#Feature Binning

Feature binning is a method of turning continuous variables into categorical
values.  This is accomplished by grouping the values into a pre-defined number
of bins.  The continuous value then gets replaced by a string describing the
bin that contains that value.

FeatureBinner supports both logarithmic and quantile binning strategies.
If the strategy is logarithmic, num_bins is a parameter passed to the 
constructor and bin break points are defined by by 10*i for i in [0,...,num_bins]. 
For instance, if num_bins = 2, the bins become (-Inf, 1], (1, Inf]. If 
num_bins = 3, the bins become (-Inf, 1], (1, 10], (10, Inf].
If the strategy is quantile, the bin breaks are defined by the 
num_bins-quantiles for that column's data. Quantiles are values that separate 
the data into roughly equal-sized subsets.

#### Introductory Example

```python
from graphlab.toolkits.feature_engineering import *

# Construct a feature binner with default options.
sf = graphlab.SFrame({'a': [1,2,3], 'b' : [2,3,4], 'c': [9,10,11]})
binner = graphlab.feature_engineering.create(sf, FeatureBinner())

# Transform the data using the binner.
binned_sf = binner.transform(sf)

# Save the transformer.
binner.save('save-path')

# Bin only a single column 'a'.
binner = graphlab.feature_engineering.create(sf,
                            FeatureBinner(features = ['a']))

# Bin all columns except 'a'.
binner = graphlab.feature_engineering.create(sf,
                            FeatureBinner(excluded_features = ['a']))
```

#### Fitting and transforming 

Once a FeatureBinner object is constructed, it must first be fitted and then 
the transform function can be called to generate hashed features. 


Logarithmic strategy:

```python
sf = graphlab.SFrame({'a' : range(100), 'b' : range(100)})
binner = graphlab.feature_engineering.FeatureBinner()
fit_binner = binner.fit(sf)
binned_sf = fit_binner.transform(sf)
``` 

```no-highlight
Columns:
         a   str
         b   str

 Rows: 100

 Data:
 +-----------+-----------+
 |     a     |     b     |
 +-----------+-----------+
 | (-Inf, 1] | (-Inf, 1] |
 | (-Inf, 1] | (-Inf, 1] |
 |  (1, 10]  |  (1, 10]  |
 |  (1, 10]  |  (1, 10]  |
 |  (1, 10]  |  (1, 10]  |
 |  (1, 10]  |  (1, 10]  |
 |  (1, 10]  |  (1, 10]  |
 |  (1, 10]  |  (1, 10]  |
 |  (1, 10]  |  (1, 10]  |
 |  (1, 10]  |  (1, 10]  |
 |    ...    |    ...    |
 +-----------+-----------+
 [100 rows x 2 columns]
 Note: Only the head of the SFrame is printed.
 You can use print_rows(num_rows=m, num_columns=n) to print more rows and columns.
```

Quantile strategy:

```python
sf = graphlab.SFrame({'a' : range(100), 'b' : range(100)})
binner = graphlab.feature_engineering.FeatureBinner(strategy='quantile')
fit_binner = binner.fit(sf)
binned_sf = fit_binner.transform(sf)
```

```no-highlight
 Columns:
         a   str
         b   str

     Rows: 100

     Data:
     +-----------+-----------+
     |     a     |     b     |
     +-----------+-----------+
     | (-Inf, 0] | (-Inf, 0] |
     |  (0, 10]  |  (0, 10]  |
     |  (0, 10]  |  (0, 10]  |
     |  (0, 10]  |  (0, 10]  |
     |  (0, 10]  |  (0, 10]  |
     |  (0, 10]  |  (0, 10]  |
     |  (0, 10]  |  (0, 10]  |
     |  (0, 10]  |  (0, 10]  |
     |  (0, 10]  |  (0, 10]  |
     |  (0, 10]  |  (0, 10]  |
     |    ...    |    ...    |
     +-----------+-----------+
     [100 rows x 2 columns]
     Note: Only the head of the SFrame is printed.
     You can use print_rows(num_rows=m, num_columns=n) to print more rows and columns.
```
