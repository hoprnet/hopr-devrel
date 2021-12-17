from numpy import result_type
from package import *

"""
Parameters
"""
# Have tried nstance 7872204418567022049 with from 10-01 till 11-07
# Have tried nstance 8212280380033896655 with from 11-13 till 11-16
instance_id = '8212280380033896655'
start_date = '2021-11-16'
end_date = '2021-11-17'
db_directory = '../db/'
# Key value pair for extraction. 
# Key: RegEx expression to extract raw logs from GCP
# Value: Name of the output csv file. E.g. # db/<instance_id>_<output_name>_result.csv
extraction_dict = {
    'restart': 'setting channel strategy from',
    'tick': 'strategy tick: ',
}
input_name = 'tick'

# """
# Main process

# A. Get logs from GCP Logging and save to ./db
# """
# # Get logs from GCP Logger. This may take loooonnng...
# get_and_save_logs_for_all_expressions(extraction_dict, instance_id, start_date, end_date, db_directory)

# """
# B. Read logs from /db and analyze
# """
# # Read logs from db csv
# df = read_csv(db_directory, instance_id + '_' + input_name + '_result.csv')
# print(df.head(10))

# # parse logs
# parsed = parse_strategy_tick(df, True)

# # plot to files
# plot_bar(parsed, 'tick_timestamp', 'balance_wo_decimal', 'balance_wo_decimal.png', 'hopr_bright_blue')
# plot_bar(parsed, 'tick_timestamp', 'diff_balance_wo_decimal', 'diff_balance_wo_decimal.png', 'hopr_bright_blue')


# TEST
# get_all_logs_of_release(None) #None for default bucket, if no specific bucket was created for the release

df = pd.concat([
    read_and_parse_logs_of_release('cos_containers/2021/10/20/11:00:00_11:59:59_S0.json', None)
]).reset_index(drop=True)
print(df)