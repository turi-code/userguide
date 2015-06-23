#Topic Models 
"Topic models" are a class of statistical models for text data. These models typically assume documents can be described by a small set of topics, and there is a probability of any word occurring for a given "topic".

For example, suppose we are given the documents shown below, where the first document begins with the text "The burrito was terrible. I..." and continues with a long description of the eater's woes. A topic model attempts to do two things:

1. Learn "topics": collections of words that co-occur in a meaningful way (as shown by the colored word clouds).
2. Learn how much each document pertains to each topic. This is represented by the colored circles, where larger circles indicate larger probabilities.

![topic_model](images/topic_model.png)

There are many variations of topic models that incorporate other sources of data, and there are a variety of algorithms for learning the parameters of the model from data. This section focuses on creating and using topic models with GraphLab Create.

##### Creating a model

The following example includes the  SArray of documents that we created in previous sections: Each element represents a document in "bag of words" representation -- a dictionary with word keys and whose values are the number of times that word occurred in the document. Once in this form, it is straightforward to learn a topic model.


```python
# Download data if you haven't already
import graphlab as gl
import os

if os.path.exists('wikipedia_w0'):
    docs = gl.SFrame('wikipedia_w0')
else:
    docs = gl.SFrame.read_csv('http://s3.amazonaws.com/dato-datasets/wikipedia/raw/w0.csv', header=False)
    docs.save('wikipedia_w0')

# Remove stopwords and convert to bag of words
docs = gl.text_analytics.count_words(docs['X1'])
docs = docs.dict_trim_by_keys(gl.text_analytics.stopwords(), exclude=True)

# Learn topic model
m = gl.topic_model.create(docs)
```

There are a variety of additional arguments available which are covered in the [API Reference](https://dato.com/products/create/docs/generated/graphlab.topic_model.create.html). The two most commonly used arguments are:

 - `num_topics`: Changes the number of topics to learn.
 - `num_iterations`: Changes how many iterations to perform.

The returned object is a TopicModel object, which exposes several useful methods. For example, [graphlab.topic_model.TopicModel.get_topics()](https://dato.com/products/create/docs/generated/graphlab.topic_model.TopicModel.get_topics.html) returns an SFrame containing the most probable words for each topic and a score related to how high that word ranks for that topic.

You may get details on a subset of topics by supplying a list of topic names or topic indices, as well as restrict the number of words returned per topic.


```python
print m.get_topics()
```
```
Columns:
topic   int
word    str
score   float

Rows: 50

Data:
+-------+--------+------------------+
| topic |  word  |      score       |
+-------+--------+------------------+
|   0   |  team  | 0.0136297268967  |
|   0   |  year  | 0.0104321717128  |
|   0   |  won   | 0.00947045945792 |
|   0   | world  | 0.00824050916636 |
|   0   | games  | 0.00753046730465 |
|   1   | south  | 0.0141457234255  |
|   1   |  town  | 0.0117033932114  |
|   1   | people | 0.00798413922024 |
|   1   | family | 0.00795199007715 |
|   1   |  east  | 0.00790276170179 |
|  ...  |  ...   |       ...        |
+-------+--------+------------------+
[50 rows x 3 columns]
Note: Only the head of the SFrame is printed.
You can use print_rows(num_rows=m, num_columns=n) to print more rows and columns.

```

If we just want to see the top words per topic, this code snippet will rearrange the above SFrame to do that.

```python
print m.get_topics(output_type='topic_words')
```

```
['club', 'league', 'year', 'family', 'time']
['season', 'team', 'time', 'world', 'played']
['town', 'age', 'people', 'years', 'area']
['river', 'north', 'war', 'british', 'army']
['building', 'state', 'united', 'police', 'act']
['album', 'band', 'company', 'film', 'song']
['system', 'game', 'games', 'number', 'show']
['president', 'life', 'made', 'released', 'general']
['party', 'national', 'state', 'members', 'government']
['high', 'city', 'school', 'students', 'university']
```

The model object keeps track of various useful statistics about how the model was trained and its current status.

```python
m
```

```
Topic Model
    Data:
        Vocabulary size:     632779
    Settings:
        Number of topics:    10
        alpha:               5.0
        beta:                0.1
        Iterations:          10
        Verbose:             False
    Accessible fields:
        m['topics']          An SFrame containing the topics.
        m['vocabulary']      An SArray containing the topics.
    Useful methods:
        m.get_topics()       Get the most probable words per topic.
        m.predict(new_docs)  Make predictions for new documents.

```

To predict the topic of a given document, one can get an SArray of integers containing the most probable topic ids:

```python
pred = m.predict(docs)
```

Combining the above method with standard SFrame capabilities, one can use predict to find documents related to a particular topic

```
documents[m.predict(docs) == topic_id]
```

or join with other data in order to analyze an author's typical topics or how topics change over time. For example, if we had author and timestamp data, we could do the following:

```
doc_data.column_names()
['timestamp', 'author', 'text']
m = topic_model.create(doc_data['text'])
doc_data['topic'] = m.predict(doc_data['text'])
doc_data['author'][doc_data['topic'] == 1] # authors of docs in topic 1
```

Sometimes you want to know how certain the model's predictions are. One can optionally also get the probability of each topic for a set of documents. Each element of the returned SArray is a vector containing the probability of each document.


```python
pred = m.predict(docs, output_type='probability')
```


##### Working with TopicModel objects

The value for each metadata field listed in ```m.get_fields()``` is accessible via ```m[field]```.


A topic model will learn parameters for every word that is present in the corpus. The "vocabulary" stored by the model will return this list of words.

```python
m['vocabulary']
```
```
dtype: str
Rows: 170715
['house', 'krainiks', 'america', 'appointed', 'gala', 'general', 'daughter', 'roles', 'lyric', 'arts', 'director', 'opera', 'native', 'career', 'leadership', 'norwegian', 'served', 'krainik', 'pavarotti', 'manitowoc', 'northwestern', 'odp', 'national', 'finalist', '2003', 'thomas', 'played', 'allcounty', 'team', 'state', 'florida', 'led', 'december', 'goals', '34', 'american', '41', 'high', '2', 'st', 'school', 'plantation', 'south', '1', 'honors', 'named', 'year', 'earned', 'record', 'district', 'assists', 'fla', '2004', 'owen', 'client', 'father', 'learn', 'marry', 'left', 'visit', 'donegal', 'leaves', 'gerhardt', 'beret', 'red', 'asianamerican', 'time', 'coming', 'beatrice', 'roger', 'siri', 'eventually', 'rescues', 'exhusband', '1991', 'gulf', 'car', 'war', 'visits', 'suburban', 'city', 'inherited', 'rich', 'live', 'rescued', 'ends', 'pay', 'husband', 'calls', 'accident', 'day', 'spend', 'hoffmanns', 'pryde', 'owner', 'pres', 'agrees', 'angry', 'attends', 'jared', ... ]
```

Similarly, we can obtain the current parameters for each word by requesting the "topics" stored by the model. Each element of the "topic_probabilities" column contains an array with length ```num_topics``` where element $k$ is the probability of that word under topic $k$.


```python
m['topics']
```

```
Columns:
topic_probabilities     array
vocabulary      str

Rows: 632779

Data:
+--------------------------------+------------------------+
|      topic_probabilities       |       vocabulary       |
+--------------------------------+------------------------+
| array('d', [7.889354018974 ... |      information       |
| array('d', [7.889354018974 ... |        freebsd         |
| array('d', [7.889354018974 ... |         linux          |
| array('d', [7.889354018974 ... |        supports        |
| array('d', [7.889354018974 ... |        windows         |
| array('d', [7.889354018974 ... |          php           |
| array('d', [7.889354018974 ... |         mysql          |
| array('d', [7.889354018974 ... | suspensionreenablement |
| array('d', [7.889354018974 ... |       additions        |
| array('d', [7.889354018974 ... |        resource        |
|              ...               |          ...           |
+--------------------------------+------------------------+
[632779 rows x 2 columns]
Note: Only the head of the SFrame is printed.
You can use print_rows(num_rows=m, num_columns=n) to print more rows and columns.
```

As with other models in GraphLab Create, it's also easy to save and load models.

```python
m.save('my_model')
m2 = graphlab.load_model('my_model')
```


##### Importing from other formats

In some cases your data my in a format that some refer to as "docword"
format, where each row in the text file contains a document id, a word id, and the number
of times that word occurs in that document. For this situation, check out the
`parse_docword` utility:

```
docs = graphlab.text_analytics.parse_docword(doc_word_file, vocab_file)
```

##### Initializing from other models

It is also easy to create a new topic model from an old one – whether it was created using GraphLab Create or another package.


```python
m2 = graphlab.topic_model.create(docs,
                                 num_topics=m['num_topics'],
                                 initial_topics=m['topics'])
```

##### Seeding the model with prior knowledge

To manually fix several words to always be assigned to a topic, use the associations argument. This can be useful for experimentation purposes:

For example, the following will ensure that "recognition" will have a high probability under topic 0:

```python
associations = graphlab.SFrame({'word':['recognition'],
                                'topic': [0]})
```

If we fit a topic model using this option, we indeed find that "recognition" is present in topic 0, and we find other related words such as "speech" in the same topic. This is unsurprising for this corpus of machine learning abstracts since "speech recognition" is a common phrase.

```python
m2 = graphlab.topic_model.create(docs,
                                 num_topics=20,
                                 num_iterations=50,
                                 associations=associations,
                                 verbose=False)
```
```
PROGRESS: Running collapsed Gibbs sampling
PROGRESS:  Iteration Tokens/second Seconds/iter Perplexity
PROGRESS:          5        464119     0.491813    2219.54
PROGRESS:         10        515565     0.443252    2116.41
PROGRESS:         15        548836     0.427076    2043.09
PROGRESS:         20        552304     0.427512    1984.96
PROGRESS:         25        554642     0.421929    1942.93
PROGRESS:         30        558313     0.419381     1912.7
PROGRESS:         35        567691     0.411404    1887.41
PROGRESS:         40        570496     0.411835    1862.76
PROGRESS:         45        489016     0.482391    1846.65
```

```python
m2.get_topics(num_words=10)
```
```
Columns:
topic   int
word    str
score   float

Rows: 200

Data:
+-------+----------------+-----------------+
| topic |      word      |      score      |
+-------+----------------+-----------------+
|   0   |    network     | 0.0933487986426 |
|   0   |  recognition   | 0.0369355681344 |
|   0   |     system     | 0.0228250710557 |
|   0   |     speech     | 0.0221732274407 |
|   0   |      word      | 0.0213200791798 |
|   0   |     neural     | 0.0206394777582 |
|   0   |   classifier   | 0.0153863850958 |
|   0   |     vector     | 0.0125681200543 |
|   0   | classification | 0.0124818466346 |
|   0   |    features    |  0.012414745086 |
|  ...  |      ...       |       ...       |
+-------+----------------+-----------------+
[200 rows x 3 columns]
Note: Only the head of the SFrame is printed.
You can use print_rows(num_rows=m, num_columns=n) to print more rows and columns.
```

##### Evaluating topic models

A common quantitative way to evaluate topic models is to split each document into a training set and a test set, learn a topic model on the training portion of each document, and compute the probability of the heldout word counts under the model. A slight variation of this probability is called "perplexity". Lower values are better. Estimates of this quantity are provided during training. See [graphlab.text_analytics.util.random_split](https://dato.com/products/create/docs/generated/graphlab.text_analytics.random_split.html), [graphlab.text_analytics.util.perplexity](), [TopicModel.evaluate](https://dato.com/products/create/docs/generated/graphlab.topic_model.TopicModel.evaluate.html) for helper functions to do this sort of evaluation on trained models.

A common way to qualitatively evaluate topic models is to examine the most probable words in each topic and count the number of words that do not fit with the rest. If there are topics with words that do not co-occur in your corpus, you may want to try:

* removing stop words and other words that are not interesting to your analysis
* changing the number of topics
* increasing the number of iterations

To learn more check out the [API Reference](https://dato.com/products/create/docs/generated/graphlab.topic_model.create.html).
