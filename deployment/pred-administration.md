# Administration

The following sub-sections explain how various properties of a deployed predictive service can be modified, like scaling up/down, changing the cache behavior, or constraining requests across domains.

#### Recovering from node failure

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

#### Reconfigure a Predictive Service Deployment

You can modify some underlying configuration parameters of the Predictive Service deployment using the [`reconfigure`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.reconfigure.html) method. The available configuration options are:

- `cache_max_memory_mb`: the amount of memory allocated to the distributed cache
- `cache_ttl_on_update_secs`: the TTL of existing cache keys after a model update
- `feedback_cache_ttl_secs`: The TTL of cached feedback requests

A call to reconfigure might look as follows:

```python
# increase the cache_max_memory size to 4 GBs
deployment.reconfigure({"cache_max_memory_mb": 4000})
```

#### Cache Management

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

#### CORS support

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

#### Terminating a Predictive Service Deployment

To terminate a Predictive Service, call the [`terminate_service`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.terminate_service.html) method. There are options to delete the logs and Predictive Objects as well. **Note:** There is no warning or confirmation on this method; it will terminate the EC2 instances and teardown the Elastic Load Balancer.

```python
deployment.terminate_service()
```
