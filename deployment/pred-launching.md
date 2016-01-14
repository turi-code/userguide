# Launching a Predictive Service

#### Configuration

In order to launch a Predictive Service you first need to configure it by instantiating a [`graphlab.deploy.Ec2Config`](https://dato.com/products/create/docs/generated/graphlab.deploy.Ec2Config.html) object:

```python
ec2 = graphlab.deploy.Ec2Config(region='us-west-2',
                                instance_type='m3.xlarge',
                                aws_access_key_id='YOUR_ACCESS_KEY',
                                aws_secret_access_key='YOUR_SECRET_KEY')
```

Note that this simply creates a configuration object in your local session, without actually interacting with AWS. The actual deployment happens when the `Ec2Config` object is passed to `graphlab.deploy.predictive_service.create` (see below).

As an alternative to explicitly specifying the AWS credentials as parameters to the config you can also set them in your shell:

```no-highlight
export AWS_ACCESS_KEY_ID='YOUR_ACCESS_KEY'
export AWS_SECRET_ACCESS_KEY='YOUR_SECRET_KEY'
```

When you create a predictive service with this configuration (see below), a new security group **Dato_Predictive_Service** will be created in the default subnet. You can also specify a custom security group when creating the `Ec2Config` object:

```python
ec2 = graphlab.deploy.Ec2Config(region='us-west-2',
                                instance_type='m3.xlarge',
                                aws_access_key_id='YOUR_ACCESS_KEY',
                                aws_secret_access_key='YOUR_SECRET_KEY',
                                security_group='YOUR_SECURITY_GROUP_NAME')
```

If this security group does not exist, a new one will be created.

For other configuration parameters, including more details on supported EC2 instance types, please refer to [`Ec2Config`](https://dato.com/products/create/docs/generated/graphlab.deploy.Ec2Config.html).

#### Deployment

With a valid configuration object of type `Ec2Config`, a Predictive Service is launched using the [`graphlab.deploy.predictive_service.create`](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.create.html) command:

```python
deployment = graphlab.deploy.predictive_service.create(
    'first', ec2, 's3://sample-testing/first')
```

The 3rd parameter&mdash;the state path&mdash;is a S3 path that is used to manage the state for the Predictive Service. This can be used to create a Predictive Service object based on an existing, running service, for instance on another machine. The path determines where the models and any corresponding data dependencies will be saved. Logs are also written to this path with an added directory named `logs`. So for example, if we specified our S3 path to be `s3://my-bucket/`, then the logs for our Predictive Service would be saved at the following S3 path: `s3://my-bucket/logs`.

When the `create` command is executed, the EC2 instances will be launched immediately, followed by a load balancer which adds the instances into the cluster as they pass health checks.

There are additional, optional parameters to [`create`](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.create.html#graphlab.deploy.predictive_service.create) including:

1. number of hosts for EC2
2. description of this service
3. the API key to use for REST queries
4. the admin key to use for modifying the deployment
5. an SSL credential pair for HTTPS
6. a string value to use as HTTP header Access-Control-Allow-Origin
7. the administration port the server will listen to (see below)

Print the deployment object to inspect some of these important parameters, such as the information necessary to connect to the deployment from an application and the list of deployed Predictive Objects. This also indicates whether there are any pending changes.

```python
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

```python
deployment
deployment.show()
```

Note: Distributed caching is supported if the number of hosts (`num_hosts`) is greater than two in the Predictive Service create call. If the number of hosts is less than three, then caching is enabled, but not shared/distributed between the nodes.

#### Working with an Existing Predictive Service Deployment

In some cases, multiple teams or team members may wish to collaborate on a shared Predictive Service deployment. Configuring and managing a shared deployment is easy. All that is needed to load an existing Predictive Service deployment locally into your current GraphLab Create session is to call the [`graphlab.deploy.predictive_service.load`](https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_service.load.html#graphlab.deploy.predictive_service.load) method. This method takes the S3 path specified when the deployment was created.

This way, it is easy to have one person on the team create a cluster, and have everyone else on the team share that cluster for deploying objects. The person that creates the cluster simply notifies the rest of the team of the S3 path for the cluster, and everyone else can load the deployment locally to start using it.

```python
deployment = graphlab.deploy.predictive_service.load(
    's3://sample-testing/pred-root/first',
    aws_access_key_id='YOUR_ACCESS_KEY',
    aws_secret_access_key='YOUR_SECRET_KEY')
```

If different credentials should be used to load this deployment than those
already defined in your shell environment, the new credentials can be specified
as additional parameters to this method call as shown above.

#### Non-default Virtual Private Cloud

When configured as above a predictive service is deployed into a default subnet of your AWS account's default Virtual Private Cloud (VPC). You have the option to deploy a predictive service into a non-default VPC, as long as your subnet has internet access.

To launch a predictive service into a non-default VPC's subnet, you can specify the `subnet_id` parameter in your configuration:

```python
ec2 = graphlab.deploy.Ec2Config(subnet_id='YOUR_SUBNET_ID')
```

This creates a new security group with a group Name **Dato_Predictive_Service** in the subnet with the given `subnet_id`. You can also provide the id of an existing security group:

```python
ec2 = graphlab.deploy.Ec2Config(security_group_id='YOUR_SECURITY_GROUP_ID',
                                subnet_id='YOUR_SUBNET_ID')
```

It is possible to specify a security group by name through the parameter `security_group`; if a group with the given name does not exist, it will be created.

Note that if `subnet_id` is not specified and there are more than one subnets in the VPC, the predictive service might be launched into any of the VPC's subnets.
