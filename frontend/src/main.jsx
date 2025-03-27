import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App'
import { RepoProvider } from './components/context/repocontext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RepoProvider>
      <App />
      <Toaster position="top-right" richColors />
    </RepoProvider>
  </StrictMode>,
)
