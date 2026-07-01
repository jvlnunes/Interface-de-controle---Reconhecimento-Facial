
// const BASE_URL = 'https://0pzc1w15w2.execute-api.sa-east-1.amazonaws.com/CrudFuncionarios';
// export async function apiGet<T>(endpoint: string): Promise<T> {
//   const response = await fetch(`${BASE_URL}${endpoint}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok) {
//     const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
//     throw new Error(error.message || `Erro HTTP: ${response.status}`);
//   }

//   return response.json();
// }

// export async function apiSend<T>(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', data?: any): Promise<T> {
//   const isFormData = data instanceof FormData;
  
//   const headers: HeadersInit = {};
//   if (!isFormData && data) {
//     headers['Content-Type'] = 'application/json';
//   }

//   const response = await fetch(`${BASE_URL}${endpoint}`, {
//     method,
//     headers,
//     body: isFormData ? data : JSON.stringify(data),
//   });

//   if (!response.ok) {
//     const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
//     throw new Error(error.message || `Erro HTTP: ${response.status}`);
//   }

//   // Alguns endpoints (como DELETE) podem não retornar JSON
//   if (response.status === 204 || response.headers.get('content-length') === '0') {
//     return {} as T;
//   }

//   return response.json();
// }

export const API_BASE_URL = 'https://0pzc1w15w2.execute-api.sa-east-1.amazonaws.com/CrudFuncionarios';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // corpo não é JSON, mantém mensagem padrão
    }
    throw { message, status: res.status };
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<T>(res);
}

export async function apiSend<T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<T> {
  const isFormData = body instanceof FormData;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders(),
    },
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}