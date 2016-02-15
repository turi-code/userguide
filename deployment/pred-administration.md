# Administration

The following sub-sections explain how various properties of a deployed predictive service can be modified, like scaling up/down, changing the cache behavior, or constraining requests across domains.

#### Launching and Terminating

In chapter [Launching](pred-launching.md) we have shown how a predictive service is created, given a valid configuration for EC2:

```python
ps = graphlab.deploy.predictive_service.create(
    'first', ec2, 's3://sample-testing/first')
```

A reference to an existing predictive service can be retrieved through the [`load`](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.load.html) API:

```python
ps = graphlab.deploy.predictive_service.load(
    's3://sample-testing/first')
```

This method will load an existing predictive service from the specified path, which corresponds to the path given at creation time (The predictive service keeps a state file in that path).

If you have worked with a predictive service in your local machine at least once, it will be added to your session. The list of predictive services registered in your session  can be listed as follows:

```python
graphlab.deploy.predictive_services
```

```python
PredictiveService(s):
+-------+-----------------+-----------------------------+-------------------+
| Index |       Name      |         State_path          |        Type       |
+-------+-----------------+-----------------------------+-------------------+
|   0   |      first      |  s3://sample-testing/first  | PredictiveService |
|   1   | demolab-one-six | s3://gl-demo-usw/demolab/ps | PredictiveService |
+-------+-----------------+-----------------------------+-------------------+
+------------------+----------------------------+
| Unsaved changes? |       Creation date        |
+------------------+----------------------------+
|        No        | 2015-10-30 11:33:43.395008 |
|        No        | 2015-10-28 13:29:43.274104 |
+------------------+----------------------------+
```

You can load a reference to a predictive service from this list like this:

```python
ps = graphlab.deploy.predictive_services[0]
```

To terminate a Predictive Service, call the [`terminate_service`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.terminate_service.html) method. There are options to delete the logs and predictive objects as well. **Note:** There is no warning or confirmation on this method; it will terminate the EC2 instances and tear down the Elastic Load Balancer.

```python
deployment.terminate_service()
```

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

#### Environment Variables

It is common to use system environment variables for specific application configurations. Specifically, it is a general best practice to use such variables for secrets, like credentials, as opposed to storing them on disk. Dato Predictive Services provides an API to set environment variables for the scope of a predictive service:

A variable is set using the [`set`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.environment_variables.set.html) API:

```python
ps.environment_variables.set('DB_USERNAME', 'bob')
ps.apply_changes()
```

Note that this type of configuration is queued up and needs to be submitted by executing `apply_changes`.

Please consider these security implications:
* When using this feature to set secrets, make sure you configured your predictive service to use SSL in order to encrypt the data transfer upon executing this API.
* To make sure these variables will be available as nodes are added to or replaced in the predictive service, they are stored in the S3 path specified when the predictive service was created. Please make sure to secure that location appropriately as well.

The value of a variable can then be used in your deployed code (e.g., a custom predictive object) as follows:

```python
db_config = {
  'USER': os.environ.get('DB_USERNAME'),
  'PASSWORD': os.environ.get('DB_PASSWORD'),
}
```

On the client, the value of a variable can be retrieved through the deployment object using [`get`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.environment_variables.get.html):

```python
username = ps.environment_variables.get('DB_USERNAME')
```

Similarly, [`unset`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.environment_variables.unset.html) removes the variable from the deployment.

All currently set variables (that have been applied to the service) can be shown using [`list`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.environment_variables.list.html), which returns a dictionary of key-value pairs:

```python
ps.environment_variables.list()
```

```python
{'DB_USERNAME': 'bob', 'DB_PASSWORD': 'abc123'}
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

##### Reconfigure Cache Parameters

You can modify some underlying configuration parameters of the Predictive Service deployment using the [`reconfigure`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.reconfigure.html) method. The available configuration options are:

- `cache_max_memory_mb`: The amount of memory allocated to the distributed cache. Default is 2GB per node for EC2; for the on-premises limit see the configuration file.
- `cache_query_ttl_secs`: The TTL (time to live) of cached query requests. This determines when cached query results expire. Default is 1 year.
- `cache_feedback_ttl_secs`: The TTL of query responses to be available in the cache for feedback. Default is 24 hours.
- `cache_ttl_on_update_secs`: The TTL of existing cache keys after a model update. This determines how long after an update cached values of the previous version will be served. Default is 15 minutes.

A call to reconfigure might look as follows:

```python
# increase the cache_max_memory size to 4 GBs
deployment.reconfigure({"cache_max_memory_mb": 4000})
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
