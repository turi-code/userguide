# Model parameter search

Many machine learning models have hyper-parameters -- tuning knobs that can modify the behavior of the model. 
These are considered different than the rest of the model's parameters, as they may modify the nature of the model (e.g., the number of parameters to learn) or the training algorithm (e.g., the step size to use as training progresses).
The settings of these parameters can be critical for optimizing the performance of a model for a specific source of data.

To perform model parameter search, you simply try out a variety of parameters and compare a model's performance. 
This chapter introduces a few key elements:

- **Models**: Which model are you trying to optimize? We discuss ways of optimizing GraphLab Create models, sklearn models, and your own custom functions.
- **Search space**: What is the set of parameters and range of each parameter that you want to consider? Below you'll hear about starting out a random search, gaining intuition with a grid search, and manually providing a list of parameters.
- **Evaluation**: How do you measure performance? We show examples of using validation sets and cross-validated metrics in order to measure the model's predictive ability given a set of parameters.
- **Execution**: Finally, many times this is an embarrassingly-parallel operation, and you can speed things up dramatically by distributing the work across many machines. We discuss how to do that below.

First we provide a quick example below, after which you can dig into each of the above categories in more detail.

## Quick start 

Suppose you have a simple dataset of (x,y) values:

```
import graphlab
from graphlab import model_parameter_search, SFrame
regression_data = SFrame({'x': range(100), 'y': [0,1] * (50)})
```

In the following example, we perform model parameter search over a linear regression model. 
We first split the data to create a training set that we will use for training the model, and a validation set to monitor the model's ability to generalize to unseen data.

```
training, validation = regression_data.random_split(0.8)
```

Next, we use the [`model_parameter_search.create`](https://dato.com/products/create/docs/generated/graphlab.toolkits.model_parameter_search.create.html) method and pass in the data, a function that creates models, and a dictionary of parameter settings.
```
# Search over a grid of multiple hyper-parameters, with validation set
params = {'target': 'y'}
job = model_parameter_search.create((training, validation),
                                    graphlab.linear_regression.create,
                                    params)
```

You can query the returned object for results.
```
results = job.get_results()
results.column_names()
```

```
['model_id',
 'l1_penalty',
 'l2_penalty',
 'target',
 'training_rmse',
 'validation_rmse']
```

```
results[['l1_penalty', 'validation_rmse']]
```
```
+------------+-----------------+
| l1_penalty | validation_rmse |
+------------+-----------------+
|    10.0    |  0.499284926708 |
|   0.0001   |  0.496962825009 |
|    10.0    |  0.499284926708 |
|    1.0     |  0.497878172682 |
|    10.0    |  0.499284926708 |
|    10.0    |  0.499284293759 |
|    10.0    |  0.499284300085 |
|    0.1     |  0.497045347005 |
|   0.001    |  0.496981811586 |
|   0.0001   |  0.496962825009 |
+------------+-----------------+
```


In the above example, the model parameter search method does the following:

* Identifies the model (here linear regression) and retrieves a set of parameters to search. For each parameter we provide an initial range of values to search. 
* By default the method fits 10 models; this can be modified with the `max_models` argument. 
* For each model, a random value of each parameter is chosen. This default search strategy can be called directly with `random_search.create`, and has been empirically shown to be quite effective [Bergstra, 2013].
* Each model is trained on the first element of the (training, validation) tuple. The model is then evaluated using the second element, representing `validation` data. 
* The returned object can be queried asynchronously for the current status (`job.get_status()`) or the results (`job.get_results(wait=False)`). 

To find out more details, continue to the next section about various supported models.

### References 

James Bergstra, Yoshua Bengio. [Random Search for Hyper-Parameter Optimization](http://www.jmlr.org/papers/volume13/bergstra12a/bergstra12a.pdf). JMLR 13 (2012).  

### Additional reading

Methodology for model parameter search is an active research area. Modern approaches often attempt to choose the next set of parameters based on the performance of previous parameter sets. 
This class of methods is often called  Bayesian hyperparameter optimization. To learn more, the paper [Practical Bayesian Optimization of Machine Learning Algorithms](http://dash.harvard.edu/handle/1/11708816) provides a great starting point.



