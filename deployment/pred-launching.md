# Launching a Predictive Service

#### Configuration

In order to launch a Predictive Service you first need to configure it by instantiating a [graphlab.deploy.predictive_service.Ec2Config](https://dato.com/products/create/docs/generated/graphlab.deploy.Ec2Config.html) object:

```no-highlight
ec2 = graphlab.deploy.Ec2Config(region='us-west-2',
                                instance_type='m3.xlarge',
                                aws_access_key_id='YOUR_ACCESS_KEY',
                                aws_secret_access_key='YOUR_SECRET_KEY')
```

As an alternative to explicitly specifying the AWS credentials as parameters to the config you can also set them in your shell:

```no-highlight
export AWS_ACCESS_KEY_ID='YOUR_ACCESS_KEY'
export AWS_SECRET_ACCESS_KEY='YOUR_SECRET_KEY'
```

#### Deployment

With a valid configuration, a Predictive Service is launched using the [graphlab.deploy.predictive_service.create](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.create.html#graphlab.deploy.predictive_service.create) command:

```no-highlight
deployment = graphlab.deploy.predictive_service.create(
    'first', ec2, 's3://sample-testing/first')
```

The 3rd parameter -- the state path -- is a S3 path that is used to manage the
state for the Predictive Service. This can be used to create a Predictive Service
object based on an existing, running service, for instance on another machine. The path determines where the models and any
corresponding data dependencies will be saved. Logs are also written to this
path with an added directory named `logs`.
So for example, if we specified our S3 path to be
`s3://my-bucket/`, then the logs for our Predictive Service would be
saved at the following S3 path: `s3://my-bucket/logs`.

When the `create` command is executed, the EC2 instances will be launched immediately, followed by a load balancer which adds the instances into the cluster as they pass health checks.

There are additional, optional parameters to [`create()`](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.create.html#graphlab.deploy.predictive_service.create) including:

1. number of hosts for EC2
2. description of this service
3. the API key to use for REST queries
4. the admin key to use for modifying the deployment
5. an SSL credential pair for HTTPS
6. a string value to use as HTTP header Access-Control-Allow-Origin
7. the administration port the server will listen to (see below)

Print the deployment object to inspect some of these important parameters, such as the information necessary to connect to the deployment from an application and the list of deployed Predictive Objects. This also indicates whether there are any pending changes.

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

To visualize this deployment in GraphLab Canvas, use the .show() method.

```no-highlight
deployment
deployment.show()
```

Note: Distributed caching is supported if the number of hosts (`num_hosts`) is greater than two in the Predictive Service create call. If the number of hosts is less than three, then caching is enabled, but not shared/distributed between the nodes.

#### Working with an Existing Predictive Service Deployment

In some cases, multiple teams or team members may wish to collaborate on a
shared Predictive Service deployment. Configuring and managing a shared
deployment is easy. All that is needed to load an existing Predictive Service
deployment locally into your current GraphLab Create session is to call the
[`graphlab.deploy.predictive_service.load`](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.load.html#graphlab.deploy.predictive_service.load)
method. This method takes the S3 path specified when the deployment was created.

This way, it is easy to have one person on the team create a cluster, and have
everyone else on the team share that cluster for deploying objects. The person
that creates the cluster simply notifies the rest of the team of the S3 path for
the cluster, and everyone else can load the deployment locally to start using
it.

```no-highlight
deployment = graphlab.deploy.predictive_service.load(
    's3://sample-testing/pred-root/first',
    aws_access_key_id='YOUR_ACCESS_KEY',
    aws_secret_access_key='YOUR_SERECT_KEY')
```

If different credentials should be used to load this deployment than those
already defined in your shell environment, the new credentials can be specified
as additional parameters to this method call as shown above.

#### Port Configuration

A Predictive Service running in EC2 exposes several open ports:

* Query endpoint: A client that queries a model through Predictive Service endpoint can either use HTTP or HTTPS, which requires ports 80 and 443 to be open, respectively.
* Administration: In order for a GraphLab Create client to be able to administer a Predictive Service, it needs to be able to talk to each node in the deployment. This happens through port 9005 by default, or a custom port if specified as a parameter to [`create`](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.create.html#graphlab.deploy.predictive_service.create).

Additionally, the internal distributed cache communicates between nodes through ports 9006 and 19006.

#### Best Practices in AWS

Because EC2 is a multi-tenancy service, we recommend a few best practices to ensure your service and data remain secure.

* Provide SSL credentials when creating your Predictive Service to enable HTTPS as the protocol for your data flow when querying the service.
* Create a security group in AWS and specify it when configuring your EC2 deployment through an [`Ec2Config`](https://dato.com/products/create/docs/generated/graphlab.deploy.Ec2Config.html#graphlab.deploy.Ec2Config) to restrict access to your Predictive Service.
* Specify explicit CIDR rules when configuring your EC2 deployment to further restrict access to your Predictive Service.
