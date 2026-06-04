import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { SessionProvider } from './ui/session/SessionContext'
import { CursoProgressProvider } from './ui/session/CursoProgressContext'
import { ActividadesCatalogProvider } from './ui/session/ActividadesCatalogContext'
import { ThemeProvider } from './ui/theme/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SessionProvider>
          <CursoProgressProvider>
            <ActividadesCatalogProvider>
              <App />
            </ActividadesCatalogProvider>
          </CursoProgressProvider>
        </SessionProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
