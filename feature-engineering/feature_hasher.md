#Feature Hashing 

Hashes an input feature space to an n-bit feature space. Feature hashing is an
efficient way of vectorizing features, and performing dimensionality reduction
or expansion along the way. Supported types include *array.array*, *list*, *dict*,
*float*, *int*, and *string*. The behaviour for different input data column types
is as follows:

 - **array.array** : The index of each element is combined with the column name and 
  hashed, and the element becomes the value.

 - **list** : Behaves the same as array.array; if the element is non-numerical, 
   the element is combined with the column name and hashed, and 1 is used as the value.

 - **dict** : Each key in the dictionary is combined with the column name and hashed, 
 and the value is kept. If the value is is non-numerical, the element is 
 combined with the column name and hashed, and 1 is used as the value.

 - **float** : The column name is hashed, and the column entry becomes the value.

 - **int** : Same behavior as float.

 - **string** : Hash the string and use it as a key, and use 1 as the value.

The hashed values are collapsed into a single sparse representation of a vector.
The num_bits parameter specifies the number of bits to hash to.

**Note:** Each time an entry is hashed, a separate hash on the key is performed to 
  either add or subtract a value with equal probability. This keeps the value
  unbiased, since the expectation value for each feature (across all examples) 
  is 0. 

#### Introductory Example 

```python
from graphlab.toolkits.feature_engineering import *

# Construct a feature hasher with default options.
sf = graphlab.SFrame({'a': [1,2,3], 'b' : [2,3,4], 'c': [9,10,11]})
hasher = graphlab.feature_engineering.create(sf, FeatureHasher())

# Transform the data using the hasher.
hashed_sf = hasher.transform(sf)

# Save the transformer.
hasher.save('save-path')

# Hash only a single column 'a'.
hasher = graphlab.feature_engineering.create(sf,
                                              FeatureHasher(features = ['a']))

# Hash all columns except 'a'.
hasher = graphlab.feature_engineering.create(sf,
                                    FeatureHasher(excluded_features = ['a']))
```

#### Fitting and transforming 

Once a FeatureHasher object is constructed, it must first be fitted and then 
the transform function can be called to generate hashed features. 

For numeric columns:
```python
sf = graphlab.SFrame({'a' : [1,2,3], 'b' : [2,3,4]})
hasher = graphlab.feature_engineering.FeatureHasher()
fit_hasher = hasher.fit(sf)
hashed_sf = fit_hasher.transform(sf)
```
```no-highlight
Columns:
        hashed_features dict

Rows: 3

Data:
+-------------------------+
|     hashed_features     |
+-------------------------+
| {79785: -1, 188475: -2} |
| {79785: -2, 188475: -3} |
| {79785: -3, 188475: -4} |
+-------------------------+
[3 rows x 1 columns]
```

For list/vector columns:
```python
l1 = [1,2,3]
l2 = [2,3,4]
sf = graphlab.SFrame({'a' : [l1,l1,l1], 'b' : [l2,l2,l2]})
hasher = graphlab.feature_engineering.FeatureHasher()
fit_hasher = hasher.fit(sf)
hashed_sf = fit_hasher.transform(sf)
```
```no-highlight
Columns:
    hashed_features dict

Rows: 3

Data:
+-------------------------------+
|        hashed_features        |
+-------------------------------+
| {642: 2.0, 164: -3.0, 937:... |
| {642: 2.0, 164: -3.0, 937:... |
| {642: 2.0, 164: -3.0, 937:... |
+-------------------------------+
[3 rows x 1 columns]
```

For string columns:
```python
sf = graphlab.SFrame({'a' : ['a','b','c'], 'b' : ['d','e','f']})
hasher = graphlab.feature_engineering.FeatureHasher()
fit_hasher = hasher.fit(sf)
hashed_sf = fit_hasher.transform(sf)
```
```no-highlight
Columns:
        hashed_features dict

Rows: 3

Data:
+------------------+
| hashed_features  |
+------------------+
| {405: 1, 79: 1}  |
| {454: 1, 423: 1} |
| {308: 1, 36: 1}  |
+------------------+
[3 rows x 1 columns]
```

For dictionary columns:
```python
dict1 = {'a' : 1 , 'b' : 2 , 'c' : 3}
dict2 = {'d' : 4 , 'e' : 5 , 'f' : 6}
sf = graphlab.SFrame({'a' : [dict1, dict1, dict1],
                          'b' : [dict2, dict2, dict2]})
hasher = graphlab.feature_engineering.FeatureHasher()
fit_hasher = hasher.fit(sf)
hashed_sf = fit_hasher.transform(sf)
```
```no-highlight
Columns:
    hashed_features dict

Rows: 3

Data:
+-------------------------------+
|        hashed_features        |
+-------------------------------+
| {36: 3, 454: 5, 423: 2, 79... |
| {36: 3, 454: 5, 423: 2, 79... |
| {36: 3, 454: 5, 423: 2, 79... |
+-------------------------------+
[3 rows x 1 columns]
```

