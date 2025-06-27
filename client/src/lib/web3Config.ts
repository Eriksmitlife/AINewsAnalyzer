
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon, bsc, avalanche } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

// Получите projectId с https://cloud.walletconnect.com
const projectId = process.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id'

const metadata = {
  name: 'AutoNews.AI',
  description: 'AI-Powered News & NFT Platform',
  url: 'https://autonews-ai.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, polygon, arbitrum, avalanche, bsc] as const

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0]
    })
  ]
})

export { chains }
