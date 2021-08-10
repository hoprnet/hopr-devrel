import {
  Text,
  Input,
  InputRightElement,
  InputGroup,
  Tag,
  FormLabel,
  Button,
  Box,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { Footer } from "../components/Footer";
import * as websocket from "websocket";
import Cookies from "js-cookie";

const Index = () => {
  const [online, setOnline] = useState<boolean>(false);
  const [serverURL, setServerURL] = useState<string>("");
  const [maybeServerURL, setMaybeServerURL] = useState<string>("");
  const [apiToken, setApiToken] = useState<string>();
  const [isLoadingServer, setLoadingServer] = useState<boolean>(false);
  const [ws, setWs] = useState<any>();
  const toast = useToast();

  const SERVER_TIMEOUT_IN_MS = 2000;
  const { w3cwebsocket } = websocket;

  let onlineTimeout: NodeJS.Timeout;

  useEffect(() => {
    if (!serverURL || serverURL.length == 0 || serverURL == "") {
      return;
    }
    console.log("Connecting to", serverURL)
    const ws = w3cwebsocket(serverURL);

    ws.onopen = () => {
      console.log("Server opened connection");
      handleOpen();
    };
    ws.onclose = () => {
      console.log("Server closed connection");
      handleDisconnect();
    };
    ws.onmessage = (message) => {
      console.log("Message from Server", message);
      handleMessages(message);
    };
    setWs(ws);
    return () => {
      console.log("Clearing out state changes.");
      //TODO: Ensure this doesn't get called twice
      handleDisconnect();
    };
  }, [serverURL]);

  const handleKeyPress = (event) => {
    if (event.charCode === 13 && online) {
      ws.send(event.target.value);
    }
  };

  const handleOpen = () => {
    console.log("Handle Open has been called, creating timeout");
    onlineTimeout = setTimeout(() => {
      console.log("Timeout was not cleared, we can go online.");
      setOnline(true);
      clearTimeout(onlineTimeout);
    }, 5000);
    console.log(`Online timeout ${onlineTimeout} was updated`);
  };

  const handleDisconnect = () => {
    console.log("Handle Disconnect has been called");
    ws && ws.close();
    console.log("Timeout", onlineTimeout);
    if (onlineTimeout) {
      console.log("Timeout was found in disconnect, clearing out");
      clearTimeout(onlineTimeout);
    }
    setServerURL("");
    setMaybeServerURL("");
    setOnline(false);
  };

  const handleMessages = (message) => {
    console.log("MESSAGE RECIEVED", message);
    if (!message) {
      return;
    }
    const msg = JSON.parse(message.data);
    if (msg.type === "auth-failed") {
      toast({
        title: "Authentication Error",
        description: `This HOPR node needs an API token`,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }
    const lastTimestamp = new Date().getTime();
    const messageTimestamp = new Date(msg.ts).getTime();
    const isRecentMessage = lastTimestamp - messageTimestamp < 1000;

    if (isRecentMessage) {
      toast({
        title: msg.type[0].toUpperCase() + msg.type.slice(1),
        description: `${msg.msg}`,
        status: "success",
        duration: 6000,
        isClosable: true,
      });
    }

    isRecentMessage && console.log("Message", msg);
  };

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
            <Button
              d="block"
              margin="auto"
              colorScheme="red"
              maxW="150"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </Box>
        ) : (
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
              onChange={(event) => setApiToken(event.target.value)}
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
                console.log("API TOKEN", apiToken);
                Cookies.set("X-Auth-Token", apiToken);
                console.log("Cookies from", Cookies.get("X-Auth-Token"));
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
        )}
      </Main>

      <DarkModeSwitch />
      <Footer>
        <Text>By HOPR Association</Text>
      </Footer>
    </Container>
  );
};

export default Index;
