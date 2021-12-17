from google.cloud import storage
from . import get_file_path
import ast
import re
import pandas as pd

print('Connect to storage client...\n')
storage_client = storage.Client()

def get_release_name(release_name):
    return release_name + '_ct_query_results'

def get_bucket_name(release_name):
    if release_name is None:
        bucket_name='log_query_results'
    else:
        bucket_name = get_release_name(release_name)
    return bucket_name

def create_bucket_for_release(release_name):
    bucket = storage_client.create_bucket(get_release_name(release_name), location='europe-west6')
    print(
        "Created bucket {} in {} with storage class {}".format(
            bucket.name, bucket.location, bucket.storage_class
        )
    )
    return bucket

def download_raw_logs_of_release(blob_name, release_name, file_name):
    bucket = storage_client.get_bucket(get_bucket_name(release_name))
    blob = bucket.blob(blob_name)
    blob.download_to_filename(get_file_path("../blob/", file_name))

def connect_to_bucket_of_release(release_name):
    bucket = storage_client.get_bucket(get_bucket_name(release_name))
    print(f"ID: {bucket.id}")
    print(f"Name: {bucket.name}")
    print(f"Storage Class: {bucket.storage_class}")
    print(f"Location: {bucket.location}")
    print(f"Location Type: {bucket.location_type}")
    return bucket

def get_all_logs_of_release(release_name, filter_console_log=True):
    bucket = connect_to_bucket_of_release(release_name)
    # list blobs
    blob_names = []
    # list dataframes
    dfs = []
    all_blobs = list(storage_client.list_blobs(bucket, prefix="cos_containers"))
    for blob in all_blobs:
        blob_names.append(blob.name)
        read_content_df = parse_logs_of_release_from_blob(blob, filter_console_log)
        # TODO: parse message and route to different dataframes
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
    print("Converted {} blobs from file {}".format(
            len(logs_content_df), blob.name
        )
    )
    if filter_console_log:
        return logs_content_df[(logs_content_df['msg_contains_time'] == True)]
    else:
        return logs_content_df


def filter_message_timestamp(log):
    regex = re.compile(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}[Zz])')
    if 'message' in log['jsonPayload']:
        msg = log['jsonPayload']['message']
        node_time = regex.findall(msg)
        return {'message': msg, 'g_time': log['timestamp'], 'node_time': node_time[0] if len(node_time) > 0 else '', 'msg_contains_time': True if len(node_time) > 0 else False}
    else:
        return {'message': '', 'g_time': log['timestamp'], 'node_time': log['timestamp'], 'msg_contains_time': False}