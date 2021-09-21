import { createClient } from '@urql/core'
import { useEffect, useState } from 'react'
import { Skeleton, Tag, Tooltip } from '@chakra-ui/react'
import { utils } from 'ethers'

const client = createClient({
  url: 'https://api.thegraph.com/subgraphs/name/hoprnet/hopr-staking-program',
  fetchOptions: {
    mode: 'cors', // no-cors, cors, *same-origin
  },
})

const QUERY_STATS = `
{
  programs(first: 1) {
    currentRewardPool
    totalActualStake
    totalVirtualStake
    totalUnclaimedRewards
    lastSyncTimestamp
  }
}
`

export const TotalStakedBalance = () => {
  const [isLoaded, setLoaded] = useState(true)
  const [virtualStake, setVirtualStake] = useState(0)
  const [actualStake, setActualStake] = useState(0)
  const [totalStake, setTotalStake] = useState(0)
  useEffect(() => {
    const loadStakingStats = async () => {
      setLoaded(false)
      const { data } = await client.query(QUERY_STATS).toPromise()
      const totalVirtualStake = +utils.formatEther(data.programs[0].totalVirtualStake)
      const totalActualStake = +utils.formatEther(data.programs[0].totalActualStake)
      setVirtualStake(totalVirtualStake)
      setActualStake(totalActualStake)
      setTotalStake(totalVirtualStake + totalActualStake)
      setLoaded(true)
    }
    loadStakingStats()
  }, [])
  return (
    <>
      <Skeleton isLoaded={isLoaded} mr="5px">
        <Tooltip label={`${actualStake.toFixed(4)} staked by community, ${virtualStake.toFixed(4)} staked by investors.`} aria-label="Staking breakdown">
          <Tag mr="5px" colorScheme="blue" fontFamily="mono">
            {totalStake.toFixed(4)}
          </Tag>
        </Tooltip>
      </Skeleton>
    </>
  )
}
