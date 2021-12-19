from package import *

# # """
# # ============================================================
# #             Preparation for a new CT node
# #     This script is only run once when CT node is created    
# # ============================================================
# # """
# # # Create a new bucket
# # new_release_name = 'budapest'
# # new_release_bucket = create_bucket_for_release(new_release_name)
# # # Spin up a CT node... and take the instance_id
# # new_instance_id = '8112381180178057866'
# # # Build filter used in sink
# # sink_filter = build_sink_filter(new_instance_id)
# # # Create sink for the new bucket
# # create_sink(new_release_name, new_release_bucket.name, sink_filter)

# """
# ======================
#     Main process
# ======================
# """

# """
# A. Get logs from GCP Bucket and save to ./db by instance_id

# !! Please remove ./db/<instance_id> folder before running the command !!
# """
# release_name = 'budapest'  # None for default bucket, if no specific bucket was created for the release
# get_all_logs_of_release(release_name)

# # # TEST
# # df = pd.concat([
# #     read_and_parse_logs_of_release('cos_containers/2021/12/12/00:00:00_00:59:59_S0.json', None, False)
# #     # read_and_parse_logs_of_release('cos_containers/2021/12/12/01:00:00_01:59:59_S0.json', None, False),
# #     # read_and_parse_logs_of_release('cos_containers/2021/12/12/02:00:00_02:59:59_S0.json', None, False)
# # ]).reset_index(drop=True)
# # print(df)

# # """
# # B. Read logs from /db and analyze
# # """
# # instance_id = '8212280380033896655'
# # input_name = 'tick'

# # # Read logs from db csv
# # df = read_csv(Constants.DB_PATH, instance_id + '_' + input_name + '_result.csv')
# # print(df.head(10))

# # # parse logs
# # parsed = parse_strategy_tick(df, True)

# # # plot to files
# # plot_bar(parsed, 'tick_timestamp', 'balance_wo_decimal', 'balance_wo_decimal.png', 'hopr_bright_blue')
# # plot_bar(parsed, 'tick_timestamp', 'diff_balance_wo_decimal', 'diff_balance_wo_decimal.png', 'hopr_bright_blue')

# # Test
built_filters = fix_build_filters('8112381180178057866', '2021-12-19', ['00','01','02','03','04','05','06'])
print('Creating {} queries\n'.format(len(built_filters)))

fix_batch_get_logs_and_save(built_filters)
# query_name = list(built_filters.keys())[0]
# print(query_name)
# query_content = built_filters[list(built_filters.keys())[0]]
# print(query_content[5])
# fix_get_logs(query_name, query_content[5], max_entries=100)