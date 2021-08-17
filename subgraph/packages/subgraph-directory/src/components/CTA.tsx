import { Link as ChakraLink, Button } from '@chakra-ui/react'

import { Container } from './Container'

export const CTA = () => (
  <Container
    flexDirection="row"
    position="fixed"
    bottom="0"
    width="100%"
    maxWidth="48rem"
    py={3}
  >
    <ChakraLink
      isExternal
      href="https://github.com/hoprnet/hopr-devrel"
      flexGrow={3}
      mx={2}
    >
      <Button width="100%" variant="solid" colorScheme="green">
        See GitHub Repo
      </Button>
    </ChakraLink>
  </Container>
)
