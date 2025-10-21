import React from 'react'
import App from './App.tsx'
import './index.css'
import ReactDOM  from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './hooks/AuthContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster richColors position='top-right' />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)