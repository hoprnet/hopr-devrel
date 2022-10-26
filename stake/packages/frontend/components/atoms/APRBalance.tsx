import { Text, Box, Skeleton } from '@chakra-ui/react'

export const APRBalance = ({
  totalAPRBoost = 0,
}: {
  totalAPRBoost?: number
}): JSX.Element => {
  return (
    <Box d="inline">
      <Text d="inline" fontWeight="700" color="blue.600" fontSize="xl">
        {`${2.5 + (totalAPRBoost >= 0 ? totalAPRBoost : 0) / 79}%`}
      </Text>
      <Text d="inline" fontWeight="700" fontSize="xl">
        {' '}
        (2.5% base +{' '}
      </Text>
      <Skeleton d="inline" isLoaded={totalAPRBoost != -1}>
        <Text d="inline" fontWeight="700" color="green.600" fontSize="xl">
          {(totalAPRBoost / 79).toFixed(2)}% boosted
        </Text>
      </Skeleton>
      <Text d="inline" fontWeight="700" fontSize="xl">
        )
      </Text>
    </Box>
  )
}
