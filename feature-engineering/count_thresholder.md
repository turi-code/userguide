#Count Thresholder 

Count Thresholder allows you to map infrequent categorical variables to a new/separate category. Input columns
to the CountThresholder must by of type **string**, **int**, **list**, or **dict**. For each
column in the input, the transformed output is a column where the input
category is retained as-is if it has  occurred at least threshold times in
the training data. Categories that do not satisfy the above are set to
`output_category_name`.

The behaviour for different input data column types is as follows: 
(see `transform()` for examples).

* **string** : Strings are marked with the `output_category_name` if the
threshold condition described above is not satisfied.

* **int** : Behave the same way as string. If `output_category_name` is
of type string, then the entire column is cast to string.

* **list** : Each of the values in the list are mapped in the same way as
a string value.

* **dict** : They key of the dictionary is treated as a namespace and the
value is treated as a sub-category in the namespace. The categorical variable 
passed through the transformer is a combination of the namespace and the 
sub-category.

You specify the threshold at which to preserve the categories with the 
parameter "threshold". 

#### Introductory Example 

```python
from graphlab.toolkits.feature_engineering import *

# Create data.
sf = gl.SFrame({'a': [1,2,3], 'b' : [2,3,4]})

# Create a transformer.
count_tr = gl.feature_engineering.create(sf, CountThresholder(threshold = 1))

# Transform the data.
transformed_sf = count_tr.transform(sf)

# Save the transformer.
count_tr.save('save-path')

# Return the categories that are not discarded.
count_tr['categories']
```

```no-highlights
Columns:
        feature str
        category  str

Rows: 6

Data:
+---------+----------+
| feature | category |
+---------+----------+
|    a    |    1     |
|    a    |    2     |
|    a    |    3     |
|    b    |    2     |
|    b    |    3     |
|    b    |    4     |
+---------+----------+
[6 rows x 2 columns]
```

#### Fitting and transforming 

Once a CountThresholder object is constructed, it must first be fitted and then 
the transform function can be called to generate encoded features. 

```python
# String/Integer columns
# ----------------------------------------------------------------------
sf = gl.SFrame({'a' : [1,2,3,2,3], 'b' : [2,3,4,2,3]})

# Set all categories that did not occur at least 2 times to None.
count_tr = gl.feature_engineering.CountThresholder(threshold = 2)

# Fit and transform on the same data.
transformed_sf = count_tr.fit_transform(sf)
```

```no-highlight
Columns:
a   int
b   int

Rows: 3

Data:
+-------+--------+
|   a   |   b    |
+-------+--------+
| None  |    2   |
|   2   |    3   |
|   3   |  None  |
|   2   |    2   |
|   3   |    3   |
+-------+--------+
[5 rows x 2 columns]
```

```python
# Lists can be used to encode sets of categories for each example.
# ----------------------------------------------------------------------
sf = gl.SFrame({'categories': [['cat', 'mammal'],
                               ['cat', 'mammal'],
                               ['human', 'mammal'],
                               ['seahawk', 'bird'],
                               ['duck', 'bird'],
                               ['seahawk', 'bird']]})

# Construct and fit.
from graphlab.toolkits.feature_engineering import CountThresholder
count_tr = graphlab.feature_engineering.create(sf, CountThresholder(threshold = 2))

# Transform the data
transformed_sf = count_tr.transform(sf)
```

```no-highlights
Columns:
        categories  list

Rows: 6

Data:
+-----------------+
|    categories   |
+-----------------+
|  [cat, mammal]  |
|  [cat, mammal]  |
|  [None, mammal] |
| [seahawk, bird] |
|   [None, bird]  |
| [seahawk, bird] |
+-----------------+
[6 rows x 1 columns]
```

```python
# Dictionaries can be used for name spaces & sub-categories.
# ----------------------------------------------------------------------
sf = gl.SFrame({'attributes':
                [{'height':'tall', 'age': 'senior', 'weight': 'thin'},
                 {'height':'short', 'age': 'child', 'weight': 'thin'},
                 {'height':'giant', 'age': 'adult', 'weight': 'fat'},
                 {'height':'short', 'age': 'child', 'weight': 'thin'},
                 {'height':'tall', 'age': 'child', 'weight': 'fat'}]})

# Construct and fit.
from graphlab.toolkits.feature_engineering import CountThresholder
count_tr = gl.feature_engineering.create(sf,
                 CountThresholder(threshold = 2))

# Transform the data
transformed_sf = count_tr.transform(sf)
```

```no-highlight
Columns:
    attributes      dict

Rows: 5

Data:
+-------------------------------+
|           attributes          |
+-------------------------------+
| {'age': None, 'weight': 't... |
| {'age': 'child', 'weight':... |
| {'age': None, 'weight': No... |
| {'age': 'child', 'weight':... |
| {'age': 'child', 'weight':... |
+-------------------------------+
```
