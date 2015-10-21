# Models

The [`model_parameter_search.create`](https://dato.com/products/create/docs/generated/graphlab.toolkits.model_parameter_search.create.html) method has executed a search of parameters over a pre-defined space of possibilities. 
This can be helpful for newcomers who may not yet know the intricacies of each model and which parameters to consider in a first search.

The GraphLab Create models that have default search ranges provided include:
- kmeans.create
- logistic_classifier.create
- boosted_trees_classifier.create
- neuralnet_classifier.create
- svm_classifier.create
- linear_regression.create
- boosted_trees_regression.create
- ranking_factorization_recommender.create
- factorization_recommender.create

If you are doing model parameter search for a scikit-learn model, we also have default search ranges for the following:
- SVC
- LogisticRegression
- GradientBoostingClassifier
- GradientBoostingRegressor
- RandomForestClassifier
- RandomForestRegressor
- ElasticNet
- LinearRegression

Suppose you want to specify your search space for a particular parameter. By specifying a set of values of `l2_penalty`, as we do below, the model search will only use `l2_penalty` values chosen from the provided list.

```
params = {'target': 'y', 'l2_penalty': [0.01, 0.05]}
job = model_parameter_search.create((training, validation),
                                    graphlab.linear_regression.create,
                                    params)
```

### Tuning a GraphLab Create model

Let's grab the Iris dataset, rename the final column to be 'target', and create a random train/test split.
```
import graphlab as gl
url = 'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data'
data = gl.SFrame.read_csv(url, header=False)
data.rename({'X5': 'target'})
(train, valid) = data.random_split(.8)
```

To do a parameter search with a [`BoostedTreesClassifier`](https://dato.com/products/create/docs/generated/graphlab.boosted_trees_classifier.BoostedTreesClassifier.html) we simply specify the data, the model, and the value of the target parameter as a dictionary:
```
params = {'target': 'target'}
j = gl.model_parameter_search.create((train, valid), 
                                     gl.boosted_trees_classifier.create, 
                                     params)
```

This will use some sensible default parameter ranges, fitting  10 models.
In the following results table, notice that we have trained models for several values of `column_subsample`, `max_depth`, etc. 

```
j.get_results()
```

```
Columns:                                                                                                                                                                                                     [18/263]
        model_id        int
        column_subsample        float
        max_depth       int
        max_iterations  int
        min_child_weight        int
        min_loss_reduction      int
        row_subsample   float
        step_size       float
        target  str
        training_accuracy       float
        validation_accuracy     float

Rows: 10

Data:
+----------+------------------+-----------+----------------+------------------+
| model_id | column_subsample | max_depth | max_iterations | min_child_weight |
+----------+------------------+-----------+----------------+------------------+
|    9     |       0.9        |     6     |       10       |        8         |
|    8     |       1.0        |     10    |      100       |        1         |
|    1     |       1.0        |     4     |      100       |        8         |
|    0     |       1.0        |     10    |      100       |        16        |
|    3     |       1.0        |     10    |      100       |        2         |
|    2     |       0.8        |     8     |      100       |        2         |
|    5     |       0.8        |     8     |       10       |        2         |
|    4     |       0.8        |     10    |      100       |        4         |
|    7     |       0.8        |     8     |       50       |        16        |
|    6     |       0.8        |     6     |       50       |        4         |
+----------+------------------+-----------+----------------+------------------+
+--------------------+---------------+-----------+--------+-------------------+
| min_loss_reduction | row_subsample | step_size | target | training_accuracy |
+--------------------+---------------+-----------+--------+-------------------+
|         1          |      0.9      |   1e-05   | target |   0.962264150943  |
|         1          |      0.9      |   1e-05   | target |   0.980582524272  |
|         10         |      0.9      |    0.1    | target |   0.981132075472  |
|         10         |      0.9      |    0.1    | target |   0.950980392157  |
|         1          |      1.0      |    0.0    | target |   0.376146788991  |
|         0          |      0.9      |    0.5    | target |        1.0        |
|         1          |      0.9      |   0.001   | target |   0.981308411215  |
|         1          |      1.0      |   1e-05   | target |   0.963302752294  |
|         1          |      0.9      |    0.0    | target |   0.377358490566  |
|         10         |      1.0      |   0.001   | target |   0.980952380952  |
+--------------------+---------------+-----------+--------+-------------------+
+---------------------+
| validation_accuracy |
+---------------------+
|    0.921052631579   |
|    0.947368421053   |
|    0.947368421053   |
|    0.947368421053   |
|    0.236842105263   |
|    0.947368421053   |
|    0.947368421053   |
|    0.947368421053   |
|    0.236842105263   |
|    0.947368421053   |
+---------------------+

```

Since this search involves a random combination of parameters, the results may vary each time you execute the function.

### Tuning a sklearn model

You may also perform model parameter search on a sklearn model. Consider creating a train/test split of the iris dataset (as done [here](http://scikit-learn.org/stable/modules/cross_validation.html)):
```
import numpy as np
from sklearn import cross_validation
from sklearn import datasets
from sklearn import svm

iris = datasets.load_iris()
iris.data.shape, iris.target.shape

X_train, X_test, y_train, y_test = cross_validation.train_test_split(
    iris.data, iris.target, test_size=0.4, random_state=0)
```

In this case, both the train and test datasets must be a tuple of numpy matrices (X, y) representing the feature matrix and the target vector, respectively. This time, we use [`grid_search.create`](https://dato.com/products/create/docs/generated/graphlab.toolkits.model_parameter_search.grid_search.create.html) to perform a grid search which fits a model for all possible combination of parameters.
```
data = ((X_train, y_train), (X_test, y_test))
params = {'kernel': 'linear', 'C': [0.5, .75, 1.0]}
j = gl.grid_search.create(data, svm.SVC, params)
```

Running this job we get the following results table. By default, `model_parameter_search` methods use an sklearn model's `score` function to make predictions for the training and validation datasets. These values are presented in the `training_score` and `validation_score` columns.

```
j.get_results()
```
```
Columns:
        model_id        int
        C       float
        kernel  str
        training_score  float
        validation_score        float

Rows: 3

Data:
+----------+------+--------+----------------+------------------+
| model_id |  C   | kernel | training_score | validation_score |
+----------+------+--------+----------------+------------------+
|    1     | 0.75 | linear | 0.988888888889 |  0.966666666667  |
|    0     | 0.5  | linear | 0.988888888889 |       0.95       |
|    2     | 1.0  | linear | 0.988888888889 |  0.966666666667  |
+----------+------+--------+----------------+------------------+
[3 rows x 5 columns]
```

To get the fitted model with `C=.5` we can query for the first element from the response of `j.get_models()`:
```
j.get_models()[0]
```
```
SVC(C=0.5, cache_size=200, class_weight=None, coef0=0.0, degree=3, gamma=0.0,
  kernel='linear', max_iter=-1, probability=False, random_state=None,
  shrinking=True, tol=0.001, verbose=False)
```

### Tuning your own custom model

You may also want to tune a custom function that contains your own model, such as one or more GraphLab Create models with additional preprocessing or postprocessing logic. For example, suppose we want to train an ensemble of two models: a boosted trees classifier and a logistic regression classifier. We first create a function that takes in a dataset (along with some parameters) and returns a scoring function. The scoring function computes a weighted average of the predictions between the two models, where the weight is determined by the `proportion` argument.

```
def ensemble(train, target, proportion=.5):
    m1 = gl.boosted_trees_classifier.create(train, target=target)
    m2 = gl.logistic_classifier.create(train, target=target)
    def score(test):
        yhat1 = m1.predict(test)
        yhat2 = m2.predict(test)
        yhat = proportion * yhat1 + (1-proportion) * yhat2
        return yhat
    return score
```

Next, we need to define a function that can evaluate the returned scoring function with respect to the training and/or validation datasets. Here we use the scoring function to make predictions on each dataset, and we evaluate the accuracy with respect to the true target values.
```
def custom_evaluator(scorer, train, valid):
    yhat_train = scorer(train)
    yhat_valid = scorer(valid)
    return {'train_acc': gl.evaluation.accuracy(train['target'], yhat_train),
            'valid_acc': gl.evaluation.accuracy(valid['target'], yhat_valid)}
```

Finally, we can perform a model parameter search over a chosen set of proportions. We pass in our custom function, our parameters, and our custom evaluator. We can again use the Iris data, where this time we are classifying whether or not each isntance has the label "Iris-setosa":
```
data = gl.SFrame.read_csv(url, header=False)
data.rename({'X5': 'target'})
data['target'] = data['target'] == 'Iris-setosa'
(train, test) = data.random_split(.3)

params = {'target': 'target', 'proportion': [.3, .5, .7]}
j = gl.grid_search.create((train, test),  
                          ensemble, 
                          params, 
                          evaluator=custom_evaluator)
```


### Debugging model search jobs

All model search jobs will attempt to fit a single model prior to scheduling the full search. We have found this can help speed up development by exposing simple errors faster. You may disable this trial run by setting `perform_trial_run=False`. For example, suppose we use the wrong name for the target column:

```
params = {'target': 'label', 'proportion': [.3, .5, .7]}
j = gl.grid_search.create((train, test), 
                          ensemble, 
                          params, 
                          evaluator=custom_evaluator)
```


In this case, the first trial job fails and you see a message like:

```
No valid results have been created from this search.
[WARNING] Trial run failed prior to launching model parameter search.  Please check for exceptions using get_metrics() on the returned object.
```

You may then do retrieve the message of the thrown exception. In this case we used an incorrect value for the `target` parameter.
```
j.get_metrics()['exception_message']
Out[47]: 
dtype: str
Rows: 2
['Runtime Exception. Column name label does not exist.', None]
```


