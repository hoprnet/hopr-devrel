import { useCall, useEthers, Web3Ethers } from '@usedapp/core'
import { Falsy } from '@usedapp/core/dist/esm/src/model/types'
import { BigNumber } from 'ethers'
import { Interface, isAddress } from 'ethers/lib/utils'

export function useStartProgramDate(
  stakeContractABI: any,
  stakeContractAddress: string | Falsy
): BigNumber {
  const [startProgramDate] =
    useCall(
      stakeContractAddress && {
        abi: new Interface(stakeContractABI),
        address: stakeContractAddress,
        method: 'PROGRAM_START',
        args: [],
      }
    ) ?? []
  return startProgramDate
}

export function useRedeemedNFTs(
  stakeContractABI: any,
  stakeContractAddress: string | Falsy,
  address: string | Falsy
): BigNumber | undefined {
  const [startProgramDate] =
    useCall(
      address &&
      stakeContractAddress && {
        abi: new Interface(stakeContractABI),
        address: stakeContractAddress,
        method: 'redeemedNftIndex',
        args: [address],
      }
    ) ?? []
  return startProgramDate
}

export function useEndProgramDate(
  stakeContractABI: any,
  stakeContractAddress: string | Falsy
): BigNumber {
  const [endProgramDate] =
    useCall(
      stakeContractAddress && {
        abi: new Interface(stakeContractABI),
        address: stakeContractAddress,
        method: 'PROGRAM_END',
        args: [],
      }
    ) ?? []
  return endProgramDate
}

export const useEthersWithViewMode = (viewModeAddress: string): Web3Ethers => {
  const result = useEthers()
  const account = result.account || (isAddress(viewModeAddress) && viewModeAddress)
  return { ...result, account }
}
