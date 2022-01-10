import { Web3Provider } from '@ethersproject/providers'
import { Contract, ethers, BigNumber, utils, constants } from 'ethers'
import React from 'react'
import xHOPRTokenABI from '@hoprnet/hopr-stake/lib/chain/abis/ERC677Mock.json'
import { ERC677Mock as xHOPRTokenType } from '@hoprnet/hopr-stake/lib/types/ERC677Mock'
import HoprStakeABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprStake.json'
import { HoprStake as HoprStakeType } from '@hoprnet/hopr-stake/lib/types/HoprStake'
import HoprBoostABI from '@hoprnet/hopr-stake/lib/chain/abis/HoprBoost.json'
import { HoprBoost as HoprBoostType } from '@hoprnet/hopr-stake/lib/types/HoprBoost'
import { round } from './helpers'

/**
 * Prop Types
 */
export type StateType = {
  stakedHOPRTokens: string
  yetToClaimRewards: string
  lastSync: string
  alreadyClaimedRewards: string
  amountValue: string
  isLoadingFetching: boolean
  isLoadingStaking: boolean
  isLoadingSync: boolean
  isLoadingRedeem: boolean
  isLoadingClaim: boolean
  totalAPRBoost: number
  isLoadingUnlock: boolean
}

/**
 * Component
 */
export const initialState: StateType = {
  stakedHOPRTokens: '',
  yetToClaimRewards: '',
  lastSync: '',
  alreadyClaimedRewards: '',
  amountValue: '',
  isLoadingFetching: false,
  isLoadingStaking: false,
  isLoadingSync: false,
  isLoadingRedeem: false,
  isLoadingClaim: false,
  totalAPRBoost: -1,
  isLoadingUnlock: false,
}

type Accounts = {
  actualLockedTokenAmount: BigNumber
  virtualLockedTokenAmount: BigNumber
  lastSyncTimestamp: BigNumber
  cumulatedRewards: BigNumber
  claimedRewards: BigNumber
}

export type ActionType =
  | {
    type: 'SET_ACCOUNT_DATA'
    stakedHOPRTokens: StateType['stakedHOPRTokens']
    yetToClaimRewards: StateType['yetToClaimRewards']
    lastSync: StateType['lastSync']
    alreadyClaimedRewards: StateType['alreadyClaimedRewards']
  }
  | {
    type: 'SET_LOADING_STAKING'
    isLoadingStaking: StateType['isLoadingStaking']
  }
  | {
    type: 'SET_LOADING_FETCHING'
    isLoadingFetching: StateType['isLoadingFetching']
  }
  | {
    type: 'SET_LOADING_CLAIM'
    isLoadingClaim: StateType['isLoadingClaim']
  }
  | {
    type: 'SET_LOADING_SYNC'
    isLoadingSync: StateType['isLoadingSync']
  }
  | {
    type: 'SET_LOADING_REDEEM'
    isLoadingRedeem: StateType['isLoadingRedeem']
  }
  | {
    type: 'SET_STAKING_AMOUNT'
    amountValue: StateType['amountValue']
  }
  | {
    type: 'SET_TOTAL_APR_BOOST'
    totalAPRBoost: StateType['totalAPRBoost']
  }
  | {
    type: 'SET_LOADING_UNLOCK'
    isLoadingUnlock: StateType['isLoadingUnlock']
  }

export function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_ACCOUNT_DATA':
      return {
        ...state,
        stakedHOPRTokens: action.stakedHOPRTokens,
        yetToClaimRewards: action.yetToClaimRewards,
        lastSync: action.lastSync,
        alreadyClaimedRewards: action.alreadyClaimedRewards,
      }
    case 'SET_LOADING_STAKING':
      return {
        ...state,
        isLoadingStaking: action.isLoadingStaking,
      }
    case 'SET_LOADING_CLAIM':
      return {
        ...state,
        isLoadingClaim: action.isLoadingClaim
      }
    case 'SET_LOADING_FETCHING':
      return {
        ...state,
        isLoadingFetching: action.isLoadingFetching,
      }
    case 'SET_LOADING_SYNC':
      return {
        ...state,
        isLoadingSync: action.isLoadingSync
      }
    case 'SET_LOADING_REDEEM':
      return {
        ...state,
        isLoadingRedeem: action.isLoadingRedeem
      }
    case 'SET_STAKING_AMOUNT':
      return {
        ...state,
        amountValue: action.amountValue,
      }
    case 'SET_TOTAL_APR_BOOST':
      return {
        ...state,
        totalAPRBoost: action.totalAPRBoost
      }
    case 'SET_LOADING_UNLOCK':
      return {
        ...state,
        isLoadingUnlock: action.isLoadingUnlock
      }
    default:
      throw new Error()
  }
}

export async function fetchAccountData(
  HoprStakeContractAddress: string,
  account: string,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
): Promise<void> {
  if (provider && HoprStakeContractAddress != '') {
    dispatch({
      type: 'SET_LOADING_FETCHING',
      isLoadingFetching: true,
    })
    const contract = new Contract(
      HoprStakeContractAddress,
      HoprStakeABI,
      provider
    ) as unknown as HoprStakeType
    try {
      const accountStruct: Accounts = account && await contract.accounts(account)
      const {
        actualLockedTokenAmount,
        cumulatedRewards,
        lastSyncTimestamp,
        claimedRewards,
      } = accountStruct 
      const [
        stakedHOPRTokens,
        alreadyClaimedRewards
      ] = [
        actualLockedTokenAmount,
        claimedRewards
      ].map((dataPoint) =>
        dataPoint ? round(Number(utils.formatEther(dataPoint)), 12) : '0.00000000'
      )
      dispatch({
        type: 'SET_ACCOUNT_DATA',
        stakedHOPRTokens,
        yetToClaimRewards: (cumulatedRewards.sub(claimedRewards)).toString(),
        lastSync: lastSyncTimestamp.toString(),
        alreadyClaimedRewards,
      })
      dispatch({
        type: 'SET_LOADING_FETCHING',
        isLoadingFetching: false,
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error: ', err)
    }
  }
}

export async function setClaim(
  HoprStakeContractAddress: string,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
): Promise<void> {
  if (provider && HoprStakeContractAddress != '') {
    dispatch({
      type: 'SET_LOADING_CLAIM',
      isLoadingClaim: true,
    })
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(
      HoprStakeContractAddress,
      HoprStakeABI,
      signer
    ) as unknown as HoprStakeType
    const transaction = await contract.claimRewards(address)
    await transaction.wait()
    fetchAccountData(
      HoprStakeContractAddress,
      address,
      provider,
      dispatch
    )
    dispatch({
      type: 'SET_LOADING_CLAIM',
      isLoadingClaim: false,
    })
  }
}

export async function setSync(
  HoprStakeContractAddress: string,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
): Promise<void> {
  if (provider && HoprStakeContractAddress != '') {
    dispatch({
      type: 'SET_LOADING_SYNC',
      isLoadingSync: true,
    })
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(
      HoprStakeContractAddress,
      HoprStakeABI,
      signer
    ) as unknown as HoprStakeType
    const transaction = await contract.sync(address)
    await transaction.wait()
    fetchAccountData(
      HoprStakeContractAddress,
      address,
      provider,
      dispatch
    )
    dispatch({
      type: 'SET_LOADING_SYNC',
      isLoadingSync: false,
    })
  }
}

export async function setRedeemNFT(
  HoprBoostContractAddress: string,
  HoprStakeContractAddress: string,
  tokenId: string,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
): Promise<void> {
  if (provider && HoprBoostContractAddress != '') {
    dispatch({
      type: 'SET_LOADING_REDEEM',
      isLoadingRedeem: true,
    })
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(
      HoprBoostContractAddress,
      HoprBoostABI,
      signer
    ) as unknown as HoprBoostType
    const transaction = await contract['safeTransferFrom(address,address,uint256)'](address, HoprStakeContractAddress, tokenId)
    await transaction.wait()
    dispatch({
      type: 'SET_LOADING_REDEEM',
      isLoadingRedeem: false,
    })
  }
}

export async function setStaking(
  xHOPRContractAddress: string,
  HoprStakeContractAddress: string,
  state: StateType,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
): Promise<void> {
  if (!state.amountValue) return
  if (provider && HoprStakeContractAddress != '') {
    dispatch({
      type: 'SET_LOADING_STAKING',
      isLoadingStaking: true,
    })
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(
      xHOPRContractAddress,
      xHOPRTokenABI,
      signer
    ) as unknown as xHOPRTokenType
    const transaction = await contract.transferAndCall(
      HoprStakeContractAddress,
      utils.parseEther(state.amountValue),
      constants.HashZero
    )
    await transaction.wait()
    fetchAccountData(
      HoprStakeContractAddress,
      address,
      provider,
      dispatch
    )
    dispatch({
      type: 'SET_STAKING_AMOUNT',
      amountValue: '0',
    })
    dispatch({
      type: 'SET_LOADING_STAKING',
      isLoadingStaking: false,
    })
  }
}

export async function setUnlock(
  HoprStakeContractAddress: string,
  provider: Web3Provider,
  dispatch: React.Dispatch<ActionType>
): Promise<void> {
  if (provider && HoprStakeContractAddress != '') {
    dispatch({
      type: 'SET_LOADING_UNLOCK',
      isLoadingUnlock: true,
    })
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(
      HoprStakeContractAddress,
      HoprStakeABI,
      signer
    ) as unknown as HoprStakeType
    const transaction = await contract.unlock(address)
    await transaction.wait()
    fetchAccountData(
      HoprStakeContractAddress,
      address,
      provider,
      dispatch
    )
    dispatch({
      type: 'SET_LOADING_UNLOCK',
      isLoadingUnlock: false,
    })
  }
}
