# End-to-End Example: Remotely Generate Batch Recommendations

In this example, we demonstrate how to implement a recommender and run it as a remote job. The recommender is implemented as three functions:

  1. a data ingestion and cleaning
  2. model training
  3. generate recommendations

First we will show how to execute this job on the local host.

##### Local Execution

```python
def clean_file(path):
    """
    Takes a CSV file passed in as a param and cleans it into an SFrame.
    In particular, it parses and drops None values.
    """
    import graphlab as gl

    sf = gl.SFrame.read_csv(path, delimiter='\t')
    sf = sf.dropna()
    return sf 
```

Next, we train a model from the cleaned data:

```python
def train_model(data):
    """
    Takes an SFrame as input and uses it to train a model,
    setting the train and test sets as outputs along with the trained
    model.
    """
    import graphlab as gl

    model = gl.recommender.create(data, user_id='user',
                                  item_id='movie',
                                  target='rating')
    return model
```

Let's make some recommendations based on the model and store them in an SFrame:

```python
def recommend_items(model, data):
    recommendations = model.recommend(users=data['user'])
    return recommendations
```

Putting the pieces together:

```python
def my_workflow(path):
    # Clean file
    data = clean_file(path)
    
    # Train model.
    model = train_model(data)

    # Make recommendations.
    recommendations = recommend_items(model, data)

    # Return the SFrame of recommendations.
    return recommendations
```

Having defined the function, we can execute it as a job using the
[``job.create()``](https://dato.com/products/create/docs/generated/graphlab.deploy.job.create.html)
function. 

```python
job_local = gl.deploy.job.create(my_workflow, 
        path = 'https://s3.amazonaws.com/dato-datasets/movie_ratings/sample.large')

# get status immediately after creating this job.
job_local.get_status()
```
```
'Running'
```

Note that we omitted the environment parameter, since LocalAsync is the default environment when creating jobs.

##### EC2

Next, let's run our job on EC2. When running on EC2, a cluster defines the EC2 instance to be launched, and is passed to the job for remote execution. After the job is completed and an additional timeout has passed the EC2
instance is terminated. While executing, the job can be monitored with the Job APIs. Execution logs will be stored in S3 according to the location specified in the cluster.

**Note**: In order to run in EC2, remember to update the `aws_access_key`, `aws_secret_key`, and `s3_path` in the code below.

```python
ec2config = gl.deploy.Ec2Config(region='us-west-2',
                                instance_type='m3.xlarge',
                                aws_access_key_id='xxxx',
                                aws_secret_access_key='xxxx')

ec2 = gl.deploy.ec2_cluster.create(name='ec2',
                                   s3_path='s3://bucket/path',
                                   ec2_config=ec2config)

job_ec2 = gl.deploy.job.create(my_workflow,
        environment=ec2,
        path='https://s3.amazonaws.com/dato-datasets/movie_ratings/sample.large')

# get the results
job_ec2.get_results()
```

The result of this job execution is an [``SFrame``](https://dato.com/products/create/docs/generated/graphlab.SFrame.html) containing the recommendations.

```
Columns:
        user    str
        movie   str
        score   float
        rank    int

Rows: 100000000

Data:
+-------------+-------------------------------+---------------+------+
|     user    |             movie             |     score     | rank |
+-------------+-------------------------------+---------------+------+
| Jacob Smith |      Coral Reef Adventure     | 4.28305720509 |  1   |
| Jacob Smith |           The Sting           | 3.82596849622 |  2   |
| Jacob Smith |        Step Into Liquid       | 3.79010831536 |  3   |
| Jacob Smith |           Moonstruck          | 3.76760589303 |  4   |
| Jacob Smith | The Shawshank Redemption: ... | 3.73217236222 |  5   |
| Jacob Smith |            Chocolat           |  3.7275472802 |  6   |
| Jacob Smith | Standing in the Shadows of... | 3.72574400128 |  7   |
| Jacob Smith |         The Green Mile        | 3.70810352982 |  8   |
| Jacob Smith |            Sabrina            | 3.69751512231 |  9   |
| Jacob Smith |         The Quiet Man         |  3.6969838065 |  10  |
+-------------+-------------------------------+---------------+------+
[100000000 rows x 4 columns]
Note: Only the head of the SFrame is printed.
You can use print_rows(num_rows=m, num_columns=n) to print more rows and columns.
```

##### Hadoop

When defining a Hadoop cluster to use as an environment we specify the directory that contains the YARN configuration files.

**Note**: The example assumes that you have access to a Hadoop cluster, and that you have
a [YARN](http://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YARN.html) configuration directory in your home directory.

```python
# define the environment, then reuse for subsequent jobs
cdh5 = gl.deploy.hadoop_cluster.create('cdh5',
      dato_dist_path='<path-to-your-dato-distributed-dir>',
      hadoop_conf_dir=,'~/yarn-conf')

job_hadoop = gl.deploy.job.create(my_workflow,
      environment=cdh5,
      path='https://s3.amazonaws.com/dato-datasets/movie_ratings/sample.large')

# get the results
job_hadoop.get_results()
```
```
Columns:
        user    str
        movie   str
        score   float
        rank    int

Rows: 100000000

Data:
+-------------+-------------------------------+---------------+------+
|     user    |             movie             |     score     | rank |
+-------------+-------------------------------+---------------+------+
| Jacob Smith |      Coral Reef Adventure     | 4.28305720509 |  1   |
| Jacob Smith |           The Sting           | 3.82596849622 |  2   |
| Jacob Smith |        Step Into Liquid       | 3.79010831536 |  3   |
| Jacob Smith |           Moonstruck          | 3.76760589303 |  4   |
| Jacob Smith | The Shawshank Redemption: ... | 3.73217236222 |  5   |
| Jacob Smith |            Chocolat           |  3.7275472802 |  6   |
| Jacob Smith | Standing in the Shadows of... | 3.72574400128 |  7   |
| Jacob Smith |         The Green Mile        | 3.70810352982 |  8   |
| Jacob Smith |            Sabrina            | 3.69751512231 |  9   |
| Jacob Smith |         The Quiet Man         |  3.6969838065 |  10  |
+-------------+-------------------------------+---------------+------+
[100000000 rows x 4 columns]
Note: Only the head of the SFrame is printed.
You can use print_rows(num_rows=m, num_columns=n) to print more rows and columns.
```


