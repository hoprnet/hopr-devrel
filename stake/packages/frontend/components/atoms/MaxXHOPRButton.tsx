import { utils, constants } from 'ethers'
import { useTokenBalance } from '@usedapp/core'
import { Button } from '@chakra-ui/react'
import { round } from '../../lib/helpers'
import { useEthersWithViewMode } from '../../lib/hooks'

export const MaxXHOPRButton = ({
  XHOPRContractAddress,
  updateBalanceHandler,
  useViewMode,
  viewModeAddress,
}: {
  XHOPRContractAddress: string
  updateBalanceHandler: (balance: string) => void
  useViewMode: boolean
  viewModeAddress: string
}): JSX.Element => {
  const { account } = useEthersWithViewMode(useViewMode && viewModeAddress)

  const tokenBalance =
    useTokenBalance(XHOPRContractAddress, account) || constants.Zero
  const balance = tokenBalance
    ? round(Number(utils.formatEther(tokenBalance)), 4)
    : '--'

  return (
    <Button
      ml="5px"
      width="10rem"
      size="sm"
      bg="blue.100"
      onClick={() => updateBalanceHandler(balance)}
    >
      Max
    </Button>
  )
}
