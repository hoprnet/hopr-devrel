import { useBlockNumber, useEthers, useTokenBalance } from '@usedapp/core'
import { Client, createClient } from '@urql/core'
import {
  Text,
  Box,
  Button,
  useColorMode,
  Image,
  Tag,
  Skeleton,
} from '@chakra-ui/react'
import type { HoprBoost, HoprStakeSeason5 as HoprStakeSeason } from '@hoprnet/hopr-ethereum'
import { useEffect, useState, Dispatch } from 'react'
import { Contract, constants, BigNumber } from 'ethers'
import { ActionType, setRedeemNFT, StateType } from '../lib/reducers'
import { RPC_COLOURS, SUBGRPAH_URLS } from '../lib/connectors'
import { bgColor, color, nonEmptyAccount } from '../lib/helpers'
import { useEthersWithViewMode, useRedeemedNFTs } from '../lib/hooks'
import { CurrencyTag } from './atoms/CurrencyTag'

type NFT = {
  tokenId: string
  typeOfBoost: string
  typeName: string
  factor: number
  deadline: number
  tokenURI: string
  redeemed?: boolean
  isBlocked: boolean
  image: string
  typeOfBoostName: string
}

const NFT_TYPE_COLOURS: { [boostType: string]: string } = {
  silver: '#A8A8B3',
  bronze: '#5F4919',
  gold: '#F9E82B',
  diamond: '#C5CDD0',
}

const QUERY_BLOCKEDTYPE = `
{
  programs(first: 1) {
    blockedType
  }
}
`

const getNFTFromTokenId = async (
  HoprBoost: HoprBoost,
  HoprStake: HoprStakeSeason,
  tokenId: BigNumber,
  redeemed = false
) => {
  const typeOfBoost = await HoprBoost.typeIndexOf(tokenId)
  const typeName = await HoprBoost.typeOf(tokenId)
  const [factor, deadline] = await HoprBoost.boostOf(tokenId)
  const tokenURI = await HoprBoost.tokenURI(tokenId)
  const isBlocked = await HoprStake.isBlockedNft(typeOfBoost)

  const json: any = await fetch(tokenURI).then((res) => res.json())
  const gateway = 'https://cloudflare-ipfs.com/ipfs/'
  const [, ipfsCID] = json.image.split('ipfs://')
  const image = `${gateway}${ipfsCID}`
  const typeOfBoostName = tokenURI.split('/').pop()

  return {
    tokenId: tokenId.toString(),
    typeOfBoost: typeOfBoost.toString(),
    typeName,
    factor: factor.toNumber(),
    deadline: deadline.toNumber(),
    tokenURI,
    redeemed,
    image,
    isBlocked,
    typeOfBoostName,
  }
}

const NFTLockButton = ({
  tokenId,
  HoprBoostABI,
  HoprBoostContractAddress,
  HoprStakeContractAddress,
  state,
  dispatch,
}: {
  tokenId: string
  HoprBoostABI: any
  HoprBoostContractAddress: string
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
}) => {
  const { chainId, library } = useEthers()
  const colours = RPC_COLOURS[chainId]
  return (
    <Button
      width="10rem"
      size="sm"
      isLoading={state.isLoadingRedeem}
      isDisabled={state.isLoadingRedeem || state.useViewMode}
      {...colours}
      onClick={() => {
        setRedeemNFT(
          HoprBoostABI,
          HoprBoostContractAddress,
          HoprStakeContractAddress,
          tokenId,
          library,
          dispatch
        )
      }}
    >
      {state.isLoadingRedeem ? 'Loading...' : 'Lock NFT'}
    </Button>
  )
}

const NFTContainer = ({
  nfts,
  HoprBoostABI,
  HoprBoostContractAddress,
  HoprStakeContractAddress,
  state,
  dispatch,
  consideredNFTs,
  isRedeemedNFTs,
}: {
  nfts: NFT[]
  HoprBoostABI: any
  HoprBoostContractAddress: string
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
  consideredNFTs: ReducedNFTs
  isRedeemedNFTs: boolean
}) => (
  <>
    {nfts.map((nft) => {
      const isRelevantNFT =
        consideredNFTs[nft.typeName] &&
        consideredNFTs[nft.typeName].factor == nft.factor
      return (
        <Box
          key={nft.tokenId}
          my="2"
          d="flex"
          flexDirection="column"
          alignContent="space-evenly"
          border="1px solid #ccc"
          p="2"
          m="2"
          borderRadius="5px"
        >
          <Image src={nft.image} width="250px" m="auto" />
          <Box py="6" px="6">
            <Box d="flex" alignItems="baseline" flexDirection="column">
              <Box w="100%">
                <Box
                  d="flex"
                  alignItems="baseline"
                  justifyContent="space-between"
                >
                  <b>Token Id</b>
                  <code>{nft.tokenId}</code>{' '}
                </Box>
                <Box
                  d="flex"
                  alignItems="baseline"
                  justifyContent="space-between"
                >
                  <b>Type</b>
                  <code>{nft.typeName}</code>{' '}
                </Box>
                <Box
                  d="flex"
                  alignItems="baseline"
                  justifyContent="space-between"
                >
                  <b>Expired</b>
                  <Tag
                    bg={nft.isBlocked ? 'red' : 'green'}
                    textTransform="capitalize"
                  >
                    {nft.isBlocked ? 'Yes' : 'No'}
                  </Tag>
                </Box>
                <Box
                  d="flex"
                  alignItems="baseline"
                  justifyContent="space-between"
                >
                  <b>Rank</b>
                  <Tag
                    bg={NFT_TYPE_COLOURS[nft.typeOfBoostName]}
                    textTransform="capitalize"
                  >
                    {nft.typeOfBoostName}
                  </Tag>
                </Box>
                <Box
                  d="flex"
                  alignItems="baseline"
                  justifyContent="space-between"
                >
                  <b>Boost</b>
                  <Text>
                    <code>{(nft.factor / 79).toFixed(2)}%</code>
                  </Text>
                </Box>
                <Box
                  d="flex"
                  alignItems="baseline"
                  justifyContent="space-between"
                >
                  <b>APR</b>
                  <Box d="flex" alignItems="baseline">
                    <Text mr="2px">
                      <code>{(nft.factor / 100).toFixed(2)}</code>
                    </Text>
                    <CurrencyTag tag="wxHOPRli/sec" />
                  </Box>
                </Box>
                {isRedeemedNFTs && (
                  <Box d="flex" justifyContent="center" mt="10px">
                    <Tag colorScheme={isRelevantNFT ? 'green' : 'red'}>
                      {isRelevantNFT ? 'In use' : 'Ignored'}
                    </Tag>
                  </Box>
                )}
              </Box>
              {/* <Box isTruncated mt="10px">
                Redeem Deadline
              </Box>
              <Text fontSize="xs" fontFamily="mono">
                {new Date(nft.deadline * 1000).toString()}
              </Text> */}

              {!nft.redeemed && !nft.isBlocked && (
                <NFTLockButton
                  tokenId={nft.tokenId}
                  HoprBoostABI={HoprBoostABI}
                  HoprBoostContractAddress={HoprBoostContractAddress}
                  HoprStakeContractAddress={HoprStakeContractAddress}
                  state={state}
                  dispatch={dispatch}
                />
              )}
            </Box>
          </Box>
        </Box>
      )
    })}
  </>
)

type ReducedNFTs = {
  [key: string]: NFT
}

export const NFTQuery = ({
  HoprBoostABI,
  HoprBoostContractAddress,
  HoprStakeABI,
  HoprStakeContractAddress,
  state,
  dispatch,
}: {
  HoprBoostABI: any
  HoprBoostContractAddress: string
  HoprStakeABI: any
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
  fromBlock?: number
}): JSX.Element => {
  const { library, account, chainId } = useEthersWithViewMode(state.useViewMode && state.viewModeAddress)
  const [nfts, setNFTS] = useState<NFT[]>([])
  const [redeemedNFTs, setRedeeemedNFTS] = useState<NFT[]>([])
  const [consideredRedeemedNFTs, setConsideredRedeeemedNFTS] =
    useState<ReducedNFTs>({})
  const startingBlock = useBlockNumber()
  const [blocks, setBlockCounter] = useState<number>(0)
  const { colorMode } = useColorMode()
  const NFTBalance =
    useTokenBalance(HoprBoostContractAddress, account) || constants.Zero

  const redeemedNFTsBalance =
    useRedeemedNFTs(HoprStakeABI, HoprStakeContractAddress, account) ||
    constants.Zero

  useEffect(() => {
    const loadNFTBalance = async () => {
      startingBlock != startingBlock - 1 && setBlockCounter(blocks + 1)
      if (
        !(HoprStakeContractAddress && account) ||
        HoprStakeContractAddress.length == 0 ||
        account.length == 0
      ) {
        return
      }
      if (library && (+NFTBalance > 0 || +redeemedNFTsBalance > 0)) {
        // We create empty arrays we can .map later based on the amount of
        // nfts or redeemed nfts a user has.
        const nftsMappedArray = [...Array(+NFTBalance)]
        const redeemedNFTsMappedArray = [...Array(+redeemedNFTsBalance)]
        // Only then we create the actual contracts we will be using.
        const HoprBoost = new Contract(
          HoprBoostContractAddress,
          HoprBoostABI,
          library
        ) as HoprBoost
        const HoprStake = new Contract(
          HoprStakeContractAddress,
          HoprStakeABI,
          library
        ) as HoprStakeSeason
        // We go through both mapped arrays and create the to be resolved promises
        // for both redeemed and not redeemed NFT tokens.
        const redeemedNFTSPromises = redeemedNFTsMappedArray.map(
          async (_, index) => {
            const tokenId = nonEmptyAccount(account)
              ? await HoprStake.redeemedNft(account, index)
              : constants.NegativeOne
            return +tokenId >= 0
              ? await getNFTFromTokenId(HoprBoost, HoprStake, tokenId, true)
              : undefined
          }
        )

        const nftsPromises = nftsMappedArray.map(async (_, index) => {
          const tokenId = await HoprBoost.tokenOfOwnerByIndex(account, index)
          return await getNFTFromTokenId(HoprBoost, HoprStake, tokenId)
        })

        // We resolve both promises to make sure all NFTs are properly obtained
        const allNfts = (await Promise.all(nftsPromises)) || []
        const redemeedNfts = (await Promise.all(redeemedNFTSPromises)) || []

        // We filter out all blocked NFT types, using the Graph data as reference
        const graphClient: Client = createClient({
          url: SUBGRPAH_URLS[chainId] || SUBGRPAH_URLS['100'],
          fetchOptions: {
            mode: 'cors', // no-cors, cors, *same-origin
          },
        })
        const { data } = await graphClient.query(QUERY_BLOCKEDTYPE).toPromise()
        const blockedNftTypes =
          data.programs.length > 0 ? data.programs[0].blockedType : []
        const nfts = allNfts.filter((nft: NFT) => {
          return !(nft.typeOfBoost in blockedNftTypes)
        })

        // We update our current component state accordingly
        const actuallyConsideredRedemeedNfts: ReducedNFTs = redemeedNfts.reduce(
          (acc, val) =>
            Object.assign(
              {},
              acc,
              acc[val.typeName]
                ? acc[val.typeName].factor < val.factor
                  ? { [val.typeName]: val }
                  : acc
                : { [val.typeName]: val }
            ),
          {}
        )
        setConsideredRedeeemedNFTS(actuallyConsideredRedemeedNfts)
        setNFTS(nfts.reverse())
        setRedeeemedNFTS(redemeedNfts)
        // We propagate the total APR boost to the rest of the application.
        const maxFactorNFT = Object.values(
          actuallyConsideredRedemeedNfts
        ).reduce(
          (prev, curr) =>
            Object.assign({}, prev, { factor: curr.factor + prev.factor }),
          { factor: 0 }
        )
        dispatch({
          type: 'SET_TOTAL_APR_BOOST',
          totalAPRBoost: maxFactorNFT.factor,
        })
      } else {
        dispatch({
          type: 'SET_TOTAL_APR_BOOST',
          totalAPRBoost: 0,
        })
      }
    }
    loadNFTBalance()
  }, [account, startingBlock])
  return (
    <>
      <Box
        maxWidth="container.l"
        p="8"
        mt="8"
        bg={bgColor[colorMode]}
        color={color[colorMode]}
      >
        <Box d="flex" justifyContent="space-between" mb="10px">
          <Box d="flex" alignItems="center">
            <Text fontSize="xl" fontWeight="900">
              HOPR NFTs
            </Text>
            <Text ml="10px" fontSize="sm" fontWeight="400">
              Please wait up to six block changes for your NFTs to show.
            </Text>
          </Box>
          <Box d="flex" alignItems="center">
            <Text fontWeight="600" fontSize="md" mr="5px">
              Blocks
            </Text>
            <Text ml="6px" fontSize="sm" fontFamily="mono">
              {startingBlock}
            </Text>
            {blocks > 0 && (
              <Text ml="2px" fontSize="sm" fontFamily="mono" color="green.600">
                (+{blocks} block changes)
              </Text>
            )}
          </Box>
        </Box>
        {[
          {
            title: 'Available HOPR NFTs',
            subtitle: `Your NFTs will show up here. Earn them by participating in activities. Lock them to boost your APR.`,
            items: nfts,
          },
          {
            title: 'Locked HOPR NFTs',
            subtitle: `Your locked NFTs will show up here. The combined NFT boost (one per NFT type) will be added to your base APR in HOPRli (1 HOPR = 1e10 HOPRli).`,
            items: redeemedNFTs,
            isRedeemedNFTs: true,
          },
        ].map((nftDataContainer) => {
          return (
            <Box key={nftDataContainer.title}>
              <Box d="flex" alignItems="center">
                <Text fontWeight="600" fontSize="md" mr="2px">
                  {nftDataContainer.title}
                </Text>
                <Text ml="10px" fontSize="sm" fontWeight="400">
                  {nftDataContainer.subtitle}
                </Text>
              </Box>
              <Skeleton isLoaded={blocks > 5}>
                <Box d="flex" flexWrap="wrap" alignItems="center" mb="10px">
                  {nftDataContainer.items.length > 0 ? (
                    <NFTContainer
                      consideredNFTs={consideredRedeemedNFTs}
                      nfts={nftDataContainer.items}
                      HoprBoostABI={HoprBoostABI}
                      HoprBoostContractAddress={HoprBoostContractAddress}
                      HoprStakeContractAddress={HoprStakeContractAddress}
                      state={state}
                      dispatch={dispatch}
                      isRedeemedNFTs={nftDataContainer.isRedeemedNFTs}
                    />
                  ) : (
                    <Box
                      minH="100px"
                      d="flex"
                      textAlign="center"
                      alignItems="center"
                      margin="auto"
                      width="100%"
                      borderRadius="5px"
                      border="1px solid #ccc"
                      justifyContent="center"
                    >
                      <Text fontSize="lg">
                        Your available NFTs will show up here.
                      </Text>
                    </Box>
                  )}
                </Box>
              </Skeleton>
            </Box>
          )
        })}
      </Box>
    </>
  )
}
