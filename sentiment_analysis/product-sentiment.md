# Product sentiment

This toolkit aims to help you explore and summarize sentiment about products within text data. The toolkit enables to search for aspects of interest and obtain summaries of the reviews or sentences with the most positive (or negative) predicted sentiment.

## Summarizing sentiment

As a quick example, suppose we want to summarize people's Comcast complaints. We can use [`graphlab.product_sentiment.create`](https://dato.com/products/create/docs/generated/graphlab.product_sentiment.create.html#graphlab.product_sentiment.create) to build a model that can be queried for summaries of product sentiment:

```python
>>> import graphlab as gl
>>> sf = gl.SFrame('s3://dato-datasets-oregon/comcast_fcc_complaints_apr_june_2015/comcast.csv')
>>> m = gl.product_sentiment.create(sf, features=['Description'], splitby='sentence')
>>> m.sentiment_summary(['billing', 'cable', 'cost', 'late', 'charges', 'slow'])
+---------+----------------+-----------------+--------------+
| keyword |  sd_sentiment  |  mean_sentiment | review_count |
+---------+----------------+-----------------+--------------+
|  cable  | 0.302471264675 |  0.285512408978 |     1618     |
|   slow  | 0.282117103769 |  0.243490314737 |     369      |
|   cost  | 0.283310577512 |  0.197087019219 |     291      |
| charges | 0.164350792173 | 0.0853637431588 |     1412     |
|   late  | 0.119163914305 | 0.0712757752753 |     2202     |
| billing | 0.159655783707 | 0.0697454360245 |     583      |
+---------+----------------+-----------------+--------------+
```

Here we see that there are 369 sentences that mention "slow", and the mean predicted sentiment is 0.243 for these. Overall, it appears the mentions of "billing" and "late" have even lower predicted sentiment.

## Under the hood

In the example above, we created a [`ProductSentimentModel`](https://dato.com/products/create/docs/generated/graphlab.product_sentiment.ProductSentimentModel.html#graphlab.product_sentiment.ProductSentimentModel) using the text in the "Description" column. While creating the model, several operations are completed under the hood:

- a data structure is created that helps facilitate searching for text snippets, including doing a TF-IDF transform of the text and creating an inverted index.
- each piece of text is tokenized into sentences using NLTK's punkt sentence parser.
- a pre-trained sentiment classifier scores all reviews (or sentences) and stores these scores within the model.

Providing `splitby='sentence'` argument when creating the model implies that all analysis should be performed at the sentence-level rather than using the entire text. Thus any calls to sentiment_summary will concern predictions for each sentence, and `get_most_positive` will return sentences rather than the entire review, for instance.

### Internal components

As mentioned above, a trained model is comprised of several internal components.

To obtain the sentiment model, you may do the following. See the <a href="sentiment-analysis.html">sentiment_analysis</a> chapter for more details.
```python
>>> m.sentiment_scorer
Class                           : SentimentAnalysisModel

Data
----
Number of rows                  : 2224

Model
-----
Score column                    : None
Features                        : ['Description']
Method                          : bow-logistic
```

To obtain the model that searches for text snippets, you may do the following:
```python
>>> m.review_searcher
Class                           : SearchModel

Corpus
------
Number of documents             : 37652
Average tokens/document         : 17.8304

Indexing settings
-----------------
BM25 k1                         : 1.5
BM25 b                          : 0.75
TF-IDF threshold                : 0.01

Query expansion settings
------------------------
Number of similar tokens        : 5
Maximum distance                : 0.99
Near match BM25 weight          : 1.0

Index
-----
Number of unique tokens indexed : 10426
Preprocessing time (s)          : 8.3658
Indexing time (s)               : 2.6618
```

## More advanced summarization

Sometimes you may have additional information that you want to use when exploring your text data. For instance you may want the most positive/negative sentences for each unique product, each unique restaurant, etc.

The `groupby` argument allows you to provide a column name of the original data set that should be used to group
the results. The most positive items will be shown for each unique
value found in this column. For instance, this could be the column
containing product names.

```python
>>> data = gl.SFrame('http://s3.amazonaws.com/dato-datasets/coursera/amazon_baby_products/amazon_baby.gl')
>>> data = data.head(10000)[['name', 'review']]
>>> m = gl.product_sentiment.create(data, features=['review'])
>>> m.get_most_negative(['cheap'], groupby='name', k=3)
    +-------------+-----------------+---------+-------------------------------+
    | __review_id | relevance_score | keyword |             review            |
    +-------------+-----------------+---------+-------------------------------+
    |     3315    |  8.98588339337  |  cheap  | I am not really impressed ... |
    |     8503    |   7.742594568   |  cheap  | I purchased this item thin... |
    |     1567    |   11.078843875  |  cheap  | This is a great learning t... |
    |     1553    |  7.55805328553  |  cheap  | The dinosaurs are very goo... |
    |     1929    |  5.21646511143  |  cheap  | With 11 years between my t... |
    |     7332    |  6.16265423577  |  cheap  | lol. I bought this product... |
    |     7235    |  10.7048436718  |  cheap  | I actually can get more mi... |
    |     7284    |  5.10796237053  |  cheap  | I purchased this pump beca... |
    |     2642    |  7.13302228683  |  cheap  | My daughter already has a ... |
    |     2638    |  2.00543732422  |  cheap  | My sons are 6.5 months old... |
    +-------------+-----------------+---------+-------------------------------+
    +-------------------+--------------------------------+
    |  sentiment_score  |              name              |
    +-------------------+--------------------------------+
    |   0.987693064592  | 100% Cotton Terry Contour ...  |
    | 0.000968652689596 | 2-in-1 Car Seat Cover `n Carry |
    |   0.989658887194  | Animal Planet's Big Tub of...  |
    |   0.99992863105   | Animal Planet's Big Tub of...  |
    |   0.999956837365  | Avent ISIS Breast Pump wit...  |
    |   0.676748057996  | Avent Isis Manual Breast Pump  |
    |   0.988287661335  | Avent Isis Manual Breast Pump  |
    |   0.999999767378  | Avent Isis Manual Breast Pump  |
    |   0.899418593296  |  BABYBJORN Little Potty - Red  |
    |   0.999999904776  |  BABYBJORN Little Potty - Red  |
    +-------------------+--------------------------------+
```

Note that up to 3 reviews are shown for each unique product where the review mentioned "cheap". A `__review_id` column containing the row numbers from the original data, allowing you to find the original pieces of data corresponding to these predictions.
