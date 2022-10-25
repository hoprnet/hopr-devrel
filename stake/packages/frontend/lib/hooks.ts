import { useCall, useEthers, Web3Ethers } from '@usedapp/core'
import { Falsy } from '@usedapp/core/dist/esm/src/model/types'
import { BigNumber, Contract } from 'ethers'
import { Interface, isAddress } from 'ethers/lib/utils'

export function useStartProgramDate(
  stakeContractABI: any,
  stakeContractAddress: string | Falsy
): BigNumber {
  const { value, error} =
    useCall(
      stakeContractAddress && {
        contract: new Contract(stakeContractAddress, stakeContractABI),
        method: 'PROGRAM_START',
        args: [],
      }
    ) ?? {}
    if(error) {
      console.error(error.message)
      return undefined
    }
    return value?.[0]
}

export function useRedeemedNFTs(
  stakeContractABI: any,
  stakeContractAddress: string | Falsy,
  address: string | Falsy
): BigNumber | undefined {
  const { value, error} =
    useCall(
      address &&
      stakeContractAddress && {
        contract: new Contract(stakeContractAddress, stakeContractABI),
        address: stakeContractAddress,
        method: 'redeemedNftIndex',
        args: [address],
      }
) ?? {}
    if(error) {
      console.error(error.message)
      return undefined
    }
    return value?.[0]
}

export function useEndProgramDate(
  stakeContractABI: any,
  stakeContractAddress: string | Falsy
): BigNumber {
  const { value, error} =
    useCall(
      stakeContractAddress && {
        contract: new Contract(stakeContractAddress, stakeContractABI),
        method: 'PROGRAM_END',
        args: [],
      }
) ?? {}
    if(error) {
      console.error(error.message)
      return undefined
    }
    return value?.[0]
}

export const useEthersWithViewMode = (viewModeAddress: string): Web3Ethers => {
  const result = useEthers()
  const account = result.account || (isAddress(viewModeAddress) && viewModeAddress)
  return { ...result, account }
}
