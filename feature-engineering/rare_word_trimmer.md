# Rare Word Trimmer

Removing words that occur below a certain number of times in a given column is a 
common method of cleaning text before it is used, and can increase the
quality and explainability of the models learned on the transformed data. For
instance, rare words are generally given higher weight in a [TF-IDF](tfidf.md) transform. 
However, the rarest words are frequently misspellings of common words. 
Interpreting these words as informative is problematic in the modeling 
stage of analysis. 

RareWordTrimmer can be applied to all the string-, dictionary-, and list-typed
columns in a given SFrame. Its behavior for each supported input column
type is as follows. 

* **string** : The string is first tokenized. By default, all letters are
  first converted to lower case, then tokenized by space characters. Each
  token is taken to be a word, and words occurring below a threshold
  number of times across the entire column are removed, then the remaining
  tokens are concatenated back into a string.

* **list** : Each element of the list must be a string, where each element
  is assumed to be a token. The remaining tokens are then filtered
  by count occurrences and a threshold value.

* **dict** : The method first obtains the list of keys in the dictionary.
  This list is then processed as a standard list, except the value of each
  key must be of integer type and is considered to be the count of that key.

#### Notes
If the SFrame to be transformed already contains a column with the
designated output column name, then that column will be replaced with the
new output. In particular, this means that `output_column_prefix=None` will
overwrite the original feature columns.

The output of the [Tokenizer](tokenizer.md) object produces valid `list` input
for this method, and the output of the [WordCounter](word_counter.md) object
produces valid `dict` input.

#### References
    - [Penn treebank tokenization](https://www.cis.upenn.edu/~treebank/tokenization.html)

#### Introductory examples
```python 

import graphlab as gl

# Create data.
sf = gl.SFrame({
...    'string': ['sentences Sentences', 'another sentence another year'],
...    'dict': [{'bob': 1, 'Bob': 2}, {'a': 0, 'cat': 5}],
...    'list': [['one', 'two', 'three', 'Three'], ['a', 'cat', 'Cat']]})

# Create a RareWordTrimmer transformer.
from graphlab.toolkits.feature_engineering import RareWordTrimmer
trimmer = RareWordTrimmer(threshold=2)

# Fit and transform the data.
transformed_sf = trimmer.fit_transform(sf)
```
```no-highlight
Columns:
    dict    dict
    list    list
    string  str

Rows: 2

Data:
+------------+----------------+---------------------+
|    dict    |      list      |        string       |
+------------+----------------+---------------------+
| {'bob': 2} | [three, three] | sentences sentences |
| {'cat': 5} |   [cat, cat]   |   another another   |
+------------+----------------+---------------------+
[2 rows x 3 columns]
```
```python
# Save the transformer.
trimmer.save('save-path')
```

#### Fit and transform
```python
import graphlab as gl

# For list columns (string elements converted to lower case by default):

l1 = ['a','good','example']
l2 = ['a','better','example']
sf = gl.SFrame({'a' : [l1,l2]})
wt = gl.feature_engineering.RareWordTrimmer('a', threshold=2)
fit_wt = wt.fit(sf)
transformed_sf = fit_wt.transform(sf)
```
```no-highlight
Columns:
    a   list

Rows: 2

Data:
+--------------+
|      a       |
+--------------+
| [a, example] |
| [a, example] |
+--------------+
[2 rows x 1 columns]
```
```python
# For string columns (converted to lower case by default):

sf = gl.SFrame({'a' : ['a good example', 'a better example']})
wc = gl.feature_engineering.RareWordTrimmer('a', threshold=2)
fit_wt = wt.fit(sf)
transformed_sf = fit_wt.transform(sf)
```
```no-highlight
Columns:
    a	str

Rows: 2

Data:
+-----------+
|     a     |
+-----------+
| a example |
| a example |
+-----------+
[2 rows x 1 columns]
```
```python
# For dictionary columns (keys converted to lower case by default):
sf = gl.SFrame(
...    {'docs': [{'this': 1, 'is': 1, 'a': 2, 'sample': 1},
...              {'this': 1, 'IS': 1, 'another': 2, 'example': 3}]})
wt = gl.feature_engineering.RareWordTrimmer('docs', threshold=2)
fit_wt = wt.fit(sf)
transformed_sf = fit_wt.transform(sf)
```
```no-highlight
Columns:
    docs    dict

Rows: 2

Data:
+-------------------------------+
|              docs             |
+-------------------------------+
|  {'this': 1, 'a': 2, 'is': 1} |
| {'this': 1, 'is': 1, 'exam... |
+-------------------------------+
  [2 rows x 1 columns]
```
