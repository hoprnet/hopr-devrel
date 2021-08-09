import { Flex, Heading } from '@chakra-ui/react'

export const Hero = ({ title = 'HOPR Channels' }: { title?: string }) => (
  <Flex
    justifyContent="center"
    alignItems="center"
    height="100vh"
  >
    <Heading fontSize="6vw">{title}</Heading>
  </Flex>
)
