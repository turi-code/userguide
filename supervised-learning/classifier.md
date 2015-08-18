#Classification
**Classification** is the problem of predicting a **categorical target**
using training data. The key difference between **regression** and
**classification** is that in regression the target is continuous while in
classification, the target is categorical.

Creating classification models is easy with GraphLab Create! Currently, the
following models are supported for classification:

* [Logistic regression](logistic-regression.md)
* [Nearest neighbor classifier](knn_classifier.md)
* [Support vector machines (SVM) ](svm.md)
* [Boosted Decision Trees](boosted_trees_classifier.md)
* [Neural network classifier (deep learning)](neuralnet-classifier.md)

These algorithms differ in how they make predictions, but conform to the same
API. With all models, call **create()** to create a model, **predict()** to make
flexible predictions on the returned model, **classify()** which provides
all the sufficient statistics for classifying data, and **evaluate()** to
measure performance of the predictions. All models can incorporate:

* Numeric features
* Categorical variables
* Sparse features (i.e feature sets that have a large set of features,
of which only a small subset of values are non-zero)
* Dense features (i.e
feature sets with a large number of numeric features)
* Text data
* Images

#### Model Selector

It isn't always clear that we know exactly which model is suitable for a given
task.  GraphLab Create's model selector automatically picks the right model for
you based on statistics collected from the data set.

```python
import graphlab as gl

# Load the data
data =  gl.SFrame('http://s3.amazonaws.com/dato-datasets/regression/yelp-data.csv')

# Restaurants with rating >=3 are good
data['is_good'] = data['stars'] >= 3

# Make a train-test split
train_data, test_data = data.random_split(0.8)

# Automatically picks the right model based on your data.
model = gl.classifier.create(train_data, target='is_good',
                             features = ['user_avg_stars',
                                         'business_avg_stars',
                                         'user_review_count',
                                         'business_review_count'])

# Generate predictions (class/probabilities etc.), contained in an SFrame.
predictions = model.classify(test_data)

# Evaluate the model, with the results stored in a dictionary
results = model.evaluate(test_data)
```

GraphLab Create implementations are built to work with up to billions of
examples and up to millions of features.
