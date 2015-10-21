# Clusters in EC2 and Hadoop

GraphLab create allows for the execution of jobs on the Dato Distributed platform, which runs on EC2 as well as Hadoop YARN clusters. While Dato distributed is set up automatically on EC2 on-demand, it needs to be deployed on Hadoop.

In this section, we will walk through the concept of a **Cluster** in the GraphLab Create API and how it can be used to execute jobs remotely, either in Hadoop or in EC2.

#### The Cluster

The GraphLab Create API includes the notion of a **Cluster**, which serves as a logical environment to host the _distributed_ execution of jobs (as opposed to the local host environment, which can be [asynchonous](https://dato.com/learn/userguide/deployment/pipeline-launch.html), but not distributed). GraphLab Create clusters can be created either in EC2 or on Hadoop YARN; while they can equally be used as environments for running jobs, their behavior is slightly different; hence they are represented by two different types: [`graphlab.deploy.Ec2Cluster`]() and [`graphlab.deploy.HadoopCluster`](). After creating a cluster object once, it can be retrieved at a later time to continue working with an existing cluster. Below we will elaborate on the specifics of each environment.

##### Creating a Cluster in EC2

In EC2 a cluster is created in two steps: first, a [`graphlab.deploy.Ec2Config`](https://dato.com/products/create/docs/generated/graphlab.deploy.Ec2Config.html) object is created, describing the cluster and how to access AWS. The cluster description includes the properties for EC2 instances that are going to be used to form the cluster, like instance type and region, the security group name, etc. Second, the cluster is launched by calling [`ec2_cluster.create`](https://dato.com/products/create/docs/generated/graphlab.deploy.ec2_cluster.create.html). When creating your EC2 cluster, you must also specify a name, and an S3 path where the EC2 cluster maintains its state and logs.

```python
import graphlab as gl

# Define your EC2 environment. In this example we use the default settings.
ec2config = gl.deploy.Ec2Config()

ec2 = gl.deploy.ec2_cluster.create(name='dato-kaggle',
                                   s3_path='s3://gl-dato-kaggle',
                                   ec2_config=ec2config,
                                   num_hosts=4)
```

At this point you can use the object `ec2` for remote and distributed job execution.

It is important to note that the [`create`](https://dato.com/products/create/docs/generated/graphlab.deploy.ec2_cluster.create.html) call will already start the hosts in EC2, so costs will be incurred at that point. They will be shutdown after an idle period, which is 30 minutes by default or set as parameter (in seconds) in the create method. Setting the timeout to a negative value will cause the cluster to run indefinitely or until explicitly stopped. For example, if you wanted to extend the timeout to one hour you would create the cluster like so:

```python
ec2 = gl.deploy.ec2_cluster.create(name='dato-kaggle',
                                   s3_path='s3://gl-dato-kaggle',
                                   ec2_config=ec2config,
                                   num_hosts=4,
                                   idle_shutdown_timeout=3600)
```

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

##### Creating a Cluster in Hadoop
In order to work with a Hadoop cluster, Dato Distributed needs to be set up on the Hadoop nodes. For instructions on how to obtain and install DD please refer to the [Hadoop setup chapter](https://dato.com/learn/userguide/deployment/pipeline-hadoop-setup.html)

When you installed Dato Distributed your provided an installation path that you need to refer to when creating a `HadoopCluster` Object through [`graphlab.deploy.hadoop_cluster.create`](https://dato.com/products/create/docs/generated/graphlab.deploy.hadoop_cluster.create.html) object. Essentially this path is your client-side handle to the Hadoop cluster within the GraphLab Create API. Moreover, when creating your Hadoop cluster object, you must specify a name, which you can later use to retrieve an existing cluster form your workbench. You can also specify hadoop_conf_dir, which is the directory of your custom Hadoop configuration path. If `hadoop_conf_dir` is not specified, GraphLab Create uses your default Hadoop configuration path on your machine.

```python
import graphlab as gl

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

##### Loading an EC2 Cluster
Unlike a `HadoopCluster`, once an `Ec2Cluster` is created, it is physically running in AWS. This cluster can be loaded at a later time and/or a separate Python session:

```python
c = gl.deploy.ec2_cluster.load('s3://gl-dato-kaggle')
```

#### Executing Jobs in a Cluster
In order to execute a job in a cluster, you pass the cluster object to the [`graphlab.deploy.job.create`](https://dato.com/products/create/docs/generated/graphlab.deploy.job.create.html) API, independently of whether it is a Hadoop or an EC2 cluster. While the job is running, the client machine can be shutdown and the job will continue to run. In the event that the client process terminates, you can reload the job and check its status.

```python
def add(x, y):
    return x + y

# c has been created or loaded before
job = gl.deploy.job.create(add, environment=c, x=1, y=2)
```

Note that the parameter names in the kwargs of the `job.create` call need to match the parameter names in the definition of your method (`x` and `y` in this example).

The syntax for getting job status, metrics, and results are the same for all jobs. You can invoke [`job.get_status`](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_status.html)
to get the status, [`job.get_metrics`](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_metrics.html) to get job metrics, and [`job.get_results`](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_results.html) to get job results.

For example, to get the results:
```python
print job.get_results()
```
```
2
```

Jobs can be cancelled using [`job.cancel`](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.cancel.html); note that for an EC2 cluster this does not stop the EC2 hosts.

```python
job.cancel()
```

For Hadoop-specific job failures (for instance, preemption), you can use the [`job.get_error`](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_error.html) API.

It is possible that a job succeeds, but tasks inside a job fail. To debug this, use the [`job.get_metrics`](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_metrics.html) API.

** EC2 Notes **

- Once the execution is complete, the idle timeout period will start, after which the EC2 instance(s) started will be terminated. Launching another job will reset the idle timeout period.
- A set of packages to be installed in addition to graphlab and its dependencies can be specified as a list of strings in the `create` call.
- Execution logs will be maintained in S3 (using the `s3_path` parameter in the cluster creation call).

** Hadoop Notes **

- Job status is also available through normal Hadoop monitoring, as GraphLab Create submits jobs using a GraphLab YARN application. Logs for executions are available using Yarn logs.
- The location of the logs is available in the job summary, which can be viewed by calling `print job`. You can also use [`job.get_log_file_path`](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_log_file_path.html) to get the location of the logs.
- If you are using Hadoop in Cloudera HA mode, you need to include conf.cloudera.hdfs in your CLASSPATH environment variable.
