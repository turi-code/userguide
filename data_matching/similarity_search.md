#Similarity Search
**Similarity search** is the task of matching complex data objects like images
and documents. Like [nearest neighbors search](https://dato.com/products/create/
docs/graphlab.toolkits.nearest_neighbors.html), similarity search matches query
items to a fixed reference set, but similarity search allows the input data to
be in a raw form, such as images, documents, or combinations of the two.
Similarity search is also similar to [autotagging](https://dato.com/products/create/docs/generated/graphlab.data_matching.autotagger.create.html), but for autotagging the
reference tags are always entered in the form of a table; similarity search is
more general.

*The Similarity Search toolkit encapsulates in a single framework the entire
process of type detection, feature engineering, and search.* For quick
prototyping, the toolkit intelligently detects the type of input data and
selects an appropriate pre-trained model for converting complex data objects
into numeric features. For more customized usage, users can inspect and modify
each of the individual steps.

The initial version of the similarity search toolkit focuses exclusively on
matching query images to reference images. In future versions, the toolkit will
also handle documents and combinations of images and documents. *Feedback is
most welcome: help us make this tool as useful as possible!*

##### MNIST Digits Example 
To illustrate usage of the similarity search toolkit, we use a small subset of
the [MNIST handwritten digits image dataset](https://en.wikipedia.org/wiki/MNIST_database), 
which is downloaded from the public Dato datasets bucket on Amazon S3. The
download is about 1.5 MB.

```python
import os
import graphlab as gl

## Download and/or load image data
if os.path.exists('mnist_train6k'):
    mnist = gl.SFrame('mnist_train6k')
else:
    mnist = gl.SFrame('http://s3.amazonaws.com/dato-datasets/mnist/sframe/train6k')
    mnist.save('mnist_train6k')
```

The dataset is very simple: each row contains a GraphLab Create Image object and
the number shown in the image.

```python
mnist.print_rows(5)
```
```no-highlight
+-------+----------------------+
| label |        image         |
+-------+----------------------+
|   5   | Height: 28 Width: 28 |
|   8   | Height: 28 Width: 28 |
|   1   | Height: 28 Width: 28 |
|   4   | Height: 28 Width: 28 |
|   2   | Height: 28 Width: 28 |
+-------+----------------------+
[6000 rows x 2 columns]
```

The simplest way to construct a similarity search model is to let the toolkit
use a default neural net model for converting the images into numeric vectors.
The only required arguments are the reference dataset and the name of the column
containing images.

```python
search_model = gl.similarity_search.create(mnist, features='image')
```

While this model is very simple to code, it can be quite slow to create. The
model downloads a 500MB pre-trained 
[ImageNet neural net classifier model](https://dato.com/products/create/docs/graphlab.toolkits.deeplearninghtml#builtin-neuralnets) from
the public Dato datasets Amazon S3 bucket, and then modifies the images to work
with the model.

A more sophisticated way to create a similarity search model is to construct a
new neural net classifier tailored to the data of interest, then pass this model
explicitly to the similarity search toolkit.

```python
nn_model = gl.neuralnet_classifier.create(mnist, target='label')
search_model2 = gl.similarity_search.create(mnist, features='image',
                                            feature_model=nn_model) 
search_model2.summary()
```
```no-highlight
Class                         : SimilaritySearchModel

Schema
------
Number of reference examples  : 6000

Training
--------
Method                        : lsh
Total training time (seconds) : 3.4045
```

The model summary shows that the default search method is `lsh`, short for
[locality-sensitive hashing](https://en.wikipedia.org/wiki/Locality-sensitive_hashing). 
In the model creation step, all reference images are assigned to a bucket by
passing them through a set of hash functions designed to approximate cosine
distance. A query image is then passed through the same hash functions,
assigning it to one of the original buckets. The reference images in that bucket
are candidate neighbors and are then compared to the query and ranked by
computing the exact cosine distance.

The LSH method makes queries very fast, but yields a set of similar items that
is **approximate**, in that some results may not very similar, and some similar
items may not be returned. For exact results, the `method` parameter can be set
to `brute_force` when the model is created. For this example, we stick with
locality-sensitive hashing, and find the three most similar items for the first
four images in our training set.

```python
sim_items = search_model2.search(mnist[:4], k=3)
sim_items.print_rows(12)
```
```no-highlight
+-------------+-----------------+--------------------+------+
| query_label | reference_label |      distance      | rank |
+-------------+-----------------+--------------------+------+
|      0      |        0        | -2.22044604925e-16 |  1   |
|      0      |       2308      | 6.42280780891e-05  |  2   |
|      0      |       2762      | 0.000111448855981  |  3   |
|      1      |        1        |        0.0         |  1   |
|      1      |       5796      | 0.000101432998189  |  2   |
|      1      |       859       | 0.000116476316971  |  3   |
|      2      |        2        | 1.11022302463e-16  |  1   |
|      2      |       918       |  0.00013260851351  |  2   |
|      2      |       5907      | 0.000174541914201  |  3   |
|      3      |        3        |        0.0         |  1   |
|      3      |       4426      |  0.00010230738112  |  2   |
|      3      |       5344      | 0.000183852540399  |  3   |
+-------------+-----------------+--------------------+------+
[12 rows x 4 columns]
```

Our first sanity check is that the most similar item to each query is itself -
success! To check the rest of the results, we join the original labels and
images to the similarity search results.

```python
mnist = mnist.add_row_number('id')
sim_items = sim_items.join(mnist, on={'reference_label': 'id'}, how='left')
sim_items = sim_items.sort(['query_label', 'reference_label'])
sim_items.print_rows(12, max_row_width=120)
```
```no-highlight
+-------------+-----------------+--------------------+------+-------+----------------------+
| query_label | reference_label |      distance      | rank | label |        image         |
+-------------+-----------------+--------------------+------+-------+----------------------+
|      0      |        0        | -2.22044604925e-16 |  1   |   5   | Height: 28 Width: 28 |
|      0      |       2308      | 6.42280780891e-05  |  2   |   7   | Height: 28 Width: 28 |
|      0      |       2762      | 0.000111448855981  |  3   |   9   | Height: 28 Width: 28 |
|      1      |        1        |        0.0         |  1   |   8   | Height: 28 Width: 28 |
|      1      |       859       | 0.000116476316971  |  3   |   0   | Height: 28 Width: 28 |
|      1      |       5796      | 0.000101432998189  |  2   |   8   | Height: 28 Width: 28 |
|      2      |        2        | 1.11022302463e-16  |  1   |   1   | Height: 28 Width: 28 |
|      2      |       918       |  0.00013260851351  |  2   |   1   | Height: 28 Width: 28 |
|      2      |       5907      | 0.000174541914201  |  3   |   6   | Height: 28 Width: 28 |
|      3      |        3        |        0.0         |  1   |   4   | Height: 28 Width: 28 |
|      3      |       4426      |  0.00010230738112  |  2   |   5   | Height: 28 Width: 28 |
|      3      |       5344      | 0.000183852540399  |  3   |   4   | Height: 28 Width: 28 |
+-------------+-----------------+--------------------+------+-------+----------------------+
[12 rows x 6 columns]
```

These results appear better than random, but there is substantial room for
improvement. The first option is to do similarity search with the `brute_force`
method, but another likely improvement would be a more powerful neural network
model for the feature engineering step.

