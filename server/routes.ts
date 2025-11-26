import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ConsultaVeicularRequest {
  placa?: string;
  chassis?: string;
  renavam?: string;
  tipo: 'gravame' | 'crv-digital' | 'base-estadual' | 'atpv-e';
}

interface ClienteLoginRequest {
  placa: string;
  cpf: string;
}

interface AdminLoginRequest {
  email: string;
  senha: string;
}

interface AssistenteRequest {
  pergunta: string;
  categoria?: string;
}

// Fallback responses when AI APIs are not configured
function getFallbackResponse(pergunta: string, categoria?: string): string {
  const perguntaLower = pergunta.toLowerCase();
  
  // Common responses based on keywords
  if (perguntaLower.includes('transferência') || perguntaLower.includes('transferir')) {
    return `Para transferir um veículo você precisa:

📋 Documentos necessários:
• CRV (Certificado de Registro de Veículo) original
• CPF e RG do vendedor e comprador
• Comprovante de residência atualizado
• Certificado de vistoria (se aplicável)

⏰ Prazo: 30 dias após a compra
💰 Taxas: DETRAN + cartório + despachante

🔍 Consulte um despachante para mais detalhes específicos da sua região.`;
  }
  
  if (perguntaLower.includes('licenciamento') || perguntaLower.includes('ipva')) {
    return `Para o licenciamento anual você precisa:

📋 Documentos:
• CRV (documento do veículo)
• Comprovante de pagamento do IPVA
• Comprovante de pagamento do seguro obrigatório
• Comprovante de pagamento da taxa de licenciamento

⏰ Prazo: Até o último dia útil do mês de aniversário do veículo
💰 Valores variam por estado e tipo de veículo

🔍 Consulte o site do DETRAN do seu estado para valores atualizados.`;
  }
  
  if (perguntaLower.includes('cnh') || perguntaLower.includes('carteira') || perguntaLower.includes('habilitação')) {
    return `Para questões sobre CNH:

🆔 Primeira via: Processo completo no DETRAN (exames, aulas, provas)
🔄 Renovação: Exames médico e psicológico + taxa
📋 Segunda via: Boletim de ocorrência + taxa + foto
⬆️ Mudança de categoria: Exames + curso + prova prática

⏰ CNH vence a cada 5 anos (até 50 anos) ou 3 anos (50+ anos)
💰 Taxas variam por estado

🔍 Procure o DETRAN do seu estado para mais informações.`;
  }
  
  if (perguntaLower.includes('multa') || perguntaLower.includes('débito') || perguntaLower.includes('dívida')) {
    return `Para regularizar débitos e multas:

🔍 Consulta:
• Site do DETRAN do seu estado
• App oficial do DETRAN
• Portais de serviços públicos

💳 Pagamento:
• À vista com desconto (geralmente 40%)
• Parcelamento (condições variam)
• PIX, cartão ou boleto

⚠️ Importante:
• Veículo com débitos não pode ser licenciado
• Multas prescrevem em 5 anos
• Débitos impedem transferência

🔍 Consulte um despachante para negociação de débitos.`;
  }
  
  if (perguntaLower.includes('segunda via') || perguntaLower.includes('documento perdido')) {
    return `Para tirar segunda via de documentos:

🚗 CRV (Documento do veículo):
• Boletim de ocorrência
• CPF e RG do proprietário
• Comprovante de residência
• Taxa do DETRAN

🆔 CNH:
• Boletim de ocorrência
• Foto 3x4 recente
• CPF e RG
• Taxa do DETRAN

⏰ Prazo: 5 a 15 dias úteis
💰 Taxa varia por estado

🔍 Alguns estados permitem solicitação online pelo site do DETRAN.`;
  }
  
  // Generic response
  return `Obrigado pela sua pergunta sobre serviços veiculares! 

🤖 Este é um assistente básico. Para informações mais detalhadas e personalizadas, recomendo:

📞 Entrar em contato pelo WhatsApp com nossos atendentes
🌐 Consultar o site oficial do DETRAN do seu estado  
🏢 Procurar um despachante credenciado na sua região

💡 Principais serviços que prestamos:
• Transferência de veículos
• Licenciamento anual
• Segunda via de documentos
• Regularização de débitos
• Serviços de CNH

Como posso ajudar especificamente com algum destes serviços?`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

  // Middleware to extract client IP
  const getClientIP = (req: Request): string => {
    return req.headers['x-forwarded-for'] as string || 
           req.headers['x-real-ip'] as string || 
           req.connection.remoteAddress || 
           '127.0.0.1';
  };

  // Rate limiting middleware
  const checkRateLimit = async (req: Request, res: Response, next: Function) => {
    const clientIP = getClientIP(req);
    const endpoint = req.path;
    
    const allowed = await storage.checkRateLimit(clientIP, endpoint);
    if (!allowed) {
      await storage.logSecurityEvent({
        action: 'rate_limit_exceeded',
        resource_type: 'api',
        ip_address: clientIP,
        user_agent: req.headers['user-agent'],
        details: { endpoint },
      });
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    await storage.updateRateLimit(clientIP, endpoint);
    next();
  };

  // Vehicle consultation API (replacing Supabase Edge Function)
  app.post('/api/consulta-veiculo', checkRateLimit, async (req: Request, res: Response) => {
    try {
      const { placa, chassis, renavam, tipo }: ConsultaVeicularRequest = req.body;
      const clientIP = getClientIP(req);
      const userAgent = req.headers['user-agent'] || '';

      // Validate required fields
      if (tipo === 'atpv-e') {
        if (!placa || !renavam) {
          return res.status(400).json({ 
            error: 'Para ATPV-E: Placa e RENAVAM são obrigatórios' 
          });
        }
      } else {
        if (!placa) {
          return res.status(400).json({ error: 'Placa é obrigatória' });
        }
      }

      // Validate license plate format
      if (placa) {
        const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
        if (!placaRegex.test(placa.toUpperCase())) {
          return res.status(400).json({ 
            error: 'Formato de placa inválido. Use o formato ABC1234 ou ABC1D23' 
          });
        }
      }

      // Get API access key
      const chaveAcesso = process.env.CHAVE_ACESSO_API;
      if (!chaveAcesso) {
        return res.status(500).json({ 
          error: 'Chave de acesso da API não configurada' 
        });
      }

      // Log the consultation attempt
      await storage.logSecurityEvent({
        action: 'vehicle_consultation_attempt',
        resource_type: 'api',
        ip_address: clientIP,
        user_agent: userAgent,
        details: {
          tipo,
          placa: placa || null,
          renavam: renavam || null,
        },
      });

      // Determine API URL based on consultation type
      let apiUrl = '';
      switch (tipo) {
        case 'gravame':
          apiUrl = 'https://portaldespachantes.online/consultar-gravame';
          break;
        case 'crv-digital':
          apiUrl = 'https://portaldespachantes.online/consultar-crv';
          break;
        case 'base-estadual':
          apiUrl = 'https://portaldespachantes.online/consultar-base-estadual';
          break;
        case 'atpv-e':
          apiUrl = 'https://portaldespachantes.online/consultar-atpve';
          break;
        default:
          return res.status(400).json({ error: 'Tipo de consulta inválido' });
      }

      // Prepare request body
      const requestBody: any = {};
      if (placa) requestBody.placa = placa.toUpperCase();
      if (tipo === 'atpv-e' && renavam) requestBody.renavam = renavam;

      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'chaveAcesso': chaveAcesso,
          'User-Agent': 'MC-Despachante/1.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Erro na consulta veicular';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Error parsing error response
        }
        
        await storage.logSecurityEvent({
          action: 'vehicle_consultation_error',
          resource_type: 'api',
          ip_address: clientIP,
          details: {
            error: errorMessage,
            status: response.status,
            tipo,
            placa: placa || null,
          },
        });
        
        return res.status(response.status).json({ error: errorMessage });
      }

      // Check if response is PDF
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/pdf')) {
        const pdfBuffer = await response.arrayBuffer();
        const base64Pdf = Buffer.from(pdfBuffer).toString('base64');
        
        await storage.logSecurityEvent({
          action: 'vehicle_consultation_success',
          resource_type: 'api',
          ip_address: clientIP,
          details: {
            tipo,
            placa: placa || null,
            response_type: 'pdf',
          },
        });
        
        return res.json({
          success: true,
          data: {
            tipo: 'pdf',
            arquivo: base64Pdf,
            contentType: 'application/pdf'
          }
        });
      } else {
        const data = await response.json();
        
        await storage.logSecurityEvent({
          action: 'vehicle_consultation_success',
          resource_type: 'api',
          ip_address: clientIP,
          details: {
            tipo,
            placa: placa || null,
            response_type: 'json',
          },
        });
        
        return res.json({
          success: true,
          data: data
        });
      }

    } catch (error) {
      const clientIP = getClientIP(req);
      
      await storage.logSecurityEvent({
        action: 'vehicle_consultation_internal_error',
        resource_type: 'api',
        ip_address: clientIP,
        details: {
          error_type: 'internal_error',
        },
      });
      
      return res.status(500).json({ 
        error: 'Erro interno do servidor. Tente novamente.' 
      });
    }
  });

  // AI Assistant API
  app.post('/api/assistente', checkRateLimit, async (req: Request, res: Response) => {
    try {
      const { pergunta, categoria }: AssistenteRequest = req.body;
      const clientIP = getClientIP(req);

      if (!pergunta || pergunta.trim().length === 0) {
        return res.status(400).json({ error: 'Pergunta é obrigatória' });
      }

      const geminiKey = process.env.GEMINI_API_KEY;
      
      console.log('Verificando chave do Gemini:', !!geminiKey);
      
      if (!geminiKey) {
        // Fallback response when Gemini API key is not configured
        const fallbackResponse = getFallbackResponse(pergunta, categoria);
        return res.json({
          success: true,
          resposta: fallbackResponse,
          categoria: categoria || 'geral',
          provider: 'fallback'
        });
      }

      let resposta = '';
      let usedProvider = 'gemini';

      // System message with context about vehicle services
      const systemMessage = `Você é um assistente especializado em serviços veiculares do Brasil. 
Sua especialidade é ajudar pessoas com questões sobre:
- Transferência de propriedade de veículos
- Licenciamento anual (IPVA, DPVAT, taxa de licenciamento)
- Segunda via de documentos (CRV, CRLV, CNH)
- CNH (primeira via, renovação, mudança de categoria)
- Regularização de veículos (débitos, multas, restrições)
- Procedimentos junto ao DETRAN
- Documentação necessária para cada serviço
- Prazos e valores aproximados

Responda de forma clara, prática e em português brasileiro. 
Se não souber algo específico, oriente a procurar um despachante ou o DETRAN.
Mantenha as respostas concisas mas informativas.`;

      // Use only Gemini
      try {
        console.log('Usando Gemini para processar a pergunta...');
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const prompt = `${systemMessage}

Pergunta do usuário: ${pergunta}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        resposta = response.text() || 'Desculpe, não consegui processar sua pergunta.';
        
      } catch (geminiError: any) {
        console.error('Erro no Gemini:', geminiError);
        
        // If Gemini fails, use fallback
        resposta = getFallbackResponse(pergunta, categoria);
        usedProvider = 'fallback';
      }

      // Log the assistant usage
      await storage.logSecurityEvent({
        action: 'ai_assistant_query',
        resource_type: 'api',
        ip_address: clientIP,
        user_agent: req.headers['user-agent'] || null,
        user_id: null,
        resource_id: null,
        details: {
          categoria: categoria || 'geral',
          pergunta_length: pergunta.length,
          provider_used: usedProvider,
        },
      });

      return res.json({
        success: true,
        resposta,
        categoria: categoria || 'geral',
        provider: usedProvider
      });

    } catch (error) {
      console.error('AI Assistant error:', error);
      
      await storage.logSecurityEvent({
        action: 'ai_assistant_error',
        resource_type: 'api',
        ip_address: getClientIP(req),
        user_agent: req.headers['user-agent'] || null,
        user_id: null,
        resource_id: null,
        details: {
          error_type: 'api_error',
        },
      });

      return res.status(500).json({ 
        error: 'Erro ao processar pergunta. Tente novamente.' 
      });
    }
  });

  // Client authentication API
  app.post('/api/auth/cliente', checkRateLimit, async (req: Request, res: Response) => {
    try {
      const { placa, cpf }: ClienteLoginRequest = req.body;
      const clientIP = getClientIP(req);

      if (!placa || !cpf) {
        return res.status(400).json({ error: 'Placa e CPF são obrigatórios' });
      }

      // Find client by placa and CPF
      const cliente = await storage.getClienteByPlacaCpf(placa, cpf);
      if (!cliente) {
        await storage.logAuthAttempt({
          identifier: `${placa}_${cpf}`,
          attempt_type: 'client',
          success: false,
          ip_address: clientIP,
          error_message: 'Cliente não encontrado',
        });
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Check account status
      if (cliente.account_status === 'suspended' || cliente.account_status === 'locked') {
        return res.status(401).json({ error: 'Conta suspensa ou bloqueada' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: cliente.id, 
          type: 'cliente',
          email: cliente.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      await storage.logAuthAttempt({
        identifier: `${placa}_${cpf}`,
        attempt_type: 'client',
        success: true,
        ip_address: clientIP,
      });

      // Update last login
      await storage.updateCliente(cliente.id, { 
        last_login_at: new Date(),
        login_attempts: 0 
      });

      return res.json({
        success: true,
        token,
        user: {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
          type: 'cliente'
        }
      });

    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Admin authentication API  
  app.post('/api/auth/admin', checkRateLimit, async (req: Request, res: Response) => {
    try {
      const { email, senha }: AdminLoginRequest = req.body;
      const clientIP = getClientIP(req);

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      // Find admin profile
      const profile = await storage.getProfileByEmail(email);
      if (!profile || profile.tipo_usuario !== 'admin') {
        await storage.logAuthAttempt({
          email,
          attempt_type: 'admin',
          success: false,
          ip_address: clientIP,
          error_message: 'Usuário não encontrado',
        });
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // For now, we'll use a simple password check
      // In production, you'd compare against a hashed password
      const isValidPassword = senha === 'admin123'; // Replace with proper password hashing
      
      if (!isValidPassword) {
        await storage.logAuthAttempt({
          email,
          attempt_type: 'admin',
          success: false,
          ip_address: clientIP,
          error_message: 'Senha inválida',
        });
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { 
          userId: profile.user_id, 
          type: 'admin',
          email: profile.email 
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      await storage.logAuthAttempt({
        email,
        attempt_type: 'admin',
        success: true,
        ip_address: clientIP,
      });

      return res.json({
        success: true,
        token,
        user: {
          id: profile.user_id,
          nome: profile.nome,
          email: profile.email,
          type: 'admin'
        }
      });

    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Get all clients (admin only)
  app.get('/api/clientes', async (req: Request, res: Response) => {
    try {
      // In production, you'd verify JWT token here
      const clientes = await storage.getAllClientes();
      return res.json(clientes);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Create new client (admin only)
  app.post('/api/clientes', async (req: Request, res: Response) => {
    try {
      const clienteData = req.body;
      const newCliente = await storage.createCliente(clienteData);
      return res.status(201).json(newCliente);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar cliente' });
    }
  });

  // Get documents for a client
  app.get('/api/clientes/:id/documentos', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const documentos = await storage.getDocumentosByCliente(id);
      return res.json(documentos);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar documentos' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}