import {
  InputGroup,
  Input,
  InputRightElement,
  Button,
  useColorMode,
} from '@chakra-ui/react'
import { bgColor } from '../../lib/helpers'
import { ActionType } from '../../lib/reducers'

function ViewAddress({
  dispatch,
  viewModeAddress,
}: {
  dispatch: React.Dispatch<ActionType>
  viewModeAddress: string
}): JSX.Element {
  const { colorMode } = useColorMode()
  return (
    <InputGroup justifyContent="right">
      <Input
        bg={bgColor[colorMode]}
        type="text"
        w="95%"
        value={viewModeAddress}
        fontSize="sm"
        placeholder="0x1234..."
        onChange={(e) => {
          dispatch({
            type: 'SET_VIEW_MODE_ADDRESS',
            viewModeAddress: e.target.value,
          })
        }}
      />
      {viewModeAddress != '' ? (
        <InputRightElement width="2.5rem">
          <Button
            h="1.75rem"
            size="sm"
            onClick={() => {
              dispatch({
                type: 'SET_VIEW_MODE_ADDRESS',
                viewModeAddress: '',
              })
            }}
          >
            ✗
          </Button>
        </InputRightElement>
      ) : (
        <InputRightElement width="9rem">
          <Button
            h="1.75rem"
            size="sm"
            onClick={() => {
              dispatch({
                type: 'SET_VIEW_MODE',
                useViewMode: false,
              })
            }}
          >
            Exit View Mode
          </Button>
        </InputRightElement>
      )}
    </InputGroup>
  )
}

export default ViewAddress
