import { Box, Heading, Text, Link, useColorMode } from '@chakra-ui/react'
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
        HOPR Staking Season 1 has ended.
      </Text>
      <Text mt="3" fontSize="xl">
        In order to unlock your staked funds and claim rewards, you will need to follow these steps:
      </Text>
        <Heading as="h5">
        1. Preparation
        </Heading>
      <Text mt="2" fontSize="xl">
        This will set the ERC777TokensRecipient implementation proxy for your wallet to be the HoprWhitehat contract, which is required for step 2 to work.
      </Text>
      <Text mt="2" fontSize="xl">
        Go to <Link px="1" href="https://blockscout.com/xdai/mainnet/address/0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24/write-contract" isExternal>
        https://blockscout.com/xdai/mainnet/address/0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24/write-contract
        </Link>
      </Text>
      <Text mt="2" fontSize="xl">
        Find row: %quot;1. setInterfaceImplementer&quot;
      </Text>
      <Text mt="2" fontSize="xl">
        Insert these parameters:<br/>
        1. The address of the account you staked with.<br/>
        2. 0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b<br/>
        3. 0x153Aa74a8588606f134B2d35eB6e707a7d550705
      </Text>
      <Text mt="2" fontSize="xl">
        Click the button &quot;Write&quot;, the Metamask popup will come out, you will need to confirm the transaction.
      </Text>
        <Heading as="h5">
        2. Perform unlock
        </Heading>
      <Text mt="2" fontSize="xl">
        Go to <Link px="1" href="https://blockscout.com/xdai/mainnet/address/0x153Aa74a8588606f134B2d35eB6e707a7d550705/write-contract" isExternal>
        https://blockscout.com/xdai/mainnet/address/0x153Aa74a8588606f134B2d35eB6e707a7d550705/write-contract
          </Link>
      </Text>
      <Text mt="2" fontSize="xl">
        Find row: %quot;3. gimmeToken&quot;
      </Text>
      <Text mt="2" fontSize="xl">
        Click the button &quot;Write&quot;, the Metamask popup will come out, you will need to confirm the transaction.
      </Text>
        <Heading as="h5">
        3. Reverse preparation step
        </Heading>
      <Text mt="2" fontSize="xl">
        This will reset the ERC777TokensRecipient implementation proxy for your wallet and this will conclude the recovery.
      </Text>

      <Text mt="2" fontSize="xl">
        Go to <Link px="1" href="https://blockscout.com/xdai/mainnet/address/0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24/write-contract" isExternal>
        https://blockscout.com/xdai/mainnet/address/0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24/write-contract
        </Link>
      </Text>

      <Text mt="2" fontSize="xl">
        Find row: %quot;1. setInterfaceImplementer&quot;
      </Text>

      <Text mt="2" fontSize="xl">
        Insert these parameters:<br/>
        1. The address of the account you staked with.<br/>
        2. 0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b<br/>
        3. 0x0000000000000000000000000000000000000000
      </Text>

      <Text mt="2" fontSize="xl">
        Click the button &quot;Write&quot;, the Metamask popup will come out, you will need to confirm the transaction.
      </Text>
      <Text mt="8" fontSize="xl">
        To restake in HOPR Staking Season 2, click{' '}
        <Link px="1" href="https://stake.hoprnet.org" isExternal>
          stake.hoprnet.org
        </Link>
        . Any questions, please ask on{' '}
        <Link px="1" href="https://t.me/hoprnet" isExternal>
          Telegram
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
