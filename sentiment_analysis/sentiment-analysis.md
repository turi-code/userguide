# Sentiment Analysis

This toolkit allows you to take text and predict whether it contains positive or negative sentiment. For instance, the model will predict "positive sentiment" for a snippet of text -- whether it is a movie review or a tweet -- when it contains words like "awesome" and "fantastic". Likewise, having many words with a negative connotation will yield a prediction of "negative sentiment".

```python
>>> import graphlab as gl
>>> data = gl.SFrame({'text': ['hate it', 'love it']})
>>> m = gl.sentiment_analysis.create(data, features=['text'])
>>> m.predict(data)
dtype: float
Rows: 2
[0.5565335646003744, 0.7532539958283951]
```

Notice that scores closer to 1 represent "positive sentiment", while scores near 0 represent "negative sentiment". These predictions are made using a statistical model trained on review data, and can be a useful
starting point for your application.

## Working with SentimentAnalysisModels

A SentimentAnalysisModel is currently a simple combination of two components:

- feature engineering:  a <a href="../text/analysis.html">bag-of-words</a> transformation
- statistical model: a LogisticClassifier is used to score whether the text contains positive or negative sentiment

After creating the above model, you can inspect it via

```python
>>> m
Class                           : SentimentAnalysisModel

Data
----
Number of rows                  : 2

Model
-----
Score column                    : None
Features                        : ['text']
Method                          : bow-logistic
```

You can list the available attributes via `m.list_fields()`. You will see that the two important internal components can be inspected and used.

```python
# Obtain the function used to process text for the internal classifier.
>>> f = m['feature_extractor']
>>> f(data)
Out[15]:
Columns:
	bow	dict

Rows: 2

Data:
+----------------------+
|         bow          |
+----------------------+
| {'hate': 1, 'it': 1} |
| {'love': 1, 'it': 1} |
+----------------------+
[2 rows x 1 columns]

# Obtain the internal classifier object.
>>> print m['classifier']
Class                         : LogisticClassifier

Schema
------
Number of coefficients        : 2278286
Number of examples            : 1267133
Number of classes             : 2
Number of feature columns     : 1
Number of unpacked features   : 2278285

Hyperparameters
---------------
L1 penalty                    : 0.0
L2 penalty                    : 0.05

Training Summary
----------------
Solver                        : auto
Solver iterations             : 10
Solver status                 : TERMINATED: Iteration limit reached.
Training time (sec)           : 39.9574

Settings
--------
Log-likelihood                : 68620.2104

Highest Positive Coefficients
-----------------------------
bow[streaming/gaming.]        : 15.1311
bow[whole....]                : 15.0669
bow[2bd/3bath,]               : 13.9028
bow[later...there]            : 13.6987
bow[cris']                    : 13.6801

Lowest Negative Coefficients
----------------------------
bow[$136.]                    : -16.0415
bow[directions....just]       : -15.4148
bow[fathom!]                  : -15.1889
bow["chick-fil-a"]            : -14.8406
bow[bece]                     : -14.2866
```

## Details about Dato's pre-trained models

When a target column name is not provided, a pre-trained model will be used.

Predicted scores from the current model are between 0 and 1, where
higher scores indicate more positive predicted sentiment. The model is
a `graphlab.logistic_classifier.LogisticClassifier` model that can be obtained via `m['classifier']`.

The first time this feature is used, GLC will download the model from a public S3 bucket to a local temporary directory within `~/.graphlab`. Future calls to the toolkit will attempt to use the cached version to avoid having to redownload the model.

**Data sets**: The model is currently trained on review data that includes:
- a random 20% subset of the <a href="http://jmcauley.ucsd.edu/data/amazon/">Amazon product data</a> (collected by Julian McAuley) with "review/score" as the target and "review/text" as the review.
- Yelp data (version 5), using "stars" as the target.

**Preprocessing**: Feature engineering includes a bag-of-words representation of
the text data. Both data sets have an integer "score" column with values ranging between 1 and 5, representing the number of stars that the user gave. Scores less than 3 are given a target of 0 (and thus considered to be negative sentiment during training) and
ratings of more than 3 are considered positive sentiment. Reviews with a score of 3 are currently considered neutral and removed prior to training the classifier.

**Accuracy**: Given the above preprocessing, we observe validation set accuracies between 88-90% on both of these data sets. More details forthcoming.

**Known issues**: The model is currently tuned to focus on English-only text corpuses, and works best when each piece of text has similar length.

**Versioning**: These models may change across versions of GLC.

## Training your own sentiment classifier

You may you may also train your own model. This can be useful when you want to tune the model to your  data set to take advantage of vocabulary that is particular to your application, or you are attempting to predict something such as "utility" by training on whether users thought a review was useful.

```python
>>> import graphlab as gl
>>> data = gl.SFrame({'rating': [1, 5], 'text': ['hate it', 'love it']})
>>> m = gl.sentiment_analysis.create(data, 'rating', features=['text'])
>>> m.predict_row({'text': 'really love it'})
>>> m.predict_row({'text': 'really hate it'})
```

## FAQ
**Why use bag-of-words and a logistic regression classifier?**
Because this combination is a very strong baseline for this particular task. Getting other approaches to match its speed/accuracy is difficult, but we will be pursuing this in the future.
