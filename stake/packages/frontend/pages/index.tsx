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
        HOPR Staking Season 1 has ended. Press &quot;Unlock&quot; to recover
        your stake, your HOPR Boost NFTs, and claim any unclaimed rewards.
      </Text>
      <Text fontSize="xl">
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
