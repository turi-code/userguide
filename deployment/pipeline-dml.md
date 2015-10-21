# Distributed Machine Learning

In the previous chapter we showed how to run jobs in a Dato Distributed cluster. While this gives you the benefit of executing arbitrary python code, you have to specify how the execution should be distributed yourself.

For a set of GraphLab Create toolkits we have done that work for you. Instead of submitting jobs to a remote environment, you can simply switch the current execution environment from the local machine to a cluster in EC2 or Hadoop, and let GraphLab Create distribute the tasks for you. We call this _Distributed Machine Learning_ or _DML_. In this section, we will demonstrate how to run distributed machine learning tasks.

The toolkits currently supported to run in a distributed execution environment are:
* [Linear regression](https://dato.com/learn/userguide/supervised-learning/linear-regression.html)
* [Logistic classifier](https://dato.com/learn/userguide/supervised-learning/logistic-regression.html)
* [SVM classifier](https://dato.com/learn/userguide/supervised-learning/svm.html)
* [Pagerank](https://dato.com/products/create/docs/generated/graphlab.pagerank.create.html)
* [Label propagation](https://dato.com/products/create/docs/generated/graphlab.label_propagation.create.html)

Let's look at an example which trains a linear regression model:

```python
import graphlab as gl

# Load data
dataset = 'http://s3.amazonaws.com/gl-testdata/xgboost/mushroom.csv'
sf = gl.SFrame(dataset)

# Train model
model = gl.logistic_classifier.create(sf, target='label')
```

In the following section we will explain how to execute this task in a cluster.

#### EC2

To setup a distributed environment using AWS, you will need to create an EC2 cluster:

```python
import graphlab as gl

ec2config = gl.deploy.Ec2Config()

# Define your EC2 cluster to use 3 hosts (instances)
c = gl.deploy.ec2_cluster.create(name='my-first-ec2-cluster',
                                 s3_path='s3://my_cluster',
                                 ec2_config=ec2config,
                                 num_hosts=3)
```

For more information about how to set up a cluster in EC2 see the chapter on [clusters](pipeline-ec2-hadoop.md).

Keep in mind that EC2 hosts are launched as soon as you create the cluster object, and keep running until they time out. For more information about the timeout see the chapter on [clusters](pipeline-ec2-hadoop.md).

Once the cluster object is created is set, you can specify it as a distributed execution environment for a machine learning task. Without changing any of the existing code in our example above, we simply surround set and clear the execution environment around it:

```python
# Connect to the cluster
gl.set_distributed_execution_environment(c)

# Load data
dataset = 'http://s3.amazonaws.com/gl-testdata/xgboost/mushroom.csv'
sf = gl.SFrame(dataset)

# Train model
model = gl.logistic_classifier.create(sf, target='label', validation_set=None)

# Clear the cluster
gl.clear_distributed_execution_environment(c)
```

In the above EC2 job execution, we distribute the execution of the linear regression model to three hosts. If any of the executions failed, we will return the exception. The data used to construct the SFrame will _not_ be downloaded to your machine, as it is only used inside the distributed execution environment, which runs remotely. In fact, you could have constructed the SFrame even before setting the execution environment to the cluster object, with the same effect.

Note that for data stored in S3 this behavior depends on the toolkit; in the example above, using a classifier, we have to explicitly turn off validation by specifying `validation_set=None`. If we had not included this parameter, the toolkit would automatically execute a random split of the data locally and hence cause the download of the data set to the client machine.

#### Hadoop

For distributed job execution on Hadoop, you will need a cluster object based on a Dato Distributed installation in your Hadoop cluster:

```python
import graphlab as gl

c = gl.deploy.hadoop_cluster.create('my-first-hadoop-cluster',
       'hdfs://path-to-dato-distributed-installation')
```

For more information about how to set up a cluster in Hadoop see the chapter on [clusters](pipeline-ec2-hadoop.md).

Once the cluster is created you can use it as an execution environment for a machine learning task&mdash;just like in the EC2 example above:

```python
gl.set_distributed_execution_environment(c)

sf = gl.SFrame('hdfs://DATASET_PATH')

model = gl.logistic_classifier.create(sf, target='label')

gl.clear_distributed_execution_environment(c)
```

The data used to construct the SFrame will not be downloaded locally, as it is only used inside the distributed execution environment. Note that for data in HDFS used to create a classifier model this behavior is slightly different from data in S3&mdash;see the explanation in the EC2 section above.
