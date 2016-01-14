#Quadratic Features

Adding interaction terms is a good way of injecting complex relationships 
between predictor variables while still using a simple learning algorithm 
(ie. Logistic Regression) that is easy to use and explain. The QuadraticFeatures 
transformer accomplishes this by taking a row of the SFrame, and multiplying 
the specified features together. If the features are of array.array or 
dictionary type, multiplications of all possible numeric pairs are computed. 
Supported types are int, float, array.array, and dict.

When the transformer is applied, an additional column with name specified by 
‘output_column_name’ is added to the input SFrame. In this column of dictionary 
type, interactions are specified in the key names (by concatenating column 
names and keys/indices if applicable) and values are the multiplied values.

#### Introductory Example

```python

from graphlab.toolkits.feature_engineering import *

# Construct a quadratic features transformer with default options.
sf = graphlab.SFrame({'a': [1,2,3], 'b' : [2,3,4], 'c': [9,10,11]})
quadratic = graphlab.feature_engineering.create(sf, QuadraticFeatures())

# Transform the data.
quadratic_sf = quadratic.transform(sf)

# Save the transformer.
quadratic.save('save-path')

# Compute interactions only for a single column 'a'.
quadratic = graphlab.feature_engineering.create(sf,
                                          QuadraticFeatures(features = ['a']))

# Compute interactions for all columns except 'a'.
quadratic = graphlab.feature_engineering.create(sf,
                                QuadraticFeatures(excluded_features = ['a']))
```

#### Fitting and transforming 

Once a QuadraticFeatures object is constructed, it must first be fitted, and then 
the transform function can be called to generate hashed features. 

For numeric columns:

```python
sf = graphlab.SFrame({'a' : [1,2,3], 'b' : [2,3,4]})
quadratic = graphlab.feature_engineering.QuadraticFeatures()
fit_quadratic = quadratic.fit(sf)
quadratic_sf = fit_quadratic.transform(sf)
```

```no-highlight
Columns:
        a   int
        b   int
        quadratic_features  dict

Rows: 3

Data:
+---+---+-------------------------------+
| a | b |       quadratic_features      |
+---+---+-------------------------------+
| 1 | 2 | {'a, b': 2, 'a, a': 1, 'b,... |
| 2 | 3 | {'a, b': 6, 'a, a': 4, 'b,... |
| 3 | 4 | {'a, b': 12, 'a, a': 9, 'b... |
+---+---+-------------------------------+
[3 rows x 3 columns]
```

For vector columns:

```python
l1 = [1,2,3]
l2 = [2,3,4]
sf = graphlab.SFrame({'a' : [l1,l1,l1], 'b' : [l2,l2,l2]})
quadratic = graphlab.feature_engineering.QuadraticFeatures()
fit_quadratic = quadratic.fit(sf)
quadratic_sf = fit_quadratic.transform(sf)
```

```no-highlight
Columns:
        a   array
        b   array
        quadratic_features  dict

Rows: 3

Data:
+-----------------+-----------------+-------------------------------+
|        a        |        b        |       quadratic_features      |
+-----------------+-----------------+-------------------------------+
| [1.0, 2.0, 3.0] | [2.0, 3.0, 4.0] | {'b:0, b:0': 4.0, 'b:0, b:... |
| [1.0, 2.0, 3.0] | [2.0, 3.0, 4.0] | {'b:0, b:0': 4.0, 'b:0, b:... |
| [1.0, 2.0, 3.0] | [2.0, 3.0, 4.0] | {'b:0, b:0': 4.0, 'b:0, b:... |
+-----------------+-----------------+-------------------------------+
[3 rows x 3 columns]
```

For dictionary columns:

```python
dict1 = {'a' : 1 , 'b' : 2 , 'c' : 3}
dict2 = {'d' : 4 , 'e' : 5 , 'f' : 6}
sf = graphlab.SFrame({'a' : [dict1, dict1, dict1], 'b' : [dict2, dict2, dict2]})
quadratic = graphlab.feature_engineering.QuadraticFeatures()
fit_quadratic = quadratic.fit(sf)
quadratic_sf = fit_quadratic.transform(sf)
```

```no-highlight
Columns:
        a   dict
        b   dict
        quadratic_features  dict

Rows: 3

Data:
+--------------------------+--------------------------+
|            a             |            b             |
+--------------------------+--------------------------+
| {'a': 1, 'c': 3, 'b': 2} | {'e': 5, 'd': 4, 'f': 6} |
| {'a': 1, 'c': 3, 'b': 2} | {'e': 5, 'd': 4, 'f': 6} |
| {'a': 1, 'c': 3, 'b': 2} | {'e': 5, 'd': 4, 'f': 6} |
+--------------------------+--------------------------+
+-------------------------------+
|       quadratic_features      |
+-------------------------------+
| {'b:d, b:d': 16, 'b:d, b:e... |
| {'b:d, b:d': 16, 'b:d, b:e... |
| {'b:d, b:d': 16, 'b:d, b:e... |
+-------------------------------+
[3 rows x 3 columns]
```
