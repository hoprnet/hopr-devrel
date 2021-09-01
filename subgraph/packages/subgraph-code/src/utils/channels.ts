import { crypto } from '@graphprotocol/graph-ts'
import { concat } from '@graphprotocol/graph-ts/helper-functions'
import { Address } from "@graphprotocol/graph-ts";
import { Channel } from "../../generated/schema";
import { ChannelUpdate } from '../../generated/HoprChannels/HoprChannels';
import { accounts } from './accounts';

export namespace channels {

  export function getChannel(event: ChannelUpdate): Channel {
    let channelId = crypto.keccak256(concat(event.params.source, event.params.destination)).toHexString()
    let channel = Channel.load(channelId);

    if (channel == null) {
      channel = create(event)
      channel.save();
    }

    return channel as Channel;
  }

  export function update(event: ChannelUpdate): Channel {
    let channel = getChannel(event);

    channel.balance = event.params.newState.balance;
    channel.commitment = event.params.newState.commitment;
    channel.ticketEpoch = event.params.newState.ticketEpoch;
    channel.ticketIndex = event.params.newState.ticketIndex;
    channel.status = event.params.newState.status;

    channel.save()

    return channel as Channel;
  }

  export function create(event: ChannelUpdate): Channel {
    let channelId = crypto.keccak256(concat(event.params.source, event.params.destination)).toHexString()
    let channel = new Channel(channelId);

    channel.source = accounts.getAccount(event.params.source as Address).id;
    channel.destination = accounts.getAccount(event.params.destination as Address).id

    channel.balance = event.params.newState.balance;
    channel.commitment = event.params.newState.commitment;
    channel.ticketEpoch = event.params.newState.ticketEpoch;
    channel.ticketIndex = event.params.newState.ticketIndex;
    channel.status = event.params.newState.status;

    channel.save()

    return channel as Channel
  }
}