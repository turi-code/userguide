#One-Hot-Encoder

Encode a collection of categorical features using a 1-of-K encoding scheme.
Input columns to the one-hot-encoder must by of type int, string, dict, or
list.  The transformed output is a column of type dictionary (max_categories
per column dimension sparse vector) where the key corresponds to the index of 
the categorical variable and the value is 1.

The behaviour of the one-hot-encoder for each input data column type is as 
follows (see transform() for examples of the same):

 - **string** : The key in the output dictionary is the string category and
   the value is 1.

 - **int** : Behave similar to string columns.

 - **list** : Each value in the list is treated like an individual string.
   Hence, a list of categorical variables can be used to represent a feature 
   where all categories in the list are simultaneously hot.

 - **dict** : They key of the dictionary is treated as a namespace and the
  value is treated as a sub-category in the namespace. The categorical variable 
  being encoded in this case is a combination of the namespace and the sub-category.


 You can specify the number of categories with the parameter max_categories. 

#### Introductory Example

```python
# Create data.
sf = graphlab.SFrame({'a': [1,2,3], 'b' : [2,3,4]})

# Create a one-hot encoder.
from graphlab.toolkits.feature_engineering import OneHotEncoder
encoder = graphlab.feature_engineering.create(sf, OneHotEncoder())

# Transform the data.
transformed_sf = encoder.transform(sf)
```
```no-highlight
Columns:
    encoded_features    dict

Rows: 5

Data:
+--------------------+
|  encoded_features  |
+--------------------+
| {0: 1, 1: 1, 2: 1} |
| {2: 1, 3: 1, 4: 1} |
| {5: 1, 6: 1, 7: 1} |
| {2: 1, 3: 1, 4: 1} |
| {0: 1, 3: 1, 6: 1} |
+--------------------+
[5 rows x 1 columns]
```

```python
# Save the transformer.
encoder.save('save-path')

# Return the indices in the encoding.
encoder['feature_encoding']
```

```no-highlight
Columns:
    feature    str
    category   str
    index      int

Rows: 4

Data:
+---------+----------+-------+
| feature | category | index |
+---------+----------+-------+
|    a    |    2     |   0   |
|    a    |    3     |   1   |
|    b    |    2     |   2   |
|    b    |    3     |   3   |
+---------+----------+-------+
[4 rows x 3 columns]
```

#### Fitting and transforming 

Once a OneHotEncoder object is constructed, it must first be fitted and then 
the transform function can be called to generate encoded features. 


```python
# String/Integer columns
# ----------------------------------------------------------------------
from graphlab.toolkits.feature_engineering import OneHotEncoder
sf = graphlab.SFrame({'a' : [1,2,3,2,3], 'b' : [2,3,4,2,3]})

# Create a OneHotEncoder
encoder = graphlab.feature_engineering.create(sf, OneHotEncoder())

# Fit and transform on the same data.
transformed_sf = encoder.fit_transform(sf)
```

```no-highlight
Columns:
        encoded_features  dict

Rows: 5

Data:
+------------------+
| encoded_features |
+------------------+
|   {0: 1, 3: 1}   |
|   {1: 1, 4: 1}   |
|   {2: 1, 5: 1}   |
|   {1: 1, 3: 1}   |
|   {2: 1, 4: 1}   |
+------------------+
[5 rows x 1 columns]
```

```python
# Lists can be used to encode sets of categories for each example.
# ----------------------------------------------------------------------
from graphlab.toolkits.feature_engineering import OneHotEncoder
sf = graphlab.SFrame({'categories': [['cat', 'mammal'],
                                         ['dog', 'mammal'],
                                         ['human', 'mammal'],
                                         ['seahawk', 'bird'],
                                         ['wasp', 'insect']]})

# Construct and fit.
encoder = graphlab.feature_engineering.create(sf, OneHotEncoder())

# Transform the data
transformed_sf = encoder.transform(sf)
```

```no-highlight
Columns:
    encoded_features    dict

Rows: 5

Data:
+------------------+
| encoded_features |
+------------------+
|   {0: 1, 1: 1}   |
|   {0: 1, 2: 1}   |
|   {0: 1, 3: 1}   |
|   {4: 1, 6: 1}   |
|   {5: 1, 7: 1}   |
+------------------+
[5 rows x 1 columns]
```

```python
# Dictionaries can be used for name spaces & sub-categories.
# ----------------------------------------------------------------------
from graphlab.toolkits.feature_engineering import OneHotEncoder
sf = graphlab.SFrame({'attributes':
                [{'height':'tall', 'age': 'senior', 'weight': 'thin'},
                 {'height':'short', 'age': 'child', 'weight': 'thin'},
                 {'height':'giant', 'age': 'adult', 'weight': 'fat'},
                 {'height':'short', 'age': 'child', 'weight': 'thin'},
                 {'height':'tall', 'age': 'child', 'weight': 'fat'}]})

# Construct and fit.
encoder = graphlab.feature_engineering.create(sf, OneHotEncoder())

# Transform the data
transformed_sf = encoder.transform(sf)
```

```no-highlight
Columns:
    encoded_features    dict

Rows: 5

Data:
+--------------------+
|  encoded_features  |
+--------------------+
| {0: 1, 1: 1, 2: 1} |
| {2: 1, 3: 1, 4: 1} |
| {5: 1, 6: 1, 7: 1} |
| {2: 1, 3: 1, 4: 1} |
| {0: 1, 3: 1, 6: 1} |
+--------------------+
[5 rows x 1 columns]
```
