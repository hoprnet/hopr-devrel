# CT Log Interpreter
## Installation
1. Install libraries
```
pip3 install -r requirements.txt
```
2. Create a service account in `hoprassociation` project according to: https://cloud.google.com/docs/authentication/getting-started

## Run
Leave unused codes commented and only uncomment parts of the code that suits your need.
1. When a new CT node is spinned up for a release, provide its `instance_id` and `release_name` so that a bucket and a sink will be created for the instance.
```python
new_release_name = 
new_instance_id = 
```
All (by default. NB, this can be modified by changing function `build_sink_filter`) the logs produced by the said instance will be dumped into the storage bucket from the moment the sink is created.

2. If the sink was not created on time and logs of a few hours are missing, run the code in section 
```python
## Use the following code when a significant delay occured between instance and bucket creations.
```

3. Get **all** the logs from bucket and save the processed outputs to `../db/<instance_id>` folder, run
```python
release_name = 'budapest_dec20'  # None for default bucket, if no specific bucket was created for the release
get_all_logs_of_release(release_name)
```

4. Get **selected** logs from the bucket and save the processed outputs to `../db/<instance_id>` folder, run
```python
# Alternative: to analyze only a subsets of logs
df = pd.concat([
    read_and_parse_logs_of_release('cos_containers/2021/12/20/14:00:00_14:59:59_S0.json', release_name, False)
]).reset_index(drop=True)
print(df)
```

5. Analyze/visualized parsed outputs from `../db/<instance_id>`, run code in the section B.
