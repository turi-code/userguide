#Introduction to Feature Engineering

Feature engineering is an important part of designing an effective machine
learning pipeline. It is best described as the process of transforming data
from its raw form to something more useful to the predictive model. This can
result in much better results on your task. 

The basic idea is to construct an object, fit it to a dataset, and transform
any new data.

```python
# Construct a transformer
sf = gl.SFrame({'docs': ["This is a document!", "This one's also a document."]})
f = graphlab.feature_engineering.TFIDF(features = ['docs'])

# Fit it to a dataset
f.fit(sf)

# Now the object is ready to transform new data
f.transform(sf)
```

Feature engineering objects can be [combined into pipelines](transformer_chain.md) 
and deployed on predictive services (see below for more). There is also a 
helper function `fit_transform` method that combines the last two methods.

GLC has a collection of feature engineering objects are helpful for 
transforming SFrames of various types. These feature engineering tasks are 
grouped based on the feature types:

#### Numeric Features

* [Quadratic Features](quadratic_features.md)
* [Feature Binning](feature_binner.md)
* [Numeric Imputer](numeric_imputer.md)
    
#### Categorical Features

* [One Hot Encoder](one_hot_encoder.md)
* [Count Thresholder](count_thresholder.md)
* [Categorical Imputer](categorical_imputer.md)

#### Image Features

* [Deep Feature Extractor](deep_feature_extractor.md)

#### Text features

* [TF-IDF](tfidf.md)
* [Tokenizer](tokenizer.md)
* [BM25](bm25.md)
  
#### Misc.

* [Hasher](feature_hasher.md)
* [Transformer Chain](transformer_chain.md)
* [Custom Transformer](custom_transformer.md)

## Transforming single columns 

Many of the above transformations have a corresponding one-liner function 
whose input is an SArray and output is an SArray. Internally it simply runs 
`fit_transform` on the corresponding transformation. 

```python
tfidf_transforms = gl.text_analytics.tf_idf(data['docs'])
bag_of_words_transforms = gl.text_analytics.count_words(data['docs'])
bag_of_ngrams_transforms = gl.text_analytics.count_words(data['docs'])
```

## Transforming multiple columns 

TF-IDF is an example of a feature engineering object that performs a 
transformation for each feature (i.e. column name) provided in the `features`
argument. Other one-to-one transformations include [CategoricalImputer](categorical_imputer.md), 
[CountThreshold](count_thresholder.md), [FeatureBinner](feature_binner.md), 
[NGramCounter](ngram_counter.md), 
[NumericImputer](numeric_imputer.md), [Tokenizer](tokenizer.md), 
[WordCounter](word_counter.md). If you would prefer to have each transformed 
column be _included_ in the SFrame (rather than replacing the original column) 
you can use the `column_name_prefix` argument to add a prefix the set of 
transformed columns.

Other transformations take a set of columns and create a single column. 
Examples include [FeatureHasher](feature_hasher.md), [OneHotEncoder](one_hot_encoder.md), 
and [QuadraticFeatures](quadratic_features.md). You may change the name of 
the output column using the `output_column_name` argument.

## Deploying feature engineering transformations

The feature engineering toolkit also makes it easy to deploy your feature 
engineering models and pipelines. 

Suppose we have a simple tokenizer:
```python
import graphlab as gl
data = gl.SFrame({'docs': ["This is a document", "Another doc"]})
m = gl.feature_engineering.Tokenizer(features=['docs'])
m.fit(data)
```

Now suppose we have created a Predictive Service object `ps`.  
(For more on that, see the [Predictive Services](../deploy/pred_intro.md) 
chapter of the user guide.) Then we can take a feature engineering model and
add it as a service, apply those changes, and query the model that has been
deployed as a service.

```python
ps = gl.deploy.predictive_service.load(my_ps_url)
ps.add('my_transformation', m)
ps.apply_changes()

d = [row for row in data]  # Create JSON-serializable version of data
ps.query('my_transformation', method='transform', data={'data': d})
```

The resulting JSON will have a "response" field containing the data transformed 
by the deployed tokenizer model.
```
{u'from_cache': False,
 u'model': u'chris_tmp_wordcounter',
 u'response': [{u'docs': [u'This', u'is', u'a', u'document']},
  {u'docs': [u'Another', u'doc']}],
 u'uuid': u'6bb3627b-708d-4398-9afd-b13dd170d8e3',
 u'version': 0}
```

## Feedback
Feedback about the feature engineering toolkit is very welcome. Please post 
questions and comments on our forum or send a note to <a href="mailto:support@dato.com">support@dato.com</a>.
