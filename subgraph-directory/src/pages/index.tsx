import {
  Link as ChakraLink,
  Text,
  Code,
  List,
  ListIcon,
  ListItem,
} from "@chakra-ui/react";
import { CheckCircleIcon, LinkIcon } from "@chakra-ui/icons";

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";
import { ChainId, CHAIN_NAMES, getExplorerUrl, HOPRChannelsDeployedSmartContractAddress } from "../lib/constants";

const Index = () => (
  <Container height="100vh">
    <Hero />
    <Main>
      <Text>
        A list of all the deployed <Code>HOPRChannels</Code> contracts used in the{" "}
        <ChakraLink isExternal href="https://hoprnet.org" flexGrow={1} mr={2}>
          HOPR Protocol <LinkIcon />
        </ChakraLink>
      </Text>
      <List spacing={3} my={0}>
        {Object.keys(HOPRChannelsDeployedSmartContractAddress).map(
          (chainId) => (
            <ListItem key={chainId}>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              {CHAIN_NAMES[chainId]} ({chainId}) -
              <ChakraLink isExternal href={getExplorerUrl(HOPRChannelsDeployedSmartContractAddress[chainId], +chainId as ChainId)} flexGrow={1} mr={2}>
                <Code>{HOPRChannelsDeployedSmartContractAddress[chainId]}</Code><LinkIcon />
              </ChakraLink>
            </ListItem>
          )
        )}
      </List>
    </Main>

    <DarkModeSwitch />
    <Footer>
      <Text>By the HOPR Association</Text>
    </Footer>
    <CTA />
  </Container>
);

export default Index;
