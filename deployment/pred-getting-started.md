# Getting Started with Predictive Services

In this section we will walk through an end-to-end example of deploying and using a Predictive Service. For more information about each aspect see the subsequent chapters of the User Guide.

#### Configuration

In order to launch a Predictive Service in EC2 we first need to configure the [`graphlab.deploy.Ec2Config`](https://dato.com/products/create/docs/generated/graphlab.deploy.Ec2Config.html)  object, which contains required configuration parameters.

```python
import graphlab

ec2 = graphlab.deploy.Ec2Config(region='us-west-2',
                                instance_type='m3.xlarge',
                                aws_access_key_id='YOUR_ACCESS_KEY',
                                aws_secret_access_key='YOUR_SECRET_KEY')
```

The configuration object is client-side only; its purpose is merely to encapsulate a set of parameters and pass them to the `create` command.

#### Launch the Predictive Service

Having configured the Predictive Service environment, we are ready to launch a Predictive
Service Deployment using
[`graphlab.deploy.predictive_service.create`](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.create.html#graphlab.deploy.predictive_service.create).
Required parameters include

1. a name for the deployment
2. a EC2 configuration we defined in the previous step
3. an state path for the root 'working directory' for this Predictive Service

When the `create()` command is executed, the EC2 instances will be launched immediately, followed by a load balancer which adds the instances into the cluster as they pass health checks.

```python
deployment = graphlab.deploy.predictive_service.create(
    'first', ec2, 's3://sample-testing/first')
```

Additional parameters include the number of EC2 nodes to use for the service, SSL credentials to secure the data flow, and more. See  [`graphlab.deploy.predictive_service.create`](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.create.html#graphlab.deploy.predictive_service.create) for a complete list.

#### Upload a Model

Any model that you create and use locally can back a Predictive Service. We will use a simple recommender model in this walk-through:

```python
data_url = 'https://s3.amazonaws.com/dato-datasets/movie_ratings/sample.small'
data = graphlab.SFrame.read_csv(data_url,delimiter='\t',column_type_hints={'rating':int})
model = graphlab.popularity_recommender.create(data, 'user', 'movie', 'rating')
```

The [`PredictiveService.add`](https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.add.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.add)
method stages a model for deployment to the cluster. It also requires us to provide a name which we will later use to query the model.

```python
deployment.add('recs', model)
```

The change needs to be applied in order for the model to be actually uploaded to the service:

```python
deployment.apply_changes()
```

Printing the deployment object displays its properties and deployed Predictive Objects:

```python
print deployment
```

```no-highlight
Name                  : first
State Path            : s3://roman-workspace/roman-ugtest
Description           : None
API Key               : 7a99ccbf-3f51-4c5a-bf32-c03a6f07ecd2
CORS origin           :
Global Cache State    : enabled
Load Balancer DNS Name: first-1793598482.us-west-2.elb.amazonaws.com

Deployed predictive objects:
 name: recs, version: 1, cache: enabled, description:
No Pending changes.
```

At this point the model is ready to be queried.

#### Query the Model

Each model (or Predictive Object) in a Predictive Service exposes a REST endpoint to query it. GraphLab Create provides wrapper methods to submit queries within its Python API.

```python
recs = deployment.query('recs',
                        method='recommend',
                        data={ 'users': [ 'Jacob Smith' ] })
```

Outside of the Python client, an application can use the endpoint directly, for instance through curl (replace the api_key and URL with your parameters as displayed by the `print deployment` command above):

```no-highlight
curl -u api_key:7a99ccbf-3f51-4c5a-bf32-c03a6f07ecd2 -d '{
  "data": {
    "method": "recommend",
    "data": { "users": [ "Jacob Smith" ] }
  }
}' http://first-1793598482.us-west-2.elb.amazonaws.com/query/recs
```

#### Shutdown the Predictive Service

As long as the Predictive Service is up and running, it incurs AWS charges. You can shut down a service as follows:

```python
deployment.terminate_service()
```

This will terminate all nodes used by the Predictive Service.
