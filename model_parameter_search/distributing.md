# Distributing model parameter search

For all model parameter search methods and `cross_val_score`, you have the choice of running the jobs locally or remotely.

### Local
By default, jobs are scheduled to run locally in an asynchronous fashion. This is called a [LocalAsync environment](https://dato.com/products/create/docs/generated/graphlab.deploy.environment.LocalAsync.html). 

### Remote
You may also run jobs on an EC2 cluster or a Hadoop cluster. This is especially useful when you want to perform a larger scale paremeter search.

For EC2, you first create an EC2 environment and pass it into the `environment` argument: 
```
ec2 = graphlab.deploy.environment.EC2('ec2_env_name', 's3://bucket/path')
j = gl.model_parameter_search.create((train, valid), 
                                     my_model, my_params, 
                                     environment=ec2)
```

For more details on creating this environment, checkout the [API docs](https://dato.com/products/create/docs/generated/graphlab.deploy.environment.Hadoop.html#graphlab.deploy.environment.Hadoop) or the [Deployment](http://dato.com/learn/userguide/deployment/pipeline-introduction.html) chapter of the userguide.

For launching jobs on a Hadoop cluster, you instead create a Hadoop environment and pass this object into the `environment` argument:

```
hd = graphlab.deploy.environment.Hadoop(‘hd’, config_dir=<local-conf-path>)
j = gl.model_parameter_search.create((train, valid), 
                                     my_model, my_params, 
                                     environment=hd)
```
For more details on creating this environment, checkout the [API docs](https://dato.com/products/create/docs/generated/graphlab.deploy.environment.EC2.html#graphlab.deploy.environment.EC2) or the [Deployment](http://dato.com/learn/userguide/deployment/pipeline-introduction.html) chapter of the userguide.

When getting started, it's useful to keep `perform_trial_run=True` to make sure you are creating your models properly.


