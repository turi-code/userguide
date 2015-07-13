# Defining the search

Dato Distributed supports several specific methods for doing model parameter search. 

### Using dictionaries to specify parameters
The way you specify the set of parameters over which to search is through a dictionary. The dictionary keys are the names of the parameters and the values are the parameter values. Any values that are str, int, or floats are treated as a list containing a single value. 

For example, specifying `{"target": "y"}` means that “y” will be the chosen target every time the model is fit. There are some list-typed arguments; in particular, `features` is a list of features to be used in the model.  If you want to search over a list-typed argument, you must provide an iterable over valid argument values. For example, using `{"features": [["col_a"], ["col_a", "col_b"]]}` would search over the two feature sets. If you just wanted to use the same set of features for each model, you would do `{"features": [["col_a"]]}`.

### Specifying a grid gearch
 Grid searches are especially useful when you have a relatively small set of parameters over which to search.

You may define a grid of parameters by specifying the possible values for each parameter. The method [`grid_search.create`](https://dato.com/products/create/docs/generated/graphlab.toolkits.model_parameter_search.grid_search.create.html) will then train a model for each unique combination. 

The collection of all combinations of valid parameter values defines a grid of model parameters that will be considered. For example, providing the following `params` dictionary

```
params = {'target': 'label', 
          'step_size': 0.3, 
          'features': [['a'], ['a', 'b']], 
          'max_depth': [.1, .2]}
```

will create the following set of combinations:

```
[{'target': 'label', 'step_size': 0.3, 'features': ['a'], 'max_depth': .1}, 
 {'target': 'label', 'step_size': 0.3, 'features': ['a'], 'max_depth': .2}, 
 {'target': 'label', 'step_size': 0.3, 'features': ['a', 'b'], 'max_depth': .1}, 
 {'target': 'label', 'step_size': 0.3, 'features': ['a', 'b'], 'max_depth': .2}] 
```

### Using a random search space

You may not always know which areas of a search space are most promising. 
In such situations, it can be useful to pick parameter combinations from random distributions. 
The top-level method, `model_parameter_search`, currently chooses `random_search.create` by default.

For example, for a real-valued parameter such as `step_size`, you could might want to draw values from an [exponential distribution](http://en.wikipedia.org/wiki/Exponential_distribution).
In the following example, each parameter combination will contain 

- a `target` value of 'Y'
- a `max_depth` value of either 5 or 7 (chosen randomly)
- a `step_size` value drawn randomly from an exponential distribution with mean of 0.1

```
import scipy.stats
url = 'http://s3.amazonaws.com/gl-testdata/xgboost/mushroom.csv'
data = gl.SFrame.read_csv(url)
data['label'] = (data['label'] == 'p')

train, valid = data.random_split(.8)
params = {'target': 'label',
          'max_depth': [5, 7],
          'step_size': scipy.stats.distributions.expon(.1)}
job = gl.random_search.create((train, valid),
                            gl.boosted_trees_regression.create,
                            params)
job.get_results()
```

```
Columns:
        model_id        int
        max_depth       int
        step_size       float
        target  str
        training_rmse   float
        validation_rmse float

Rows: 8

Data:
+----------+-----------+----------------+--------+-------------------+
| model_id | max_depth |   step_size    | target |   training_rmse   |
+----------+-----------+----------------+--------+-------------------+
|    9     |     7     | 0.742280945789 | label  | 0.000562821322042 |
|    8     |     5     | 0.37544111673  | label  |  0.00963600115039 |
|    1     |     5     | 0.138909527035 | label  |   0.11368970605   |
|    0     |     7     | 0.977843893103 | label  | 0.000269710408328 |
|    3     |     7     | 0.32559648473  | label  |  0.0110626696535  |
|    2     |     5     | 0.330703633987 | label  |  0.0137912720349  |
|    5     |     7     | 0.408652318249 | label  |  0.00367912426229 |
|    4     |     7     | 0.295146249231 | label  |  0.0162840474088  |
+----------+-----------+----------------+--------+-------------------+
+-------------------+
|  validation_rmse  |
+-------------------+
| 0.000790839939725 |
|  0.0123972020261  |
|   0.114722098681  |
| 0.000369491390958 |
|  0.0120762185507  |
|  0.0169411827805  |
|  0.00439583387505 |
|  0.0171414864358  |
+-------------------+
```


### Manually specifying parameters

If you want full control over your parameter search, then you can use the [`manual_search.create`](https://dato.com/products/create/docs/generated/graphlab.toolkits.model_parameter_search.manual_search.create.html) function. All you need to do is to pass in a list of parameter dictionaries; a model will be fit for each parameter set.

```
factory = gl.boosted_trees_classifier.create
params = [{'target': 'label', 'max_depth': 3}, 
          {'target': 'label', 'max_depth': 6}]
job = gl.manual_search.create((train, valid),
                              factory, params)
```
