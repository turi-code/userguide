# Asynchronous Job Executions

This section describes how to execute a job asynchronously, but on the same machine. Consequently this does not count as a remote or distributed execution, and hence does not depend on Dato Distributed. For the sake of completeness it is still included in this chapter.

Let's start with the "Hello World" of deployment examples: adding two numbers. In the following code, we will do the following:

- Write a simple python function to add two numbers.
- Execute the function asynchronously on your local machine.

First, let's create the Python function. Then pass the name and the function keyword arguments that you want to run with into [job.create()](https://dato.com/products/create/docs/generated/graphlab.deploy.job.create.html).

```python
import graphlab as gl

def add(x, y):
    return x + y

# Execute the job.
job = gl.deploy.job.create(add, x=1, y=1)
```

Note that the parameter names in the kwargs of the `job.create` call need to match the parameter names in the definition of your method (`x` and `y` in this example).

To get the results of this execution, simply call [job.get_results()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_results.html).

```python
print job.get_results()
```
```
2
```

To get the status of this execution, simply call [job.get_status()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_status.html)

```python
print job.get_status()
```
```
Completed
```

If the execution of this function throws an exception, we can get the exception
type, message, and traceback from the job metrics. See [job.get_metrics()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.get_metrics.html).

```python
# Will fail since y is None
job = gl.deploy.job.create(add, x=1, y=None)
metrics = job.get_metrics()

print metrics
```
```
+-----------+--------+---------------------+----------+-----------+
| task_name | status |      start_time     | run_time | exception |
+-----------+--------+---------------------+----------+-----------+
|    add    | Failed | 2015-05-07 11:13:40 |   None   | TypeError |
+-----------+--------+---------------------+----------+-----------+
+-------------------------------+-------------------------------+
|       exception_message       |      exception_traceback      |
+-------------------------------+-------------------------------+
| unsupported operand type(s... | Traceback (most recent cal... |
+-------------------------------+-------------------------------+
[1 rows x 7 columns]
```

```python
# get exception type and exception message
print metrics[0]['exception'] + ": " + metrics[0]['exception_message']
```
```
TypeError: unsupported operand type(s) for +: 'int' and 'NoneType'
```

To visualize this job execution, use [job.show()](https://dato.com/products/create/docs/generated/graphlab.deploy.Job.show.html)

```python
job.show()
```

That should give you a sense of the types of tasks that can be accomplished
with this API. In the following more practical example, we build a recommender
and then execute it remotely.
