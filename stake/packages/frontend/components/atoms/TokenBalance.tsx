import { utils, constants } from 'ethers'
import { useTokenBalance } from '@usedapp/core'
import { Skeleton, Tag } from '@chakra-ui/react'
import { round } from '../../lib/helpers'
import { useEthersWithViewMode } from '../../lib/hooks'

export const TokenBalance = ({
  tokenContract,
  givenAccount,
  colorScheme = 'green',
  useViewMode,
  viewModeAddress
}: {
  tokenContract: string
  givenAccount?: string
  colorScheme?: string
  useViewMode?: boolean
  viewModeAddress?: string
}): JSX.Element => {
  let isLoaded = false;
  const { account } = useEthersWithViewMode(useViewMode && viewModeAddress)
  
  const tokenBalance =
    useTokenBalance(tokenContract, givenAccount || account) || constants.Zero
  const balance = tokenBalance
    ? round(Number(utils.formatEther(tokenBalance)), 4)
    : '--'
    isLoaded = true;

  return (
    <>
      <Skeleton isLoaded={isLoaded} mr="5px">
        <Tag mr="5px" colorScheme={colorScheme} fontFamily="mono">
          {balance}
        </Tag>
      </Skeleton>
    </>
  )
}
