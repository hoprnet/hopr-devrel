import {
  Button,
  InputGroup,
  Input,
  InputRightElement,
  InputLeftElement,
  Text,
  Box,
  Tag,
  Skeleton,
} from '@chakra-ui/react'
import { CurrencyTag } from '../components/atoms/CurrencyTag'
import { CallButton } from './atoms/CallButton'
import { MaxXHOPRButton } from './atoms/MaxXHOPRButton'
import {
  ActionType,
  fetchAccountData,
  setClaim,
  setStaking,
  setSync,
  StateType,
  setUnlock,
} from '../lib/reducers'
import { RPC_COLOURS } from '../lib/connectors'
import { useEndProgramDate, useEthersWithViewMode } from '../lib/hooks'
import { useBlockNumber } from '@usedapp/core'
import { Dispatch, useState } from 'react'
import { EndProgramDateDays } from './atoms/ProgramDate'
import { BalanceWithCurrency } from './molecules/BalanceWithCurrency'
import { format } from 'timeago.js'
import { useEffect } from 'react'
import { nonEmptyAccount } from '../lib/helpers'
import { utils } from 'ethers'

enum LOADED_STATUS {
  'INIT',
  'ACCOUNT_DATA_FETCHED',
  'LOADED',
}

export const StakeXHoprTokens = ({
  xHoprABI,
  XHOPRContractAddress,
  HoprStakeABI,
  HoprStakeContractAddress,
  state,
  dispatch,
}: {
  xHoprABI: any
  XHOPRContractAddress: string
  HoprStakeABI: any
  HoprStakeContractAddress: string
  state: StateType
  dispatch: Dispatch<ActionType>
}): JSX.Element => {
  const { chainId, library, account } = useEthersWithViewMode(state.useViewMode && state.viewModeAddress)
  const startingBlock = useBlockNumber()
  const [blocks, setBlockCounter] = useState<number>(0)
  const colours = RPC_COLOURS[chainId]

  const [loadStatus, setLoadStatus] = useState<LOADED_STATUS>(
    LOADED_STATUS.INIT
  )
  const [loadCounter, setLoadCounter] = useState<number>(0)

  const timeDiff = (new Date().getTime() - +state.lastSync * 1000) / 1000 // to seconds
  const FACTOR_DENOMINATOR = 1e12
  const baseBoost = 3171 / FACTOR_DENOMINATOR
  const bonusBoost = state.totalAPRBoost / FACTOR_DENOMINATOR
  const totalBoost = bonusBoost + baseBoost
  const estimatedRewards = timeDiff * (+state.stakedHOPRTokens * totalBoost)
  const canUnlock =
    useEndProgramDate(HoprStakeABI, HoprStakeContractAddress)?.lt(
      Math.floor(new Date().getTime() / 1e3)
    ) ?? false
  const hasLoaded = () => loadStatus === LOADED_STATUS.LOADED

  useEffect(() => {
    const loadAccountData = async () => {
      startingBlock != startingBlock - 1 && setBlockCounter(blocks + 1)
      if (nonEmptyAccount(account)) {
        await fetchAccountData(
          HoprStakeABI,
          HoprStakeContractAddress,
          account,
          library,
          dispatch
        )
        setLoadCounter(loadCounter + 1)
        loadCounter >= 1
          ? setLoadStatus(LOADED_STATUS.LOADED)
          : setLoadStatus(LOADED_STATUS.ACCOUNT_DATA_FETCHED)
      }
    }
    loadAccountData()
  }, [account, startingBlock])

  return (
    <>
      <Box d="flex" justifyContent="space-between" mb="10px">
        <Box d="flex" alignItems="center">
          <Text fontSize="xl" fontWeight="900">
            Stake xHOPR tokens
          </Text>
          <Text ml="10px" fontSize="sm" fontWeight="400">
            You won’t be able to recover your stake until the staking program
            ends.
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
      <Box d="flex" justifyContent="space-between" alignItems="center">
        <Box
          d="flex"
          alignItems="center"
          justifyContent="space-between"
          width="50%"
        >
          {[
            {
              value: state.stakedHOPRTokens,
              currency: 'xHOPR',
              label: 'Staked',
            },
            {
              value: state.alreadyClaimedRewards,
              currency: 'wxHOPR',
              label: 'Claimed',
            },
          ].map((item) => {
            return (
              <Box d="flex" key={item.currency}>
                <Text fontWeight="600" fontSize="md" mr="5px">
                  {item.label}
                </Text>
                <BalanceWithCurrency
                  balanceElement={
                    <Skeleton
                      isLoaded={!state.isLoadingFetching && hasLoaded()}
                      mr="5px"
                    >
                      <Tag colorScheme="gray" fontFamily="mono">
                        {item.value || '--'}
                      </Tag>
                    </Skeleton>
                  }
                  currencyElement={<CurrencyTag tag={item.currency} />}
                />
              </Box>
            )
          })}
        </Box>
        <Box d="flex" alignItems="center">
          <Text fontWeight="600" fontSize="md" mr="5px">
            Rewards (wxHOPR/sec)
          </Text>
          <Text ml="6px" fontSize="sm" fontFamily="mono">
            +{(baseBoost * +state.stakedHOPRTokens).toFixed(12)} (Base)
          </Text>
          <Text ml="6px" fontSize="sm" fontFamily="mono" color="green.600">
            +{(bonusBoost * +state.stakedHOPRTokens).toFixed(12)} (Boost)
          </Text>
        </Box>
      </Box>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        mt="10px"
      >
        <InputGroup size="md">
          <InputLeftElement width="3.5rem">
            <MaxXHOPRButton
              XHOPRContractAddress={XHOPRContractAddress}
              updateBalanceHandler={(xHOPRBalance) =>
                dispatch({
                  type: 'SET_STAKING_AMOUNT',
                  amountValue: xHOPRBalance,
                })
              }
              useViewMode={state.useViewMode}
              viewModeAddress={state.viewModeAddress}
            />
          </InputLeftElement>
          <Input
            pl="4rem"
            pr="10.5rem"
            type={'number'}
            value={state.amountValue}
            placeholder="Enter amount"
            onChange={(e) => {
              dispatch({
                type: 'SET_STAKING_AMOUNT',
                amountValue: e.target.value,
              })
            }}
          />
          {account && (
            <InputRightElement width="10.5rem">
              <Button
                width="10rem"
                size="sm"
                disabled={state.useViewMode}
                isLoading={state.isLoadingStaking}
                onClick={() => {
                  setStaking(
                    xHoprABI,
                    XHOPRContractAddress,
                    HoprStakeABI,
                    HoprStakeContractAddress,
                    state,
                    library,
                    dispatch
                  )
                }}
                {...colours}
              >
                Stake xHOPR tokens
              </Button>
            </InputRightElement>
          )}
        </InputGroup>
      </Box>
      <Box
        mt="20px"
        d="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Box d="flex" alignItems="center" mb="5px">
            <Text fontSize="sm" fontFamily="mono">
              Last time synced:{' '}
            </Text>
            <Skeleton
              isLoaded={!state.isLoadingFetching && hasLoaded()}
              mr="5px"
              minW="100px"
            >
              <Text ml="5px" fontSize="sm">
                {state.lastSync
                  ? state.lastSync == '0'
                    ? 'Never'
                    : new Date(+state.lastSync * 1000).toString()
                  : '--'}
                {+state.lastSync > 0 && `(${format(+state.lastSync * 1000)})`}
              </Text>
            </Skeleton>
          </Box>
          <Box d="flex" alignItems="center">
            <Text fontWeight="600" fontSize="md" mr="5px">
              Claimable -
            </Text>
            <BalanceWithCurrency
              balanceElement={
                <Skeleton
                  isLoaded={!state.isLoadingFetching && hasLoaded()}
                  mr="5px"
                >
                  <Tag colorScheme="gray" fontFamily="mono">
                    {utils
                      .formatEther(state.yetToClaimRewards || '0')
                      .toString() || '--'}
                  </Tag>
                </Skeleton>
              }
              currencyElement={<CurrencyTag tag={'wxHOPR'} />}
            />
            <Text ml="6px" fontSize="sm" fontFamily="mono" color="blue.600">
              + {estimatedRewards.toFixed(12)} (Sync for actual amount)
            </Text>
          </Box>
        </Box>
        {account && (
          <Box textAlign="right">
            <CallButton
              disabled={state.useViewMode}
              isLoading={state.isLoadingSync}
              handler={() => {
                setSync(
                  HoprStakeABI,
                  HoprStakeContractAddress,
                  library,
                  dispatch
                )
              }}
            >
              Sync
            </CallButton>
            <Button
              size="md"
              mx="10px"
              bg="blackAlpha.900"
              color="whiteAlpha.900"
              isDisabled={!canUnlock || state.useViewMode}
              onClick={() => {
                setUnlock(
                  HoprStakeABI,
                  HoprStakeContractAddress,
                  library,
                  dispatch
                )
              }}
            >
              Unlock
              {canUnlock ? null : (
                <>
                  (
                  <EndProgramDateDays
                    HoprStakeABI={HoprStakeABI}
                    HoprStakeContractAddress={HoprStakeContractAddress}
                  />{' '}
                  to go)
                </>
              )}
            </Button>
            <CallButton
              disabled={state.useViewMode}
              isLoading={state.isLoadingClaim}
              handler={() => {
                setClaim(
                  HoprStakeABI,
                  HoprStakeContractAddress,
                  library,
                  dispatch
                )
              }}
            >
              Claim rewards
            </CallButton>
          </Box>
        )}
      </Box>
    </>
  )
}
