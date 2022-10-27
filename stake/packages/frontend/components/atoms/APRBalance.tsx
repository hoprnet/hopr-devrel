import { Text, Box, Skeleton } from '@chakra-ui/react'

export const APRBalance = ({
  totalAPRBoost = 0,
}: {
  totalAPRBoost?: number
}): JSX.Element => {
  const base = 2.5
  const factor = 1 / (100 * 60 * 60 * 24 * 365 / 1e12)
  const totalAPRBoostReal = totalAPRBoost >= 0 ? totalAPRBoost : 0
  const boost = totalAPRBoostReal / factor
  const total = +base + +boost
  return (
    <Box d="inline">
      <Text d="inline" fontWeight="700" color="blue.600" fontSize="xl">
        {total.toFixed(2)}%
      </Text>
      <Text d="inline" fontWeight="700" fontSize="xl">
        {' '}
        ({base.toFixed(2)}% base +{' '}
      </Text>
      <Skeleton d="inline" isLoaded={totalAPRBoost != -1}>
        <Text d="inline" fontWeight="700" color="green.600" fontSize="xl">
          {boost.toFixed(2)}% boosted
        </Text>
      </Skeleton>
      <Text d="inline" fontWeight="700" fontSize="xl">
        )
      </Text>
    </Box>
  )
}
