#Numeric Imputer 

NumericImputer allows you to impute missing values with feature means. Input columns to the NumericImputer
must be of type *int*, *float*, *dict*, *list*, or *array.array*.  For each
 input column, the transformed output is a column where the input is
retained as-is if:

- there is no missing value.

Inputs that do not satisfy the above are set to the mean value of that
feature.



The behavior for different input data column types is as follows:

- **float**: If there is a missing value, it is replaced with the mean
  of that column.

- **int**: Behaves the same way as *float*.

- **list**: Each index of the list is treated as a feature column, and
  missing values are replaced with per-feature means. This is
  the same as unpacking, computing the mean, and re-packing. See [pack_columns](https://dato.com/products/create/docs/generated/graphlab.SFrame.pack_columns.html) 
  for more information. All elements must be of type *float*, *int*, or *None*.

- **array**: Same behavior as *list*

- **dict** : Same behavior as *list*, except keys not present in
  a particular row are implicitly interpreted as having the
  value 0. This makes the  *dict* type a sparse representation
  of a vector.

#### Introductory Example
```python

# Create data.
sf = graphlab.SFrame({'a': [1, None, 3], 
                      'b' : [2, None, 4]})

# Create a transformer.
from graphlab.toolkits.feature_engineering import NumericImputer
imputer = graphlab.feature_engineering.create(sf, NumericImputer())

# Transform the data.
transformed_sf = imputer.transform(sf)

# Save the transformer.
imputer.save('save-path')

# Return the means.
imputer['means']
```
```no-highlight
Columns:
    a float
    b float

Rows: 1

Data:
+-----+-----+
|  a  |  b  |
+-----+-----+
| 2.0 | 3.0 |
+-----+-----+
[1 rows x 2 columns]

```
#### Fitting and transforming

```python
# Integer/Float columns
# ----------------------------------------------------------------------
# Create the data
sf = graphlab.SFrame({'a' : [1, 2, None, 4, 5], 
                      'b' : [2, 3, None, 5, 6]})

# Create the imputer.
imputer = graphlab.feature_engineering.NumericImputer()

# Fit and transform on the same data.
transformed_sf = imputer.fit_transform(sf)
```
```no-highlight
Columns:
        a   float
        b   float

Rows: 5

Data:
+-----+-----+
|  a  |  b  |
+-----+-----+
| 1.0 | 2.0 |
| 2.0 | 3.0 |
| 3.0 | 4.0 |
| 4.0 | 5.0 |
| 5.0 | 6.0 |
+-----+-----+
[5 rows x 2 columns]
```

Lists can contain numeric and None values.

```python
sf = graphlab.SFrame({'a': [[1, 2],
                            [2, 3],
                            [3, 4],
                            [None, None],
                            [5, 6],
                            [6, 7]]})

# Construct and fit.
from graphlab.toolkits.feature_engineering import NumericImputer
imputer = graphlab.feature_engineering.create(sf, NumericImputer())

# Transform the data
transformed_sf = imputer.transform(sf)
```
```no-highlight
Columns:
        a   list

Rows: 6

Data:
+------------+
|     a      |
+------------+
|   [1, 2]   |
|   [2, 3]   |
|   [3, 4]   |
| [3.4, 4.4] |
|   [5, 6]   |
|   [6, 7]   |
+------------+
[6 rows x 1 columns]
```

Dictionaries can contain numeric and None values. Assumes sparse
data format.

```python
sf = graphlab.SFrame({'X':
                [{'a':1, 'b': 2, 'c': 3},
                 None,
                 {'b':4, 'c': None, 'd': 6}]})

# Construct and fit.
from graphlab.feature_engineering import NumericImputer
imputer = graphlab.feature_engineering.create(sf, NumericImputer())

# Transform the data
transformed_sf = imputer.transform(sf)
```
```no-highlight
Columns:
    X   dict

Rows: 3

Data:
+-------------------------------+
|               X               |
+-------------------------------+
|    {'a': 1, 'c': 3, 'b': 2}   |
| {'a': 0.5, 'c': 3.0, 'b': ... |
|   {'c': 3.0, 'b': 4, 'd': 6}  |
+-------------------------------+
[3 rows x 1 columns]

```
