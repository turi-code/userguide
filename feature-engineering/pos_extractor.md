<script src="../dato/js/recview.js"></script>
# Part of Speech Extractor

PartOfSpeechExtractor takes SFrame columns of type string and list,
and transforms into a nested dictionary. If the input column is of type list,
each element in the list must also be of type list or string.  In the first
level of the output dictionary, the keys are parts of speech and values are
bags of words of the specified part of speech.

#### Notes 

This extractor depends on spaCy, a Python package for natural language
processing. Please see spacy.io for installation information.

If the SFrame to be transformed already contains a column with the
designated output column name, then that column will be replaced with the
new output. In particular, this means that `output_column_prefix=None` will
overwrite the original feature columns.


#### Introductory examples
```python
>>> import graphlab as gl

# Create data.
>>> sf = gl.SFrame({
...    'text': ['This is  a great sentence. This is sentence two.']})

# Create a PartOfSpeechExtractor transformer.
>>> from graphlab.toolkits.feature_engineering import PartOfSpeechExtractor
>>> transformer = PartOfSpeechExtractor()

# Fit and transform the data.
>>> transformed_sf = transformer.fit_transform(sf)
```
```no-highlight
Columns:
    text    dict

Rows: 1

Data:
+-----------------------+
|          text         |
+-----------------------+
| {'ADJ': {'great': 1}} |
+-----------------------+
[1 rows x 1 columns]
```
```python
#SFrame with list of strings
>>> sf = gl.SFrame({
...    'text': [['This is  a great sentence.', 'This is sentence two.']]})

# Create a PartOfSpeechExtractor transformer.
>>> from graphlab.toolkits.feature_engineering import PartOfSpeechExtractor
>>> transformer = PartOfSpeechExtractor()

# Fit and transform the data.
>>> transformed_sf = transformer.fit_transform(sf)
```
```no-highlight
Columns:
    text    dict

Rows: 1

Data:
+-----------------------+
|          text         |
+-----------------------+
| {'ADJ': {'great': 1}} |
+-----------------------+
[1 rows x 1 columns]
```
```python
#SFrame with list of strings
>>> sf = gl.SFrame({
...    'text': [['This is  a great sentence.', 'This is sentence two.']]})

# Create a PartOfSpeechExtractor transformer.
>>> from graphlab.toolkits.feature_engineering import PartOfSpeechExtractor
>>> transformer = PartOfSpeechExtractor(
...                                    chosen_pos=[graphlab.text_analytics.PartOfSpeec.NOUN])

# Fit and transform the data.
>>> transformed_sf = transformer.fit_transform(sf)
```
```no-highlight
Columns:
  string  dict

Rows: 1

Data:
+---------------------------+
|           string          |
+---------------------------+
| {'NOUN': {'sentence': 1}} |
+---------------------------+
[1 rows x 1 columns]
```

