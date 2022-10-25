import { Box, Heading, Text, Link, useColorMode } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { getExplorerAddressLink, useEthers } from '@usedapp/core'
import React, { useEffect, useReducer, useState } from 'react'
import { DarkModeSwitch } from '../components/atoms/DarkModeSwitch'
import Layout from '../components/layout/Layout'
import { NFTQuery } from '../components/NFTQuery'
import { StakeXHoprTokens } from '../components/StakeXHoprTokens'
import {
  emptyContractABIs,
  emptyContractAddresses,
  emptyFromBlockNumbers,
  getBlockNumberFromDeploymentTransactionHashReceipt,
  getContractABIs,
  getContractAddresses,
  IContractABIs,
  IContractAddress,
  IContractFromBlockNumbers,
} from '../lib/addresses'
import { bgColor, color } from '../lib/helpers'
import { APRBalance } from '../components/atoms/APRBalance'
import { reducer, initialState } from '../lib/reducers'
import { ParagraphLinks } from '../components/atoms/ParagraphLinks'
import { TokenBalance } from '../components/atoms/TokenBalance'
import { CurrencyTag } from '../components/atoms/CurrencyTag'
import {
  EndProgramDateDays,
  StartProgramDate,
} from '../components/atoms/ProgramDate'
import { BoldText } from '../components/atoms/BoldText'
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
  const [contractABIs, setContractABIs] =
    useState<IContractABIs>(emptyContractABIs)

  useEffect(() => {
    const loadContracts = async () => {
      const contractAddresses = await getContractAddresses(chainId)
      const fromBlockNumbers =
        await getBlockNumberFromDeploymentTransactionHashReceipt(chainId)
      const abis = await getContractABIs(chainId)
      setContractAddresses(contractAddresses)
      setFromBlockNumbers(fromBlockNumbers)
      setContractABIs(abis)
    }
    loadContracts()
  }, [chainId])

  return (
    <Layout dispatch={dispatch} useViewMode={state.useViewMode} viewModeAddress={state.viewModeAddress}>
      <Box d="flex" mb="8" justifyContent="space-between" alignItems="center">
        <Heading as="h1">HOPR Staking Season 5</Heading>
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
      <Text mt="8" fontSize="xl" d="inline">
        Stake{' '}
        <Link
          px="1"
          href={getExplorerAddressLink(contractAddresses.xHOPR, chainId)}
          isExternal
        >
          xHOPR <ExternalLinkIcon />
        </Link>{' '}
        tokens to earn a total APR of{' '}
      </Text>
      <APRBalance totalAPRBoost={state.totalAPRBoost} />.
      <Text mt="8" fontSize="xl">
        HOPR Staking Season 4 has finished, to recover your xHOPR stake, locked
        NFTs and unclaimed wxHOPR rewards, visit{' '}
        <Link px="1" href="https://stake-s4.hoprnet.org" isExternal>
          stake S4 <ExternalLinkIcon />
        </Link>
        , connect your wallet and press “Unlock”. To restake, simply
        return to this site.
      </Text>
      <Heading mt="8" as="h4" fontSize="large">
        MAKE SURE TO STAKE FROM YOUR SEASON 4 ADDRESS TO BE ELIGIBLE FOR EXTRA
        REWARDS
      </Heading>
      <br />
      <Text mt="8" fontSize="xl" d="inline">
        Starting{' '}
      </Text>
      <BoldText>
        <StartProgramDate
          HoprStakeABI={contractABIs.HoprStake}
          HoprStakeContractAddress={contractAddresses.HoprStake}
        />
      </BoldText>
      <Text mt="8" fontSize="xl" d="inline">
        , rewards can be claimed on each block. All rewards will be returned as{' '}
        <Link
          px="1"
          href={getExplorerAddressLink(contractAddresses.wxHOPR, chainId)}
          isExternal
        >
          wxHOPR <ExternalLinkIcon />
        </Link>{' '}
        tokens. xHOPR staked today will be locked for{' '}
      </Text>
      <BoldText fullstop>
        <EndProgramDateDays
          HoprStakeABI={contractABIs.HoprStake}
          HoprStakeContractAddress={contractAddresses.HoprStake}
        />
      </BoldText>
      <Text mt="2" fontSize="xl">
        Increase your APR by redeeming NFTs to your account. HOPR Boost NFTs can
        be earned by participating in events. Season 3 and 4 NFTs can be
        restaked in Season 5 with the same APR boost. Season 1 and 2 NFTs and the HODLr NFT have been
        discontinued. New NFTs based on your previous collection will be available soon.
      </Text>
      <ParagraphLinks />
      <Text mt="2" fontSize="xl"></Text>
      <Box
        maxWidth="container.l"
        p="8"
        mt="8"
        bg={bgColor[colorMode]}
        color={color[colorMode]}
      >
        <StakeXHoprTokens
          xHoprABI={contractABIs.xHOPR}
          XHOPRContractAddress={contractAddresses.xHOPR}
          HoprStakeABI={contractABIs.HoprStake}
          HoprStakeContractAddress={contractAddresses.HoprStake}
          state={state}
          dispatch={dispatch}
        />
      </Box>
      <NFTQuery
        HoprBoostABI={contractABIs.HoprBoost}
        HoprBoostContractAddress={contractAddresses.HoprBoost}
        HoprStakeABI={contractABIs.HoprStake}
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
