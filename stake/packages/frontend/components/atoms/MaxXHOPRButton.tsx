import { utils, constants } from 'ethers'
import { useEthers, useTokenBalance } from '@usedapp/core'
import { Button } from '@chakra-ui/react'

export const MaxXHOPRButton = ({
  XHOPRContractAddress,
  updateBalanceHandler,
}: {
  XHOPRContractAddress: string
  updateBalanceHandler: (balance: string) => void
}): JSX.Element => {
  const { account } = useEthers()

  const tokenBalance =
    useTokenBalance(XHOPRContractAddress, account) || constants.Zero
  const balance = tokenBalance
    ? Number(utils.formatEther(tokenBalance))
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
