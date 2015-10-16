#Autotagger
The GraphLab Create **autotagger** tool matches unstructured text queries to a
reference set of strings, a.k.a *tags*, which are known beforehand. Adding tags
to unstructured text gives readers a quick intuition about the content of the
text as well as anchors for quicker navigation and statistical summaries.
Autotagging is closely related to the task of *searching* for user-specified
queries in unstructured text, but it differs in that autotagging is typically
done with a fixed set of tags, and treats the unstructured documents as queries,
rather than the tags.

In this chapter we autotag posts from
[CrossValidated](http://stats.stackexchange.com/), the statistics section of the
Stack Exchange network. Questions posted on this forum are typically annotated
with tags by the authors but responses are not, making it more difficult to
quickly scan responses for the most useful information. The raw data is
available from the [Stack Exchange data
dump](https://archive.org/details/stackexchange). For convenience we provide a
preprocessed subsample (7.8MB) in the public Dato datasets bucket on Amazon S3,
which is downloaded and saved locally with the first code snippet below.

For reference tags we use a lightly-curated [list of statistics topics from
Wikipedia](http://en.wikipedia.org/wiki/List_of_statistics_articles). The
preprocessed list is also available in the Dato-datasets S3 bucket.

```python
import os
import graphlab as gl

## Load unstructured text data
if os.path.exists('stats_overflow_clean'):
    posts = gl.SFrame('stats_overflow_clean')
else:
    posts = gl.SFrame('http://s3.amazonaws.com/dato-datasets/stats_overflow_clean')
    posts.save('stats_overflow_clean')

## Load reference set of statistics topics
if os.path.exists('statistics_topics.csv'):
    topics = gl.SFrame.read_csv('statistics_topics.csv', header=False, delimiter='\n')
else:
    topics = gl.SFrame.read_csv(
        'http://s3.amazonaws.com/dato-datasets/tag_lists/statistics_topics.csv',
        header=False, delimiter='\n')
    topics.save('statistics_topics', format='csv')

topics.rename({'X1': 'topic'})
```

Here's a quick peek at the data in both the reference tags and the
CrossValidated posts. There are 2,737 topics and 11,077 posts, comprising both
original questions and response. The 'PostTypeID' column indicates whether a row
corresponds to a question or a response, and it's clear that the responses
(PostTypeID == 2) have neither tags nor titles.

```python
topics.print_rows(5)
```
```no-highlight
+-------------------------+
|          topic          |
+-------------------------+
|   A priori probability  |
|   Abductive reasoning   |
|    Absolute deviation   |
| Absolute risk reduction |
|  Absorbing Markov chain |
|           ...           |
+-------------------------+
[2737 rows x 1 columns]
```

```python
posts.print_rows(5, max_row_width=100)
```
```no-highlight
+-------------+-------------------------------+------------+--------------+
| AnswerCount |              Body             | ClosedDate | CommentCount |
+-------------+-------------------------------+------------+--------------+
|     None    | Assuming you meant a binom... |    None    |      0       |
|     None    | This is because you are fi... |    None    |      0       |
|     None    | I think I agree, drag/drop... |    None    |      0       |
|     None    | Similar to Weka, you may a... |    None    |      0       |
|     None    | Scortchi and Peter Flom ha... |    None    |      3       |
+-------------+-------------------------------+------------+--------------+
+---------------------------+---------------+------------+-------+------+-------+
|        CreationDate       | FavoriteCount | PostTypeId | Score | Tags | Title |
+---------------------------+---------------+------------+-------+------+-------+
| 2014-06-01 00:03:48+00:00 |      None     |     2      |   3   | None |  None |
| 2014-06-01 00:09:09+00:00 |      None     |     2      |   1   | None |  None |
| 2014-06-01 01:26:06+00:00 |      None     |     2      |   1   | None |  None |
| 2014-06-01 01:29:40+00:00 |      None     |     2      |   0   | None |  None |
| 2014-06-01 01:32:17+00:00 |      None     |     2      |   5   | None |  None |
+---------------------------+---------------+------------+-------+------+-------+
[11077 rows x 10 columns]
```

There is currently only one autotagger model, accessible through the
`graphlab.autotagger.create` call. This method takes the reference tag data and
returns a `NearestNeighborAutoTagger` model, which can then be queried with the
unstructured text data. Under the hood, the model cleans input strings (in both
the tag and query datasets), generates unigrams, bigrams, and 4-character
shingles, and computes the distance between tags and queries with weighted
Jaccard distance.

```python
m = gl.autotagger.create(topics, verbose=False)
m.summary()
```
```no-highlight
Class                               : NearestNeighborAutoTagger

Settings
--------
Number of examples                  : 2732
Number of feature columns           : 3
Total training time (seconds)       : 0.0514
```

There are two key parameters when querying the model: `k`, which indicates the maximum number of tags to return for each query, and `similarity_threshold`, which indicates the minimum similarity from a query document to the tag. A typical pattern is to get preliminary results by setting `k` to 5 and leaving `similarity_threshold` unspecified, then run `tag` again using the `similarity_threshold` parameter for finely-tuned results.

The query documents must be a single column of the query SFrame, so we first concatenate the CrossValidate post titles and bodies.

```python
posts['all_text'] = posts['Title'] + ' ' + posts['Body']
tags = m.tag(posts, query_name='all_text', k=5, similarity_threshold=0.1, 
             verbose=True)
tags.print_rows(10, max_row_width=100, max_column_width=50)
```
```no-highlight
PROGRESS: Starting pairwise querying.
PROGRESS: +--------------+---------+-------------+--------------+
PROGRESS: | Query points | # Pairs | % Complete. | Elapsed Time |
PROGRESS: +--------------+---------+-------------+--------------+
PROGRESS: | 0            | 692     | 0.00228667  | 26.525ms     |
PROGRESS: | 4844         | 1.3e+07 | 43.7346     | 1.02s        |
PROGRESS: | 9692         | 2.6e+07 | 87.4989     | 2.03s        |
PROGRESS: | Done         |         | 100         | 2.29s        |
PROGRESS: +--------------+---------+-------------+--------------+
+-------------+---------------------------------------------------+
| all_text_id |                      all_text                     |
+-------------+---------------------------------------------------+
|      13     | neural network output layer for binary classif... |
|      13     | neural network output layer for binary classif... |
|      13     | neural network output layer for binary classif... |
|      13     | neural network output layer for binary classif... |
|      13     | neural network output layer for binary classif... |
|      37     | Negative predictions for binomial predictions ... |
|      55     | Estimating entropy of multidimensional variabl... |
|      80     | Does the sequence satisfy WLLN? Could you help... |
|      80     | Does the sequence satisfy WLLN? Could you help... |
|      80     | Does the sequence satisfy WLLN? Could you help... |
+-------------+---------------------------------------------------+
+---------------------------------------------------+----------------+
|                       topic                       |     score      |
+---------------------------------------------------+----------------+
|               Binary classification               | 0.15503875969  |
|             Artificial neural network             | 0.107913669065 |
|              One-class classification             | 0.101449275362 |
|                   Neural network                  | 0.100775193798 |
|             Multiclass classification             | 0.10071942446  |
|             Negative predictive value             | 0.104712041885 |
|                Dimension reduction                | 0.101123595506 |
|                Law of large numbers               | 0.197916666667 |
| Independent and identically distributed random... | 0.186046511628 |
|          Convergence of random variables          | 0.177570093458 |
+---------------------------------------------------+----------------+
[1356 rows x 4 columns]
```

Note that the *score* column in the tags output is a *similarity* score, unlike the `radius` parameter in many other tools in GraphLab Create. The similarity in the autotagger is simply 1 minus the weighted jaccard distance, so setting the `similarity_threshold` to 0.1, for example, requires that all output query-tag matches have a weighted jaccard distance of no more than 0.9.  In these particular results we see that that a post that appears to be about "binary classification" indeed receives this topic as its top match, while the post about the weak law of large numbers (WLLN) is appropriately tagged with "Law of large numbers."

Post-processing of the autotagger toolkit generally involves straightforward SFrame operations. For example, suppose we want to compare our model-generated tags to the human-generated ones attached to original question posts. To do this we first *filter* the unstructured dataset of posts by post type, then *unstack* the tags output to get a list of tags for each query in a single row, and finally *join* the original posts to the tags.

```python
tags.rename({'all_text_id': 'id'})
tags = tags[['id', 'topic']].unstack('topic', new_column_name='topics')

posts = posts.add_row_number('id')
tags = tags.join(posts[['Body', 'Title', 'Tags', 'id']], on='id', how='left')

print tags[0]
```
```no-highlight
{'Body': "I'm using a neural network for a binary classification problem. Is it
 better to have one neuron in the output layer or to use two, i.e. one for each
 class? ",
 'Tags': '<machine-learning><neural-networks>',
 'Title': 'neural network output layer for binary classification',
 'id': 13,
 'topics': ['Binary classification',
  'One-class classification',
  'Artificial neural network']}
```

In this particular example, both the human and the autotagger used a neural
networks tag, while the human also attached a more general "machine learning"
tag, and the autotagger included a "binary classification" tag.
