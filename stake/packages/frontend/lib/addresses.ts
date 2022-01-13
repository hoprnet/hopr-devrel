import { chainIdToNetwork } from './connectors'

export type IContractAddress = {
  xHOPR: string
  wxHOPR: string
  HoprBoost: string
  HoprStake: string
}

export type IContractFromBlockNumbers = {
  xHOPR: number
  wxHOPR: number
  HoprBoost: number
  HoprStake: number
}

export const emptyContractAddresses: IContractAddress = {
  xHOPR: '',
  wxHOPR: '',
  HoprBoost: '',
  HoprStake: '',
}
export const emptyFromBlockNumbers: IContractFromBlockNumbers = {
  xHOPR: -1,
  wxHOPR: -1,
  HoprBoost: -1,
  HoprStake: -1,
}

export const getContractAddresses = async (chainId: number): Promise<IContractAddress> => {
  const network = chainIdToNetwork(chainId)
  return {
    xHOPR: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/xHOPR.json`)
    ).address,
    wxHOPR: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/wxHOPR.json`)
    ).address,
    HoprBoost: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/HoprBoost.json`)
    ).address,
    HoprStake: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/HoprStake2.json`)
    ).address,
  }
}

export const getBlockNumberFromDeploymentTransactionHashReceipt = async (chainId: number): Promise<IContractFromBlockNumbers> => {
  const network = chainIdToNetwork(chainId)
  return {
    xHOPR: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/xHOPR.json`)
    ).receipt.blockNumber,
    wxHOPR: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/wxHOPR.json`)
    ).receipt.blockNumber,
    HoprBoost: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/HoprBoost.json`)
    ).receipt.blockNumber,
    HoprStake: (
      await import(`@hoprnet/hopr-stake/deployments/${network}/HoprStake2.json`)
    ).receipt.blockNumber
  }
}