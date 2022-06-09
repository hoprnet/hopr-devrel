import getContracts from './contracts'

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

export type IContractABIs = {
  xHOPR: any
  wxHOPR: any
  HoprBoost: any
  HoprStake: any
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
export const emptyContractABIs: IContractABIs = {
  xHOPR: [],
  wxHOPR: [],
  HoprBoost: [],
  HoprStake: [],
}

export const getContractAddresses = async (
  chainId: number
): Promise<IContractAddress> => {
  const contracts = await getContracts(chainId)

  return {
    xHOPR: contracts.xHoprToken.address,
    wxHOPR: contracts.wxHoprToken.address,
    HoprBoost: contracts.hoprBoost.address,
    HoprStake: contracts.hoprStake.address,
  }
}

export const getBlockNumberFromDeploymentTransactionHashReceipt = async (
  chainId: number
): Promise<IContractFromBlockNumbers> => {
  const contracts = await getContracts(chainId)

  return {
    xHOPR: Number(contracts.xHoprToken.blockNumber),
    wxHOPR: Number(contracts.wxHoprToken.blockNumber),
    HoprBoost: Number(contracts.hoprBoost.blockNumber),
    HoprStake: Number(contracts.hoprStake.blockNumber),
  }
}

export const getContractABIs = async (
  chainId: number
): Promise<IContractABIs> => {
  const contracts = await getContracts(chainId)

  return {
    xHOPR: contracts.xHoprToken.abi,
    wxHOPR: contracts.wxHoprToken.abi,
    HoprBoost: contracts.hoprBoost.abi,
    HoprStake: contracts.hoprStake.abi,
  }
}
