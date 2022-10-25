import { Flex, BoxProps } from '@chakra-ui/react'

export const BalanceWithCurrency = ({
  balanceElement,
  currencyElement,
  props,
}: {
  balanceElement: JSX.Element
  currencyElement: JSX.Element
  props?: BoxProps
}): JSX.Element => {
  return (
    <Flex alignItems="baseline" {...props}>
      {balanceElement}
      {currencyElement}
    </Flex>
  )
}
