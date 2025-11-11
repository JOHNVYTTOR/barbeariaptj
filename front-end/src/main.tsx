import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster as Sonner } from "@/components/ui/sonner" // Importar o Sonner
import { TooltipProvider } from "@/components/ui/tooltip" // Importar Tooltip
import { QueryClient, QueryClientProvider } from "@tanstack/react-query" // Importar Query
import AuthProvider from '@/hooks/useAuth.tsx'

// Criar o client do React Query
const queryClient = new QueryClient(); 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 1. Provedor de Query (para o React Query) */}
    <QueryClientProvider client={queryClient}>
      {/* 2. Provedor de Tooltip (para o Shadcn) */}
      <TooltipProvider>
        {/* 3. Provedor de Rotas (para o React Router) */}
        <BrowserRouter>
          {/* 4. Provedor de Autenticação (nosso hook) */}
          <AuthProvider> 
            
            {/* O App agora só contém as rotas */}
            <App /> 
            
            {/* O Toaster (notificações) fica aqui, global */}
            <Sonner position="top-right" richColors />

          </AuthProvider> 
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)