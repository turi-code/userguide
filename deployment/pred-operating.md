# Operating Predictive Services

Once a deployment is created and running, it is important to be able to monitor and manage its behavior and make sure it is operating as expected. With GraphLab Create, we offer the tools needed to monitor and operate Predictive Service deployments.

#### Monitoring

Dato Predictive Services provides a set of interfaces to gain insight into a running Predictive Services deployment, both visually as well as APIs.

##### Predictive Service Dashboard in GraphLab Canvas

To visualize a deployment using GraphLab Canvas, simply run [`show`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.show.html), as follows:

```python
deployment.show()
```

[<img alt="Example of a Predictive Service Deployment in GraphLab Canvas" src="images/predictive-services-dashboard-glc1.1.png" style="max-width: 70%; margin-left: 15%;" />](images/predictive-services-dashboard-glc1.1.png)

This will launch GraphLab Canvas in your browser and show you a dashboard for this Predictive Service, like the example above.

If you would like to see an overall dashboard of all your Predictive Services, run:

```python
graphlab.deploy.predictive_services.show()
```

Using the Predictive Service dashboard you can see the important metrics about the deployment for the last six hours.

##### View Deployment Metrics in CloudWatch

To zoom in beyond the basic dashboard, you can click through to Amazon CloudWatch, where the metrics for a Predictive Service are stored. Using the dashboard offered there you can see the individual metrics for a Predictive Object, or overall metrics about the deployment.

##### Setting Alarms using CloudWatch Alarms

To set alarms for a deployment, use the Amazon CloudWatch console for the metrics published by the Predictive Service Deployment.

For more information see the [Amazon CloudWatch Alarms](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/AlarmThatSendsEmail.html) documentation.

#### Monitoring APIs

To retrieve the overall status of a deployment, call [`get_status`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_status.html).

```python
print deployment.get_status()
```

You may get status of different aspects of the deployment by way of the `view` parameter to `get_status`

```python
# get node status
deployment.get_status(view='node')
```

```
Columns:
	cache	str
	dns_name	str
	instance_id	str
	state	str

Rows: 1

Data:
+---------+-------------------------------+-------------+-----------+
|  cache  |            dns_name           | instance_id |   state   |
+---------+-------------------------------+-------------+-----------+
| Healthy | ec2-52-24-53-250.us-west-2... |  i-8af8867c | InService |
+---------+-------------------------------+-------------+-----------+
[1 rows x 4 columns]
```

Or alternatively,

```python
# get cache status
deployment.get_status(view='cache')

# get Predictive Object status
deployment.get_status(view='model')
```

This API returns an SFrame regarding each Predictive Object's status on each node in the deployment, so it is easy to verify programmatically when a Predictive Object has been fully loaded by all nodes in the deployment.

##### Service Metrics

Through the [`get_metrics`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_metrics.html) API a variety of operational metrics about the predictive service can be retrieved. By default, the method returns the number of requests and the average latency over the last 12 hours, in 5 minute increments:

```python
ps.get_metrics()
```

```
{'requests':
+------------------+---------------------------+-------------------+
|       sum        |            time           |        unit       |
+------------------+---------------------------+-------------------+
|       8.0        | 2014-11-13 00:31:00+00:00 |       Count       |
|       2.0        | 2014-11-13 00:36:00+00:00 |       Count       |
|       7.0        | 2014-11-13 00:41:00+00:00 |       Count       |
|     24707.0      | 2014-11-13 00:46:00+00:00 |       Count       |
|       5.0        | 2014-11-13 00:51:00+00:00 |       Count       |
......
'latency':
+------------------+---------------------------+-------------------+
|     average      |            time           |        unit       |
+------------------+---------------------------+-------------------+
|    0.0229513     | 2014-11-13 00:31:00+00:00 |      Seconds      |
|    0.0231056     | 2014-11-13 00:36:00+00:00 |      Seconds      |
|    0.0221893     | 2014-11-13 00:41:00+00:00 |      Seconds      |
|    0.0578591     | 2014-11-13 00:46:00+00:00 |      Seconds      |
|    0.0225744     | 2014-11-13 00:51:00+00:00 |      Seconds      |
......
```

Aside from requests and latency, the number of exceptions as well as cache-specific counters can be retrieved. Moreover, the scope can be reduced to a specific endpoint. For more information see the API documentation of [`get_metrics`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_metrics.html).

#### Operations

The following sub-sections explain how various properties of a deployed predictive service can be modified, like scaling up/down, changing the cache behavior, or constraining requests across domains.

##### Recovering from node failure

Occasionally, Predictive Service nodes fail. How would you discover this problem in the first place? Most likely, you’ve found that occasionally queries are timing out. Or better yet, you have configured [CloudWatch](http://aws.amazon.com/cloudwatch/) metrics monitoring for your service and you received an alert indicating that something is wrong. You can manually inspect the status of the deployment with the `get_status` method. If you find that a node is unreachable ("Unable to connect"), you may decide to replace the node using [`replace_nodes`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.replace_nodes.html).

```python
deployment.replace_nodes(['i-8af8867c'])
```

```
[INFO] Adding 1 nodes to cluster
[INFO] Launching an m3.xlarge instance in the us-west-2a availability zone, with
       id: i-c5dda333. You will be responsible for the cost of this instance.
[INFO] Cluster not fully operational yet, [1/2] instances currently in service.
[INFO] Cluster not fully operational yet, [1/2] instances currently in service.
[INFO] Cluster not fully operational yet, [1/2] instances currently in service.
[INFO] Cluster not fully operational yet, [1/2] instances currently in service.
[INFO] Cluster not fully operational yet, [1/2] instances currently in service.
[INFO] Cluster not fully operational yet, [1/2] instances currently in service.
[INFO] Cluster not fully operational yet, [1/2] instances currently in service.
[INFO] Cluster not fully operational yet, [1/2] instances currently in service.
[INFO] Cluster not fully operational yet, [1/2] instances currently in service.
[INFO] Cluster not fully operational yet, [1/2] instances currently in service.
[INFO] Cluster not fully operational yet, [1/2] instances currently in service.
[INFO] Cluster is fully operational, [2/2] instances currently in service.
[INFO] Terminating EC2 host(s) ['i-8af8867c'] in us-west-2
```

This method terminates each of the specified nodes and brings up new ones in their place with the appropriate settings for your Predictive Service deployment.

Note: currently we cannot preserve the state of the distributed cache when repairing the cluster. In other words, all data in the cache at the time repair is called will be lost.

Similarly, you can add and remove nodes with the [`add_nodes`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.add_nodes.html) and [`remove_nodes`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.remove_nodes.html) APIs.

##### Reconfigure a Predictive Service Deployment

You can modify some underlying configuration parameters of the Predictive Service deployment using the [`reconfigure`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.reconfigure.html) method. The available configuration options are:

- `cache_max_memory_mb`: the amount of memory allocated to the distributed cache
- `cache_ttl_on_update_secs`: the TTL of existing cache keys after a model update
- `feedback_cache_ttl_secs`: The TTL of cached feedback requests

A call to reconfigure might look as follows:

```python
# increase the cache_max_memory size to 4 GBs
deployment.reconfigure({"cache_max_memory_mb": 4000})
```

##### Cache Management

Caching is supported for Predictive Service clusters of any size. It can be controlled both at the cluster level and at the Predictive Object level. By default, the cache is enabled globally (ie. for all models) in a Predictive Service deployment. Caching is enabled for all Predictive Objects by default. You may control the cache globally and at the level of individual Predictive Objects.

You may enable/disable/clear the cache at the cluster level using the following commands:

```python
# enable cache for the cluster
# note this will turn on cache for all Predictive Objects
deployment.cache_enable()

# disable cache for the cluster
# note this will turn off cache for all Predictive Objects
deployment.cache_disable()

# clear all cache entries in the cluster
deployment.cache_clear()
```

You may turn the cache on/off for individual Predictive Object, which overrides the global setting:

```python
# disable cache for a Predictive Object called 'my-no-cache-model'
deployment.cache_disable('my-no-cache-model')

# enable cache for a Predictive Object called 'my-no-cache-model'
deployment.cache_enable('my-no-cache-model')
```

##### CORS support

To enable CORS support for cross-origin requests coming from a website (ex. https://dato.com), use set_CORS:

```python
# To allow requests coming from https://dato.com
deployment.set_CORS('https://dato.com')
```

To enable CORS support for all cross-origin requests:

```python
# allow any CORS request
deployment.set_CORS('*')
```

To disable CORS support for this Predictive Service:

```python
# disable CORS support
deployment.set_CORS()
```

##### Terminating a Predictive Service Deployment

To terminate a Predictive Service, call the [`terminate_service`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.terminate_service.html) method. There are options to delete the logs and Predictive Objects as well. **Note:** There is no warning or confirmation on this method; it will terminate the EC2 instances and teardown the Elastic Load Balancer.

```python
deployment.terminate_service()
```
