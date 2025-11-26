import { VercelRequest, VercelResponse } from '@vercel/node';

interface AssistenteRequest {
  pergunta: string;
  categoria?: string;
}

interface AssistenteResponse {
  success: boolean;
  resposta: string;
  categoria: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req;
  
  // Handle assistente route
  if (url?.startsWith('/api/assistente') && req.method === 'POST') {
    try {
      const { pergunta, categoria = 'geral' }: AssistenteRequest = req.body;
      
      if (!pergunta || pergunta.trim().length === 0) {
        return res.status(400).json({
          success: false,
          resposta: 'Pergunta é obrigatória.',
          categoria: 'erro'
        });
      }

      // Simulate AI response based on common questions
      const resposta = gerarResposta(pergunta.toLowerCase(), categoria);
      
      const response: AssistenteResponse = {
        success: true,
        resposta,
        categoria: determinarCategoria(pergunta.toLowerCase())
      };

      return res.status(200).json(response);
      
    } catch (error) {
      console.error('Erro no assistente:', error);
      return res.status(500).json({
        success: false,
        resposta: 'Desculpe, ocorreu um erro interno. Tente novamente.',
        categoria: 'erro'
      });
    }
  }
  
  // Test route
  if (url?.startsWith('/api/test')) {
    res.status(200).json({ 
      message: 'API is working!', 
      method: req.method,
      url: url 
    });
    return;
  }

  // Default response for unmatched routes
  res.status(404).json({ error: 'API endpoint not found' });
}

function determinarCategoria(pergunta: string): string {
  if (pergunta.includes('transfer') || pergunta.includes('propriedade')) return 'Transferência';
  if (pergunta.includes('licencia') || pergunta.includes('anual')) return 'Licenciamento';
  if (pergunta.includes('cnh') || pergunta.includes('habilitação')) return 'CNH';
  if (pergunta.includes('documento') || pergunta.includes('crv')) return 'Documentação';
  if (pergunta.includes('regulariz') || pergunta.includes('débito')) return 'Regularização';
  return 'Geral';
}

function gerarResposta(pergunta: string, categoria: string): string {
  // Transferência
  if (pergunta.includes('transfer') || pergunta.includes('propriedade')) {
    if (pergunta.includes('documento')) {
      return `Para transferir um veículo, você precisa dos seguintes documentos:

📋 **Documentos necessários:**
• CRV (Certificado de Registro do Veículo) preenchido e assinado
• Comprovante de quitação de débitos (IPVA, licenciamento, multas)
• Documento de identidade e CPF do comprador e vendedor
• Comprovante de residência atualizado
• Laudo de vistoria (se necessário)

⚠️ **Importante:** A transferência deve ser feita em até 30 dias após a compra.

💰 **Custos:** Taxa de transferência + eventuais tributos pendentes.

📍 Procure um Detran ou despachante credenciado para realizar o processo.`;
    }
    if (pergunta.includes('prazo')) {
      return `⏰ **Prazo para transferência:** 30 dias corridos

A transferência de propriedade deve ser realizada em até **30 dias** após a data de compra do veículo.

⚠️ **Multa por atraso:** R$ 293,47 (valor sujeito a alteração)

📋 **Para cumprir o prazo:**
• Quite todos os débitos pendentes
• Providencie a documentação necessária
• Agende atendimento no Detran ou despachante

💡 **Dica:** Inicie o processo o quanto antes para evitar complicações e multas.`;
    }
  }

  // Licenciamento
  if (pergunta.includes('licencia') || pergunta.includes('anual')) {
    if (pergunta.includes('fazer') || pergunta.includes('como')) {
      return `🚗 **Como fazer o licenciamento anual:**

📋 **Documentos necessários:**
• CRV (Certificado de Registro do Veículo)
• Comprovante de quitação do IPVA
• Comprovante de quitação do seguro DPVAT
• Certificado de inspeção veicular (se obrigatório)

💻 **Como fazer:**
1. Acesse o site do Detran do seu estado
2. Quite o IPVA e taxas pendentes
3. Solicite o novo CRLV
4. Aguarde a entrega pelos Correios

📱 **Digital:** Na maioria dos estados, o CRLV digital já está disponível no app do Detran.`;
    }
    if (pergunta.includes('valor') || pergunta.includes('custa')) {
      return `💰 **Valores do licenciamento no RJ (2024):**

🚗 **Automóvel:** R$ 156,13
🏍️ **Motocicleta:** R$ 78,06
🚐 **Caminhonete:** R$ 234,19

**Taxas adicionais:**
• DPVAT: Consultar valor atual
• IPVA: 4% do valor venal (automóveis)

⚠️ **Valores sujeitos a alteração**

💡 **Importante:** Valores podem variar conforme o estado e tipo de veículo. Consulte sempre o site oficial do Detran.`;
    }
  }

  // CNH
  if (pergunta.includes('cnh') || pergunta.includes('habilitação')) {
    if (pergunta.includes('renovar') || pergunta.includes('vencida')) {
      return `🆔 **Renovação de CNH vencida:**

📋 **Documentos necessários:**
• RG e CPF
• Comprovante de residência
• Exame médico e psicotécnico
• Taxa de renovação

⚠️ **CNH vencida há mais de 5 anos:** Será necessário refazer os exames teórico e prático.

🚫 **Importante:** Com CNH vencida, você NÃO pode dirigir. É infração grave com multa de R$ 293,47 e retenção do veículo.

📅 **Validade:** 10 anos (até 50 anos), 5 anos (50-70 anos), 3 anos (acima de 70 anos).`;
    }
    if (pergunta.includes('categoria') || pergunta.includes('mudança')) {
      return `🔄 **Mudança de categoria B para D:**

📋 **Requisitos:**
• Ter CNH categoria B há pelo menos 2 anos
• Não ter cometido infração grave/gravíssima nos últimos 12 meses
• Idade mínima: 21 anos

📚 **Processo:**
1. Curso teórico-técnico (50 horas/aula)
2. Exame teórico específico
3. Aulas práticas (20 horas/aula mínimo)
4. Exame prático de direção

💰 **Custo aproximado:** R$ 1.500 a R$ 3.000 (varia por auto escola)

⏰ **Tempo:** 2 a 4 meses em média`;
    }
  }

  // Documentação
  if (pergunta.includes('segunda via') || pergunta.includes('perdi')) {
    if (pergunta.includes('crv') || pergunta.includes('documento')) {
      return `📄 **Segunda via do CRV:**

📋 **Documentos necessários:**
• RG e CPF do proprietário
• Comprovante de residência atualizado
• Boletim de Ocorrência (se foi roubado/furtado)
• Comprovante de quitação de débitos

💻 **Como solicitar:**
1. Acesse o site do Detran do seu estado
2. Preencha o formulário online
3. Pague a taxa (aprox. R$ 156,13 no RJ)
4. Aguarde entrega pelos Correios (15-20 dias)

⚠️ **Importante:** Enquanto aguarda, você pode imprimir o CRV provisório do site do Detran.`;
    }
    if (pergunta.includes('cnh')) {
      return `🆔 **Segunda via da CNH:**

📋 **Documentos necessários:**
• RG e CPF
• Comprovante de residência
• Boletim de Ocorrência (se roubada/furtada)
• Foto 3x4 recente

💻 **Como solicitar:**
1. Acesse o site do Detran
2. Solicite a segunda via online
3. Pague a taxa (aprox. R$ 156,13)
4. Agende retirada ou receba pelos Correios

📱 **CNH Digital:** Baixe o app CDT para ter sua CNH digital enquanto aguarda a física.

⏰ **Prazo:** 5-10 dias úteis`;
    }
  }

  // Regularização
  if (pergunta.includes('restrição') || pergunta.includes('judicial')) {
    return `⚖️ **Veículo com restrição judicial:**

🔍 **Como verificar:** Consulte o site do Detran com placa/chassi

📋 **Tipos de restrição:**
• Alienação fiduciária
• Reserva de domínio
• Penhora/arresto
• Comunicação de venda

🛠️ **Como resolver:**
1. Identifique o tipo de restrição
2. Quite o financiamento (se aplicável)
3. Solicite baixa junto ao credor
4. Acompanhe a atualização no sistema

⚠️ **Importante:** Veículo com restrição não pode ser transferido. Procure orientação jurídica se necessário.`;
  }

  if (pergunta.includes('débito') || pergunta.includes('ipva') || pergunta.includes('multa')) {
    return `💰 **Como quitar débitos em atraso:**

📋 **Tipos de débito:**
• IPVA atrasado
• Licenciamento em atraso
• Multas de trânsito
• Taxa de vistoria

💻 **Como quitar:**
1. Consulte débitos no site do Detran
2. Gere boleto ou use PIX
3. Quite preferencialmente tudo junto
4. Aguarde compensação (1-2 dias úteis)

💡 **Parcelamento:** Alguns estados permitem parcelamento de débitos. Consulte as condições no Detran.

⚠️ **Importante:** Débitos em atraso impedem licenciamento e transferência do veículo.`;
  }

  // Resposta padrão
  return `Olá! Sou seu assistente virtual para serviços veiculares. 

Posso ajudar você com:
🚗 Transferência de veículos
📋 Licenciamento anual
🆔 CNH e habilitação
📄 Segunda via de documentos
⚖️ Regularização de pendências

Digite sua dúvida específica ou escolha uma das perguntas frequentes no menu acima.

Para atendimento personalizado, clique em "Atendente" para falar conosco pelo WhatsApp!`;
}