Transform an SFrame into the Penn-Tree-Bank-style tokenization.

For an SFrame of strings, where each row is assumed to be a natural English language document, the tokenizer transforms each row into an ordered list of strings that represents the Penn-Tree-Bank-style tokenization of that row's document.

The transformed output is a column of type list[string] with the list of tokens for each document.

#### Introductory Example

```python
import graphlab as gl

sf = gl.SFrame({'docs': ["This is a document!",
                          "This one's also a document."]})
tokenizer = graphlab.feature_engineering.Tokenizer('docs')
tokenized_sf = tokenizer.transform(sf)
```
```no-highlight
Data:
+-------------------------------+
|             docs              |
+-------------------------------+
| ['This', 'is', 'a', 'docum... |
| ['This', 'one', '\'s', 'al... |
+-------------------------------+
[2 rows x 1 columns]
```

For the tokenizer, the transformation is completely dependent on internal state prior to seeing any data, so it doesn't need to be serialized or fit. 

We encourage you to use the 'tokenize' function in the text\_analytics toolkit. It has nearly identical behavior to Tokenizer's transform function, but takes only the target SArray instead of an SFrame.
