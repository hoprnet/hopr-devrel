import { Box, Heading, Text, Link, useColorMode, UnorderedList, ListItem } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useEthers } from '@usedapp/core'
import React, { useEffect, useReducer, useState } from 'react'
import { DarkModeSwitch } from '../components/atoms/DarkModeSwitch'
import Layout from '../components/layout/Layout'
import { NFTQuery } from '../components/NFTQuery'
import { StakeXHoprTokens } from '../components/StakeXHoprTokens'
import {
  emptyContractAddresses,
  emptyFromBlockNumbers,
  getBlockNumberFromDeploymentTransactionHashReceipt,
  getContractAddresses,
  IContractAddress,
  IContractFromBlockNumbers,
} from '../lib/addresses'
import { bgColor, color } from '../lib/helpers'
import { reducer, initialState } from '../lib/reducers'
import { TokenBalance } from '../components/atoms/TokenBalance'
import { CurrencyTag } from '../components/atoms/CurrencyTag'
import { TotalStakedBalance } from '../components/atoms/TotalStakedBalance'

function HomeIndex(): JSX.Element {
  const { chainId } = useEthers()
  const { colorMode } = useColorMode()
  const [state, dispatch] = useReducer(reducer, initialState)

  const [contractAddresses, setContractAddresses] = useState<IContractAddress>(
    emptyContractAddresses
  )
  const [fromBlockNumbers, setFromBlockNumbers] =
    useState<IContractFromBlockNumbers>(emptyFromBlockNumbers)

  useEffect(() => {
    const loadContracts = async () => {
      const contractAddresses = await getContractAddresses(chainId)
      const fromBlockNumbers =
        await getBlockNumberFromDeploymentTransactionHashReceipt(chainId)
      setContractAddresses(contractAddresses)
      setFromBlockNumbers(fromBlockNumbers)
    }
    loadContracts()
  }, [chainId])

  return (
    <Layout>
      <Box d="flex" mb="8" justifyContent="space-between" alignItems="center">
        <Heading as="h1">HOPR Staking</Heading>
        <Box d="flex" alignItems="center">
          <Box d="flex" alignItems="baseline" mr="20px">
            <Text fontWeight="600" mr="10px">
              Available Rewards{'  '}
            </Text>
            <TokenBalance
              tokenContract={contractAddresses.wxHOPR}
              givenAccount={contractAddresses.HoprStake}
            />{' '}
            <Text fontSize="xs">wxHOPR</Text>
          </Box>
          <Box d="flex" alignItems="baseline">
            <Text fontWeight="600" mr="10px">
              Total Staked{'  '}
            </Text>
            <TotalStakedBalance />
            <CurrencyTag tag="xHOPR" />
          </Box>
        </Box>
      </Box>
      <Text mt="8" fontSize="xl">
        HOPR Staking Season 1 has ended. To unlock your tokens, please follow these steps. If you have any questions, please ask on Telegram [<Link px="1" href="https://t.me/hoprnet">https://t.me/hoprnet <ExternalLinkIcon /></Link>]
      </Text>
        <Heading as="h5" mt="4">
          STEP ONE: PREPARATION
        </Heading>
      <Text mt="2" fontSize="xl">
        <b>Visit this contract:</b> <Link px="1" href="https://blockscout.com/xdai/mainnet/address/0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24/write-contract" isExternal>
        https://blockscout.com/xdai/mainnet/address/0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24/write-contract <ExternalLinkIcon />
        </Link>
      </Text>
      <Text mt="2" fontSize="xl">
        Find row: <b>1. setInterfaceImplementer</b>
      </Text>
      <UnorderedList mt="2" fontSize="xl">
        <ListItem>In the first field paste your staking address</ListItem>
        <ListItem>In the second field paste: <b>0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b</b></ListItem>
        <ListItem>In the third field, paste: <b>0x153Aa74a8588606f134B2d35eB6e707a7d550705</b></ListItem>
      </UnorderedList>
      <Text mt="2" fontSize="xl">
        Click <b>&quot;Write&quot;</b>. A Metamask popup will appear. Confirm the transaction.
      </Text>
        <Heading as="h5" mt="4">
          STEP TWO: PERFORM UNLOCK
        </Heading>
      <Text mt="2" fontSize="xl">
        <b>Go to the whitehat contract</b>: <Link px="1" href="https://blockscout.com/xdai/mainnet/address/0x153Aa74a8588606f134B2d35eB6e707a7d550705/write-contract" isExternal>
        https://blockscout.com/xdai/mainnet/address/0x153Aa74a8588606f134B2d35eB6e707a7d550705/write-contract <ExternalLinkIcon />

          </Link>
      </Text>
      <Text mt="2" fontSize="xl">
        Find row: <b>3. gimmeToken</b>
      </Text>
      <Text mt="2" fontSize="xl">
        Click <b>&quot;Write&quot;</b>. A Metamask popup will appear. Confirm the transaction.
      </Text>
        <Heading as="h5" mt="4">
          STEP THREE: REVERSE STEP ONE
        </Heading>
      <Text mt="2" fontSize="xl">
        <b>Go back to the first contract</b>: <Link px="1" href="https://blockscout.com/xdai/mainnet/address/0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24/write-contract" isExternal>
        https://blockscout.com/xdai/mainnet/address/0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24/write-contract <ExternalLinkIcon />

        </Link>
      </Text>
      <Text mt="2" fontSize="xl">
        Find row: <b>1. setInterfaceImplementer</b>
      </Text>
      <UnorderedList mt="2" fontSize="xl">
        <ListItem>In the first field paste your staking address</ListItem>
        <ListItem>In the second field paste: <b>0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b</b></ListItem>
        <ListItem>In the third field, paste: <b>0x0000000000000000000000000000000000000000</b></ListItem>
      </UnorderedList>
      <Text mt="2" fontSize="xl">
        Click <b>&quot;Write&quot;</b>. A Metamask popup will appear. Confirm the transaction. This will reset the ERC777TokensRecipient implementation proxy for your wallet and this will conclude the recovery.
      </Text>
      <Text mt="8" fontSize="xl">
        To restake in HOPR Staking Season 2, click{' '}
        <Link px="1" href="https://stake.hoprnet.org" isExternal>
          stake.hoprnet.org <ExternalLinkIcon />
        </Link>
        . Any questions, please ask on{' '}
        <Link px="1" href="https://t.me/hoprnet" isExternal>
          Telegram <ExternalLinkIcon />
        </Link>
        .
      </Text>
      <Box
        maxWidth="container.l"
        p="8"
        mt="8"
        bg={bgColor[colorMode]}
        color={color[colorMode]}
      >
        <StakeXHoprTokens
          XHOPRContractAddress={contractAddresses.xHOPR}
          HoprStakeContractAddress={contractAddresses.HoprStake}
          state={state}
          dispatch={dispatch}
        />
      </Box>
      <NFTQuery
        HoprBoostContractAddress={contractAddresses.HoprBoost}
        HoprStakeContractAddress={contractAddresses.HoprStake}
        fromBlock={fromBlockNumbers.HoprBoost}
        state={state}
        dispatch={dispatch}
      />
      <DarkModeSwitch />
    </Layout>
  )
}

export default HomeIndex
