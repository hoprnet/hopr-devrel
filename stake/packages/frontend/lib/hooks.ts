import HoprStakeABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprStake.json'
import { useContractCall } from '@usedapp/core'
import { Falsy } from '@usedapp/core/dist/esm/src/model/types'
import { BigNumber } from 'ethers'
import { Interface } from 'ethers/lib/utils'

export function useStartProgramDate(stakeContractAddress: string | Falsy): BigNumber {
    const [startProgramDate] =
      useContractCall(
        stakeContractAddress && {
        abi: new Interface(HoprStakeABI),
        address: stakeContractAddress,
        method: 'PROGRAM_START',
        args: [],
        }
      ) ?? []
    return startProgramDate
}

export function useRedeemedNFTs(stakeContractAddress: string | Falsy, address: string | Falsy): BigNumber | undefined {
  const [startProgramDate] =
      useContractCall(
        address &&
        stakeContractAddress && {
        abi: new Interface(HoprStakeABI),
        address: stakeContractAddress,
        method: 'redeemedNftIndex',
        args: [address],
        }
      ) ?? []
    return startProgramDate
}

export function useEndProgramDate(stakeContractAddress: string | Falsy): BigNumber {
    const [endProgramDate] =
      useContractCall(
        stakeContractAddress && {
        abi: new Interface(HoprStakeABI),
        address: stakeContractAddress,
        method: 'PROGRAM_END',
        args: [],
        }
      ) ?? []
    return endProgramDate
    
}