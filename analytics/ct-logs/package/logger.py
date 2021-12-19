from google.cloud import logging
from datetime import date
from datetime import timedelta
import pandas as pd
import json
from .io import return_file_to_save

print('Connect to logging client...\n')
logging_client = logging.Client()

def build_filter(instance_id, start_date, end_date, regex_expression):
    """
    Construct a filter for given instance id and start/end date (T00:00:00.000z)

    :param instance_id: The instance id of cover traffic node
    :param start_date: Date in ISO format from which logs get checked. E.g. 2021-11-16
    :param end_date: Date in ISO format till which logs get checked. E.g. 2021-11-17
    :param regex_expression: The Regex expression that applies on the output logs
    :return: returns the filter string
    """
    return '((resource.type="gce_instance" AND resource.labels.instance_id="' + instance_id + '") OR (resource.type="global" AND jsonPayload.instance.id="' + instance_id + '")) AND timestamp >= "' + start_date + 'T00:00:00.000z" AND timestamp < "' + end_date + 'T00:00:00.000z" AND jsonPayload.message =~ "' + regex_expression + '"'

def build_filters(instance_id, start_date, end_date, regex_expression):
    """
    Construct a set of filters for given instance id and start/end date (T00:00:00.000z)
    Each query addresses for one-day long window

    :param instance_id: The instance id of cover traffic node
    :param start_date: Date in ISO format from which logs get checked. E.g. 2021-11-16
    :param end_date: Date in ISO format till which logs get checked. E.g. 2021-11-17
    :param regex_expression: The Regex expression that applies on the output logs
    :return: returns the filter string
    """
    start_day = date.fromisoformat(start_date)
    delta = date.fromisoformat(end_date) - start_day
    print('Built %i queries \n' %delta.days)
    queries = []
    for day in range(delta.days):
        window_start = start_day + timedelta(days=day)
        window_end = start_day + timedelta(days=day + 1)
        queries.append(build_filter(instance_id, window_start.isoformat(), window_end.isoformat(), regex_expression))
    return queries

def get_logs(filter_string, **kwargs):
    """
    Conenct to Google Logging client and query logs with the filter.
    It returns the jsonPayload.message field 

    E.g. get_logs('resource.type="gce_instance" AND resource.labels.instance_id="123"', None)
    E.g. get_logs('resource.type="gce_instance" AND resource.labels.instance_id="123"', 20)

    :param filter_string: Query that is passed to the GCP Logger
    :param max_entries: keyword argument, The maximum entry returned per query. None means unlimited.
    :return: returns the dataframe with "g_time" (timestamp that the log is output to GCP Logger), "node_time" (timestamp in the node when log is produced. If no time is produced, it returns "NaN"), "message" (log content)
    """
    result = []
    max_entries = kwargs.get('max_entries', None)
    nr_entries = 0
    for entry in logging_client.list_entries(filter_=filter_string):
        r = (entry.payload, entry.received_timestamp)
        result.append(r)
        nr_entries += 1
        if max_entries is not None and nr_entries >= max_entries:
            break
    df = pd.DataFrame(result, columns=["mes","g_time"])
    df['message'] = df['mes'].apply(lambda x: x['message'])
    df['g_time'] = pd.to_datetime(df['g_time'].astype('str',copy=False))
    df['node_time'] = df['message'].str.extract('(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}[Zz])').astype('str')
    # df['node_time'] = pd.to_datetime(df['node_time'])
    return df.loc[:, df.columns != "mes"]

def get_logs_from_queries_and_concat(queries, max_entry_per_query):
    """
    Pass the list of queries to the GCP Logger with a limit of returned results per query
    It calls `get_logs` under the hood

    E.g. get_logs_from_queries_and_concat('resource.type="gce_instance" AND resource.labels.instance_id="123"', None)
    E.g. get_logs_from_queries_and_concat('resource.type="gce_instance" AND resource.labels.instance_id="123"', 20)

    :param queries: A List of queries being passed to the GCP Logger
    :param max_entries: keyword argument, The maximum entry returned per query. None means unlimited.
    :return: returns the dataframe with "g_time" (timestamp that the log is output to GCP Logger), "node_time" (timestamp in the node when log is produced. If no time is produced, it returns "NaN"), "message" (log content)
    """
    appended = []
    for index in range(len(queries)):
        query = queries[index]
        print('  Calling query nr.%i' %index)
        query_result_df = get_logs(query, max_entries=max_entry_per_query)
        appended.append(query_result_df)
    return pd.concat(appended).reset_index(drop=True)

# Sink
def create_all_ct_logs_sink(release_name, filter):
    sink = logging.Sink(name='ct_'+release_name, filter_=filter)
    logging.Sink.create(logging_client)

def create_sink(sink_name, destination_bucket, filter_):
    """
    Creates a sink to export logs to the given Cloud Storage bucket.

    The filter determines which logs this sink matches and will be exported
    to the destination. For example a filter of 'severity>=INFO' will send
    all logs that have a severity of INFO or greater to the destination.
    See https://cloud.google.com/logging/docs/view/advanced_filters for more
    filter information.
    """
    logging_client = logging.Client()

    # The destination can be a Cloud Storage bucket, a Cloud Pub/Sub topic,
    # or a BigQuery dataset. In this case, it is a Cloud Storage Bucket.
    # See https://cloud.google.com/logging/docs/api/tasks/exporting-logs for
    # information on the destination format.
    destination = "storage.googleapis.com/{bucket}".format(bucket=destination_bucket)

    sink = logging_client.sink(sink_name, filter_=filter_, destination=destination)

    if sink.exists():
        print("Sink {} already exists.".format(sink.name))
        return

    sink.create()
    print("Created sink {}".format(sink.name))

def update_sink(sink_name, filter_):
    """
    Changes a sink's filter.

    The filter determines which logs this sink matches and will be exported
    to the destination. For example a filter of 'severity>=INFO' will send
    all logs that have a severity of INFO or greater to the destination.
    See https://cloud.google.com/logging/docs/view/advanced_filters for more
    filter information.
    """
    logging_client = logging.Client()
    sink = logging_client.sink(sink_name)

    sink.reload()

    sink.filter_ = filter_
    print("Updated sink {}".format(sink.name))
    sink.update()

def build_sink_filter(instance_id):
    """
    Construct a filter for given instance id

    :param instance_id: The instance id of cover traffic node
    :param regex_expression: The Regex expression that applies on the output logs
    :return: returns the filter string
    """
    return ('((resource.type="gce_instance" AND resource.labels.instance_id="' 
        + instance_id 
        + '") OR (resource.type="global" AND jsonPayload.instance.id="' 
        + instance_id 
        + '"))')


# Get missing logs
def fix_build_filters(instance_id, date, hours):
    result_dictionary = {}
    for hour in hours:
        result_key = str(hour) + ':00:00_' + str(hour) + ':59:59_S0.json'
        result_values = []
        for minute_start in range(6):
            # every 10 minutes
            built_filter = ('(resource.type="gce_instance" AND resource.labels.instance_id="' + instance_id 
                + '") OR (resource.type="global" AND jsonPayload.instance.id="' + instance_id + '") AND (timestamp >= "' 
                + date + 'T' + hour + ':' + str(minute_start) + '0:00.000z" AND timestamp <= "' 
                + date + 'T' + hour + ':' + str(minute_start) + '9:59.999z")')
            result_values.append(built_filter)
        result_dictionary.update({result_key: result_values})
    return result_dictionary

def fix_get_logs(file_name, filter_string, **kwargs):
    result = []
    max_entries = kwargs.get('max_entries', None)
    nr_entries = 0
    f = return_file_to_save('../tmp/', file_name, True)
    for entry in logging_client.list_entries(filter_=filter_string):
        f.write("{}\n".format(json.dumps(entry.to_api_repr()))) # end in new line
        result.append(entry.to_api_repr())
        nr_entries += 1
        if max_entries is not None and nr_entries >= max_entries:
            break
    f.close()
    return result

def fix_batch_get_logs_and_save(query_filter_dict):
    dict_keys = list(query_filter_dict.keys())
    for dict_key in dict_keys:
        # dict_key is file_name
        print("Collecting entries for file {}".format(dict_key))
        query_nr = 0
        for built_filter in query_filter_dict[dict_key]:
            print("     Querying entry nr. {}".format(query_nr))
            fix_get_logs(dict_key, built_filter)
            query_nr += 1
    print("Complete batch getting logs.")

