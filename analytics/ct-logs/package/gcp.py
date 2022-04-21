from . import build_filters, get_logs_from_queries_and_concat, save_csv

# via Logger
def get_and_save_logs_for_expression(instance_id, start_date, end_date, regex_extract, db_directory, output_name, max_entries_per_query):
    print('Get filters... \n')
    filters = build_filters(instance_id, start_date, end_date, regex_extract)

    print('Call get_logs... \n')
    logs = get_logs_from_queries_and_concat(filters, max_entries_per_query)

    print('\nPrint first 10/%i get_logs results \n' %len(logs))
    print(logs.head(10))

    print('Save output to db \n')
    save_csv(logs, db_directory, instance_id + '_' + output_name + '_result.csv')

    print('Done! \n---------------------')

def get_and_save_logs_for_all_expressions(extraction_dict, instance_id, start_date, end_date, db_directory):
    for key, value in extraction_dict.items():
        print('---------------------\nFilter for **%s** file \n' %key)
        get_and_save_logs_for_expression(instance_id, start_date, end_date, value, db_directory, key, None)


# via Storage Bucket