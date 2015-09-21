# Deduplication
The GraphLab Create **deduplication** tool ingests data in one or more SFrames
and assigns an entity label to each row. Records with the same label likely
correspond to the same real-world entity.

To illustrate usage of the deduplication tool, we use data about musical albums,
downloaded originally from
<http://hpi.de/de/naumann/projects/data-quality-and-cleansing/annealing-standard.html#c123255>.
For this example, we have extracted a random sample of about 20% of the original
data, and split it into four SFrames based on genre. The preprocessed data can
be downloaded (and saved to your machine) from the Dato public datasets bucket
with the following code. This download is about 7MB.

```python
import os
import graphlab as gl
import graphlab.aggregate as agg

genres = ['rock', 'americana', 'classical', 'misc']
data = {}

for g in genres:
    if os.path.exists('{}_albums'.format(g)):
        print "Loading genre '{}' from local SFrame....".format(g)
        data[g] = gl.load_sframe('{}_albums'.format(g))
    else:
        print "Downloading genre '{}' from S3 bucket....".format(g)
        data[g] = gl.load_sframe(
            'http://s3.amazonaws.com/dato-datasets/dedupe_albums/{}_albums'.format(g))
        data[g].save('{}_albums'.format(g))
```

As usual, our first step is to look at the data:

```python
data['rock'].print_rows(5)
```
```no-highlight
+---------+--------------+-----------------+-------------------------------+
| disc_id | freedbdiscid |   artist_name   |           disc_title          |
+---------+--------------+-----------------+-------------------------------+
|   166   |   1075217    |     Various     |       Mega Hits'80 S-03       |
|   719   |   33670401   |  Dead Can Dance |           Sambatiki           |
|   829   |   34061313   |   Alice Cooper  | Anselmo Valencia Amphithea... |
|   1810  |   51495699   |     Kasabian    |   Kasabian-Ulimate Version-   |
|   2013  |   68222994   | Various Artists |          Fear Candy14         |
+---------+--------------+-----------------+-------------------------------+
+-------------+---------------+-------------+--------------+---------------+
| genre_title | disc_released | disc_tracks | disc_seconds | disc_language |
+-------------+---------------+-------------+--------------+---------------+
|     Rock    |      1994     |      17     |     4200     |      eng      |
| Alternative |      1999     |      1      |     453      |               |
|  Hard Rock  |      2003     |      1      |     1980     |               |
|     Rock    |      2005     |      19     |     4547     |               |
|    Metal    |      2005     |      18     |     4352     |      eng      |
|     ...     |      ...      |     ...     |     ...      |      ...      |
+-------------+---------------+-------------+--------------+---------------+
[23202 rows x 9 columns]
```

For this example, we define a distance that is a weighted sum of Euclidean
distance on the album length (in seconds), weighted Jaccard distance on the
artist name and album title, and Levenshtein distance on the genre. Note that if
you pass a composite distance to the deduplication toolkit, there is no need to
specify the 'features' parameter; the composite distance already defines the
relevant features.

```python
album_dist = [[('disc_seconds',), 'euclidean', 1],
              [('artist_name', 'disc_title'), 'weighted_jaccard', 4],
              [('genre_title',), 'levenshtein', 1]]
```


##### Grouping the data
In any dataset larger than about 10,000 records, grouping the records into
smaller blocks (also known as "blocking") is critical to avoid computing the
distance between all pairs of records.

In this example, we group on the number of tracks on each album ("disc_tracks"),
which means that the toolkit will first split the data into groups each of whose
members have the same number of tracks, then look for approximate matches only
within each group. As of GraphLab Create v1.4, grouping features are specified
with the `grouping_features` parameter; previous versions used the standard
distance "exact" for this purpose, but this flag is no longer enabled.


##### Feature engineering
In the `nearest_neighbors` toolkit, the `weighted_jaccard` distance applies only
to dictionary-type features, but in our `album_dist` we indicated that we want
to apply it to two string-type features ('artist_name' and 'disc_title'). The
deduplication toolkit does several feature engineering steps automatically so
you have less work to do manipulating the data and defining the composite
distance. In particular:

  - String features are cleaned by removing punctuation and extra white space,
    and converting all characters to lower case.

  - Strings are converted to dictionaries with 3-character shingling when used
    with dictionary-based distances (`jaccard`, `weighted_jaccard`, `cosine`,
    and `dot_product`).

  - String features specified for a single distance component are concatenated,
    separated by a space.

  - Missing values are imputed. Missing strings are imputed to be "", while
    missing numeric values are imputed to be the mean value for the appropriate
    feature within the exact match group (see previous section). Note that
    records with missing values in the "exact" match features are ignored in
    model training and assigned entity label "None".

The feature engineering that occurs within the deduplication toolkit does not
alter the input data in any way.


##### Choosing a model
Currently the deduplication toolkit has only one model:
"nearest_neighbor_deduplication", which labels a pair of records as duplicate if
one record is a close neighbor of the other. To resolve the question of
*transitive closure*---A and B are duplicates, B and C are duplicates, but A and
C are not---this model constructs a similarity graph and finds the connected
components. Each connected component corresponds to an entity in the final
output.

In addition to the data and the distance function, the nearest neighbor
deduplication model takes two parameters. If *k* is specified, only the closest
*k* neighbors for a record are considered duplicates, while the *radius*
parameter indicates the maximum distance that a neighbor can be from a record to
still be considered a duplicate. The most typical usage leaves `k` unspecified,
and uses a `radius` that makes sense for the problem and the distance function.

```python
m = gl.nearest_neighbor_deduplication.create(data, row_label='disc_id',
                                             grouping_features=['disc_tracks'],
                                             distance=album_dist,
                                             k=None, radius=3)
```

If two datasets are known to have records that match one-to-one, then setting
`k=2` can be very useful. The `k` parameter is also useful to get preliminary
results when we have no prior intuition about the problem or the distance
function. In addition, the top level `deduplication` create method hides the
parameters, in the expectation that future versions of the toolkit will
automatically choose the best modeling solution.

```python
m2 = gl.deduplication.create(data, row_label='disc_id',
                             grouping_features=['disc_tracks'],
                             distance=album_dist)
```

Returning to our original model, the usual GraphLab Create toolkit functions
give us information about model training and access to the output entity labels.

```python
m.summary()
```
```no-highlight
Class                               : NearestNeighborDeduplication

Schema
------
Number of input datasets            : 4
Number of feature columns           : 4
Number of neighbors per point (k)   : None
Max distance to a neighbor (radius) : 3
Number of entities                  : 129632
Total training time (seconds)       : 268.9886

Training
--------
Total training time (seconds)       : 268.9886

Accessible fields                   :
   entities                         : Consolidated input records plus entity labels.
```

The model's `entities` attribute contains the deduplication results. All input
data rows are appended into a single SFrame, and the column `__entity` indicates
which records correspond to the same entity. Because we specified the datasets
in a dictionary, the keys of that dictionary are used to identify which SFrame
each record comes from; if the data were passed as a list this would be the
index of the list.

##### Aggregating records
The entity labels are not very interesting by themselves; the deduplication
problem typically involves a final step of aggregating records to produce a
final clean dataset with one record per entity. This can be done
straightforwardly with the SFrame groupby-aggregate tool.

In this example we define an aggregator that returns the number of records
belonging to the entity, the mean length of album in seconds, the shortest album
title and the compilation of all constituent genre and artist names.

```python
# add disc title length in number of characters
entities = m['entities']
entities['title_length'] = entities['disc_title'].apply(lambda x: len(x))

# define the aggregation scheme and do the aggregation
album_aggregator = {
    'num_records': agg.COUNT,
    'disc_seconds': agg.MEAN('disc_seconds'),
    'genres': agg.CONCAT('genre_title'),
    'artist_name': agg.CONCAT('artist_name'),
    'title': agg.ARGMIN('title_length', 'disc_title')
}

sf_clean = entities.groupby('__entity', album_aggregator)

# find the dupe IDs
entity_counts = m['entities'].groupby('__entity', agg.COUNT)
dupe_entities = entity_counts[entity_counts['Count'] > 1]['__entity']

# print the results for the dupes
dupes = sf_clean.filter_by(dupe_entities, '__entity')
dupes.print_rows(10, max_row_width=100, max_column_width=50)
```
```no-highlight
+----------+------------------------------------+-------------+--------------+
| __entity |               genres               | num_records | disc_seconds |
+----------+------------------------------------+-------------+--------------+
|  76316   |            [Rock, Rock]            |      2      |    3154.5    |
|  16727   |          [Speech, Speech]          |      2      |    4770.0    |
|  73607   |            [Rock, Rock]            |      2      |    3498.0    |
|  17856   |            [Jazz, Jazz]            |      2      |    2817.0    |
|  25833   |        [Synthpop, Synthpop]        |      2      |    4202.0    |
|  16473   |         [Country, Country]         |      2      |    2055.0    |
|  76742   | [Native American, Native American] |      2      |    4217.0    |
|  80763   |         [Country, Country]         |      2      |    4520.5    |
|  26116   |            [Rock, Rock]            |      2      |    4640.0    |
|  43964   |            [Jazz, Jazz]            |      2      |    3357.0    |
+----------+------------------------------------+-------------+--------------+
+------------------------------------------+-------------------------------------------+
|               artist_name                |                   title                   |
+------------------------------------------+-------------------------------------------+
|        [Cheap Trick, Cheap Trick]        |               Greatest Hits               |
|      [Neville Jason, Neville Jason]      |       The Lives Of The Great Artists      |
|     [Monster Magnet, Monster Magnet]     |                4-Way Diablo               |
|    [Patricia Barber, Patricia Barber]    |                   Split                   |
|            [Various, Various]            | Atmospheric Synthesizer Spectacular Vol.2 |
|            [Various, Various]            |            The Power Of Country           |
| [Paul Ortega, A. Paul Ortega-Two Worlds] |                Three Worlds               |
|   [Marvin Rainwater, Marvin Rainwater]   |          Classic Recordings Disc1         |
|            [Various, Various]            |               Rules Of Rock               |
|          [Woong San, Woomg San]          |              Close Your Eyes              |
+------------------------------------------+-------------------------------------------+
[321 rows x 6 columns]
```

