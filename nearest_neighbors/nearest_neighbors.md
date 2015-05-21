The GraphLab Create
[nearest neighbors toolkit](https://dato.com/products/create/docs/graphlab.toolkits.nearest_neighbors.html)
is used to find the rows in a data
table that are most similar to a query row. This is a two-stage process,
analogous to many other GraphLab Create toolkits. First a
[NearestNeighborsModel](https://dato.com/products/create/docs/generated/graphlab.nearest_neighbors.NearestNeighborsModel.html)
is created, using a
**reference dataset** contained in an
[SFrame](https://dato.com/products/create/docs/generated/graphlab.SFrame.html).
For a **dataset of query
points**---also stored in an SFrame---this model is then queried to find the
nearest reference data points. For this chapter we use an example dataset of
house attributes and prices, downloaded from Dato's public datasets bucket.

```python
import graphlab as gl
import os

if os.path.exists('houses.csv'):
    sf = gl.SFrame.read_csv('houses.csv')
else:
    data_url = 'http://s3.amazonaws.com/dato-datasets/regression/houses.csv'
    sf = gl.SFrame.read_csv(data_url)
    sf.save('houses.csv')

sf.head(5)
```
<div style="max-height:1000px;max-width:1500px;overflow:auto;">
<table frame="box" rules="cols">
    <tr>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">tax</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">bedroom</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">bath</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">price</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">size</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">lot</th>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">590</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1.0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">50000</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">770</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">22100</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1050</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2.0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">85000</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1410</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">12000</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">20</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1.0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">22500</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1060</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3500</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">870</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2.0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">90000</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1300</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">17500</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1320</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2.0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">133000</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1500</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">30000</td>
    </tr>
</table>
[5 rows x 6 columns]<br/>
</div>

Because the features in this dataset have very different scales (e.g. price is
in the hundreds of thousands while the number of bedrooms is in the single
digits), it is important to **normalize the features**. In this example we
standardize so that each feature is measured in terms of standard deviations
from the mean (see [Wikipedia for more
detail](http://en.wikipedia.org/wiki/Normalization_%28statistics%29)). In
addition, both reference and query datasets may have a column with row labels,
but for this example we let the model default to using row indices as labels.

```python
for c in sf.column_names():
    sf[c] = (sf[c] - sf[c].mean()) / sf[c].std()
```

First, we **create a nearest neighbors model**. We can list specific features to
use in our distance computations, or default to using all features in the
reference SFrame. In the model summary below the following code snippet, note
the fields ``Features`` and ``Variables``, which in this case are both 3,
because our second command specifies three numeric SFrame columns as features
for the model.

```python
model = gl.nearest_neighbors.create(sf)
model = gl.nearest_neighbors.create(sf, features=['bedroom', 'bath', 'size'])
model.summary()
```
```no-highlight
Class                         : NearestNeighborsModel

Attributes
----------
Distance                      : euclidean
Method                        : ball tree
Number of examples            : 15
Number of feature columns     : 3
Number of unpacked features   : 3
Total training time (seconds) : 0.0091

Ball Tree Attributes
--------------------
Tree depth                    : 1
Leaf size                     : 1000
```

To retrieve the five closest neighbors for each query data point, we **query the
model**. The result is an SFrame with four columns: query label, reference
label, distance, and rank of the reference point among the query point's nearest
neighbors. Query points are also contained in an SFrame, which must contain
columns with the same names as those used to construct the model. Often, the
reference SFrame is used as the query SFrame as well, in which case the nearest
neighbors for all items in the reference SFrame are returned.

```python
knn = model.query(sf, k=5)
knn.head()
```
<div style="max-height:1000px;max-width:1500px;overflow:auto;">
<table frame="box" rules="cols">
    <tr>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">query_label</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">reference_label</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">distance</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">rank</th>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">5</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.100742954001</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">7</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.805943632008</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">10</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1.82070683014</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">4</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1.83900997922</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">5</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">4</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.181337317202</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">8</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.181337317202</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">11</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.322377452803</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">4</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">12</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.705200678007</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">5</td>
    </tr>
</table>
[10 rows x 4 columns]<br/>
</div>

The most critical choice in computing nearest neighbors is the **distance
function** that measures the dissimilarity between any pair of observations.

For numeric data, the options are ``euclidean``, ``manhattan``, ``cosine``, and
``dot_product.`` For data in dictionary format (i.e. sparse data), ``jaccard``
and ``weighted_jaccard`` are also options, in addition to the numeric distances.
For string features, use ``levenshtein`` distance, or use the text analytics
toolkit's ``count_ngrams`` feature to convert strings to dictionaries of words
or character shingles, then use Jaccard or weighted Jaccard distance. Leaving
the distance parameter set to its default value of ``auto`` tells the model to
choose the most reasonable distance based on the type of features in the
reference data. Select the distance option when creating the model. In the
following output cell, the second line of the model summary confirms our choice
of Manhattan distance.

```python
model = gl.nearest_neighbors.create(sf, features=['bedroom', 'bath', 'size'],
                                    distance='manhattan')
model.summary()
```
```no-highlight
Class                         : NearestNeighborsModel

Attributes
----------
Distance                      : manhattan
Method                        : ball tree
Number of examples            : 15
Number of feature columns     : 3
Number of unpacked features   : 3
Total training time (seconds) : 0.013

Ball Tree Attributes
--------------------
Tree depth                    : 1
Leaf size                     : 1000
```

Distance functions are also exposed in the ``graphlab.distances`` module. This
allows us not only to specify the distance argument for a nearest neighbors
model as a distance function (rather than a string), but also to *use* that
function for any other purpose.

In the following snippet we use a nearest neighbors model to find the closest
reference points to the first three rows of our dataset, then confirm the
results by computing a couple of the distances manually with the Manhattan
distance function.

```python
model = gl.nearest_neighbors.create(sf, features=['bedroom', 'bath', 'size'],
                                    distance=gl.distances.manhattan)
knn = model.query(sf[:3], k=3)
knn.print_rows()

sf_check = sf[['bedroom', 'bath', 'size']]
print "distance check 1:", gl.distances.manhattan(sf_check[2], sf_check[10])
print "distance check 2:", gl.distances.manhattan(sf_check[2], sf_check[14])
```
<div style="max-height:1000px;max-width:1500px;overflow:auto;"><table frame="box" rules="cols">
    <tr>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">query_label</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">reference_label</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">distance</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">rank</th>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">5</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.100742954001</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">7</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.805943632008</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">4</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.181337317202</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">8</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.181337317202</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">10</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.0604457724006</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">14</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1.61656820464</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
    </tr>
</table>
[9 rows x 4 columns]<br/>
</div>

```no-highlight
distance check 1: 0.0604457724006
distance check 2: 1.61656820464
```

GraphLab Create also allows **composite distances**, where the final measure of
dissimilarity between two data points is a weighted sum of standard distances
over subsets of features. In our house price dataset for example, we can measure
the difference between numbers of bedrooms and baths with Manhattan distance and
the difference between house and lot sizes with Euclidean distance, giving twice
as much weight to the latter.

```python
distance_params = [[['bedroom', 'bath'], 'manhattan', 1],
                   [['size', 'lot'], 'euclidean', 2]]
model = gl.nearest_neighbors.create(sf, distance=distance_params)
model.summary()
```
```no-highlight
Class                         : NearestNeighborsModel

Attributes
----------
Distance                      : composite
Method                        : brute force
Number of examples            : 15
Number of feature columns     : 4
Number of unpacked features   : 4
Total training time (seconds) : 0.0029
```

With the addition of composite distances, we no longer need to specify
homogeneous feature types. In fact, if we specify the distance parameter as
``auto``, a composite distance is created where each type of feature is paired
with the most appropriate distance function.

Another important choice in model creation is the **method**. The
``brute_force`` method computes the distance between a query point and *each* of
the reference points, with a run time linear in the number of reference points.
Creating a model with the ``ball_tree`` method takes more time, but leads to
much faster queries by partitioning the reference data into successively smaller
balls and searching only those that are relatively close to the query.  The
default method is ``auto`` which chooses a reasonable method based on both the
feature types and the selected distance function. The method parameter is also
specified when the model is created. The third row of the model summary confirms
our choice to use the ball tree in the next example.

```python
model = gl.nearest_neighbors.create(sf, features=['bedroom', 'bath', 'size'],
                                    method='ball_tree', leaf_size=5)
model.summary()
```
```no-highlight
Class                         : NearestNeighborsModel

Attributes
----------
Distance                      : euclidean
Method                        : ball tree
Number of examples            : 15
Number of feature columns     : 3
Number of unpacked features   : 3
Total training time (seconds) : 0.012

Ball Tree Attributes
--------------------
Tree depth                    : 3
Leaf size                     : 5
```

If the ball tree is used, it's important to choose an appropriate value for the
'leaf_size' parameter, which controls how many observations are stored in each
leaf of the ball tree. By default, this is set so that the tree is no more than
12 levels deep, but larger or smaller values may lead to quicker queries
depending on the shape and dimension of the data. Our houses example only has 15
rows, so the ``leaf_size`` parameter (and the ``ball_tree`` method for that
matter) are not too useful, but for illustration purposes we set the leaf size
to 5 above.