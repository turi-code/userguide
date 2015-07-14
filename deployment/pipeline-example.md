# Example to use Job execution to generate batch recommendations

In this example, we build a job execution that has three functions associated
with it:

  1. a data ingestion and cleaning
  2. model training
  3. generate recommendations

##### Local

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

Now, let's make some recommendations and store them in an SFrame:

```python
def recommend_items(model, data):
    recommendations = model.recommend(users=data['user'])
    return recommendations
```

Now let us put the pieces together:
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


Now that we is defined, we execute it using the
[job.create](https://dato.com/products/create/docs/generated/graphlab.deploy.job.create.html)
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

Note that we also could have omitted the environment parameter, since
LocalAsync is the default environment when creating jobs.

##### EC2

Next, let's run our job on EC2. When running on EC2, an EC2 instance is
launched according to the environment and the job is executed on that instance.
Once the job is completed the EC2 instance is terminated. While executing, the
job can be monitored with the Job APIs. Execution logs will be stored in S3
according to the location specified in the environment.

**Note**: In order to run in EC2, remember to update the `aws_access_key`,
`aws_secret_key`, and `s3_folder_path` in the code below.

```python
# define the environment once and save it, then reuse conveniently
ec2 = gl.deploy.environment.EC2('ec2', aws_access_key='xxxx',
                                aws_secret_key='xxxx',
                                s3_folder_path='s3://bucket/path',
                                region='us-west-2',
                                instance_type='m3.xlarge')

job_ec2 = gl.deploy.job.create(my_workflow, environment = ec2,
        path = 'https://s3.amazonaws.com/dato-datasets/movie_ratings/sample.large')

# get the results
job_ec2.get_results()
```

The result of this job execution contains the [SFrame](https://dato.com/products/create/docs/generated/graphlab.SFrame.html) of the recommendations

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

Last but not least, let's see how we can launch our job in Hadoop. When defining
a Hadoop cluster to use as an environment we specify the directory that contains
the YARN configuration files.

**Note**: The final example assumes that you have access to a Hadoop cluster,
and that you have
a [YARN](http://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YARN.html)
configuration directory in your home directory.

```python
# define the environment, then reuse for subsequent jobs
cdh5 = gl.deploy.environment.Hadoop('cdh5',
                                    config_dir='~/yarn-conf',
                                    memory_mb=16384,
                                    virtual_cores=4)

job_hadoop = gl.deploy.job.create(my_workflow, environment = cdh5,
        path = 'https://s3.amazonaws.com/dato-datasets/movie_ratings/sample.large')

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


