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
    expanded['tick_timestamp'] = pd.to_datetime(expanded['tick_timestamp'].astype('int',copy=False), unit='ms')
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