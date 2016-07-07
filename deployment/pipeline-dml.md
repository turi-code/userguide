<script src="../turi/js/recview.js"></script>
# Distributed Machine Learning

*Note: The distributed machine learning API has been through significant changes in 2.0 and is not backwards compatible*

In the previous chapter we showed how to run jobs in a Turi Distributed cluster.
While, Job (or Map Job) give you the benefit of executing arbitrary python code in cluster in a map reduce fashion,
it does not support distributing the training of machine learning models.

For a set of GraphLab Create toolkits we have enabled distributed model training in a hadoop cluster.
We call this _Distributed Machine Learning_ or _DML_. In this section, we will demonstrate how to run distributed machine learning tasks.

The toolkits currently supported to run in a distributed execution environment are:
* [Linear regression](https://turi.com/learn/userguide/supervised-learning/linear-regression.html)
* [Logistic classifier](https://turi.com/learn/userguide/supervised-learning/logistic-regression.html)
* [SVM classifier](https://turi.com/learn/userguide/supervised-learning/svm.html)
* [Boosted trees classifier](https://turi.com/learn/userguide/supervised-learning/boosted_trees_classifier.html)
* [Boosted trees regression](https://turi.com/learn/userguide/supervised-learning/boosted_trees_regression.html)
* [Random forest classifier](https://turi.com/learn/userguide/supervised-learning/random_forest_classifier.html)
* [Random forest regression](https://turi.com/learn/userguide/supervised-learning/random_forest_regression.html)
* [Pagerank](https://turi.com/products/create/docs/generated/graphlab.pagerank.create.html)
* [Label propagation](https://turi.com/products/create/docs/generated/graphlab.label_propagation.create.html)

Let us look at an example which trains a boosted trees classifier model:

```python
import graphlab as gl

# Load data
dataset = 'https://static.turi.com/datasets/xgboost/mushroom.csv'
sf = gl.SFrame(dataset)

# Train model
model = gl.boosted_trees_classifier.create(sf, target='label', max_iterations=12)
```
#### Hadoop

For distributed machine learning on Hadoop, you will need a cluster object based on a Turi Distributed installation in your Hadoop cluster:

```python
>>> c = gl.deploy.hadoop_cluster.create('my-first-hadoop-cluster',
                                        'hdfs://path-to-turi-distributed-installation',
                                        num_containers=4,
                                        container_size=4096,
                                        num_vcores=4)
>>> c.hdfs_tmp_dir = hdfs:///tmp
>>> print c
Hadoop Cluster:
        Name:                    : my-cluster
        Cluster path             : hdfs://path-to-turi-distributed-installation

        Number of Containers:    : 4
        Container Size (in mb)   : 4096
        Container num of vcores  : 4
        Port range               : 9100 - 9200
        Node temp directory      : /tmp
        HDFS temp directory      : hdfs:///tmp

        Additional packages      : None
```

For more information about how to set up a cluster in Hadoop see the chapter on [clusters](pipeline-ec2-hadoop.md).
The following cluster parameters are critical for successfully running distributed model training:

- `container_size` : Memory limit in MB for each worker. Workers which exceed the memory limit may get killed and result in job failure.
- `Node temp directory` : The local temporary directory to store cache and intermediate files. Make sure this directory has
  enough disk space.
- `HDFS temp directory` : The hdfs temporary directory to store cache and intermediate files. Make sure this directory has
  enough disk space and is writable by hadoop user `yarn`.

Once the cluster is created you can use it as an execution environment for a machine learning task:

```python
sf = gl.SFrame('hdfs://DATASET_PATH')

job = gl.distributed.boosted_trees_classifier.submit_training_job(env=c, dataset=sf, target='label')
```

The above code submits to the cluster a distributed boosted trees classifier training job which is automatically distributed
among the number of containers. The return object is a handle to the submitted job. 

```python
>>> print job.get_state()
STATE.COMPLETED
```
```
>>> print job.get_progress()
PROGRESS: Number of workers: 4
PROGRESS: CPUs per worker : 4
PROGRESS: Memory limit: 3276.8MB
PROGRESS: Local cache file locations: /tmp
PROGRESS: HDFS access: yes
PROGRESS: HDFS cache file locations: hdfs:///tmp
PROGRESS: Max fileio cache capacity: 819.2MB
PROGRESS: Boosted trees classifier:
PROGRESS: --------------------------------------------------------
PROGRESS: Number of examples          : 8124
PROGRESS: Number of classes           : 2
PROGRESS: Number of feature columns   : 22
PROGRESS: Number of unpacked features : 22
PROGRESS: +-----------+--------------+-------------------+-------------------+
PROGRESS: | Iteration | Elapsed Time | Training-accuracy | Training-log_loss |
PROGRESS: +-----------+--------------+-------------------+-------------------+
PROGRESS: | 1         | 0.124934     | 0.999631          | 0.438946          |
PROGRESS: | 2         | 0.245594     | 0.999631          | 0.298226          |
PROGRESS: | 3         | 0.355051     | 0.999631          | 0.209494          |
PROGRESS: | 4         | 0.489932     | 0.999631          | 0.150114          |
PROGRESS: | 5         | 0.605267     | 0.999631          | 0.109027          |
PROGRESS: Checkpointing to hdfs:///turi_distributed/jobs/dml_job_88a92020-e6d9-42d3-ade3-058e278dbf1e/checkpoints/model_checkpoint_5
PROGRESS: | 6         | 1.255561     | 0.999631          | 0.080002          |
PROGRESS: | 10        | 1.665121     | 0.999631          | 0.024130          |
PROGRESS: Checkpointing to hdfs:///turi_distributed/jobs/dml_job_88a92020-e6d9-42d3-ade3-058e278dbf1e/checkpoints/model_checkpoint_10
PROGRESS: +-----------+--------------+-------------------+-------------------+
```
```python
# wait for job to complete
import time
while job.get_state() != job.STATE.COMPLETED:
    time.sleep(1)
    print job.get_progress()
    print job.get_state()

# check the final state 
assert job.get_final_state() == job.FINAL_STATE.SUCCESS:

# fetch the trained model, this code will block until job.get_state() is COMPLETED.
model = job.get_results()
model.save('./bst_mushroom')
```

#### Data locality

Data locality is critical to efficient distributed model training with massive data. 
In the example above, because the SFrame is constructed from HDFS source, there will be no copy
of data between HDFS and the local machine that submits the training job.
The model training process will be executed natively in the cluster by reading from HDFS.

On the other hand, if the SFrame is constructed locally, or read from S3, the SFrame will 
be automatically copied into HDFS. Depending on the size of the data and network speed, this process
can take from minutes to hours. Hence, it is recommended to always save your training or validation SFrame
to HDFS before submitting the training job.

#### Model Checkpointing (Available for Boosted Trees and Random Forest models)

Jobs running in distributed environment like Yarn may be preempted when the load of the cluster is high. Therefore,
it is critical to have some recovery mechanism for models that could take very long time to train. 

For training a Boosted Trees or Random Forest model, the API supports checkpointing the model 
every K (default 5) iterations to a file system (local, HDFS or S3) location. In case of interruption,
you can resume the training procedure by pointing to the checkpointed model. This feature is enabled by default
for distributed boosted trees and random forest model. The training job automatically creates a checkpoint
every 5 iterations at the working directory.

```python
>>> print job.last_checkpoint()
hdfs://turi_distributed/jobs/dml_job_1324f729-250f-497c-9f28-4c06ff5daf71/checkpoints/model_checkpoint_10
```

```python
# Resume training from last checkpoint at iteration 10 
job2 = gl.distributed.boosted_trees_classifier.submit_training_job(env=c, dataset=sf, target='label', max_iterations=12,
                                                                   resume_from_checkpoint=job.last_checkpoint())
```

You can also specify the location and frequency of checkpointing by using the parameter `model_checkpoint_path` and
`model_checkpoint_interval` in `submit_training_job`. For example:
```python
# Change the default checkpoint frequency and location 
job = gl.distributed.boosted_trees_classifier.submit_training_job(env=c, dataset=sf, target='label', max_iterations=12,
                                                                  model_checkpoint_interval=10,
                                                                  model_checkpoint_path='hdfs:///tmp/job1/model_checkpoints')
```
*Note: The training job is executed as hadoop user `yarn` in the cluster. When specifying model_checkpoint_path, please
make sure the directory is writable by hadoop user `yarn`.*

#### Debugging Job Failure
The final job state could be one of the followings: `FINAL_STATE.SUCCESS`, `FINAL_STATE.KILLED`, `FINAL_STATE.FAILURE`.
When the job does not complete successfully, the following sequence may be executed to debug the failure.
```python
>>> print job.get_final_state()
'FINAL_STATE.FAILURE'
>>> print job.summary()
Container list: ['container_e44_1467403925081_0044_01_000001', 'container_e44_1467403925081_0044_01_000002', 'container_e44_1467403925081_0044_01_000003', 'container_e44_1467403925081_0044_01_000004']

container_e44_1467403925081_0044_01_000001:
  Application Master
container_e44_1467403925081_0044_01_000002:
  Report not found in log.
container_e44_1467403925081_0044_01_000003:
  Report not found in log.
container_e44_1467403925081_0044_01_000004:
  Container terminated due to exceeding allocated physical memory. (-104)
```
```python
# Get the location of yarn logs, you can open the log file in your local editor.
>>> print job.get_log_file_path()
/tmp/tmpdcl2_V/tmp_log.stdout
```
