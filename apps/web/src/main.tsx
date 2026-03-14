import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { ReactQueryClientProvider } from './queryClient'
import { wagmiConfig } from './wagmi'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <ReactQueryClientProvider>
        <App />
      </ReactQueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
