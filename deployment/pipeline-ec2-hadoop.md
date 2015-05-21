### Launching job executions on EC2 and Hadoop

In this section, we will do the following:

- Execute a function in Amazon's EC2 environment.
- Execute a function in your Hadoop Cluster.

#### Executing Jobs in EC2

In the example below, we will demonstrate how to trigger and launch a job on an
[EC2](http://aws.amazon.com/ec2/) instance. When EC2 is specified as the
execution environment, the framework will launch instance(s) of the type
specified in the region specified, before ultimately starting the job on the
new instances. While the job is running, the client machine can be shutdown and
the job will continue. In the event that the client process terminates, you can
reload the job and check its status.

When defining your EC2 environment, you must specify a name, and a S3 path where
the EC2 job execution can write the logs and results. 

```python
import graphlab as gl

def add(x, y):
    return x + y

# Define your EC2 environment.
ec2 = gl.deploy.environment.EC2('dato-kaggle', s3_folder_path='s3://gl-dato-kaggle')

# Execute the job.
job = gl.deploy.job.create(add, x = 1, y = 1, environment = ec2)
```

The syntax for getting job **status**, **metrics**, and **results** are the same
for all jobs. For this EC2 job, you can invoke [job.get_status()](https://dato.com
/products/create/docs/generated/graphlab.deploy.Job.get_status.html)
to get the status, [job.get_metrics()](https://dato.com/products/create/docs
/generated/graphlab.deploy.Job.get_metrics.html) to get job metrics, and 
[job.get_results()](https://dato.com/products/create/docs/generated/
graphlab.deploy.Job.get_results.html) to get job results. 

For example, to get the results:
```python
print job.get_results()
```
```
2
```

Jobs can be cancelled, which ensures that the EC2 instance will be terminated.
```python
job.cancel()
```


** Notes **

- Once the execution is complete, the EC2 instance(s) started will be terminated.
- Execution logs will be maintained in S3 (using the `s3_folder_path`
  attribute on the EC2 environment). 

#### Executing Jobs in Hadoop

GraphLab Create is currently certified on two Hadoop distributions:

- [HortonWorks 2.2](http://hortonworks.com/blog/announcing-hdp-2-2/)
- [Cloudera Hadoop YARN clusters (CDH5)](http://www.cloudera.com/content/cloudera/en/products-and-services/cdh.html).

Before running a job on Hadoop, we need to setup GraphLab Create on the Hadoop
nodes. Choose **one** of the two ways to setup GraphLab Create:

1. Natively install GraphLab Create in all nodes as default python package, and
   ignore the ``gl_source`` field when constructing Hadoop Environment object.

2. Do not install GraphLab Create on any of the Hadoop nodes. Instead, manually
   download all the required packages for GraphLab Create (using ``pip install
   --download graphlab-create``) and then store all downloaded files in a HDFS path.
   When creating your Hadoop environment object, use the ``gl_source`` field to
   point to that HDFS path that contains all the downloaded required packages.
   With this way, GraphLab Create is installed in a virtual environment on each
   Hadoop node before the job execution, and will be deleted when the job execution
   finishes and the virtual environment is removed.

In the example below, we will demostrate how to launch a job in Hadoop assuming
that GraphLab Create is already installed natively on your hadoop nodes.

When defining your Hadoop environment, you must specify a name to your environment.
You can also specify config_dir, which is the directory of your custom hadoop
configuration path. If config_dir is not specified, GraphLab Create would use your
default hadoop configuration path on your machine.

```python
import graphlab as gl

def add(x, y):
    return x + y

# Define your Hadoop environment
hd = gl.deploy.environment.Hadoop('hd', config_dir='<path-to-your-hadoop-config-dir>')

# Execute the job.
job = gl.deploy.job.create(add, x = 1, y = 1, environment = hd)
print job.get_results()
```
```
2
```

Also, you can invoke [job.get_status()](https://dato.com/products/create/docs/
generated/graphlab.deploy.Job.get_status.html) to get the **status**, 
[job.get_metrics()](https://dato.com/products/create/docs/generated/
graphlab.deploy.Job.get_metrics.html) to get job **metrics**, and 
[job.get_results()](https://dato.com/products/create/docs/generated/
graphlab.deploy.Job.get_results.html) to get job **results**. 

Just like the Jobs running on Local and EC2 environments, Hadoop jobs can be canceled using
[job.cancel()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.cancel.html)

** Notes **

- Job status is also available through normal Hadoop monitoring, as
  GraphLab Create submits jobs using a GraphLab YARN application. Logs for
  executions are available using Yarn logs. 
- The location of the logs is available in the job summary, which can be viewed 
  by calling `print job`. You can also use [job.get_log_file_path()](https://dato.com/
  products/create/docs/generated/graphlab.deploy.Job.get_log_file_path.html) to get the location of the logs.


