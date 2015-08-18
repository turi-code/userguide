# Cross validation 

Data is the first argument for all of the model parameter search functions. This argument allows for several different input types to allow you to better evaluate model performance on a given set of parameters.

You can provide a train/test pair: by default, each model will be trained on the first element and evaluated on both elements.

```
url = 'http://s3.amazonaws.com/gl-testdata/xgboost/mushroom.csv' 
data = gl.SFrame.read_csv(url)
(train, valid) = data.random_split(.7)
gl.model_parameter_search.create((train, valid), my_model, my_params)
```

You can provide a list of train/test pairs. The results for each model will be averaged across the folds.

```
folds = [(train0, valid0), (train1, valid1)]
gl.model_parameter_search.create(folds, my_model, my_params)
```

We also provide a convenience object [`KFold`](https://dato.com/products/create/docs/generated/graphlab.toolkits.cross_validation.KFold.html) for performing model search using K folds.

```
folds = gl.cross_validation.KFold(sf, 5)
job = gl.random_search.create(folds,
                              my_model,  
                              my_params)
```

In this case, the returned `KFold` object splits the data lazily to minimize communication costs.

### Cross validation for a single parameter set 

We also provide a convenience function for evaluating model performance via cross validation for a given set of parameters.

```
url = 'http://s3.amazonaws.com/gl-testdata/xgboost/mushroom.csv'
data = gl.SFrame.read_csv(url)
data['label'] = (data['label'] == 'p')
folds = gl.cross_validation.KFold(data, 5)
params = {'target': 'label', 'max_depth': 5}
job = gl.cross_validation.cross_val_score(folds,
                                          gl.boosted_trees_classifier.create,
                                          params)
print job.get_results()
```

This is analogous to sklearn's [cross_val_score](http://scikit-learn.org/stable/modules/generated/sklearn.cross_validation.cross_val_score.html).

### Additional reading

To learn more about the benefits of k-fold cross-validation, check out Chapter 5.1 of 
[Introduction to Statistical Learning](http://www-bcf.usc.edu/~gareth/ISL/ISLR%20First%20Printing.pdf).
