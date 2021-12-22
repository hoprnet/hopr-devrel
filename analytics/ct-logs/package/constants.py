import re
import os

class Constants:
    DEFAULT_BUCKET_NAME = 'log_query_results'
    DEFAULT_BUCKET_LOCATION = 'europe-west6'
    BUCKET_APPENDIX = '_ct_query_results'
    DEFAULT_BUCKET_BLOB_SUBFOLDER="cos_containers"

    BLOB_DOWNLOAD_PATH = "../blob/"
    DB_PATH = "../db/"
    FILE_DIRECTORY = os.path.dirname(os.path.abspath(__file__))

    REGEX_DICTIONARY = {
        # on (re)start of HOPR node, it logs its strategy.
        'restart': r'setting channel strategy from (?P<from>\w*) to (?P<to>\w*)',

        # when HOPR CT strategy is alive, it logs CT nodes -- CT Stats -- followed by a multi-lines network connection report every 5 seconds.
        'stats_check': r'-- CT (?P<stats_check>Stats) --',
        # when ther persisted state gets updated (in following cases), it logs CT nodes' view on the entire HOPR network:
        # Persisted state gets updated when 1) a new channel appears, 2) a new node appears, 3) status change in CT channel, 
        # 4) indexer picks up a new block 5) failed message increases 6) failed message get reset
        'state_update': r'State update:\s?(?P<state_nodes_num>\d*) nodes, (?P<state_channels_num>\d*) channels',

        # periodic check in hopr=core
        'periodic_check_start': r'periodic check (?P<periodic_check_status>\w*)',
        'periodic_check_too_long': r'strategy tick took longer than (?P<periodic_check_duration>\d*) secs',
        'periodic_check_trigger_tick': r'Triggering (?P<periodic_check_trigger_tick>\w*) channel strategy',

        # tick in strategy
        # check balance at the beginning of tick (everty 10 seconds)
        'tick_start': r'tick, balance (?P<tick_start_balance>\d*)',
        # print ticket actions at the end of tick (everty 10 seconds)
        'tick_end': r'strategy tick: (?P<tick_end_timestamp>\d*) balance:(?P<tick_end_balance>\d*) open:(?P<open>[\w\d,]*) close:(?P<close>\s[\w\d,]*)',
        # find channels to close
        'close_with_low_network_quality': r'closing channel (?P<close_low_quality>[\w\d]*) with quality',
        'close_with_low_stake': r'closing channel with balance too low (?P<close_low_stake>[\w\d]*)',
        'close_with_fail_msg': r'closing channel with too many message fails: (?P<close_fail_msg>[\w\d]*)',
        # find channels to open
        'about_to_open_channel': r'hopr:cover-traffic opening (?P<path_to_open>[\w\d]*)',

        # Among all the open CT channels, react based on their status. There are four status (`CLOSED`, `WAITING_FOR_COMMITMENT`, `OPEN`, `PENDING_TO_CLOSE`)
        # For channels with `OPEN` status, try to find path and send message
        # Check first if it's possible to send 2-hop messages - when not enough nodes exist in the topology, abort send attempts.
        'fail_to_send_with_less_channel': r'aborting send messages - (?P<fail_less>\w*) channels in network than hops required',
        # Check first if it's possible to send 2-hop messages - when not enough nodes exist in the topology, abort send attempts.
        'fail_to_send_in_sendctmessage_method': r'hopr:cover-traffic failed to send to (?P<fail_to_send>[\w\d]*) fails: (?P<fail_to_send_times>\d*)',
        # to breakdown errors
        # > sucess in finding path
        'path_found': r'SEND (?P<path_to_send>[\w\d,]*)',
        # > failure in sending a message
        'error_sent': r'hopr:cover-traffic error (?P<error_sent>.*) sending to (?P<error_sent_to>.*)',
        # success in sending a message
        'success_sent': r'success sending (?P<success_sent>.*)',
        # For channels with `WAITING_FOR_COMMITMENT` status, check if they've been in this status for long. If yes, close
        'close_with_long_stall': r'channel is stalled in WAITING_FOR_COMMITMENT, closing (?P<close_long_stall>[\w\d]*)',
        'still_wait_for_stall': r'channel is WAITING_FOR_COMMITMENT, waiting (?P<wait_for_stall>[\w\d]*)',
        # For channels that are `CLOSED` or `PENDING_TO_CLOSE`, they should not be in the process
        'unknown_error_in_ct_channels': r'Unknown error in sending traffic. Channel is (?P<fail_with_unknown_state>\w*); openChannel is (?P<fail_with_unknown_channel>.*)',
        # end of send phase
        'completed_send_phase': r'message send phase (?P<complete>\w*)',

        # When sending messages, it logs the following messages
        # > checks the local outstanding balances
        'create_ticket_packet_check_balance': r'hopr-core:message:packet balances (?P<channel_balance>\d*) - (?P<channel_outstanding_balance>\d*) should >= (?P<channel_remaining_balance>\d*) in channel open to (?P<channel_to_destination>.*)',
        # > followed by ticket creation message
        # Creating ticket in channel ${channel.getId().toHex()}. Ticket data: \n${ticket.toString()}

        # execute tick channel strategy (after `tick` in strategy)
        'tick_channel_summary_close': r'hopr-core strategy wants to close (?P<tick_summary_channel_to_close>\d*) channels',
        'execute_closing_channel': r'hopr-core closing channel (?P<execute_channel_to_close>.*)',
        'execute_closed_channel': r'hopr-core closed channel (?P<execute_channel_closed>.*)',
        'tick_channel_summary_open': r'hopr-core strategy wants to open\s?(?P<tick_summary_channel_to_open>\d*)\s?new channels',

        'success_received': r'Received message (?P<received_message>.*)',
        # CT node ignores winning ticket
        'winning_ticket': r'cover traffic ignores winning (?P<winning_ticket>\w*).'
    }

    REGEX_EXTRACT_TIMESTAMP = re.compile(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}[Zz])')
    REGEX_EXTRACT_COLUMN_NAMES = re.compile(r'<([\w\d]*)>')