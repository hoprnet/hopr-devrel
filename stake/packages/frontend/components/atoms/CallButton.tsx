import { Button } from '@chakra-ui/react'

export const CallButton = ({
  disabled,
  isLoading,
  handler,
  children
}: {
  disabled?: boolean
  isLoading: boolean
  handler: () => void
  children: JSX.Element | string
}): JSX.Element => (
  <Button
    size="md"
    bg="blackAlpha.900"
    color="whiteAlpha.900"
    isLoading={isLoading}
    disabled={disabled}
    onClick={handler}
  >
    { children }
  </Button>
)
