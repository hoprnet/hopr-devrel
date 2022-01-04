from package import *

# """
# ============================================================
#             Preparation for a new CT node
#     This script is only run once when CT node is created    
# ============================================================
# """
# # Create a new bucket
# new_release_name = 'budapest_dec20'
# new_release_bucket = create_bucket_for_release(new_release_name)
# # Spin up a CT node... and take the instance_id
# new_instance_id = '4538161417096644131'
# # Build filter used in sink
# sink_filter = build_sink_filter(new_instance_id)
# # Create sink for the new bucket
# create_sink(new_release_name, new_release_bucket.name, sink_filter)

# # Use the following code when a significant delay occured between instance and bucket creations.
# missing_date = '2021-12-19'
# missing_hours = ['04','05','06']
# built_filters = fix_build_filters(new_instance_id, missing_date, missing_hours)
# print('Creating {} queries\n'.format(len(built_filters)))
# fix_batch_get_logs_and_save(built_filters)

"""
======================
    Main process
======================
"""

"""
A. Get logs from GCP Bucket and save to ./db by instance_id

!! Please remove ./db/<instance_id> folder before running the command !!
"""
release_name = 'budapest_dec20'  # None for default bucket, if no specific bucket was created for the release
get_all_logs_of_release(release_name, False)

# # Alternative: to analyze only a subsets of logs
# df = pd.concat([
#     read_and_parse_logs_of_release('cos_containers/2021/12/20/14:00:00_14:59:59_S0.json', release_name, False)
# ]).reset_index(drop=True)
# print(df)

# """
# B. Read logs from /db and analyze
# """
# instance_id = '8212280380033896655'
# input_name = 'tick'

# # Read logs from db csv
# df = read_csv(Constants.DB_PATH, instance_id + '_' + input_name + '_result.csv')
# print(df.head(10))

# # parse logs
# parsed = parse_strategy_tick(df, True)

# # plot to files
# plot_bar(parsed, 'tick_timestamp', 'balance_wo_decimal', 'balance_wo_decimal.png', 'hopr_bright_blue')
# plot_bar(parsed, 'tick_timestamp', 'diff_balance_wo_decimal', 'diff_balance_wo_decimal.png', 'hopr_bright_blue')