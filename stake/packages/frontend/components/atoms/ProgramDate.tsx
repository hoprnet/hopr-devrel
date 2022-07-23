import { constants } from 'ethers'
import { useEndProgramDate, useStartProgramDate } from '../../lib/hooks'

export const StartProgramDate = ({
  HoprStakeABI,
  HoprStakeContractAddress,
}: {
  HoprStakeABI: any
  HoprStakeContractAddress: string
}): JSX.Element => {
  const startProgramDate =
    useStartProgramDate(HoprStakeABI, HoprStakeContractAddress) ||
    constants.Zero
  return <>{new Date(+startProgramDate.toString() * 1000).toDateString()}</>
}

export const EndProgramDateDays = ({
  HoprStakeABI,
  HoprStakeContractAddress,
}: {
  HoprStakeABI: any
  HoprStakeContractAddress: string
}): JSX.Element => {
  const endProgramDateInSeconds =
    useEndProgramDate(HoprStakeABI, HoprStakeContractAddress) || constants.Zero
  const endProgramDateInMs = +endProgramDateInSeconds.toString() * 1000
  const timeDiff = endProgramDateInMs - new Date().getTime()
  const daysUntilProgramEnd = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  return <>{daysUntilProgramEnd} days</>
}
