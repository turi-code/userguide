#Exercises 
The data for these exercises is culled from [Wikipedia's Database Download](http://en.wikipedia.org/wiki/Wikipedia:Database_download). Wikipedia's text and many of its images are co-licensed under the [Creative Commons Attribution-Sharealike 3.0 Unported License (CC-BY-SA)](http://creativecommons.org/licenses/by-sa/2.5/).

Load the first Wikipedia text file called "w0". Each line in the document
represents a single document and there is no header line. Name the variable
`documents`.


```python
# Downloads the data from S3 if you haven't already.
import os
if os.path.exists('wikipedia_w0'):
    documents = graphlab.SFrame('wikipedia_w0')
else:
    documents = graphlab.SFrame.read_csv('http://s3.amazonaws.com/dato-datasets/wikipedia/raw/w0', header=False)
    documents.save('wikipedia_w0')
```

<span style="color:red">**Question 1:**</span>

Create an SArray that represents the documents in "bag-of-words format", where
each element of the SArray is a dictionary with each unique word as a key and
the number of occurrences is the value. *Hint*: look at the text analytics
method [count_words][1].

```python
bow = graphlab.text_analytics.count_words(documents['X1'])
```

<span style="color:red">**Question 2:**</span> Create a trimmed version of this
dataset that excludes all words in each document that occur just once.


```python
docs = bow.dict_trim_by_values(2)
```

<span style="color:red">**Question 3:**</span> Remove all stopwords from the
dataset. *Hint*: you'll find a predefined set of stopwords in [stopwords][2].

```python
docs = docs.dict_trim_by_keys(graphlab.text_analytics.stopwords(), exclude=True)
```

<span style="color:red">**Question 4:**</span> Remove all documents from `docs`
and `documents` that now have fewer than 10 unique words. *Hint*: You can use
SArray's [logical filter][3].


```python
ix = docs.apply(lambda x: len(x.keys()) >= 10)
docs = docs[ix]
```

<span style="color:red">**Question 5:**</span> What proportion of documents have
we removed from the dataset?


```python
1 - ix.mean()
```

##### Topic Modeling

<span style="color:red">**Question 6:**</span> Create a topic model using your processed version of the dataset, `docs`. Have the model learn 30 topics and let the algorithm run for 30 iterations. *Hint*: use the [topic modeling toolkit](https://dato.com/products/create/docs/generated/graphlab.topic_model.TopicModel.html).


```python
m = graphlab.topic_model.create(docs, num_topics=30, num_iterations=30)
```

<span style="color:red">**Question 7:**</span> Print information about the
model.


```python
m
```

<span style="color:red">**Question 8:**</span> Find out how many words the model
has used while learning the topic model.


```python
len(m['vocabulary'])
```

Use the following code to get the top 10 most probable words in each topic. Typically we hope that each list is a cohesive set of words, one that represents a general cluster of topics present in the dataset.

```python
topics = m.get_topics(num_words=10).unstack(['word','score'], new_column_name='topic_words')['topic_words'].apply(lambda x: x.keys())
for topic in topics:
    print topic
```

<span style="color:red">**Question 9:**</span> Predict the topic for the first 5
documents in `docs`.


```python
m.predict(docs[:5])
```

Sometimes it is useful to manually fix words to be associated with a particular topic. For this we can use the `associations` argument.

<span style="color:red">**Question 10:**</span> Create a new topic model that uses the following SFrame which will associate the words "law", "court", and "business" to topic 0. Use `verbose=False`, 30 topics, and let the algorithm run for 20 iterations.


```python
fixed_associations = graphlab.SFrame()
fixed_associations['word'] = ['law', 'court', 'business']
fixed_associations['topic'] = 0
m2 = graphlab.topic_model.create(docs,  
                                 associations=fixed_associations,
                                 num_topics=30, verbose=False, num_iterations=20)
```

<span style="color:red">**Question 11:**</span> Get the top 20 most likely words for topic 0. Ideally, we will see the words "law", "court", and "business". What other words appear to be related to this topic?

```python
m2.get_topics([0], num_words=20)
```

##### Transforming word counts

Remove all the documents from `docs` and `documents` that have 0 words.


```python
tf_idf_docs = graphlab.text_analytics.tf_idf(docs)
```

<span style="color:red">**Question 12:**</span> Use GraphLab Canvas to explore the distribution of TF-IDF scores given to the word "year".


```python
tf_idf_docs.show()
```

<span style="color:red">**Question 13:**</span> Create an SFrame with the following columns:

- `id`: a string column containing the range of numbers from 0 to the number of documents
- `word_score`: the SArray containing TF-IDF scores you created above
- `text`: the original text from each document


```python
doc_data = graphlab.SFrame()
doc_data['id'] = graphlab.SArray(range(len(tf_idf_docs))).astype(str)
doc_data['word_score'] = tf_idf_docs
doc_data['text'] = docs
```

<span style="color:red">**Question 14:**</span> Create a model that allows you to query the nearest neighbors to a given document. Use the `id` column above as your label for each document, and use the `word_score` column of TF-IDF scores as your features. *Hint*: use the new [nearest_neighbors toolkit](https://dato.com/products/create/docs/graphlab.toolkits.nearest_neighbors.html).


```python
nn = graphlab.nearest_neighbors.create(doc_data, label='id', feature='word_score')
```

<span style="color:red">**Question 15:**</span> Find all the nearest documents for the first two documents in the data set.

```python
nearest = nn.query(doc_data.head(2), label='id')
```

<span style="color:red">**Question 16:**</span> Make an SFrame that contains the original text for the query points and the original text for each query's nearest neighbors. *Hint*: Use [SFrame.join](https://dato.com/products/create/docs/generated/graphlab.SFrame.join.html#graphlab.SFrame.join).


```python
nearest_docs = nearest[['query_label', 'reference_label']]
doc_data = doc_data[['id', 'text']]
nearest_docs.join(doc_data, on={'query_label':'id'})\
                .rename({'text':'query_text'})\
                .join(doc_data, on={'reference_label':'id'})\
                .rename({'text':'original_text'})\
                .sort('query_label')[['query_text', 'original_text']]
```


  [1]: https://dato.com/products/create/docs/generated/graphlab.text_analytics.count_words.html
  [2]: https://dato.com/products/create/docs/generated/graphlab.text_analytics.stopwords.html
  [3]: https://dato.com/products/create/docs/generated/graphlab.SArray.__getitem__.html
