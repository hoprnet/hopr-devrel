from google.cloud import logging
from datetime import date
from datetime import timedelta
import pandas as pd

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