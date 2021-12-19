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
        'tick': r'strategy tick: (?P<tick_timestamp>\d*) balance:(?P<balance>\d*) open:(?P<open>[\w\d,]*) close: (?P<close>[\w\d,]*)',
        'restart': r'setting channel strategy from (?P<from>\w*) to (?P<to>\w*)',
        'about_to_send_packet': r'SEND (?P<path_to_send>[\w\d,]*)',
        'completed_send_phase': r'message send phase (?P<complete>\w*)',
        'success_sent': r'success (?P<success_sent>sending)',
        'success_received': r'Received message (?P<received_message>.*)',
        'close_with_low_network_quality': r'closing channel (?P<close_low_quality>[\w\d]*) with quality',
        'close_with_low_stake': r'closing channel with balance too low (?P<close_low_stake>[\w\d]*)',
        'close_with_fail_msg': r'closing channel with too many message fails: (?P<close_fail_msg>[\w\d]*)',
        'close_with_long_stall': r'channel is stalled in WAITING_FOR_COMMITMENT, closing (?P<close_long_stall>[\w\d]*)',
        'fail_to_send_with_unknown_error': r'Unknown error in sending traffic. Channel is (?P<fail_with_unknown_state>\w*); openChannel is (?P<fail_with_unknown_channel>.*)',
        'fail_to_send_with_less_channel': r'aborting send messages - (?P<fail_less>\w*) channels in network than hops required',
        'fail_to_send_in_channel': r'hopr:cover-traffic failed to send to (?P<fail_to_send>[\w\d]*) fails: (?P<fail_to_send_times>\d*)',
        'about_to_open_channel': r'hopr:cover-traffic opening (?P<path_to_open>[\w\d]*)',
        'winning_ticket': r'cover traffic ignores winning (?P<winning_ticket>\w*).'
    }

    REGEX_EXTRACT_TIMESTAMP = re.compile(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}[Zz])')
    REGEX_EXTRACT_COLUMN_NAMES = re.compile(r'<([\w\d]*)>')