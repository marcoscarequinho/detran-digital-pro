import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsultaVeicularRequest {
  placa?: string;
  chassis?: string;
  renavam?: string;
  tipo: 'gravame' | 'crv-digital' | 'base-estadual' | 'atpv-e';
}

// Inicializar cliente Supabase para logging de segurança
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extrair informações da requisição para segurança
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';
    
    console.log(`Consulta Veicular - IP: ${clientIP}, User-Agent: ${userAgent}`);

    // Advanced rate limiting with threat detection
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('advanced_rate_limit_check', {
        p_ip_address: clientIP,
        p_endpoint: 'consulta-veiculo',
        p_user_agent: userAgent,
        p_additional_context: { timestamp: new Date().toISOString() }
      });

    if (rateLimitError) {
      console.error('Rate limit check failed');
      await supabase.rpc('log_security_event', {
        p_event_type: 'rate_limit_check_error',
        p_resource_type: 'edge_function',
        p_details: { endpoint: 'consulta-veiculo' },
        p_severity: 'error'
      });
      
      return new Response(JSON.stringify({ 
        error: 'Validação de segurança falhou' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!rateLimitCheck?.allowed) {
      return new Response(JSON.stringify({ 
        error: 'Limite de requisições excedido. Tente novamente em alguns minutos.',
        details: 'Muitas tentativas detectadas'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { placa, chassis, renavam, tipo }: ConsultaVeicularRequest = await req.json();

    // Validar dados obrigatórios
    if (tipo === 'atpv-e') {
      if (!placa || !renavam) {
        return new Response(JSON.stringify({ 
          error: 'Para ATPV-E: Placa e RENAVAM são obrigatórios' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      if (!placa) {
        return new Response(JSON.stringify({ 
          error: 'Placa é obrigatória' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Validar formato da placa se fornecida
    if (placa) {
      const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
      if (!placaRegex.test(placa.toUpperCase())) {
        return new Response(JSON.stringify({ 
          error: 'Formato de placa inválido. Use o formato ABC1234 ou ABC1D23' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Obter chave de acesso das variáveis de ambiente
    const chaveAcesso = Deno.env.get('CHAVE_ACESSO_API');

    if (!chaveAcesso) {
      return new Response(JSON.stringify({ 
        error: 'Chave de acesso da API não configurada' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Preparar dados para a API
    const requestBody: any = {};

    if (placa) {
      requestBody.placa = placa.toUpperCase();
    }

    if (tipo === 'atpv-e' && renavam) {
      requestBody.renavam = renavam;
    }

    console.log(`Consulta Veicular - Tipo: ${tipo}, Placa: ${placa || 'N/A'}, RENAVAM: ${renavam || 'N/A'}`);

    // Log da tentativa de consulta com função segura
    await supabase.rpc('log_security_event', {
      p_event_type: 'vehicle_consultation_attempt',
      p_resource_type: 'api',
      p_details: {
        tipo,
        placa: placa || null,
        renavam: renavam || null,
        ip_truncated: clientIP.substring(0, 10) + '***', // Partial IP for privacy
        user_agent_truncated: userAgent.substring(0, 50)
      }
    });

    // Determinar a URL baseada no tipo de consulta
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
        return new Response(JSON.stringify({ 
          error: 'Tipo de consulta inválido' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Fazer a consulta na API com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

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
        console.error('API error occurred');
      } catch (e) {
        console.error('Error parsing error response');
      }
      
      // Log do erro
      await supabase.from('security_audit_logs').insert({
        action: 'vehicle_consultation_error',
        resource_type: 'api',
        details: {
          error: errorMessage,
          status: response.status,
          tipo,
          placa: placa || null,
          ip_address: clientIP
        }
      });
      
      return new Response(JSON.stringify({
        error: errorMessage
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar se o retorno é PDF
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      const pdfBuffer = await response.arrayBuffer();
      const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
      
      // Log de sucesso
      await supabase.from('security_audit_logs').insert({
        action: 'vehicle_consultation_success',
        resource_type: 'api',
        details: {
          tipo,
          placa: placa || null,
          response_type: 'pdf',
          ip_address: clientIP
        }
      });
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          tipo: 'pdf',
          arquivo: base64Pdf,
          contentType: 'application/pdf'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Se não for PDF, tentar parsear como JSON
      const data = await response.json();
      
      // Log de sucesso
      await supabase.from('security_audit_logs').insert({
        action: 'vehicle_consultation_success',
        resource_type: 'api',
        details: {
          tipo,
          placa: placa || null,
          response_type: 'json',
          ip_address: clientIP
        }
      });
      
      return new Response(JSON.stringify({
        success: true,
        data: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Internal consultation error occurred');
    
    // Log do erro interno com função segura
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: 'vehicle_consultation_internal_error',
        p_resource_type: 'api',
        p_details: {
          error_type: 'internal_error',
          ip_truncated: (req.headers.get('x-forwarded-for') || '127.0.0.1').substring(0, 10) + '***'
        },
        p_severity: 'error'
      });
    } catch (logError) {
      console.error('Failed to log error');
    }
    
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor. Tente novamente.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});