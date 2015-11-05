# NGram Counter

An ngram is a sequence of n consecutive tokens. NGrams are often used to
represent natural text. Text ngrams can be word-based or character-based.
To formulate word-based ngrams, a text string is first tokenized into words.
An ngram is then a sliding window of n words. For character ngrams, no
tokenization is necessary, and the sliding window is taken directly over
accepted characters.

The output is a dictionary of the count of the number of times each unique
ngram appears in the text string. This dictionary is a sparse representation
because most of the ngrams do not appear in every single sentence, hence
they have a zero count and are not explicitly included in the dictionary.

NGramCounter can be applied to all the string-, dictionary-, and list-typed
columns in a given SFrame. Its behavior for each supported input column
type is as follows. (See :func:`~graphlab.feature_engineering.NGramCounter.transform`
for usage examples).

* **string** : By default, all letters are first converted to lower case.
  Then, if computing word ngrams, each string is tokenized by space and
  puncutation characters. (The user can specify a custom delimiter
  list, or use Penn tree-bank style tokenization. See input parameter
  description for details.) If computing character ngrams, then each
  accepted character is understood to be a token. What is accepted is
  determined based on the flags `ignore_punct` and `ignore_space`.
  A dictionary is generated where each key is a sequence of `n` tokens that
  appears in the input text string, and the value is the number of times
  the ngram appears. For example, based on default settings, the string "I
  really like Really fluffy dogs" would generate these 2-gram counts:
  {'i really': 1, 'really like': 1, 'like really': 1, 'really fluffy': 1, 'fluffy dogs': 1}.
  The string "aaa..hhh" would generate these character 2-gram counts:
  {'aa': 2, 'ah': 1, 'hh': 2}.

* **dict** : Each (key, value) pair is treated as a string-count pair. The
  keys are tokenized according to either word or character tokenization
  methods. Input keys must be strings and input values numeric (integer or
  float). The output dictionary is a sum of the input values for the
  ngrams in the key string. For example, under default settings, the input
  dictionary {'alice bob Bob': 1, 'Alice bob': 2.5} would generate a word
  2-gram dictionary of {'alice bob': 3.5, 'bob bob': 1}.

* **list** : Each element of the list must be a string, which is tokenized
  according to the input method and tokenization settings, followed by
  ngram counting. The behavior is analogous to that of dict-type input,
  where the count of each list element is taken to be 1. For example, under
  the default settings, an input list of ['alice bob Bob', 'Alice bob']
  generates an output word 2-gram dictionary of {'alice bob': 2, 'bob bob': 1}.

#### Notes

If the SFrame to be transformed already contains a column with the
designated output column name, then that column will be replaced with the
new output. In particular, this means that `output_column_prefix=None` will
overwrite the original feature columns.

A bag-of-words representation is essentially an ngram where `n=1`. Larger
`n` generates more unique ngrams. Therefore the output dictionary will
be more sparse, contain more unique keys, and will be more expensive to
compute. Calling this function with large values `n` (larger than 3 or 4)
should be done very carefully.

#### References
- `N-gram wikipedia article <http://en.wikipedia.org/wiki/N-gram>`_
- `Penn treebank tokenization <https://www.cis.upenn.edu/~treebank/tokenization.html>`_

#### Introductory example

```python
>>> import graphlab as gl

# Create data.
>>> sf = gl.SFrame({
...    'string': ['sent.ences Sent.ences', 'another sentence'],
...    'dict': [{'alice bob': 1, 'Bob alice': 0.5}, {'a dog': 0, 'a dog cat': 5}],
...    'list': [['one', 'bar bah'], ['a dog', 'a dog cat']]})

# Create a NGramCounter transformer.
>>> from graphlab.toolkits.feature_engineering import NGramCounter
>>> encoder = NGramCounter()

# Save the transformer.
>>> encoder.save('save-path')

# Fit and transform the data.
>>> transformed_sf = encoder.fit_transform(sf)
Columns:
    dict    dict
    list    dict
    string  dict

Rows: 2

Data:
+------------------------------------+----------------------------+
|                dict                |            list            |
+------------------------------------+----------------------------+
| {'bob alice': 0.5, 'alice bob': 1} |       {'bar bah': 1}       |
|     {'dog cat': 5, 'a dog': 5}     | {'dog cat': 1, 'a dog': 2} |
+------------------------------------+----------------------------+
+------------------------------------+
|               string               |
+------------------------------------+
| {'sent ences': 2, 'ences sent': 1} |
|      {'another sentence': 1}       |
+------------------------------------+
[2 rows x 3 columns]

# Penn treebank-style tokenization (recommended for smarter handling
#    of punctuations)
>>> sf = gl.SFrame({'string': ['sentence $$one', 'sentence two...']})
>>> NGramCounter(delimiters=None).fit_transform(sf)
Columns:
    string  dict

Rows: 2

Data:
+-------------------------------------------+
|                   string                  |
+-------------------------------------------+
|  {'sentence $': 1, '$ $': 1, '$ one': 1}  |
| {'sentence two': 1, '. .': 2, 'two .': 1} |
+-------------------------------------------+
[2 rows x 1 columns]

# Character n-grams
>>> sf = gl.SFrame({'string': ['aa$bb.', ' aa bb  ']})
>>> NGramCounter(method='character').fit_transform(sf)
Columns:
    string  dict

Rows: 2

Data:
+-----------------------------+
|            string           |
+-----------------------------+
| {'aa': 1, 'ab': 1, 'bb': 1} |
| {'aa': 1, 'ab': 1, 'bb': 1} |
+-----------------------------+
[2 rows x 1 columns]

# Character n-grams, not skipping over spaces or punctuations
>>> sf = gl.SFrame({'string': ['aa$bb.', ' aa bb  ']})
>>> encoder = NGramCounter(method='character', ignore_punct=False, ignore_space=False)
>>> encoder.fit_transform(sf)
Columns:
    string  dict

Rows: 2
Data:
+-----------------------------------------------------------------+
|                              string                             |
+-----------------------------------------------------------------+
|          {'aa': 1, 'b.': 1, '$b': 1, 'a$': 1, 'bb': 1}          |
| {' b': 1, 'aa': 1, '  ': 1, ' a': 1, 'b ': 1, 'bb': 1, 'a ': 1} |
+-----------------------------------------------------------------+
[2 rows x 1 columns]
```

#### Fitting and transforming
```python
>>> import graphlab as gl

# Create the data
>>> sf = gl.SFrame(
...    {'dict': [{'this is a': 1, 'is a sample': 1},
...              {'This is': 1, 'is example': 1, 'is EXample': 2}],
...     'string': ['sentence one', 'sentence one...'],
...     'list': [['one', 'One'], ['two two']]})

# Fit, then transform the data
>>> encoder = gl.feature_engineering.NGramCounter()
>>> encoder = encoder.fit(sf)
>>> output_sf = encoder.transform(sf)
>>> output_sf.print_rows(max_column_width=60)
+------------------------------------------+----------------+
|                   dict                   |      list      |
+------------------------------------------+----------------+
| {'a sample': 1, 'this is': 1, 'is a': 2} |       {}       |
|     {'is example': 3, 'this is': 1}      | {'two two': 1} |
+------------------------------------------+----------------+
+---------------------+
|        string       |
+---------------------+
| {'sentence one': 1} |
| {'sentence one': 1} |
+---------------------+
[2 rows x 3 columns]

# Alternatively, fit and transform the data in one step
>>> output2 = gl.feature_engineering.NGramCounter().fit_transform(sf)
>>> output2
Columns:
    dict    dict
    list    dict
    string  dict

Rows: 2

Data:
+------------------------------------------+----------------+
|                   dict                   |      list      |
+------------------------------------------+----------------+
| {'a sample': 1, 'this is': 1, 'is a': 2} |       {}       |
|     {'is example': 3, 'this is': 1}      | {'two two': 1} |
+------------------------------------------+----------------+
+---------------------+
|        string       |
+---------------------+
| {'sentence one': 1} |
| {'sentence one': 1} |
+---------------------+
[2 rows x 3 columns]
```
