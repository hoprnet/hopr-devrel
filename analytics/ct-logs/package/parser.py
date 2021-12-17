import pandas as pd
from mpmath import *

# 18 decimals
mp.dps = 18

def split_string_to_list(content, seperator):
    if content == "":
        return []
    else:
        return content.split(seperator)

def parse_strategy_tick(df, keep_active_logs_only=True):
    # regular expression to parse extracted logs (df['message']) into expanded columns
    parse_regex = 'strategy tick: (?P<tick_timestamp>\d*) balance:(?P<balance>\d*) open:(?P<open>[\w\d,]*) close: (?P<close>[\w\d,]*)'
    expanded = df['message'].str.extract(parse_regex, expand=True).convert_dtypes()

    # parse timestamps into 
    expanded['tick_timestamp'] = pd.to_datetime(expanded['tick_timestamp'].apply(lambda x: int(x)), unit='ms')
    expanded['g_time'] = df['g_time'].astype('datetime64[ns]')
    expanded['node_time'] = df['node_time'].astype('datetime64[ns]')
    expanded['balance_wo_decimal'] = expanded['balance'].apply(lambda x: mpf(int(x))/1e18)
    expanded['diff_balance_wo_decimal'] = expanded['balance_wo_decimal'].diff()
    expanded['open'] = expanded['open'].apply(lambda x: split_string_to_list(x, ","))
    expanded['open_nr'] = (expanded['open']).apply(lambda x: len(x))
    expanded['close'] = expanded['close'].apply(lambda x: split_string_to_list(x, ","))
    expanded['close_nr'] = expanded['close'].apply(lambda x: len(x))
    expanded['activity'] = (expanded['diff_balance_wo_decimal'].isna() | expanded['diff_balance_wo_decimal'] > 0) | (expanded['open_nr'] > 0 ) | (expanded['close_nr'] > 0)
    expanded['diff_balance_wo_decimal'] = expanded['diff_balance_wo_decimal'].fillna(0)

    if keep_active_logs_only :
        logs_to_remove = expanded[expanded['activity'] == False].index
        expanded = (expanded.drop(logs_to_remove)).reset_index(drop=True)
    
    print(expanded)
    return expanded


def parse_restart(df):
    # regular expression to parse extracted logs (df['message']) into expanded columns
    parse_regex = 'from (?P<from>\w*) to (?P<to>\w*)'
    expanded = df['message'].str.extract(parse_regex, expand=True).convert_dtypes()

    # parse timestamps into 
    expanded['g_time'] = df['g_time'].astype('datetime64[ns]')
    expanded['node_time'] = df['node_time'].astype('datetime64[ns]')
    expanded['from_nr'] = (expanded['from']).apply(lambda x: 1 if x == 'undefined' else 0)
    expanded['to_nr'] = (expanded['to']).apply(lambda x: 1 if x == 'covertraffic' else 0)
    expanded['from_to'] = (expanded['from_nr'] + expanded['to_nr'])
    expanded['from_to_diff'] = expanded['from_to'].diff()
    expanded['new_node_time'] = pd.to_datetime(expanded['node_time'])
    expanded['time_diff'] = expanded['new_node_time'].diff()
    expanded['time_diff2'] = expanded['time_diff'].apply(lambda x: x.total_seconds())

    print(expanded)
    return expanded

def parse_send_complete(df):
    # regular expression to parse extracted logs (df['message']) into expanded columns
    parse_regex = 'message send phase (?P<send_complete>\w*)'
    expanded = df['message'].str.extract(parse_regex, expand=True).convert_dtypes()

    # parse timestamps into 
    expanded['g_time'] = df['g_time'].astype('datetime64[ns]')
    expanded['node_time'] = df['node_time'].astype('datetime64[ns]')

    print(expanded)
    return expanded

def parse_send(df):
    # regular expression to parse extracted logs (df['message']) into expanded columns
    parse_regex = 'SEND (?P<send_to>[\w\d,]*)'
    expanded = df['message'].str.extract(parse_regex, expand=True).convert_dtypes()

    # parse timestamps into 
    expanded['g_time'] = df['g_time'].astype('datetime64[ns]')
    expanded['node_time'] = df['node_time'].astype('datetime64[ns]')
    #number of addresses the 
    expanded['number_of_add'] = expanded['send'].apply(lambda x: (len(str(x)))/53)
    #if needed, the code extracts the addresses 
    #expanded = pd.concat([expanded[['node_time']], expanded['send'].str.split(',', expand=True)], axis=1)

    print(expanded)
    return expanded


