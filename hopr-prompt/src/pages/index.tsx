import {
  Text,
  Input,
  InputRightElement,
  InputGroup,
  Tag,
  FormLabel,
  Button,
  Box,
  useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { Footer } from "../components/Footer";
import * as websocket from "websocket";

const Index = () => {
  const [online, setOnline] = useState<boolean>(false);
  const [serverURL, setServerURL] = useState<string>("");
  const [maybeServerURL, setMaybeServerURL] = useState<string>();
  const [isLoadingServer, setLoadingServer] = useState<boolean>(false);
  const [ws, setWs] = useState<any>();
  const toast = useToast()

  const SERVER_TIMEOUT_IN_MS = 5000;
  const { w3cwebsocket } = websocket;

  useEffect(() => {
    if (!serverURL || serverURL.length == 0 || serverURL == "") {
      return;
    }
    const ws = w3cwebsocket(serverURL);
    ws.onopen = () => {
      setOnline(true);
      console.log("Server has been found");
    };
    ws.onmessage = (message) => {
      const msg = JSON.parse(message.data)
      // toast({
      //   title: msg.type,
      //   description: "We've created your account for you.",
      //   status: "success",
      //   duration: 9000,
      //   isClosable: true,
      // })
      console.log("Message", msg);
    };
    setWs(ws);
    console.log("WS", ws);
    return () => {
      ws.close();
    }
  }, [serverURL]);

  const handleKeyPress = (event) => {
    if (event.charCode === 13 && online) {
      ws.send(event.target.value);
    }
  };

  const handleDisconnect = () => {
    ws && ws.close();
    setServerURL('');
    setMaybeServerURL('');
    setOnline(false);
  }

  return (
    <Container height="100vh">
      <Hero />
      <Main>
        <Text mt="10" textAlign="center">
          Web utility to interact with your HOPR node from your browser.
        </Text>
        {online ? (
          <Box>
          <InputGroup size="md">
            <FormLabel>Send command</FormLabel>
            <Input
              pr="4.5rem"
              type="text"
              placeholder="Send a command to your node."
              onKeyPress={handleKeyPress}
            />
            <InputRightElement width="5rem">
              <Tag
                colorScheme={online ? "green" : "gray"}
                h="1.75rem"
                size="sm"
                onClick={() => {}}
              >
                {online ? "Online" : "Offline"}
              </Tag>
            </InputRightElement>
          </InputGroup>
          <Button d="block" margin="auto" colorScheme="red" maxW="150" onClick={handleDisconnect}>Disconnect</Button>
          </Box>)
        :
        <InputGroup size="md">
          <Input
            isDisabled={isLoadingServer}
            mx="2"
            name="url"
            onChange={(event) => setMaybeServerURL(event.target.value)}
            type="text"
            placeholder="Your node web socket URL"
            onKeyPress={handleKeyPress}
          />
          <Input
            isDisabled={isLoadingServer}
            mx="2"
            name="apiToken"
            type="password"
            placeholder="Your API token (if any)"
            onKeyPress={handleKeyPress}
          />
          <Button
            mx="2"
            minWidth="100px"
            colorScheme="green"
            isLoading={isLoadingServer}
            onClick={() => {
              setLoadingServer(true);
              setServerURL(maybeServerURL);
              setInterval(() => {
                setLoadingServer(false);
              }, SERVER_TIMEOUT_IN_MS);
            }}
          >
            Connect
          </Button>
        </InputGroup>
}
      </Main>

      <DarkModeSwitch />
      <Footer>
        <Text>By HOPR Association</Text>
      </Footer>
    </Container>
  );
};

export default Index;
