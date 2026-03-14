import { http, createConfig } from 'wagmi'
import { sepolia, foundry } from 'wagmi/chains'

export const wagmiConfig = createConfig({
  chains: [foundry, sepolia],
  transports: {
    [sepolia.id]: http(),
    [foundry.id]: http(),
  },
})
