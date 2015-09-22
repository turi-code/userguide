# Distributed Machine Learning 

Dato distributed also allows you to run distributed machine learning jobs on
compute fabrics like EC2 or Hadoop. This gives you the ability to scale out and
distribute the work across multiple machines. In this section, we will
demonstrate how to run distributed machine learning jobs. 


##### EC2

To setup a distributed EC2 environment, you will need one or more host in your
EC2 cluster.

```python
import graphlab as gl

ec2config = gl.deploy.Ec2Config()

# Define your EC2 cluster to use 3 hosts (instances)
cluster_path = 's3://my_cluster'
ec2 = gl.deploy.ec2_cluster.create(name='my-first-ec2-cluster',
                                   s3_path=cluster_path,
                                   ec2_config=ec2config,
                                   num_hosts=3)
```

Once the cluster metadata is set, you can connect to this cluster and run a
machine learning job. **Note** that the cluster creation does not launch the
cluster, it configures the cluster and makes sure it is ready to launch. Now,
we can run a distributed machine learning job as follows:

```python
# Get the cluster handle.
c = gl.deploy.environments['my-first-ec2-cluster']

# Connect to the cluster.
gl.set_execution_context(c)

# Load data
dataset = 'http://s3.amazonaws.com/gl-testdata/xgboost/mushroom.csv'
sf = gl.SFrame('%s/%s' % (HDFS_DATASET_HOME, dataset))


# Train model.
model = gl.linear_regression.create(sf, 'target', features='features')

# Clear the cluster.
gl.clear_execution_context(c)
```

In the above EC2 job execution, we distribute the execution of the linear
regression model in three different hosts. If any of the executions failed, we
will return the exception.

##### Hadoop

For distributed job execution on Hadoop, you will also need more than one
container in your execution environment. This can be done as follows.

```python
import graphlab as gl

c = gl.deploy.hadoop_cluster.create('my-first-hadoop-cluster',
       'hdfs://path-to-dato-distributed-installation')
```

Once the cluster metadata is set, you can connect to this cluster and run a
machine learning job. 

```python
# Get the cluster handle.
c = gl.deploy.environments['my-first-hadoop-cluster']

# Connect to the cluster.
gl.set_execution_context(c)

# Load data
sf = gl.SFrame('hdfs://DATASET_PATH')

# Train model.
model = gl.linear_regression.create(sf, 'target', features='features')

# Clear the cluster.
gl.clear_execution_context(c)
```

In the above Hadoop job execution, we distribute the execution of the linear
regression model using as many containers as set by the dato distributed
installation. If any of the executions failed, we will return the exception.
