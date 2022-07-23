import { ChakraProvider } from '@chakra-ui/react'
import { ChainId, Config, DAppProvider } from '@usedapp/core'
import type { AppProps } from 'next/app'
import React from 'react'

const config: Config = {
  readOnlyChainId: ChainId.xDai,
  readOnlyUrls: {
    [ChainId.Goerli]: `https://provider-proxy.hoprnet.workers.dev/eth_goerli`,
    [ChainId.xDai]: `https://provider-proxy.hoprnet.workers.dev/xdai_mainnet`,
    [ChainId.Hardhat]: 'http://localhost:8545',
    [ChainId.Localhost]: 'http://localhost:8545',
  },
  supportedChains: [
    ChainId.Goerli,
    ChainId.xDai,
    ChainId.Localhost,
    ChainId.Hardhat,
  ],
}

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <DAppProvider config={config}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </DAppProvider>
  )
}

export default MyApp
