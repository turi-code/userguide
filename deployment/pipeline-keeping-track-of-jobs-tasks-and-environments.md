# Session Management

GraphLab Create manages local references to your Jobs and Environments in a local session.  These local references can be persisted to disk, allowing you to resume and modify your work at a later time. Put another way, GraphLab Create makes it easy to recall previous work, maintaining a history and a workbench that facilitate incremental modifications over time.

Because these objects are persisted they must have unique names, so the session can keep track of them.

##### List

To see a listing of all jobs:

```python
gl.deploy.jobs
```
```
Job(s):
+-------+-------------+-------------------------------+---------------------------+
| Index | Environment |              Name             |       Creation date       |
+-------+-------------+-------------------------------+---------------------------+
|   0   | dato-kaggle | my_workflow-May-08-2015-14... | 2015-05-08 14:36:20+00:00 |
|   1   |    async    | my_workflow-May-08-2015-14... | 2015-05-08 14:25:05+00:00 |
|   2   |    async    | my_workflow-May-08-2015-13... | 2015-05-08 13:41:30+00:00 |
|   3   |    async    |    add-May-07-2015-12-46-51   | 2015-05-07 12:46:51+00:00 |
|   4   |    async    |    add-May-07-2015-12-46-16   | 2015-05-07 12:46:16+00:00 |
|   5   | dato-kaggle |    add-May-07-2015-11-53-10   | 2015-05-07 11:56:14+00:00 |
|   6   |    async    |    add-May-07-2015-11-13-38   | 2015-05-07 11:13:38+00:00 |
|   7   |    async    |    add-May-07-2015-11-13-06   | 2015-05-07 11:13:07+00:00 |
|   8   | dato-kaggle |          sleep_long3          | 2015-05-04 10:55:42+00:00 |
+-------+-------------+-------------------------------+---------------------------+
[9 rows x 4 columns]
```

To visualize all Jobs, run:
```no-highlight
gl.deploy.jobs.show()
```
[<img alt="Jobs dashboard" src="images/jobs-dashboard.png" style="max-width: 100%;"/>](images/jobs-dashboard.png)

This will show the overall dashboard for all Jobs known in the workbench.

To see all Environments known in the workbench.

```python
gl.deploy.environments
```
```
Environment(s): 
+-------+-------------+------------+------------------+---------------------------+
| Index |     Name    |    Type    | Unsaved changes? |       Creation date       |
+-------+-------------+------------+------------------+---------------------------+
|   0   | dato-kaggle |    EC2     |        No        | 2015-05-07 11:52:34+00:00 |
|   1   |    async    | LocalAsync |        No        | 2015-05-07 11:13:07+00:00 |
+-------+-------------+------------+------------------+---------------------------+
[2 rows x 5 columns]
```

For programmatic access:

```python
gl.deploy.jobs.list() # returns an SFrame of jobs
gl.deploy.predictive_services.list() # returns an SFrame of predictive services
gl.deploy.environments.list() # returns an SFrame of environments
```

##### Load

We can use either the index of the job in the session, or the name, to load a persisted job in the current session.

```python
print gl.deploy.jobs
```
```
+-------+-------------+-------------------------------+---------------------------+
| Index | Environment |              Name             |       Creation date       |
+-------+-------------+-------------------------------+---------------------------+
|   0   | dato-kaggle | my_workflow-May-08-2015-14... | 2015-05-08 14:36:20+00:00 |
|   1   |    async    | my_workflow-May-08-2015-14... | 2015-05-08 14:25:05+00:00 |
|   2   |    async    | my_workflow-May-08-2015-13... | 2015-05-08 13:41:30+00:00 |
|   3   |    async    |    add-May-07-2015-12-46-51   | 2015-05-07 12:46:51+00:00 |
|   4   |    async    |    add-May-07-2015-12-46-16   | 2015-05-07 12:46:16+00:00 |
|   5   | dato-kaggle |    add-May-07-2015-11-53-10   | 2015-05-07 11:56:14+00:00 |
|   6   |    async    |    add-May-07-2015-11-13-38   | 2015-05-07 11:13:38+00:00 |
|   7   |    async    |    add-May-07-2015-11-13-06   | 2015-05-07 11:13:07+00:00 |
|   8   | dato-kaggle |          sleep_long3          | 2015-05-04 10:55:42+00:00 |
+-------+-------------+-------------------------------+---------------------------+
[9 rows x 4 columns]
```

To load the first job at index "0":
```python
job = gl.deploy.jobs[0]
```

To load the job named "sleep_long3":
```python
job = gl.deploy.jobs['sleep_long3']
```


##### Delete

We can also use the index or the name to delete a job from the current session.

```python
del gl.deploy.jobs[0]
# or
gl.deploy.jobs.delete[0]
```

```python
del gl.deploy.jobs['sleep_long3']
# or
gl.deploy.jobs.delete['sleep_long3']
```

