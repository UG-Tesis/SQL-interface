import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ActividadesCatalogProvider } from './ui/session/ActividadesCatalogContext'
import { ThemeProvider } from './ui/theme/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ActividadesCatalogProvider>
          <App />
        </ActividadesCatalogProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
