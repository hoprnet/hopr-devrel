export enum ChainId {
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Goerli = 5,
    Kovan = 42,
    BSC = 56,
    xDai = 100,
    Polygon = 137,
    Mumbai = 80001,
    Harmony = 1666600000,
    Localhost = 1337,
    Hardhat = 31337,
  }
  
  export const CHAIN_NAMES = {
    [ChainId.Mainnet]: 'Mainnet',
    [ChainId.Ropsten]: 'Ropsten',
    [ChainId.Kovan]: 'Kovan',
    [ChainId.Rinkeby]: 'Rinkeby',
    [ChainId.Goerli]: 'Goerli',
    [ChainId.BSC]: 'BSC',
    [ChainId.xDai]: 'xDai',
    [ChainId.Polygon]: 'Polygon',
    [ChainId.Mumbai]: 'Mumbai',
    [ChainId.Harmony]: 'Harmony',
    [ChainId.Localhost]: 'Localhost',
    [ChainId.Hardhat]: 'Hardhat',
  }

  
export const HOPRChannelsDeployedSmartContractAddress = {
    [ChainId.Goerli]: '0xa3722f4758C6F41e3c1Dfd3a7dbA6FD9BAec9190',
    [ChainId.Mumbai]: '0xf4Ff7E5bf2cC7eF89196c8086982F6f5Ec502685',
    [ChainId.Polygon]: '0xd8F4E1867BBff6647B80bC624D22bD552EB81eEF',
    [ChainId.xDai]: '0x71B1BA4C741Dc9B1FFFB3EA22a831707eCc826B6'
}

export const getExplorerUrl = (address: string, chainId?: ChainId): string => {
    switch (chainId) {
      case ChainId.Mainnet:
        return `https://etherscan.io/address/${address}`
      case ChainId.Ropsten:
        return `https://ropsten.etherscan.io/address/${address}`
      case ChainId.Rinkeby:
        return `https://rinkeby.etherscan.io/address/${address}`
      case ChainId.Goerli:
        return `https://goerli.etherscan.io/address/${address}`
      case ChainId.Kovan:
        return `https://kovan.etherscan.io/address/${address}`
      case ChainId.xDai:
        return `https://blockscout.com/xdai/mainnet/address/${address}/transactions`
      case ChainId.Mumbai:
        return `https://mumbai.polygonscan.com/address/${address}/transactions`
      case ChainId.Polygon:
        return `https://polygonscan.com/address/${address}/transactions`
      default:
        return '#'
    }
  }