from numpy import result_type

from package import *

"""
Parameters
"""
# Have tried nstance 7872204418567022049 with from 10-01 till 11-07
# Have tried nstance 8212280380033896655 with from 11-13 till 11-16
instance_id = '8212280380033896655'
start_date = '2021-11-13'
end_date = '2021-11-15'
db_directory = '../db/'
# Key value pair for extraction. 
# Key: RegEx expression to extract raw logs from GCP
# Value: Name of the output csv file. E.g. # db/<instance_id>_<output_name>_result.csv
extraction_dict = {
    'restart': 'setting channel strategy from',
    #'tick': 'strategy tick: ',
}
input_name = 'restart'

"""
Functions
"""
def get_logs_and_save(instance_id, start_date, end_date, regex_extract, output_name, max_entries_per_query):
    print('Get filters... \n')
    filters = build_filters(instance_id, start_date, end_date, regex_extract)

    print('Call get_logs... \n')
    logs = get_logs_from_queries_and_concat(filters, max_entries_per_query)

    print('\nPrint first 10/%i get_logs results \n' %len(logs))
    print(logs.head(10))

    print('Save output to db \n')
    save_csv(logs, db_directory, instance_id + '_' + start_date + '_' + end_date + '_' + output_name + '_result.csv')

    print('Done! \n---------------------')


"""
A. Get logs from GCP and save to /db
This may take loooonnng...
"""
# Get logs from GCP Logger

#for key, value in extraction_dict.items():
#   print('---------------------\nFilter for **%s** file \n' %key)
#  get_logs_and_save(instance_id, start_date, end_date, value, key, None)


# """
# B. Read logs from /db and analyze
# """
# Read logs from db csvpy
df = read_csv(db_directory, instance_id + '_' + start_date + '_' + end_date + '_' + input_name + '_result.csv')
print(df.head(10))

# # # parse logs
parsed = parse_restart(df, True)
rightbeforeplot = restart_time(parsed)
print(rightbeforeplot)

restart_time_plot(rightbeforeplot, "node_time", "restart", "restart_time", "restart_in_sec")
# # # plot to files
# plot_bar(parsed, 'tick_timestamp', 'balance_wo_decimal', 'balance_wo_decimal.png', 'hopr_bright_blue')
# plot_bar(parsed, 'tick_timestamp', 'diff_balance_wo_decimal', 'diff_balance_wo_decimal.png', 'hopr_bright_blue')