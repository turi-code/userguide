The
 [GraphLab clustering toolkit](https://dato.com/products/create/docs/graphlab.toolkits.clustering.html)
provides tools for unsupervised learning problems, where the aim is to
consolidate unlabeled data points into groups based on how similar the points
are to each other. The only clustering algorithms presently available are k-means and hierarchical k-means.
Our implementations of k-means and hierarchical k-means use
 [k-means++](http://en.wikipedia.org/wiki/K-means%2B%2B)
and
 [reservoir sampling](http://www.geeksforgeeks.org/reservoir-sampling/)
respectively to choose initial clusters.

##K-Means
In this section, we explore a medical dataset from a June 2014 Kaggle
competition using k-means clustering. The dataset can be found at [MLSP 2014
Schizophrenia Classification Challenge](https://www.kaggle.com/c/mlsp-2014-mri),
which is the Kaggle page for the IEEE International Workshop on Machine Learning
for Signal Processing.

The original data consisted of two sets of features: functional network
connectivity (FNC) features and source-based morphometry (SBM) features. A
detailed description of these features is available at the Kaggle URL linked
above.

We incorporate both types of features into a single
[SFrame](https://dato.com/products/create/docs/generated/graphlab.SFrame.html).
The CSV containing FNC
features consists of 379 columns, where the first column is an integer ID for
each patient, and the remaining 378 columns are all floating point values. The
SBM data files share the same patient ID field, and have an additional 32
columns of features of type float. To combine the original data into a single
SFrame, we need to use the
[SFrame.join](https://dato.com/products/create/docs/generated/graphlab.SFrame.join.html)
method.

```python
# load FNC features
data_url = 'http://s3.amazonaws.com/dato-datasets/mlsp_2014/train_FNC.csv'
col_types = [int] + [float] * 378
fnc_sf = gl.SFrame.read_csv(data_url, column_type_hints=col_types)

# load SBM features
data_url = 'http://s3.amazonaws.com/dato-datasets/mlsp_2014/train_SBM.csv'
col_types = [int] + [float] * 32
sbm_sf = gl.SFrame.read_csv(data_url, column_type_hints=col_types)

# join all features on the Id column
dataset = fnc_sf.join(sbm_sf, on="Id")
```

For many clustering algorithms including k-means, you need to specify the number
of clusters the algorithm should create. Unfortunately, we rarely know the
correct number of clusters a priori. There is a simple heuristic that often
works quite well for estimating this parameter: $$k \approx \sqrt{n/2}$$ with
n as the number of rows in your dataset.

```python
from math import sqrt

n = len(fnc_sf)
k = int(sqrt(n / 2.0))

del dataset["Id"] # delete 'Id' column to exclude it from feature set

model = gl.kmeans.create(dataset, num_clusters=k)
```

For large datasets, this training process can be very time-consuming. The
problem of partitioning *n* items into *k* clusters based on an item's distance
from the cluster mean is
 [NP-hard](http://en.wikipedia.org/wiki/NP-hard). There are a few tricks one might
employ to reduce the running time of the algorithm. One such improvement is to
reduce the total number of iterations required for convergence by making our
initial cluster assignments more accurate. This is precisely why our implementation
initializes cluster centers with the k-means++ algorithm. Here are a few other tips
for reducing the overall running time:

  - Cluster a sample of the original dataset.
  - Do some initial feature selection to reduce the feature space to the most
  discriminative features.

The model exposes two fields to help us understand how the algorithm has
clustered the data. The first is the `cluster_id` field, which gives us an
SFrame containing one row for each record in our input dataset. Each row of
`cluster_id` has a cluster assignment (an integer 0 to k, exclusive) and a
distance, which is the [euclidean
distance](http://en.wikipedia.org/wiki/Euclidean_distance) between the data
point and its cluster's center.

```python
model['cluster_id']
```

```no-highlight
    cluster_id    distance
0           3   6.591738
1           1   6.163163
2           3   7.194580
3           2   7.371710
4           4   7.303070
5           2   7.882903
6           4   6.130990
7           1   6.615896
8           3   8.299443
9           0   5.236333
10          1   9.129009
11          2   6.777277
12          4   6.796411
13          1   6.762669
14          3   6.384697
15          3   8.058596
16          1   6.773928
17          2   6.030693
18          2   7.900586
19          1   7.639997
20          2   7.767107
21          2   6.653062
22          4   8.572708
23          2   7.379239
24          2   6.338177
          ...        ...

[86 rows x 2 columns]
```

Equally interesting and useful for doing any post-hoc analysis is the
`cluster_info` field, which consists of another SFrame containing k rows (one
row per cluster). Each of these rows has a dimensionality equal to the input
dataset (ie. 378 FNC features + 32 SBM features + 1 ID), with values
representing the center of the corresponding cluster. Each row of the
`cluster_info` SFrame also contains the cluster ID number, the sum of distances
from all cluster members to the cluster cluster, and the number of data points
assigned to that cluster.

Here we print just the first 5 columns of the cluster info SFrame for the
purpose of illustration, followed by the cluster metadata.

```python
model['cluster_info'].print_rows(num_columns=5)
```
<div style="max-height:1000px;max-width:1500px;overflow:auto;"><table frame="box" rules="cols">
    <tr>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">FNC1</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">FNC2</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">FNC3</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">FNC4</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">FNC5</th>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.29645625</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.18360825</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">-0.031482</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">-0.22433625</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.27823125</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.214121916667</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.103074</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">-0.0531845833333</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.0384319166667</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.246585041667</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.176196448276</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">-0.0303982758621</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">-0.184082458621</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">-0.176179551724</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.123517862069</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.150637533333</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">-0.0209958666667</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">-0.0950924666667</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">-0.153809926667</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.0386812133333</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.3431122</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.23126</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">-0.0018778</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.04711628</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.100756</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.3168948</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.0628264</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.0947642</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">-0.15517396</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0.1654592</td>
    </tr>
</table>
[6 rows x 5 columns]<br/>
</div>


```python
model['cluster_info'][['cluster_id', '__within_distance__', '__size__']]
```
<div style="max-height:1000px;max-width:1500px;overflow:auto;"><table frame="box" rules="cols">
    <tr>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">cluster_id</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">__within_distance__</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">__size__</th>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">0</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">55.0737148571</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">8</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">167.069080727</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">24</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">213.064455321</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">29</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">108.468702579</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">15</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">4</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">33.149361302</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">5</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">5</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">38.8373819666</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">5</td>
    </tr>
</table>
[6 rows x 3 columns]<br/>
</div>

##Hierarchical K-Means

###What you'll need for this example
In this section, we explore a dataset of vector space embeddings of words from 
the word2vec project at Google Research using hierarchical k-means. The dataset 
can be found at [word2vec](https://code.google.com/p/word2vec/), which is the 
Google Code page for the Google Research project. To repeat the experiments 
shown in this section, you will also need [gensim](https://radimrehurek.com/gensim/). 
Gensim's [word2vec implementation](https://radimrehurek.com/gensim/models/word2vec.html)
is quite easy to use and provides utilities for unpacking the word2vec binary files.

###The data
The data consists of real-valued vectors of 300 dimensions, each corresponding to a 
unique string observed in a 100 billion word data set. There is one vector per unique 
string. The vectors are acquired by running the word2vec algorithm on a corpus. The 
word2vec algorithm is a log-bilinear language model. Details can be found at the 
Google Code project page linked above. 

 > NOTE: It is important to keep in mind that the representations produced by log-
 bilinear models consistent latent variables with no interpretable, real-world meaning.

We use the gensim utility to unpack the vectors into Python lists of floats, then 
enter each word:list[float] pair its own row of an
[SFrame](https://dato.com/products/create/docs/generated/graphlab.SFrame.html).

```python
# load FNC features
data_url = 'http://s3.amazonaws.com/dato-datasets/mlsp_2014/train_FNC.csv'
col_types = [int] + [float] * 378
fnc_sf = gl.SFrame.read_csv(data_url, column_type_hints=col_types)

# load SBM features
data_url = 'http://s3.amazonaws.com/dato-datasets/mlsp_2014/train_SBM.csv'
col_types = [int] + [float] * 32
sbm_sf = gl.SFrame.read_csv(data_url, column_type_hints=col_types)

# join all features on the Id column
dataset = fnc_sf.join(sbm_sf, on="Id")
```
