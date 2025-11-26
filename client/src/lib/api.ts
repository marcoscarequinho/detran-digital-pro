interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface VehicleConsultationRequest {
  placa?: string;
  chassis?: string;
  renavam?: string;
  tipo: 'gravame' | 'crv-digital' | 'base-estadual' | 'atpv-e';
}

interface ClientLoginRequest {
  placa: string;
  cpf: string;
}

interface AdminLoginRequest {
  email: string;
  senha: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    type: 'admin' | 'cliente';
  };
}

class ApiClient {
  private baseURL = '/api';
  private token: string | null = localStorage.getItem('auth_token');

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Erro na requisição',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão',
      };
    }
  }

  // Authentication methods
  async loginCliente(credentials: ClientLoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/cliente', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async loginAdmin(credentials: AdminLoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/admin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Vehicle consultation
  async consultarVeiculo(request: VehicleConsultationRequest): Promise<ApiResponse> {
    return this.request('/consulta-veiculo', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Client management (admin only)
  async getClientes(): Promise<ApiResponse> {
    return this.request('/clientes');
  }

  async createCliente(clienteData: any): Promise<ApiResponse> {
    return this.request('/clientes', {
      method: 'POST',
      body: JSON.stringify(clienteData),
    });
  }

  async getDocumentos(clienteId: string): Promise<ApiResponse> {
    return this.request(`/clientes/${clienteId}/documentos`);
  }
}

export const apiClient = new ApiClient();
export type { VehicleConsultationRequest, ClientLoginRequest, AdminLoginRequest, AuthResponse };