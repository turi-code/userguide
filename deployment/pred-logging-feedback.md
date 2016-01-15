# Logging and Feedback

A predictive service that you can query is the core of deploying machine learning to production. This feature, however, would not be truly powerful without the ability to gain insight into the service's behavior and to qualify the service's responses. Dato Predictive Services' logging and feedback APIs fulfill this requirement.

#### Logging

A predictive service automatically logs all queries that are made against your deployment, as well as the query results. Those logs are shipped to the S3 log path you specified when you created the predictive service deployment.

Similarly, if you use the custom logging mechanism in a custom query, those custom log files will also be shipped periodically to the same log location. If you use GraphLab Create Client's `feedback` mechanism, the feedback log is handled in exactly the same way.

With query, result, feedback, and custom logs, you should have enough information to evaluate your model performance, and potentially collect training data to improve the next version of your model.

All log files are named in the following format in your S3 log path:

	timestamp-computerip_[query|result|server|feedback|custom].log

Here is an example log filename associated with a sample of query log entries:

	2015-01-29T23:35:09.ip-172-31-16-139_query.log

These log files can easily be loaded into an SFrame using the following PredictiveService methods:

- [get_query_logs](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_query_logs.html)
- [get_result_logs](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_result_logs.html)
- [get_feedback_logs](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_feedback_logs.html)
- [get_custom_logs](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_custom_logs.html)
- [get_server_logs](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_server_logs.html)

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

Each of these methods returns all of the log entries corresponding to the specified log type within the specified timestamp. If your Predictive Service cluster consists of multiple nodes, this will merge all of the nodes' logfiles into a single SFrame and sort the merged results by timestamp. The resulting SFrame has as many rows as there were queries during that time span. It has a
timestamp column of type [datetime](https://docs.python.org/2/library/datetime.html), and a log column of type `dict`. You can easily go from here and start your own experimentation process.

#### Providing Feedback

A predictive service's logs provide a deep insight into the behavior of a predictive object, both in terms of queries as well as returned results. For models to be able to adapt to user behavior we need another component that closes the loop between the service and its consumers: the ability to associate a quality measure with each query result. To this end we are providing the `feedback` API.

The idea behind feedback is for an application to assign custom information to a query result, which gets logged in the service. The association happens through the uuid that was returned with the query response, which is used as parameter for a call to the feedback interface. This interface, just like the query API, is accessible either from within the GraphLab Create Python API or as a RESTful endpoint though HTTP:

Here is an example for an app that uses a predictive model to get suggestions for a user's text input ("auto-suggest"). The application returns feedback about whether the user accepted or ignored the suggested value:

```python
deployment.feedback('e8f13b17-173a-402d-835d-cc816eba626f',
                    search_term='dato pre',
                    suggested='dato predictive services',
                    suggestion_accepted=True)
```

The values for the uuid as well as the search term and suggestion were returned as query response. The user behavior is known by the application. Together this information is now logged as custom keyword arguments of the `feedback` call; they end up in the feedback logs, where they can be collected and used to improve the predictive model.

The example below demonstrates how to call the HTTP version of the feedback API using curl:

```no-highlight
curl -u api_key:b0a1c056-30b9-4468-9b8d-c07289017228 -d '{
  "id": "e8f13b17-173a-402d-835d-cc816eba626f",
  "data": {
    "search_term: "dato pre",
    "suggested": "dato predictive services",
    "suggestion_accepted": "True"
  }
}' http://first-8410747484.us-west-2.elb.amazonaws.com/feedback
```

You can retrieve feedback logs like the regular query and result logs using the [get_feedback_logs](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_feedback_logs.html) API. A feedback log entry has a timestamp, the uuid, and the custom information that encapsulates the feedback. It is now up to your application how to express feedback when submitting it for a query result, and how to process it when retrieving it from the logs.

So far we described custom feedback that you need to process manually. With the introduction of adaptive predictive policies we also let you supply feedback that is automatically taken into account to improve the quality of a predictive service dynamically. For more information about adaptive policies see the section about Multi-armed bandits in the [Experimentation](pred-experimentation.md) chapter.
