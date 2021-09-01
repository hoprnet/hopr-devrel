import { Announcement, ChannelUpdate } from '../generated/HoprChannels/HoprChannels'
import { Account, Channel } from '../generated/schema'
import { accounts, channels } from './utils';

export function handleAnnouncement(event: Announcement): void {
  let account = accounts.getAccount(event.transaction.from) as Account
  account.multiaddr = event.params.multiaddr;
  account.hasAnnounced = true;
  account.save()
}

export function handleChannelUpdate(event: ChannelUpdate): void {
  let account = accounts.getAccount(event.transaction.from) as Account;
  let channel = channels.getChannel(event) as Channel

  let newStatus = event.params.newState.status;

  switch (channel.status) {
    case 0:
      // Transition from (0) Closed -> Open (2) = OPEN
      if (newStatus == 2) {
        account.openedChannels = account.openedChannels + 1
        account.totalStaked = account.totalStaked.plus(event.params.newState.balance)
      }
      break;
    case 1:
      // Transition from (1) Waiting For Commitment -> Open (2) = OPEN
      if (newStatus == 2) {
        account.openedChannels = account.openedChannels + 1
        account.totalStaked = account.totalStaked.plus(event.params.newState.balance)
      }
      break;
    case 3:
      // Transition from (3) Pending To Close -> Closed (0) = CLOSED
      if (newStatus == 0) {
        account.closedChannels = account.closedChannels + 1
      }
      break
  }
  channels.update(event)
  account.save()
}