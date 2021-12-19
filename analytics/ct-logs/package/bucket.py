from google.cloud import storage
from . import get_file_path, save_csv, if_file_exist, Constants
import ast
import pandas as pd
import numpy as np

print('Connect to storage client...\n')
storage_client = storage.Client()

def get_release_name(release_name):
    """
    Create the full bucket name for a release

    :param release_name: Name of the release.
    :return: returns the full release name with appendix
    """
    return release_name + Constants.BUCKET_APPENDIX

def get_bucket_name(release_name):
    """
    Get the bucket name
    
    :param release_name: Name of the release. If None, it uses DEFAULT_BUCKET_NAME
    :return: returns the bucket name of a release/or default
    """
    if release_name is None:
        bucket_name = Constants.DEFAULT_BUCKET_NAME
    else:
        bucket_name = get_release_name(release_name)
    return bucket_name

def create_bucket_for_release(release_name):
    """
    Create a bucket in GCP to store logging data of a given release

    :param release_name: Name of the release. If None, it uses DEFAULT_BUCKET_NAME
    :return: returns bucket object
    """
    bucket = storage_client.create_bucket(get_release_name(release_name), location=Constants.DEFAULT_BUCKET_LOCATION)
    print(
        "Created bucket {} in {} with storage class {}".format(
            bucket.name, bucket.location, bucket.storage_class
        )
    )
    return bucket

def download_raw_logs_of_release(blob_name, release_name, file_name):
    """
    [Deprecated] Directly download blobs to a location
    """
    bucket = storage_client.get_bucket(get_bucket_name(release_name))
    blob = bucket.blob(blob_name)
    blob.download_to_filename(get_file_path(Constants.BLOB_DOWNLOAD_PATH, file_name))

def connect_to_bucket_of_release(release_name):
    """
    Connect to a GCP bucket

    :param release_name: Name of the release. If None, it uses DEFAULT_BUCKET_NAME
    :return: returns bucket object
    """
    bucket = storage_client.get_bucket(get_bucket_name(release_name))
    print(f"ID: {bucket.id}")
    print(f"Name: {bucket.name}")
    print(f"Storage Class: {bucket.storage_class}")
    print(f"Location: {bucket.location}")
    print(f"Location Type: {bucket.location_type}")
    return bucket

def get_all_logs_of_release(release_name, filter_console_log=True):
    """
    Get all the logs of releases
    """
    bucket = connect_to_bucket_of_release(release_name)
    # list blobs
    blob_names = []
    # list dataframes
    dfs = []
    all_blobs = list(storage_client.list_blobs(bucket, prefix=Constants.DEFAULT_BUCKET_BLOB_SUBFOLDER))
    for blob in all_blobs:
        blob_names.append(blob.name)
        read_content_df = parse_logs_of_release_from_blob(blob, filter_console_log)
        dfs.append(read_content_df)
    
    print(f"Blobs amount: {len(blob_names)}")
    results = pd.concat(dfs).reset_index(drop=True)
    print(f"Records amount: {len(results)}")
    return results

def read_and_parse_logs_of_release(blob_name, release_name, filter_console_log=True):
    """
    Read blob from GCP Storage bucket, drop most of the metadata and convert the blob into a dataframe
    E.g. read_and_parse_logs_of_release(cos_system/2021/10/20/11:00:00_11:59:59_S0.json', None)

    :param blob_name: A List of queries being passed to the GCP Logger
    :param release_name: Get the bucket name from release_name. None means the default bucket 'log_query_results'.
    :return: returns the dataframe with "g_time" (timestamp that the log is output to GCP Logger) and "message" (log content)
    """
    bucket = storage_client.get_bucket(get_bucket_name(release_name))
    blob = bucket.blob(blob_name)
    return parse_logs_of_release_from_blob(blob, filter_console_log)

def parse_logs_of_release_from_blob(blob, filter_console_log=True):
    """
    Extract only message and timestamp filed from cover-traffic logs blob

    :param blob: cover-traffic logs blob
    :return: returns the dataframe with "g_time" (timestamp that the log is output to GCP Logger) and "message" (log content)
    """
    with blob.open("rt") as f:
        blob_content = f.readlines()

    # turn blob content into a string of array, in order to be recognized by ast.literal_eval 
    blob_in_str_of_array = ('[' + ','.join(map(str, blob_content)) + ']').replace('\r','').replace('\n','')
    logs_list = ast.literal_eval(blob_in_str_of_array)
    log_content_list = map(filter_message_timestamp, logs_list)

    # convert into dataframe
    logs_content_df = pd.DataFrame(log_content_list)
    print("Converted {} blobs from file {}\n".format(
            len(logs_content_df), blob.name
        )
    )
    if filter_console_log:
        filtered_console_log = logs_content_df.dropna(thresh=1)
    else:
        filtered_console_log = logs_content_df
    
    # parse message and route to different dataframes
    route_to_dfs(filtered_console_log)
    return filtered_console_log


def filter_message_timestamp(log):
    # regex = re.compile(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}[Zz])')
    returned = {'g_time': log['timestamp']}
    if 'message' in log['jsonPayload']:
        msg = log['jsonPayload']['message']
        node_time = Constants.REGEX_EXTRACT_TIMESTAMP.findall(msg)
        returned = {**returned, 'message': msg, 'node_time': node_time[0] if len(node_time) > 0 else np.nan}
    else:
        returned = {**returned, 'message': '', 'node_time': log['timestamp']}

    if ('resource' in log) & ('labels' in log["resource"]) & ('instance_id' in log["resource"]['labels']):
        return {**returned, 'instance_id': log["resource"]['labels']['instance_id']}
    else: 
        return {**returned, 'instance_id': np.nan}

def route_to_dfs(df):
    """
    Take the parsed dataframe and route entries to multiple dataframes
    """
    # build a dictionary for sub dataframe's list of columns
    base_columns = ['g_time', 'node_time']
    sub_df = []
    for expression in Constants.REGEX_DICTIONARY.values():
        column_names = Constants.REGEX_EXTRACT_COLUMN_NAMES.findall(expression)
        sub_df.append(base_columns + column_names)
    sub_df_dictionary = dict(zip(Constants.REGEX_DICTIONARY.keys(), sub_df))

    # get list of instances
    instances = df['instance_id'].unique()
    num_instances = len(instances)
    print('{} unique instance, which are {}\n'.format(num_instances, instances))

    # parse dataframe into columns
    regex_dictionary_list = Constants.REGEX_DICTIONARY.values()
    extracts = df['message'].str.extract('|'.join(regex_dictionary_list))
    extracts.insert(0, 'instance_id', df['instance_id'])
    for base_column in base_columns: 
        extracts.insert(0, base_column, df[base_column])
    
    for instance_id in instances:
        extract_per_instance = extracts[extracts['instance_id'] == instance_id]
        sub_df_of_instance = []
        for file_name in sub_df_dictionary.keys():
            df = extract_per_instance[sub_df_dictionary[file_name]]
            # drop rows where content rows are all NaNs
            df = df.dropna(thresh=len(sub_df_dictionary[file_name]))
            sub_df_of_instance.append(df)
            print('     > {} file of instance {} has size of {}'.format(file_name, instance_id, df.shape))
            if df.shape[0] > 0:
                # No need to save when no row exists
                folder_name = Constants.DB_PATH + instance_id + '/'
                result_file_name = file_name + '.csv'
                if if_file_exist(folder_name, result_file_name):
                    # append to csv without header
                    save_csv(df, folder_name, result_file_name, False, True)
                else:
                    # write to csv with header
                    save_csv(df, folder_name, result_file_name, True, True)
    print(extracts)

