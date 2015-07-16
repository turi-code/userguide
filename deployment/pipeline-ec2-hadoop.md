# Launching Job Executions on EC2 and Hadoop

GraphLab create allows for the execution of jobs on the Dato Distributed platform, which runs on EC2 as well as Hadoop YARN clusters. While Dato distributed is set up automatically on EC2 on-demand, it needs to be deployed on Hadoop.

In this section, we will walk through the following:

- Execute a function in Amazon's EC2 environment.
- Execute a function in your Hadoop Cluster.

#### The Cluster

The GraphLab Create API includes the notion of a **cluster**, which serves as a logical environment to host the _distributed_ execution of jobs (as opposed to the local host environment). GraphLab Create clusters can be created either in EC2 or on Hadoop YARN; while they can equally be used as environments for running jobs, their behavior is slightly different; hence they are represented by two different types: [graphlab.deploy.Ec2Cluster]() and [graphlab.deploy.HadoopCluster](). Below we will elaborate on the specifics of each environment.

#### Executing Jobs in EC2

In the example below, we will demonstrate how to trigger and launch a job on an [EC2](http://aws.amazon.com/ec2/) instance. When an EC2 cluster is specified as the execution environment, the framework will start the job on the
new instances. While the job is running, the client machine can be shutdown and the job will continue. In the event that the client process terminates, you can reload the job and check its status.

An EC2 cluster is created in two steps: first, a configuration object is created, describing the cluster and how to access AWS. The cluster description includes the properties for EC2 instances that are going to be used to form the cluster, like instance type and region, the security group name, etc. Second, the cluster is launched.
When configuring your EC2 cluster, you must also specify a name, and an S3 path where the EC2 cluster maintains its state and logs. 

```python
import graphlab as gl

def add(x, y):
    return x + y

# Define your EC2 environment. In this example we use the default settings.
ec2config = gl.deploy.Ec2Config()

ec2 = gl.deploy.ec2_cluster.create(name='dato-kaggle',
                                   s3_path='s3://gl-dato-kaggle',
                                   ec2_config=ec2config,
                                   num_hosts=4)

# Execute the job.
job = gl.deploy.job.create(add, environment=ec2, x=1, y=2)
```

It is important to note that the [graphlab.deploy.ec2_cluster.create()]() call will already start the hosts in EC2, so costs will be incurred at that point. They will be shutdown after an idle period, which is 10 minutes by default or set as parameter in the create method. Setting the timeout to a negative value will cause the cluster
to run indefinitely or until explicitly stopped.

You can retrieve the properties of a cluster by printing the cluster object:
```python
print ec2
```
```
S3 State Path: s3://gl-dato-kaggle
EC2 Config   : [instance_type: m3.xlarge, region: us-west-2, aws_access_key: ABCDEFG]
Num Hosts    : 4
Status       : Running
```

The syntax for getting job status, metrics, and results are the same for all jobs. For this EC2 job, you can invoke [job.get_status()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_status.html)
to get the status, [job.get_metrics()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_metrics.html) to get job metrics, and [job.get_results()](https://dato.com/products/create/docs/generated/
graphlab.deploy.Job.get_results.html) to get job results. 

For example, to get the results:
```python
print job.get_results()
```
```
2
```

Jobs can be cancelled; note that this does not stop the EC2 hosts.
```python
job.cancel()
```


** Notes **

- Once the execution is complete, the idle timeout period will start, after which the EC2 instance(s) started will be terminated. Launching another stop will reset the idle timeout period.
- A set of packages to be installed in addition to graphlab and its dependencies can be specified as a list of strings in the `create()` call.
- Execution logs will be maintained in S3 (using the `s3_path` parameter in the cluster creation call). 

#### Executing Jobs in Hadoop

Dato Distributed is currently certified on two Hadoop distributions:

- [HortonWorks 2.2](http://hortonworks.com/blog/announcing-hdp-2-2/)
- [Cloudera Hadoop YARN clusters (CDH5)](http://www.cloudera.com/content/cloudera/en/products-and-services/cdh.html).

Before running a job on Hadoop, Dato Distributed needs to be set up on the Hadoop nodes. To this end, we provide a setup script that deploys Dato Distributed binaries to HDFS to make them available for subsequent distributed execution.

After downloading and unpacking the Dato Distributed package, execute the `setup_dato-distributed.sh` shell script. The script requires the specification of an HDFS path which will contain the GraphLab Create packages and configurations. Subequently, this path identifies the Dato Distributed deployment and is provided to the `hadoop_cluster.create()` function.

When creating your Hadoop cluster object, you must specify a name, which you can later use to retrieve an existing cluster form your workbench. You can also specify hadoop_conf_dir, which is the directory of your custom hadoop
configuration path. If hadoop_conf_dir is not specified, GraphLab Create uses your default hadoop configuration path on your machine.

```python
import graphlab as gl

def add(x, y):
    return x + y

# Define your Hadoop environment
dd-deployment = 'hdfs://our.cluster.com:8040/user/name/dato-dist-folder'

hd = gl.deploy.hadoop_cluster.create(name='hadoop-cluster',
                                     dato_dist_path=dd-deployment)
```

You can retrieve the properties of a cluster by printing the cluster object:
```python
print hd
```
```
Hadoop Cluster:
	Name:                    : hadoop-cluster
	Cluster path             : hdfs://our.hadoop-cluster.com:8040/user/name/dato-distributed-folder
	Hadoop conf dir          : /Users/name/yarn-conf

	Number of Containers:    : 3
	Container Size (in mb)   : 4096
	Container num of vcores  : 2
	Port range               : 9100 - 9200

	Additional packages      : ['names']
```

(See Section [Dependencies](https://dato.com/learn/userguide/deployment/pipeline-dependencies.html) for more information about additional packages.)

Running a job looks the same as on EC2:
```python
# Execute the job.
job = gl.deploy.job.create(add, environment=hd, x=1, y=2)

print job.get_results()
```
```
2
```

Also, you can invoke [job.get_status()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_status.html) to get the status, [job.get_metrics()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_metrics.html) to get job metrics, and [job.get_results()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_results.html) to get job results. 

For Hadoop-specific errors, you can use the [job.get_error()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_error.html) API.

Just like jobs running on Local and EC2 environments, Hadoop jobs can be canceled using
[job.cancel()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.cancel.html)

** Notes **

- Job status is also available through normal Hadoop monitoring, as GraphLab Create submits jobs using a GraphLab YARN application. Logs for executions are available using Yarn logs. 
- The location of the logs is available in the job summary, which can be viewed by calling `print job`. You can also use [job.get_log_file_path()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_log_file_path.html) to get the location of the logs.
