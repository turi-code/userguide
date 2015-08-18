# Launching Distributed Jobs

A core benefit of executing jobs on compute fabrics like EC2 or Hadoop is the ability to scale out and distribute the work across nodes. In this section, we will demonstrate how to launch a distributed execution through the [``map_job``] API, which executes the same function, in parallel, with multiple arguments.


#### Distributed Execution

A ``map_job`` is nothing more than a [map](https://docs.python.org/2/library/functions.html#map) of a function applied to a list of arguments. The result of a ``map_job`` is a list of results from the execution of the function on each of the arguments.

```python
# A map job is equivalent to the following
results = [my_func(**kwargs) for kwargs in parameter_set]
```

In this section, we will show a simple example of executing the ``map_job`` 
in a distributed environment.

##### EC2

To setup a distributed EC2 environment, you will need one or more host in your
EC2 cluster.

```python
import graphlab as gl

def add(x, y):
    return x + y

ec2config = gl.deploy.Ec2Config()

# Define your EC2 cluster to use 3 hosts (instances)
ec2 = gl.deploy.ec2_cluster.create(name='add_ec2',
                                   s3_path='s3://add_test',
                                   ec2_config=ec2config,
                                   num_hosts=3)

# Execute a map_job.
job = gl.deploy.map_job.create(add, [{'x': 20, 'y': 20}, 
                                     {'x': 10, 'y': 10}, 
                                     {'x': 5,  'y': 5}],
                               environment=ec2)

# Get a list of results.
print job.get_map_results()
```
```
[40, 20, 10]
```

In the above EC2 job execution, we distribute the three parameter sets in this job to three different hosts. Each host will run the function with its given parameter set.

If any of the executions failed, we can capture it in the job metrics.

```python
# Capture exceptions if the execution failed.
job = gl.deploy.map_job.create(add, [{'x': 20, 'y': 20}, 
                                     {'x': None, 'y': 10}, 
                                     {'x': 5,  'y': 5}],
                               environment=ec2)

# Exception captured in metrics if the execution failed.
metrics = job.get_metrics()

print metrics
```
```
+-----------+-----------+---------------------+-------------------+-----------+
| task_name |   status  |      start_time     |      run_time     | exception |
+-----------+-----------+---------------------+-------------------+-----------+
|  add-0-0  | Completed | 2015-05-07 12:46:53 | 6.60419464111e-05 |    None   |
|  add-0-1  |   Failed  | 2015-05-07 12:46:53 |        None       | TypeError |
|  add-0-2  | Completed | 2015-05-07 12:46:53 | 1.50203704834e-05 |    None   |
+-----------+-----------+---------------------+-------------------+-----------+
+-------------------------------+-------------------------------+
|       exception_message       |      exception_traceback      |
+-------------------------------+-------------------------------+
|              None             |              None             |
| unsupported operand type(s... | Traceback (most recent cal... |
|              None             |              None             |
+-------------------------------+-------------------------------+
[3 rows x 7 columns]
```
```python
# Capture partial results of functions that didn't fail.
print job.get_map_results()
```
```
[40, None, 10]
```
**Note:** In Hadoop ``job.get_error()`` can provide further diagnosis on failed jobs.

You can process the results of the ``map_job`` using a combiner function. The combiner is used as follows.

```python
def add_combiner(**kwargs):
    return sum(kwargs.values())

# Call map, and then combine all the results using the add_combiner.
job = gl.deploy.map_job.create(add, [{'x': 20, 'y': 20}, 
                                     {'x': 10, 'y': 10}, 
                                     {'x': 5,  'y': 5}], 
                               environment=ec2,
                               combiner_function=add_combiner)

# get_map_results() would still return [40, 20, 10]
# use get_results() to get result from combiner
print job.get_results()
```
```
70
```


##### Hadoop

For distributed job execution on Hadoop, you will also need more than one container
in your execution environment.

```python
import graphlab as gl

def add(x, y):
    return x + y

def add_combiner(**kwargs):
    return sum(kwargs.values())

# Define your Hadoop cluster to use 3 containers
dd-deployment = 'hdfs://our.cluster.com:8040/user/name/dato-dist-folder'

hadoop = gl.deploy.hadoop_cluster.create(name='add_hadoop',
                                         dato_dist_path=dd-deployment,
                                         hadoop_conf_dir=,'~/yarn-conf',
                                         num_containers=3)
  
# Execute a map_job.
job = gl.deploy.map_job.create(add, [{'x': 20, 'y': 20}, 
                                     {'x': 10, 'y': 10}, 
                                     {'x': 5,  'y': 5}],
                               environment=hadoop,
                               combiner_function=add_combiner)

# get map results
print job.get_map_results()
```
```
[40, 20, 10]
```

```python
# get combiner result
job.get_results()
```
```
70
```
In the above Hadoop job execution, we distribute the three parameter sets in this job to three different containers. Each container will run the function with its given parameter set. In the end, we combine the results with a combiner function.
