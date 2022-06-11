import { ChakraProvider } from '@chakra-ui/react'
import {
  ChainId,
  Config,
  DAppProvider,
  MULTICALL_ADDRESSES,
} from '@usedapp/core'
import type { AppProps } from 'next/app'
import React from 'react'
import Multicall from '@hoprnet/hopr-stake/deployments/localhost/Multicall.json'

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
  // remove as it's unused
  multicallAddresses: {
    ...MULTICALL_ADDRESSES,
    [ChainId.Hardhat]: Multicall.address,
    [ChainId.Localhost]: Multicall.address,
  },
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
