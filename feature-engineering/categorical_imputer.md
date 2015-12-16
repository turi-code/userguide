# Categorical Imputer

Impute missing categorical values using reference features. The imputer takes as an input a column which contains categorical values, and may contain some None values. Its secondary input is a set of reference feature columns. During the Fit phase, the imputer learns the relationships between the values of the column to be imputed and the reference feature columns. During the Transform phase, the learned relationship is applied to the missing values, and they are filled with categorical values.  The imputer also outputs a probability for each filled value. The probability is based on the number of possible candidates for each missing value.

In specific terms, during the Fit phase, the imputer performs two steps. The first step is to cluster the data using the reference features. The dominant label of the cluster is used to provide a label to None values. The probability returned becomes the proportion of dominant label in the cluster. The second step involves clusters with no label. In this case, a graph of clusters is built, and label propagation is used to determine the best label for the cluster. In this case, the probability returned is established by the label propagation algorithm.

The reference feature columns must be of type *int*, *float*, *dict*, *list*, *string* or 
*array.array*. The column to be imputed must be of the type *int*, *dict*, *list*, 
*string* or *array.array* - as long as it is categorical.

The column to be imputed can contain Nones during the Fit phase, but it must also contain
some categorical values. In the Transform phase, it can be all None, or can contain some
values. If it contains values, they will be returned untouched with a probability of 100%.

#### Introductory Example
```python
# Import GraphLab if not already imported
import graphlab

# Create data.
sf = graphlab.SFrame({'a': [1,0,1], 'b' : [0,1,0], 'c' : ['a', 'b', None]})

# Create a transformer that fits learns from the data above, and tries to impute column c.
from graphlab.toolkits.feature_engineering import CategoricalImputer
imputer = graphlab.feature_engineering.create(sf, CategoricalImputer(feature = 'c'))

# Transform the data.
transformed_sf = imputer.transform(sf)

# Retrieve the imputed values
transformed_sf
```
```no-highlight
Columns:
	a	int
	b	int
	c	str
	predicted_feature_c	str
	feature_probability_c	float

Rows: 3

Data:
+---+---+------+---------------------+-----------------------+
| a | b |  c   | predicted_feature_c | feature_probability_c |
+---+---+------+---------------------+-----------------------+
| 1 | 0 |  a   |          a          |          1.0          |
| 0 | 1 |  b   |          b          |          1.0          |
| 1 | 0 | None |          a          |          1.0          |
+---+---+------+---------------------+-----------------------+
[3 rows x 5 columns]

```
#### Fitting and transforming

```python

# Import GraphLab if not already imported
import graphlab

# Fit and Transform the same column
# ----------------------------------------------------------------------
# Create the data
sf = graphlab.SFrame({'a': [1,0,1], 'b' : [0,1,0], 'c' : ['a', 'b', None]})

# Create the imputer.
imputer = graphlab.feature_engineering.CategoricalImputer(feature='c')

# Fit and transform on the same data.
transformed_sf = imputer.fit_transform(sf)

#Retrieve the imputed values
transformed_sf
```
```no-highlight
Columns:
	a	int
	b	int
	c	str
	predicted_feature_c	str
	feature_probability_c	float

Rows: 3

Data:
+---+---+------+---------------------+-----------------------+
| a | b |  c   | predicted_feature_c | feature_probability_c |
+---+---+------+---------------------+-----------------------+
| 1 | 0 |  a   |          a          |          1.0          |
| 0 | 1 |  b   |          b          |          1.0          |
| 1 | 0 | None |          a          |          1.0          |
+---+---+------+---------------------+-----------------------+
[3 rows x 5 columns]
```
```python
# Import GraphLab if not already imported
import  graphlab

# Fit on one set, and transform another
# ----------------------------------------------------------------------
sf = graphlab.SFrame({'a': [1,0,1], 'b' : [0,1,1], 'c' : ['a', 'b', 'c']})

# Construct and fit.
from graphlab.toolkits.feature_engineering import CategoricalImputer
imputer = graphlab.feature_engineering.CategoricalImputer(feature='c')

# Fit the data
imputer.fit(sf)
```
```no-highlight
Class                         : CategoricalImputer

Model fields
------------
reference_features            : ['a', 'b']
Column to impute              : c
```
```python
# Data to be imputed
sf2 = graphlab.SFrame({'a': [1,0,1,0], 'b' : [0,1,1,0], 'c' : [None, None, None, None]})
sf2['c'] = sf2['c'].astype(str)

# Transform the data
transformed_sf = imputer.transform(sf2)

#Retrieve the imputed values
transformed_sf
```
```no-highlight
Columns:
	a	int
	b	int
	c	float
	predicted_feature_c	str
	feature_probability_c	float

Rows: 4

Data:
+---+---+------+---------------------+-----------------------+
| a | b |  c   | predicted_feature_c | feature_probability_c |
+---+---+------+---------------------+-----------------------+
| 1 | 0 | None |          a          |          1.0          |
| 0 | 1 | None |          c          |          0.5          |
| 1 | 1 | None |          c          |          0.5          |
| 0 | 0 | None |          c          |          0.5          |
+---+---+------+---------------------+-----------------------+
[4 rows x 5 columns]
```
