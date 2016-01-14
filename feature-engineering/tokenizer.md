#Tokenizer

For an SFrame of strings, where each row is assumed to be a natural English language document, the tokenizer transforms each row into an ordered list of strings that represents a simpler version of the Penn-Tree-Bank-style (PTB-style) tokenization of that row's document. For many text analytics tasks that require word-level granularity, simple space delimitation does not address some of the subtleties of natural langauge text, especially with respect to sentence-final punctuation, contractions, URL's, email addresses, phone numbers and other quirks. The representation of a document provided by PTB-style tokenization is essential for sequence-tagging, parsing, bag-of-words treatment, and any text analytics task that requires word-level granularity. For a description of this style of tokenization, see https://www.cis.upenn.edu/~treebank/tokenization.html. Note that our tokenizer does not normalize quote and bracket-like characters as described by the linked document.

The transformed output is a column of type list[string] with the list of tokens for each document.

```python
import graphlab as gl

sf = gl.SFrame({'docs': ["This is a document!",
                          "This one's also a document."]})
tokenizer = graphlab.feature_engineering.Tokenizer(features = ['docs'])
tokenizer.fit(sf)
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
