import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Container,
  Flex,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Text,
  Tag,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
  useNotifications,
  useConfig,
  Goerli,
  Chain
} from '@usedapp/core'
import blockies from 'blockies-ts'
import React from 'react'
import { useEffect, useState } from 'react'
import {
  emptyContractAddresses,
  getContractAddresses,
  IContractAddress,
} from '../../lib/addresses'
import UserBalance from '../atoms/UserBalance'
import ConnectWallet from '../atoms/ConnectWallet'
import Head, { MetaProps } from './Head'
import { chainIdToNetwork, RPC_COLOURS } from '../../lib/connectors'
import { ActionType } from '../../lib/reducers'
import ViewAddress from '../atoms/ViewAddress'
import { useEthersWithViewMode } from '../../lib/hooks'

// Extends `window` to add `ethereum`.
declare global {
  interface Window {
    ethereum: any
  }
}

/**
 * Constants & Helpers
 */

// Title text for the various transaction notifications.
const TRANSACTION_TITLES = {
  transactionStarted: 'Local Transaction Started',
  transactionSucceed: 'Local Transaction Completed',
}

// Takes a long hash string and truncates it.
function truncateHash(hash: string, length = 38): string {
  return hash.replace(hash.substring(6, length), '...')
}

/**
 * Prop Types
 */
interface LayoutProps {
  children: React.ReactNode
  customMeta?: MetaProps
  dispatch: React.Dispatch<ActionType>
  useViewMode: boolean
  viewModeAddress: string
}

/**
 * Component
 */
const Layout = ({ children, customMeta, dispatch, useViewMode, viewModeAddress }: LayoutProps): JSX.Element => {
  const { networks } = useConfig()
  const { account, deactivate, chainId } = useEthersWithViewMode(useViewMode && viewModeAddress)
  const [contractAddresses, setContractAddresses] = useState<IContractAddress>(
    emptyContractAddresses
  )
  const { notifications } = useNotifications()
  const [chain, setChain] = useState<Chain>(Goerli)
  const colours = RPC_COLOURS[chainId] || { scheme: 'gray' }

  let blockieImageSrc
  if (typeof window !== 'undefined') {
    blockieImageSrc = blockies.create({ seed: account }).toDataURL()
  }

  useEffect(() => {
    const loadContracts = async () => {
      const contractAddresses = await getContractAddresses(chainId)
      const chain = networks.find((network) => network.chainId == chainId)
      setContractAddresses(contractAddresses)
      setChain(chain)
    }
    loadContracts()
  }, [chainId, networks])

  return (
    <>
      <Head customMeta={customMeta} />
      <header>
        <Box
          backgroundColor="yellow.100"
          color="blue.500"
          textAlign="center"
          padding="10px"
        >
          <Link px="1" href="https://stake-s4.hoprnet.org" isExternal>
            Unstake your season 4 stake by following this link
            <ExternalLinkIcon />
          </Link>
        </Box>
        <Container maxWidth="container.xl">
          <SimpleGrid
            columns={[1, 1, 1, 3]}
            alignItems="center"
            justifyContent="space-between"
            py="8"
          >
            <Flex py={[4, null, null, 0]}>
              <Link
                py="1"
                href="https://medium.com/hoprnet/780edfd4f1e1"
                isExternal
              >
                Read about HOPR staking <ExternalLinkIcon />
              </Link>
              <Link
                px="4"
                py="1"
                href={chain.getExplorerAddressLink(
                  contractAddresses.HoprStake
                )}
                isExternal
              >
                Contract Address <ExternalLinkIcon />
              </Link>
            </Flex>
            <Flex justifyContent="flex-end">
              <UserBalance
                useViewMode={useViewMode}
                viewModeAddress={viewModeAddress}
                wxHOPRContractAddress={contractAddresses.wxHOPR}
                xHOPRContractAddress={contractAddresses.xHOPR}
              />
            </Flex>
            {account ? (
              <Flex
                order={[-1, null, null, 2]}
                alignItems={'center'}
                justifyContent={['flex-start', null, null, 'flex-end']}
              >
                <Tag px="10px" ml="10" textTransform="uppercase" {...colours}>
                  {chainIdToNetwork(chainId) || 'Loading...'}
                </Tag>
                <Image ml="4" src={blockieImageSrc} alt="blockie" />
                <Menu placement="bottom-end">
                  <MenuButton as={Button} ml="4">
                    {truncateHash(account)}
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        deactivate()
                        dispatch({
                          type: 'SET_VIEW_MODE',
                          useViewMode: false,
                        })
                        dispatch({
                          type: 'SET_VIEW_MODE_ADDRESS',
                          viewModeAddress: '',
                        })
                      }}
                    >
                      Disconnect
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            ) : (
              useViewMode ? <ViewAddress dispatch={dispatch} viewModeAddress={viewModeAddress} /> : <ConnectWallet dispatch={dispatch} />
            )}
          </SimpleGrid>
        </Container>
      </header>
      <main>
        <Container maxWidth="container.xl">
          {children}
          {notifications.map((notification) => {
            if (notification.type === 'walletConnected') {
              return null
            }
            return (
              <Alert
                key={notification.id}
                status="success"
                position="fixed"
                bottom="8"
                right="8"
                width="400px"
              >
                <AlertIcon />
                <Box>
                  <AlertTitle>
                    {TRANSACTION_TITLES[notification.type]}
                  </AlertTitle>
                  <AlertDescription overflow="hidden">
                    Transaction Hash:{' '}
                    {truncateHash(notification.transaction.hash, 61)}
                  </AlertDescription>
                </Box>
              </Alert>
            )
          })}
        </Container>
      </main>
      <footer>
        <Container py="8" maxWidth="container.xl">
          <Text>©2022 HOPR Association, all rights reserved.</Text>
        </Container>
      </footer>
    </>
  )
}

export default Layout
