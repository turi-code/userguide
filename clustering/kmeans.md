#K-means

**K-means** finds cluster centers for a predetermined number of clusters ("K")
by minimizing the sum of squared distances from each point to its assigned
cluster. Points are assigned to the cluster whose center is closest.

Lloyd's algorithm is the standard way to compute K-means clusters, and it
describes the essential intuition for the method. After initial centers are
chosen, two steps repeat until the cluster assignment no longer changes for any
point (which is equivalent to the cluster centers no longer moving):

1. Assign each point to the cluster with the closest center.
2. Update each cluster center to the be mean of the assigned points.

The GraphLab Create implementation of K-means uses several wrinkles to improve
the speed of the method and quality of the results. Initial cluster centers are
chosen with the K-means++ algorithm (if not provided explicitly by the user).
This algorithm chooses cluster centers that are far apart with high probability,
which tends to reduce the number of iterations needed for convergence, and make
it less likely that the method returns sub-optimal results.

In addition, GraphLab Create's K-means uses the triangle inequality to reduce
the number of exact distances that need to be computed in each iteration.
Conceptually, if we know that a data point $$x$$ is close to center $$A$$, which
is in turn far from center $$B$$, then there is no need to compute the exact
distance from point $$x$$ to center $$B$$ when assigning $$x$$ to a cluster.


#### Basic usage

We illustrate usage of GraphLab Create K-means with the dataset from the [June
2014 Kaggle competition to classify schizophrenic subjects based on MRI
scans](https://www.kaggle.com/c/mlsp-2014-mri). The original data consists of
two sets of features: functional network connectivity (FNC) features and
source-based morphometry (SBM) features, which we incorporate into a single
[SFrame](https://dato.com/products/create/docs/generated/graphlab.SFrame.html)
with [SFrame.join](https://dato.com/products/create/docs/generated/graphlab.SFra
me.join.html). For convenience the data can be downloaded from our public AWS S3
bucket; the following code snippet does this if the data is not found in the
local working directory.

```python
import os
import graphlab as gl

if os.path.exists('schizophrenia_clean'):
    sf = gl.SFrame('schizophrenia_clean')
else:
    sf_functional = gl.SFrame.read_csv(
        'http://s3.amazonaws.com/dato-datasets/mlsp_2014/train_FNC.csv')
    sf_morphometry = gl.SFrame.read_csv(
        'http://s3.amazonaws.com/dato-datasets/mlsp_2014/train_SBM.csv')

    sf = sf_functional.join(sf_morphometry, on="Id")
    sf = sf.remove_column('Id')   

    sf.save('schizophrenia_clean')
```

The most basic usage of K-means clustering requires only a choice for the number
of clusters, $$K$$. We rarely know the correct number of clusters *a priori*,
but the following simple heuristic sometimes works well:

$$
    K \approx \sqrt{n/2}
$$ 

where $$n$$ is the number of rows in your dataset. By default, the maximum
number of iterations is 10, and all features in the input dataset are used.

```python
from math import sqrt
K = int(sqrt(sf.num_rows() / 2.0))

kmeans_model = gl.kmeans.create(sf, num_clusters=K)
kmeans_model.summary()
```
```no-highlight
Class                           : KmeansModel

Schema
------
Number of clusters              : 6
Number of examples              : 86
Number of feature columns       : 410
Number of unpacked features     : 410

Training Summary
----------------
Training method                 : elkan
Number of training iterations   : 2
Batch size                      : 86
Total training time (seconds)   : 0.2836

Accessible fields               : 
   cluster_id                   : An SFrame containing the cluster assignments.
   cluster_info                 : An SFrame containing the cluster centers.
```

The model summary shows the usual fields about model schema, training time, and
training iterations. It also shows that the K-means results are returned in two
SFrames contained in the model; there is no need to call a separate predict or
query method as with many supervised models. The `cluster_info` SFrame indicates
the final cluster centers, one per row, in terms of the same features used to
create the model.

```python
kmeans_model['cluster_info'].print_rows(num_columns=5, max_row_width=80,
                                        max_column_width=10)
```
```no-highlight
+-----------+-----------+-----------+------------+-----------+-----+
|    FNC1   |    FNC2   |    FNC3   |    FNC4    |    FNC5   | ... |
+-----------+-----------+-----------+------------+-----------+-----+
|  0.24935  | 0.1910... | -0.052... | -0.209...  | 0.2108... | ... |
| 0.2657... | 0.1496... | -0.064885 | -0.0159845 | 0.2050... | ... |
| 0.2294... | 0.0468... | -0.083... | -0.001...  | 0.2293... | ... |
| 0.1448524 | -0.073752 | -0.143306 |  -0.2104   |  0.26996  | ... |
|  0.37518  | 0.0692715 |  0.314985 | -0.2189335 | -0.001041 | ... |
| 0.1416... | -0.036... | -0.153... | -0.215...  | 0.0075653 | ... |
+-----------+-----------+-----------+------------+-----------+-----+
[6 rows x 413 columns]
```

The last three columns of the `cluster_info` SFrame indicate metadata about the
corresponding cluster: ID number, number of points in the cluster, and the
within-cluster sum of squared distances to the center.

```python
kmeans_model['cluster_info'][['cluster_id', 'size', 'sum_squared_distance']]
```
```no-highlight
+------------+------+----------------------+
| cluster_id | size | sum_squared_distance |
+------------+------+----------------------+
|     0      |  9   |     419.09369278     |
|     1      |  14  |    701.154155731     |
|     2      |  32  |    1779.06003189     |
|     3      |  5   |    207.496253967     |
|     4      |  2   |    65.7113265991     |
|     5      |  24  |    1463.26512146     |
+------------+------+----------------------+
[6 rows x 3 columns]
```

The `cluster_id` field of the model shows the cluster assignment for each input
data point, along with the Euclidean distance from the point to its assigned
cluster's center.

```python
kmeans_model['cluster_id'].head()
```
```no-highlight
+--------+------------+---------------+
| row_id | cluster_id |    distance   |
+--------+------------+---------------+
|   0    |     5      | 6.66008281708 |
|   1    |     2      | 6.27191209793 |
|   2    |     0      | 6.47308111191 |
|   3    |     2      | 8.02576828003 |
|   4    |     5      | 8.29527854919 |
|   5    |     0      | 7.80406332016 |
|   6    |     5      | 7.80014944077 |
|   7    |     5      |  6.7954287529 |
|   8    |     3      | 7.58359575272 |
|   9    |     5      | 8.34588241577 |
+--------+------------+---------------+
[86 rows x 3 columns]
```

#### Advanced usage

For large datasets K-means clustering can be a time-consuming method. One simple
way to reduce the computation time is to reduce the number of training
iterations with the `max_iterations` parameter. The model prints a warning
during training to indicate that the algorithm stops before convergence is
reached.

```python
kmeans_model = gl.kmeans.create(sf, num_clusters=K, max_iterations=1)
```
```no-highlight
PROGRESS: WARNING: Clustering did not converge within max_iterations.
```

It can also save time to set the initial centers manually, rather than having
the tool choose the initial centers automatically. These initial centers can be
chosen randomly from a sample of the original dataset, then passed to the final
K-means model.

```python
kmeans_sample = gl.kmeans.create(sf.sample(0.2), num_clusters=K, 
                                 max_iterations=0)

my_centers = kmeans_sample['cluster_info']
my_centers = my_centers.remove_columns(['cluster_id', 'size', 
                                        'sum_squared_distance'])

kmeans_model = gl.kmeans.create(sf, initial_centers=my_centers)
```

For really large datasets, the tips above may not be enough to get results in a
reasonable amount of time; in this case, we can switch to **minibatch K-means**,
using the same GraphLab Create model. The `batch_size` parameter indicates how
many randomly sampled points to use in each training iteration when updating
cluster centers. Somewhat counter-intuitively, the results for minibatch K-means
tend to be very similar to the exact algorithm, despite typically using only a
small fraction of the training data in each iteration. Note that for the
minibatch version of K-means, the model will always compute a number of
iterations equal to `max_iterations`; it does not stop early.

```python
kmeans_model = gl.kmeans.create(sf, num_clusters=K, batch_size=30,
                                max_iterations=10)
kmeans_model.summary()
```
```no-highlight
Class                           : KmeansModel

Schema
------
Number of clusters              : 6
Number of examples              : 86
Number of feature columns       : 410
Number of unpacked features     : 410

Training Summary
----------------
Training method                 : minibatch
Number of training iterations   : 10
Batch size                      : 30
Total training time (seconds)   : 0.3387

Accessible fields               : 
   cluster_id                   : An SFrame containing the cluster assignments.
   cluster_info                 : An SFrame containing the cluster centers.
```

The model summary shows the training method here is "minibatch" with our
specified batch size of 30, unlike the previous model which used the "elkan"
(exact) method with a batch size of 86 - the total number of examples in our
dataset.


#### References and more information

- [Wikipedia - k-means
  clustering](http://en.wikipedia.org/wiki/K-means_clustering>)

- Artuhur, D. and Vassilvitskii, S. (2007) [k-means++: The Advantages of Careful
  Seeding](http://ilpubs.stanford.edu:8090/778/1/2006-13.pdf). In Proceedings of
  the Eighteenth Annual ACM-SIAM Symposium on Discrete Algorithms. pp.
  1027-1035.

- Elkan, C. (2003) [Using the triangle inequality to accelerate k-means]
  (http://www.aaai.org/Papers/ICML/2003/ICML03-022.pdf). In Proceedings of the
  Twentieth International Conference on Machine Learning, Volume 3, pp. 147-153.

- Sculley, D. (2010) [Web Scale K-Means
  Clustering](http://www.eecs.tufts.edu/~dsculley/papers/fastkmeans.pdf). In
  Proceedings of the 19th International Conference on World Wide Web. pp.
  1177-1178
