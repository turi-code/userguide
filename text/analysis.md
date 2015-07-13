
Suppose our text data is currently arranged into a single file, where each line of that file contains all of the text in a single document. Here we can use [SFrame.read_csv](https://dato.com/products/create/docs/generated/graphlab.SFrame.read_csv.html) to parse the text data into a one-column SFrame.

```python
import os
if os.path.exists('wikipedia_w16'):
    sf = graphlab.SFrame('wikipedia_w16')
else:
    sf = graphlab.SFrame.read_csv('http://s3.amazonaws.com/dato-datasets/wikipedia/raw/w16.csv', header=False)
    sf.save('wikipedia_w16')
```

```python
sf
```
```
Columns:
X1      str

Rows: 72269

Data:
+--------------------------------+
|               X1               |
+--------------------------------+
| alainconnes alain connes i ... |
| americannationalstandardsi ... |
| alberteinstein near the be ... |
| austriangerman as german i ... |
| arsenic arsenic is a metal ... |
| alps the alps alpen alpi a ... |
| alexiscarrel born in saint ... |
| adelaide adelaide is a coa ... |
| artist an artist is a pers ... |
| abdominalsurgery the three ... |
|              ...               |
+--------------------------------+
[72269 rows x 1 columns]
Note: Only the head of the SFrame is printed.
You can use print_rows(num_rows=m, num_columns=n) to print more rows and columns.
```


##### Bag-of-words

Both SFrames and SArrays expose functionality that can be very useful for manipulating text data. For example, one common preprocessing task for text data is to transform it into "bag-of-words" format: each document is represented by a map where the words are keys and the values are the number of occurrences. So a document containing the text "hello goodbye hello" would be represented by a ```dict``` type element containing the value ```{"hello": 2, "goodbye":1}```. This transformation can be accomplished with the following code.

```python
bow = graphlab.text_analytics.count_words(sf['X1'])
```

We can print five of the words in the first document

```python
bow[0].keys()[:5]
```
```
['and', 'work', 'baumconnes', 'gold', 'almost']
```

and find the documents that contain the word "gold":

```python
bow.dict_has_any_keys(['gold'])
```

We can save this representation of the documents as another column of the original SFrame.

```python
sf['bow'] = bow
```

##### TF-IDF

Another useful representation for text data is called TF-IDF (term frequency - inverse document frequency). This is a modification of the bag-of-words format where the counts are transformed into scores: words that are common across the document corpus are given low scores, and rare words occurring often in a document are given high scores. 

$$ \mbox{TF-IDF}(word, document) = N(word, document) * log(1/\sum_d N(word, d))) $$

where N(w, d) is the number of times word w occurs in document d. This transformation can be done to an SArray of dict type containing documents in bow-of-words format using [tf_idf](https://dato.com/products/create/docs/generated/graphlab.text_analytics.tf_idf.html).

```python
sf['tfidf'] = graphlab.text_analytics.tf_idf(sf['bow'])
```

##### Text cleaning 

We can easily remove all words do not occur at least twice in each document using [SArray.dict_trim_by_values](https://dato.com/products/create/docs/generated/graphlab.SArray.dict_trim_by_values.html).

```python
docs = sf['bow'].dict_trim_by_values(2)
```

GraphLab Create also contains a helper function called [stopwords](https://dato.com/products/create/docs/generated/graphlab.text_analytics.stopwords.html?highlight=stopwords#graphlab.text_analytics.stopwords) that returns a list of common words. We can use [SArray.docs.dict_trim_by_keys](https://dato.com/products/create/docs/generated/graphlab.SArray.dict_trim_by_keys.html) to remove these words from the documents as a preprocessing step. NB: Currently only English words are available.


```python
docs = docs.dict_trim_by_keys(graphlab.text_analytics.stopwords(), exclude=True)
```

To confirm that we have indeed removed common words, e.g. "and", "the", etc, we can examine the first document.

```python
docs[0]
```
```
{'academy': 5,
 'algebras': 2,
 'connes': 3,
 'differential': 2,
 'early': 2,
 'geometry': 2,
 'including': 2,
 'medal': 2,
 'operator': 2,
 'physics': 2,
 'sciences': 5,
 'theory': 2,
 'work': 2}
```

#####Tokenization

For an SArray of strings, where each row is assumed to be a natural English language document, the tokenizer transforms each row into an ordered list of strings that represents the a simpler version of the Penn-Tree-Bank-style (PTB-style) tokenization of that row's document. For many text analytics tasks that require word-level granularity, simple space delimitation does not address some of the subtleties of natural langauge text especially with respect to sentence-final punctuation, contractions, URL's, email addresses, phone numbers and other quirks. The representation of a document provided by PTB-style of tokenization is essential for sequence-tagging, parsing, bag-of-words treatment, and any text analytics task that requires word-level granularity. For a description of this style of tokenization, see https://www.cis.upenn.edu/~treebank/tokenization.html. Note that our tokenizer does not normalize quote and bracket-like characters as described by the linked document.

```python
import graphlab as gl

from graphlab.toolkits.text_analytics import tokenize

sa = gl.SArray(["This is a document!",
                "This one's also a document."])
tokenized_sa = tokenize(sa)
```
```no-highlight
Out[6]: 
dtype: list
Rows: 2
[['This', 'is', 'a', 'document', '!'], ['This', 'one', "'s", 'also', 'a', 'document', '.']]
```
