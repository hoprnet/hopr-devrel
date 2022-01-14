import { Client, createClient } from '@urql/core'
import { useEffect, useState } from 'react'
import { Skeleton, Tag, Tooltip } from '@chakra-ui/react'
import { utils } from 'ethers'
import { useEthers } from '@usedapp/core'
import { SUBGRPAH_URLS } from '../../lib/connectors'

let client: Client

const QUERY_STATS = `
{
  programs(first: 1) {
    currentRewardPool
    totalActualStake
    totalUnclaimedRewards
    lastSyncTimestamp
  }
}
`

export const TotalStakedBalance = () => {
  const { chainId } = useEthers()
  const [isLoaded, setLoaded] = useState(true)
  const [actualStake, setActualStake] = useState(0)
  const [totalStake, setTotalStake] = useState(0)
  useEffect(() => {
    const loadStakingStats = async () => {
      setLoaded(false)
      client = createClient({
        url: SUBGRPAH_URLS[chainId] || SUBGRPAH_URLS['100'],
        fetchOptions: {
          mode: 'cors', // no-cors, cors, *same-origin
        },
      })
      const { data } = await client.query(QUERY_STATS).toPromise()
      const totalActualStake = +utils.formatEther(
        data.programs[0].totalActualStake
      )
      setActualStake(totalActualStake)
      setTotalStake(totalActualStake)
      setLoaded(true)
    }
    loadStakingStats()
  }, [])
  return (
    <>
      <Skeleton isLoaded={isLoaded} mr="5px">
        <Tooltip
          label={`${actualStake.toFixed(4)} staked by community.`}
          aria-label="Staking breakdown"
        >
          <Tag mr="5px" colorScheme="blue" fontFamily="mono">
            {totalStake.toFixed(4)}
          </Tag>
        </Tooltip>
      </Skeleton>
    </>
  )
}
