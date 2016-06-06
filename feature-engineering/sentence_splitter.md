<script src="../dato/js/recview.js"></script>
# Sentence Splitter

The SentenceSplitter takes SFrame columns of type string or list,
and transforms into list of strings, where each element is a single sentence.
If the input column type is list, each element must either be list or string
and the lists are recursively flattened and concatenated before sentence
splitting.

#### Notes

This transformer depends on spaCy, a Python package for natural language
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
...    'text': ['This is sentence 1. This is sentence two.']})

# Create a SentenceSplitter transformer.
>>> from graphlab.toolkits.feature_engineering import SentenceSplitter
>>> transformer = SentenceSplitter()

# Fit and transform the data.
>>> transformed_sf = transformer.fit_transform(sf)
```
```no-highlight
Columns:
    text    list

Rows: 1

Data:
+-------------------------------+
|              text             |
+-------------------------------+
| [This is sentence 1., This... |
+-------------------------------+
[1 rows x 1 columns]
```
```python
# For SFrame of type list
>>> import graphlab as gl

# Create data.
>>> sf = gl.SFrame({
...    'text': [['This is sentence 1. This is sentence two.']]})

# Create a SentenceSplitter transformer.
>>> from graphlab.toolkits.feature_engineering import SentenceSplitter
>>> transformer = SentenceSplitter()

# Fit and transform the data.
>>> transformed_sf = transformer.fit_transform(sf)
```
```no-highlight
Columns:
    text    list

Rows: 1

Data:
+-------------------------------+
|              text             |
+-------------------------------+
| [This is sentence 1., This... |
+-------------------------------+
[1 rows x 1 columns]
```

