# Word Counter

Bag-of-words is a common text representation. An input text string is first 
tokenized. Each token is understood to be a word. The output is a dictionary
of the count of the number of times each unique word appears in the text 
string. This dictionary is a sparse representation because most of the 
words in the vocabulary do not appear in every single sentence, hence their
count is zero, which are not explicitly included in the dictionary. 

WordCounter can be applied to all the string-, dictionary-, and list-typed 
columns in a given SFrame. Its behavior for each supported input column
type is as follows. 

* **string** : The string is first tokenized. By default, all letters are 
first converted to lower case, then tokenized by space characters. The
user can specify a custom delimiter list, or use Penn tree-bank style 
tokenization (see input parameter description for details). Each token
is taken to be a word, and a dictionary is generated where each key is a
unique word that appears in the input text string, and the value is the 
number of times the word appears. For example, "I really like Really
fluffy dogs" would get converted to 
{'i' : 1, 'really': 2, 'like': 1, 'fluffy': 1, 'dogs':1}.

* **dict** : Each (key, value) pair is treated as a string-count pair. The
keys are tokenized according to the input tokenization method and
lower-case conversion option. Each token is then treated as a word and
their corresponding values accumulated. Input keys must be strings and 
input values numeric (integer or float). For example, if `to_lower=True` 
and delimiters are the default space characters, then an input of the 
form {'bob alice': 1, 'Bob': 0.5} generates an output of
{'bob': 1.5, 'alice': 1}.

* **list** : Each element of the list must be a string, which is tokenized 
according to the input method and tokenization settings, followed by 
counting. The behavior is analogous to that of dict-type input, where the 
count of each list element is taken to be 1. For example, under default 
settings, an input list of ['alice bob Bob', 'Alice bob'] generates an 
output bag-of-words dictionary of {'alice': 2, 'bob': 3}.

#### Notes
If the SFrame to be transformed already contains a column with the 
designated output column name, then that column will be replaced with the 
new output. In particular, this means that `output_column_prefix=None` will
overwrite the original feature columns.

#### References
- [Penn treebank tokenization](https://www.cis.upenn.edu/~treebank/tokenization.html)

#### Introductory examples
```python
>>> import graphlab as gl

# Create data.
>>> sf = gl.SFrame({
...    'string': ['sentences Sentences', 'another sentence'],
...    'dict': [{'bob': 1, 'Bob': 0.5}, {'a': 0, 'cat': 5}],
...    'list': [['one', 'two', 'three'], ['a', 'cat']]})

# Create a WordCounter transformer.
>>> from graphlab.toolkits.feature_engineering import WordCounter
>>> encoder = WordCounter()

# Fit and transform the data.
>>> transformed_sf = encoder.fit_transform(sf)
Columns:
    dict    dict
    list    dict
    string  dict

Rows: 2

Data:
+------------------------+----------------------------------+
|          dict          |               list               |
+------------------------+----------------------------------+
|      {'bob': 1.5}      | {'one': 1, 'three': 1, 'two': 1} |
| {'a': 0, 'cat': 5}     |        {'a': 1, 'cat': 1}        |
+------------------------+----------------------------------+
+-------------------------------+
|             string            |
+-------------------------------+
|        {'sentences': 2}       |
| {'another': 1, 'sentence': 1} |
+-------------------------------+
[2 rows x 3 columns]

# Penn treebank-style tokenization (recommended for smarter handling
#    of punctuations)
>>> sf = gl.SFrame({'string': ['sentence $$one', 'sentence two...']})
>>> WordCounter(delimiters=None).fit_transform(sf)
Columns:
    string  dict

Rows: 2

Data:
+-----------------------------------+
|               string              |
+-----------------------------------+
| {'sentence': 1, '$': 2, 'one': 1} |
| {'sentence': 1, 'two': 1, '.': 3} |
+-----------------------------------+
[2 rows x 1 columns]

# Save the transformer.
>>> encoder.save('save-path')
```

#### Fit and transform
```python
>>> import graphlab as gl

# Create the data
>>> sf = gl.SFrame(
...    {'dict': [{'this': 1, 'is': 1, 'a': 2, 'sample': 1},
...              {'This': 1, 'is': 1, 'example': 1, 'EXample': 2}],
...     'string': ['sentence one', 'sentence two...'],
...     'list': [['one', 'One'], ['two']]})

# Transform the data
>>> encoder = gl.feature_engineering.WordCounter()
>>> encoder = encoder.fit(sf)
>>> output_sf = encoder.transform(sf)
>>> output_sf[0]
{'dict': {'a': 2, 'is': 1, 'sample': 1, 'this': 1},
 'list': {'one': 2},
 'string': {'one': 1, 'sentence': 1}}

# Alternatively, fit and transform the data in one step
>>> output2 = gl.feature_engineering.WordCounter().fit_transform(sf)
>>> output2
Columns:
    dict    dict
    list    dict
    string  dict

Rows: 2

Data:
+-------------------------------------------+------------+
|                    dict                   |    list    |
+-------------------------------------------+------------+
| {'sample': 1, 'a': 2, 'is': 1, 'this': 1} | {'one': 2} |
|     {'this': 1, 'is': 1, 'example': 3}    | {'two': 1} |
+-------------------------------------------+------------+
+------------------------------+
|            string            |
+------------------------------+
|  {'sentence': 1, 'one': 1}   |
| {'two...': 1, 'sentence': 1} |
+------------------------------+
[2 rows x 3 columns]

# For list columns (string elements converted to lower case by default):

>>> l1 = ['a','good','example']
>>> l2 = ['a','better','example']
>>> sf = gl.SFrame({'a' : [l1,l2]})
>>> wc = gl.feature_engineering.WordCounter('a')
>>> fit_wc = wc.fit(sf)
>>> transformed_sf = fit_wc.transform(sf)
Columns:
    a   dict

Rows: 2

Data:
+-------------------------------------+
|                  a                  |
+-------------------------------------+
|  {'a': 1, 'good': 1, 'example': 1}  |
| {'better': 1, 'a': 1, 'example': 1} |
+-------------------------------------+
[2 rows x 1 columns]

# For string columns (converted to lower case by default):

>>> sf = gl.SFrame({'a' : ['a good example', 'a better example']})
>>> wc = gl.feature_engineering.WordCounter('a')
>>> fit_wc = wc.fit(sf)
>>> transformed_sf = fit_wc.transform(sf)
Columns:
    a   dict

Rows: 2

Data:
+-------------------------------------+
|                  a                  |
+-------------------------------------+
|  {'a': 1, 'good': 1, 'example': 1}  |
| {'better': 1, 'a': 1, 'example': 1} |
+-------------------------------------+
[2 rows x 1 columns]

# For dictionary columns (keys converted to lower case by default):
>>> sf = gl.SFrame(
...    {'docs': [{'this': 1, 'is': 1, 'a': 2, 'sample': 1},
...              {'this': 1, 'IS': 1, 'another': 2, 'example': 3}]})
>>> wc = gl.feature_engineering.WordCounter('docs')
>>> fit_wc = wc.fit(sf)
>>> transformed_sf = fit_wc.transform(sf)
+--------------------------------------------------+
|                      docs                        |
+--------------------------------------------------+
|    {'sample': 1, 'a': 2, 'is': 1, 'this': 1}     |
| {'this': 1, 'is': 1, 'example': 3, 'another': 2} |
+--------------------------------------------------+
[2 rows x 1 columns]
```
