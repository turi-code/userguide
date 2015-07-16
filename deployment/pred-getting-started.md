#Getting Started with Predictive Services
First let's get a prerequisite to using Predictive Services out of the way. To
get started, we configure the EC2 Config object, which contains the
configuration parameters required for launching a Predictive Service cluster in
EC2.

```no-highlight
import graphlab

ec2 = graphlab.deploy.Ec2Config(region='us-west-2',
                                instance_type='m3.xlarge',
                                aws_access_key_id='YOUR_ACCESS_KEY',
                                aws_secret_access_key='YOUR_SECRET_KEY')
```

For more documentation about how GraphLab Create manages Jobs and Predictive
Services, see
[here](https://dato.com/products/create/docs/graphlab.deploy.html#predictive-services).

Having configured our EC2 Config object, we're ready to launch a Predictive
Service Deployment using
[graphlab.deploy.predictive_service.create](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.create.html#graphlab.deploy.predictive_service.create).
Required parameters include

1. a name for the deployment
2. a EC2 configuration we defined in the previous step
3. an state path for the root 'working directory' for this Predictive Service

The 3rd parameter -- the state path -- is a S3 path that is used to manage the
state for the Predictive Service. This can be used to create a Predictive Service
object on another machine. This path determines where the models and any
corresponding data dependencies will be saved. Logs are also written to this
path with an added directory named logs.
So for example, if we specified our S3 path to be
`s3://my-bucket/`, then the logs for our Predictive Service would be
saved at the following S3 path: `s3://my-bucket/logs`.

When this `create` command is executed, the EC2 instances will be launched immediately, after which a load balancer will be launched, configured, and finally the load balancer will add the instances into the cluster as they pass health checks.

```no-highlight
deployment = graphlab.deploy.predictive_service.create(
    'first', ec2, 's3://sample-testing/first')
```

There are additional, optional parameters to [graphlab.deploy.predictive_service.create()](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.create.html#graphlab.deploy.predictive_service.create) including:

1. number of hosts for EC2
2. description of this service
3. the API key to use for REST queries
4. the admin key to use for modifying the deployment
5. an SSL credential pair for HTTPS
6. a string value to use as HTTP header Access-Control-Allow-Origin
7. the port the server will listen to

Print the deployment object to inspect some of these important parameters, such as the information necessary to connect to the deployment from an application and the list of deployed Predictive Objects. This also indicates whether there are any pending changes. To visualize this deployment in GraphLab Canvas, use the .show() method.

```no-highlight
print deployment
```

```
Name                  : first
State Path            : s3://sample-testing/first
Description           : None
API Key               : b0a1c056-30b9-4468-9b8d-c07289017228
CORS origin           : 
Global Cache State    : enabled
Load Balancer DNS Name: first-8410747484.us-west-2.elb.amazonaws.com

Deployed predictive objects:
No Pending changes.
```

Note: Distributed caching is supported if the number of hosts (`num_hosts`) is greater than two in the Predictive Service create call. If the number of hosts is less than three, then caching is enabled, but not shared/distributed between the nodes.

```no-highlight
deployment
deployment.show()
```

