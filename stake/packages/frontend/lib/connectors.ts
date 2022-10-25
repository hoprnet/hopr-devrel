import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

// const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
  5: 'https://provider-proxy.hoprnet.workers.dev/eth_goerli',
  100: 'https://provider-proxy.hoprnet.workers.dev/xdai_mainnet',
}

export const SUBGRPAH_URLS: { [chainId: number]: string } = {
  // TODO: create development subgraph
  5: 'https://api.thegraph.com/subgraphs/name/hoprnet/stake-season5-development',
  100: 'https://api.thegraph.com/subgraphs/name/hoprnet/stake-season5',
}

export const RPC_COLOURS: {
  [chainId: number]: { bg: string; color: string; scheme: string }
} = {
  5: { bg: 'lightblue', color: '#414141', scheme: 'blue' },
  100: { bg: 'yellow.500', color: '#414141', scheme: 'yellow' },
  1337: { bg: 'blackAlpha.500', color: '#414141', scheme: 'blackAlpha' },
}

export const walletconnect = new WalletConnectConnector({
  rpc: { 5: RPC_URLS[5], 100: RPC_URLS[100] },
  qrcode: true,
  // pollingInterval: POLLING_INTERVAL,
})

export const chainIdToNetwork = (chainId: number): string => {
  switch (chainId) {
    case 5:
      return 'goerli'
    case 100:
      return 'xdai'
    case 1337:
      return 'localhost'
    case 31337:
      return 'hardhat'
    default:
      return 'xdai'
  }
}

// TODO: read from protocol-config
export const chainToNativeToken = (chainId: number): string => {
  switch (chainId) {
    case 5:
      return 'gETH'
    case 100:
      return 'xDAI'
    case 31337:
      return 'hETH'
    case 1337:
      return 'lETH'
    default:
      return 'xDAI'
  }
}

type EnvironmentIds = 'master-goerli' | 'monte_rosa'

export const chainIdToEnvironmentId = (chainId: number): EnvironmentIds => {
  // goerli
  if (chainId === 5) {
    return 'master-goerli'
  } else {
    return 'monte_rosa'
  }
}
