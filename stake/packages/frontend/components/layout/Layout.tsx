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
  getExplorerAddressLink,
  useEthers,
  useNotifications,
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
}

/**
 * Component
 */
const Layout = ({ children, customMeta }: LayoutProps): JSX.Element => {
  const { account, deactivate, chainId } = useEthers()
  const [contractAddresses, setContractAddresses] = useState<IContractAddress>(
    emptyContractAddresses
  )
  const { notifications } = useNotifications()
  const colours = RPC_COLOURS[chainId] || { scheme: 'gray' }

  let blockieImageSrc
  if (typeof window !== 'undefined') {
    blockieImageSrc = blockies.create({ seed: account }).toDataURL()
  }

  useEffect(() => {
    const loadContracts = async () => {
      const contractAddresses = await getContractAddresses(chainId)
      setContractAddresses(contractAddresses)
    }
    loadContracts()
  }, [chainId])

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
          <Link px="1" href="https://stake-s1.hoprnet.org" isExternal>
            Unstake your season 1 stake by following this link
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
                href="https://medium.com/hoprnet/hopr-staking-2-0-6e79dbf66827"
                isExternal
              >
                Read about HOPR staking <ExternalLinkIcon />
              </Link>
              <Link
                px="4"
                py="1"
                href={getExplorerAddressLink(
                  contractAddresses.HoprStake,
                  chainId
                )}
                isExternal
              >
                Contract Address <ExternalLinkIcon />
              </Link>
            </Flex>
            <Flex justifyContent="flex-end">
              <UserBalance
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
                      }}
                    >
                      Disconnect
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            ) : (
              <ConnectWallet />
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
          <Text>©2021 HOPR Association, all rights reserved.</Text>
        </Container>
      </footer>
    </>
  )
}

export default Layout
