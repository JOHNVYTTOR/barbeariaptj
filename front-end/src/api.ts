import axios from 'axios';
import { toast } from "sonner"; 

// Cria a instância do axios com a URL base do seu backend
const api = axios.create({
  baseURL: 'http://localhost:8080', // URL do backend Spring (porta 5000)
});

// --- Interceptor de Requisição ---
// Adiciona o token JWT a CADA requisição autenticada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Adiciona o cabeçalho de autorização
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Interceptor de Resposta ---
// Lida com erros globais, especialmente o 401 (Não Autorizado)
api.interceptors.response.use(
  (response) => {
    // Se a resposta for bem-sucedida, apenas a retorna
    return response;
  },
  (error) => {
    // Se for um erro de rede ou servidor (sem resposta)
    if (!error.response) {
       toast.error("Erro de Rede", {
         description: "Não foi possível conectar ao servidor. Verifique sua conexão.",
       });
       return Promise.reject(error);
    }

    // Lida especificamente com erros 401 (Token inválido/expirado) ou 403 (Proibido)
    if (error.response.status === 401 || error.response.status === 403) {
      toast.error("Sessão Expirada", {
        description: "Por favor, faça login novamente.",
      });
      
      // Limpa o storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user'); // Limpa o usuário
      
      // Força o redirecionamento para a página de login
      // Usamos window.location para garantir que o estado do React seja resetado
    }
    
    // Para outros erros (400, 404, 500), apenas rejeita o promise
    // para que o .catch() no componente possa lidar com eles.
    return Promise.reject(error);
  }
);

export default api;