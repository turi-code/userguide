First let's get a prerequisite to using Predictive Services out of the way. To
get started, we configure the EC2 Environment object, which contains the
configuration parameters required for launching a Predictive Service cluster in
EC2.

```no-highlight
import graphlab

env = graphlab.deploy.environment.EC2('pred-ec2',
                                      's3://sample-testing/logs',
                                      region='us-west-2',
                                      instance_type='m3.xlarge',
                                      aws_access_key='YOUR_ACCESS_KEY',
                                      aws_secret_key='YOUR_SECRET_KEY',
                                      num_hosts=3)
```

After creating this object, we save it locally, so we can easily retrieve it in
subsequent GraphLab Create sessions. For more documentation about how GraphLab
Create manages local references to Environments, Jobs and Predictive Services,
see
[here](https://dato.com/products/create/docs/graphlab.deploy.environments.html#graphlab.deploy.environments).

Having configured our EC2 environment, we're ready to launch a Predictive
Service Deployment using
[graphlab.deploy.predictive_service.create](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.create.html#graphlab.deploy.predictive_service.create).
Required parameters include

1. a name for the deployment
1. the environment configuration we defined in the previous step
1. and an S3 path for the root 'working directory' for this Predictive Service

The 3rd parameter -- the S3 path -- determines where the models and any
corresponding data dependencies will be saved. Logs will be written to the S3
path specified in the EC2 Environment with an added directory corresponding to
the Predictive Service's name. So for example, if we specified as our Predictive
Service name the value `my-recommender-service` and as our S3 log path
`s3://my-bucket/my-logs`, then the logs for our Predictive Service would be
saved at the following S3 path: `s3://my-bucket/my-logs/my-recommender-service`.

When this `create` command is executed, the EC2 instances will be launched
immediately, after which a load balancer will be launched, configured, and
finally the load balancer will add the instances into the cluster as they pass
health checks.

```no-highlight
deployment = graphlab.deploy.predictive_service.create(
    'first', env, 's3://sample-testing/first')
```

There are additional, optional parameters to
[graphlab.deploy.predictive_service.create()](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.create.html#graphlab.deploy.predictive_service.create)
including:

1. an SSL credential pair for HTTPS
1. the API key to use for REST queries
1. the admin key to use for modifying the deployment

Print the deployment object to inspect some of these important parameters, such
as the information necessary to connect to the deployment from an application
and the list of deployed Predictive Objects. This also indicates whether there
are any pending changes. To visualize this deployment in GraphLab Canvas, use
the .show() method.

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

Note: Distributed caching is supported if the number of hosts (`num_hosts`) is
greater than two in the EC2 Environment object. If the number of hosts is less
than three, then caching is enabled, but not shared/distributed between the 
nodes.

```no-highlight
deployment
deployment.show()
```

