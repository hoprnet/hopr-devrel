import type { ContractData } from '@hoprnet/hopr-ethereum'
import { chainIdToNetwork, chainIdToEnvironmentId } from './connectors'

export type Contracts = {
  [key in
    | 'wxHoprToken'
    | 'xHoprToken'
    | 'hoprBoost'
    | 'hoprStake']: ContractData
}

// cache results
let last_chainId = 0
let contracts: Contracts | undefined = undefined

export default async function getContracts(
  chainId: number
): Promise<typeof contracts> {
  if (contracts && last_chainId === chainId) return contracts

  const network = chainIdToNetwork(chainId)
  const envId = chainIdToEnvironmentId(chainId)
  console.log(network, envId)

  const [hoprToken, hoprBoost, hoprStake] = await Promise.all([
    import(
      `@hoprnet/hopr-ethereum/deployments/${envId}/${network}/HoprToken.json`
    ).then((res) => res.default),
    import(
      `@hoprnet/hopr-ethereum/deployments/${envId}/${network}/HoprBoost.json`
    ).then((res) => res.default),
    import(
      `@hoprnet/hopr-ethereum/deployments/${envId}/${network}/HoprStake.json`
    ).then((res) => res.default),
  ])

  const wxHoprToken: ContractData = {
    ...(envId === 'master-goerli' ? hoprToken : xDai_wxHOPR),
    abi: ERC677_ABI,
    transactionHash: '', // not required by this website
  }

  const xHoprToken: ContractData = {
    ...(envId === 'master-goerli' ? goerli_xHOPR : xDai_xHOPR),
    abi: ERC677_ABI,
    transactionHash: '', // not required by this website
  }

  last_chainId = chainId
  contracts = {
    wxHoprToken,
    xHoprToken,
    hoprBoost,
    hoprStake,
  }

  return contracts
}

// TODO: read from protocol-config
const xDai_xHOPR: Pick<ContractData, 'address' | 'blockNumber'> = {
  address: '0xD057604A14982FE8D88c5fC25Aac3267eA142a08',
  blockNumber: 14635013,
}

// TODO: read from protocol-config
const xDai_wxHOPR: Pick<ContractData, 'address' | 'blockNumber'> = {
  address: '0xD4fdec44DB9D44B8f2b6d529620f9C0C7066A2c1',
  blockNumber: 14744161,
}

const goerli_xHOPR: Pick<ContractData, 'address' | 'blockNumber'> = {
  address: '0xe8ad2ac347da7549aaca8f5b1c5bf979d85bc78f',
  blockNumber: 6907086,
}

// TODO: read from hopr-ethereum
const ERC677_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'transferAndCall',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
