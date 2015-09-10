# Querying Predictive Services
In this section we cover the various ways to query a Predictive Service.

The deployment serves models through a REST API. The API takes JSON input, and
returns JSON results.

#### Python Client

To make it easy to validate deployment changes, and to manually warm up the
distributed cache, we offer a [query](
https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.query.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.query)
method. This makes it is easy to query the deployment directly from within your
GraphLab Create session.

For the example deployment, the code below demonstrates how we query for
recommendations for user ```Jacob Smith```:

```python
deployment = gl.deploy.predictive_services.load('s3://sample-testing/first')
recs = deployment.query('recs', method='recommend', data={'users':['Jacob Smith']})
```

This query results in a call to the `recommend` method on the deployed
Predictive Object named `recs`, and returns a set of recommendations as JSON.

We also offer a standalone Python client package, which makes it easy for Python
applications to query the Predictive Service. You can download that client
package from [pypi](https://pypi.python.org/pypi)

```no-highlight
pip install graphlab-service-client
```

##### Using curl

Another way to query the REST API is with the Unix ```curl``` command. Recall,
that we can get the DNS name of the load balancer and the deployment's API key
by printing the deployment
[(PredictiveService)](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.html?highlight=predictiveservice)
object:

```no-highlight
print deployment
```

```
Name                  : first
S3 Path               : s3://sample-testing/first
Description           : None
API Key               : b0a1c056-30b9-4468-9b8d-c07289017228
CORS origin           :
Global Cache State    : enabled
Load Balancer DNS Name: first-8410747484.us-west-2.elb.amazonaws.com

Deployed predictive objects:
No Pending changes.
```

The line below demonstrates how to reproduce the same query shown above using
curl:

```no-highlight
curl -X POST -d '{"api_key": "b0a1c056-30b9-4468-9b8d-c07289017228",
                  "data": {
                    "method": "recommend",
                    "data": { "users": [ "Jacob Smith" ] }
                    }
                  }'
     http://first-8410747484.us-west-2.elb.amazonaws.com/data/recs
```

Remember that the API key is a parameter optionally specified when creating the
Predictive Service Deployment. If an API key is not specified at the time the
Predictive Service is created and launched, then one is generated for you.

#### Writing your own client library

Because querying the API is easy using ```curl```, building a client library
that depends on ```libcurl``` is really easy, since ```libcurl``` has bindings
for all recent programming languages.

#### Consume query, result, feedback and custom logs

GraphLab Create Predictive Service automatically logs all queries that are made
against your deployment. Those query logs are shipped to the S3 log path you
specified when you created the Predictive Service deployment. With the release
of GraphLab-Create 1.4, we are doing the same for query results.

Similarly, if you use the custom logging mechanism in a custom query, those
custom log files will also be shipped periodically to the same log location. If
you use GraphLab Create Client's `feedback` mechanism, the feedback log is
handled in exactly the same way.

With query, result, feedback, and custom logs, you should have enough
information to evaluate your model performance, and potentially collect training
data to improve the next version of your model.

All log files are named in the following format in your S3 log path:

	timestamp-computerip_[query|result|server|feedback|custom].log

Here is an example log filename associated with a sample of query log entries:

	2015-01-29T23:35:09.ip-172-31-16-139_query.log

These log files can easily be loaded into an SFrame using the following
PredictiveService methods:

- [get_query_logs](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_query_logs.html#graphlab.deploy.PredictiveService.get_query_logs)
- [get_result_logs](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_result_logs.html#graphlab.deploy.PredictiveService.get_result_logs)
- [get_feedback_logs](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_feedback_logs.html#graphlab.deploy.PredictiveService.get_feedback_logs)
- [get_custom_logs](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_custom_logs.html#graphlab.deploy.PredictiveService.get_custom_logs)
- [get_server_logs](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_server_logs.html#graphlab.deploy.PredictiveService.get_server_logs)

Each of these methods takes both a start and end time parameter to determine the time window from which we want to load logs. For example:

```python
# read in all query logs from yesterday
import datetime
now = datetime.datetime.now()
yesterday = now.replace(day=now.day-1, hour=0, minute=0, second=0, microsecond=0)
query_logs_sf = deployment.get_query_logs(yesterday, now.replace(hour=0, minute=0, second=0, microsecond=0))
[INFO] Fetching 1 log files from S3...
PROGRESS: download: s3://sample-testing/logs/recs_logs/2015-05-13T00:03:21.ip-172-31-30-62_query.log to ../../var/tmp/graphlab-username/4741/000009
PROGRESS:
PROGRESS: Finished parsing file s3://sample-testing/logs/recs_logs/2015-05-13T00:03:21.ip-172-31-30-62_query.log
PROGRESS: Parsing completed. Parsed 5 lines in 0.8146 secs.
[INFO] Read, parsed, and merged 1 log files in 4 seconds
print query_logs_sf
```

```
+---------------------------+-------------------------------+
|          datetime         |              log              |
+---------------------------+-------------------------------+
| 2015-05-13 00:18:13+00:00 | {'version': 1, 'params': {... |
| 2015-05-13 00:18:16+00:00 | {'version': 1, 'params': {... |
| 2015-05-13 00:18:17+00:00 | {'version': 1, 'params': {... |
| 2015-05-13 00:18:18+00:00 | {'version': 1, 'params': {... |
| 2015-05-13 00:18:19+00:00 | {'version': 1, 'params': {... |
+---------------------------+-------------------------------+
[5 rows x 2 columns]
```

Each of these methods returns all of the log entries corresponding to the
specified log type within the specified timestamp. If your Predictive Service
cluster consists of multiple nodes, this will merge all of the nodes' logfiles
into a single SFrame and sort the merged results by timestamp. The resulting
SFrame has as many rows as there were queries during that time span. It has a
timestamp column of type
[datetime](https://docs.python.org/2/library/datetime.html), and a log column of
type `dict`. You can easily go from here and start your own experimentation
process.
