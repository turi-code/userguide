#Exercises
##### Predict if new questions asked on Stack Overflow will be closed

We all use [Stack Overflow](http://stackoverflow.com/), day in and day out, to
get answers to our programming questions. The website, its content, and its
users provide high quality solutions to reach other programmers. Quality is
everything to them and they take it pretty seriously. In this exercise, we will
build classifier to detect if questions will end up closed or not.

###### Closing Questions

Currently about 6% of all new questions end up **closed**.  Questions can be
closed as:

1. Off topic
2. Not constructive
3. Not a real question
4. Too localized

More in depth descriptions of each reason can be found in the
[Stack Overflow FAQ](http://stackoverflow.com/help/closed-questions).
Your goal is to build a
classifier that predicts whether or not a question will be closed using a lot of
information about the post.

(source
[Kaggle competition](https://www.kaggle.com/c/predict-closed-questions-on-stack-overflow))

###### Data loading

Let us start by loading an SFrame given in binary format. Assuming the file given to you
is in the location **FILEPATH**, then you can use the following:


```
sf = gl.SFrame(FILEPATH)
```

Canvas runs in the background, so you can continue to work as the summary
visualizations are computed for you. In the mean time, let us take a quick look
at the target column **OpenStatus**.

<span style="color:red">**Question 1:**</span> Now, use the
[SArray.unique()](http://dato.com/products/create/docs/generated/graphlab.SArray.unique.html#graphlab.SArray.unique)
function to get out the unique values of the column
**OpenStatus**.


```
unique_stats = sf['OpenStatus'].unique()
unique_stats.show()
```

It seems like the data was not very clean. That is mostly the case with real
world datasets. We need to do some munging here.

<span style="color:red">**Question 2:**</span> Add a column to the Sframe
called **is_closed** which is 1 when **OpenStatus** is "closed" and 0 otherwise.
*Hint*: You can use SArray's
[boolean operation](https://dato.com/products/create/docs/generated/graphlab.SArray.html#graphlab.SArray)
or the
[SArray.apply()](https://dato.com/products/create/docs/generated/graphlab.SArray.apply.html)
function.


```
sf['is_closed'] = sf['OpenStatus'] == "closed"
```

###### Creating a balanced dataset.

It looks like only around **2.44%** of the data contains closed data.
Classification on imbalanced data is a challenging task. Let us make a balanced
dataset with an equal number of posts that are open and closed. One way of
doing this is to **sub sample the data** with open posts to create more of
a balance.  We will accomplish this over the next few questions.

<span style="color:red">**Question 3:**</span> Create an SFrame (lets call it
*sf_closed_only*) that only contains the data in the original SFram (*sf*) where
**is_closed == 1**. Use the
[SFrame's logical filter](https://dato.com/products/create/docs/generated/graphlab.SFrame.html)
to do so.


```
sf_closed_only = sf[sf['is_closed'] == 1]
```

<span style="color:red">**Question 4:**</span> Let us use the
[SFrame's sample](https://dato.com/products/create/docs/generated/graphlab.SFrame.sample.html)
function to sample about 2.5% of the SFrame (*sf*) where
**is_closed = 0**. Call the resulting SFrame **sf_open_only**.


```
sf_open_only = sf[sf['is_closed'] == 0].sample(0.025)
```

<span style="color:red">**Question 5:**</span> Now, let us use
[SFrame's append()](https://dato.com/products/create/docs/generated/graphlab.SFrame.append.html)
functionality to append the SFrame **sf_open_only**
with **sf_closed_only**. Call the resulting SFrame **sf_subsampled**.

NOTE: In some versions of IPython Notebook the following command must be run
twice - the first time yields an error.

```
sf_subsampled = sf_open_only.append(sf_closed_only)
```


<span style="color:red">**Question 6:**</span> Use the
[SArray.astype()](http://dato.com/products/create/docs/generated/graphlab.SArray.astype.html)
function to make sure the following columns (in
**sf_subsampled**) are of the right types. Here are the right types.

* ReputationAtPostCreation (**int**)
* OwnerUndeletedAnswerCountAtPostTime (**int**)


```
sf_subsampled['ReputationAtPostCreation'] = sf_subsampled['ReputationAtPostCreation'].astype(int)
sf_subsampled['OwnerUndeletedAnswerCountAtPostTime'] = sf_subsampled['OwnerUndeletedAnswerCountAtPostTime'].astype(int)
```


###### Logistic Regresssion

In this section, we will create a classifier that can predict the target
**is_closed** using the other features.

<span style="color:red">**Question 7:**</span> Create a **train-test** split
with 80% of the data being in the training set and 20% of the data in the test
set. *Hint*: Using the
[SFrame.random split()](https://dato.com/products/create/docs/generated/graphlab.SFrame.random_split.html)
function.


```
train_sf, test_sf = sf_subsampled.random_split(0.8)
```

The random split function creates two SFrames. One which we will use for
training and a separate SFrame, which we will hold out for testing. The pattern
of splitting your data for training and testing is important to ensure that
your model is not too specialized for the training data.


<span style="color:red">**Question 8:**</span> Use the training data and build a
[logistic regression classifier](https://dato.com/products/create/docs/generated/graphlab.logistic_classifier.create.html)
with the following features:

* *ReputationAtPostCreation*
* *OwnerUndeletedAnswerCountAtPostTime*

and the target **is_closed**. Use the default options for the logistic
regression classifier.


```
model = gl.logistic_regression.create(train_sf, target='is_closed',
                                      features = ['ReputationAtPostCreation',
                                                   'OwnerUndeletedAnswerCountAtPostTime'])
```

<span style="color:red">**Question 9:**</span> Use the
[LogisticClassifier.evaluate()](https://dato.com/products/create/docs/generated/graphlab.logistic_classifier.LogisticClassifier.evaluate.html)
function to get useful statistics about the
prediction on the test data (**test_sf**).


```
print model.evaluate(test_sf)
```
```json
{'accuracy': 0.5653733528550512,
 'confusion_table': {'false_negative': 0,
  'false_positive': 17811,
  'true_negative': 0,
  'true_positive': 23169}}
```


That was an accuracy of 56.52%. This isn't great. On closer inspection, you can
see that the number of **false_positive**s is too high. This means that the
model is predicting all 1's. Let us try and see if we can get more out of our
data.


<span style="color:red">**Question 10:**</span> Collapse the columns *['Tag1',
'Tag2', 'Tag3', 'Tag4', 'Tag5']* into one column called *'tags_category'* (for
convinience) as a **list type**. Use the
[SFrame.pack_columns()](http://graphlab.com/products/create/docs/generated/graphlab.SFrame.pack_columns.html)
to collapse these columns.

Make sure you do this on **both the training and test data**.

```
train_sf = train_sf.pack_columns(column_prefix='Tag', dtype=list, new_column_name='tags_category')
test_sf = test_sf.pack_columns(column_prefix='Tag', dtype=list, new_column_name='tags_category')
```

<span style="color:red">**Question 11:**</span> Dictionaries are easier to work
with, so let us convert the column **tags_category** to type dictionary using
the
[SFrame's apply()](https://dato.com/products/create/docs/generated/graphlab.SFrame.apply.html?highlight=sframe.apply)
function. The
keys in the dictionary are the same as the elements in the list. The values of
the dictionary are all set to 1.

For example, the list ["a", "b"] must be converted to {"a": 1, "b": 1}

```
train_sf['tags_dict'] = train_sf['tags_category'].apply(lambda x: {a:1 for a in x})
test_sf['tags_dict'] = test_sf['tags_category'].apply(lambda x: {a:1 for a in x})
```


###### Feature Engineering

Let us try the
[basic benchmark](https://github.com/benhamner/Stack-Overflow-Competition/blob/master/basic_benchmark.py)
from the Kaggle competition.  Use
the
[SArray's apply](https://dato.com/products/create/docs/generated/graphlab.SArray.apply.html?highlight=apply)
function to do the
following things:

<span style="color:red">**Question 12:**</span>
1. Create a column called **num_tags** that counts the number of keys in the
columns 'tags_dict'.
2. Create a column called **BodyMarkdown-Length** to count the length of the
text in the column *'BodyMarkdown'*.
3. Create a column called **Title-Length** to count the length of the text of
the column *'Title'*.

**Note**: Remember to do this on your train and test set.

```
# On the train data
train_sf['num_tags'] = train_sf['tags_dict'].apply(lambda x: len(x))
train_sf['BodyMarkdown-Length'] = train_sf['BodyMarkdown'].apply(lambda x: len(x))
train_sf['Title-Length'] = train_sf['Title'].apply(lambda x: len(x))

# On the test data
test_sf['num_tags'] = test_sf['tags_dict'].apply(lambda x: len(x))
test_sf['BodyMarkdown-Length'] = test_sf['BodyMarkdown'].apply(lambda x: len(x))
test_sf['Title-Length'] = test_sf['Title'].apply(lambda x: len(x))
```



<span style="color:red">**Question 13:**</span>

Create a logisitc regression model using the following features (on the data
**train_sf**):

* ReputationAtPostCreation
* OwnerUndeletedAnswerCountAtPostTime
* num_tags
* BodyMarkdown-Length
* Title-Length

with the target being **is_closed**.

```
model = gl.logistic_regression.create(train_sf, target ='is_closed',
                                      features = ['ReputationAtPostCreation',
                                                  'OwnerUndeletedAnswerCountAtPostTime',
                                                  'num_tags',
                                                  'BodyMarkdown-Length',
                                                  'Title-Length'])
```

<span style="color:red">**Question 14:**</span>

Again, evaluate your model on the test set ( **test_sf**).

```
print model.evaluate(test_sf)
```
```json
 {'accuracy': 0.6072474377745242,
  'confusion_table': {'false_negative': 3856,
   'false_positive': 12239,
   'true_negative': 5572,
   'true_positive': 19313}}
```



That's a bit better but not too much better. The **num_tags** had the highest
coefficients so I suppose the tag data is very useful.

########## Gradient Boosted Trees

Let's see if we can do something in the non-linear space. Graphlab Create has
recently added a fast
[gradient boosting](http://en.wikipedia.org/wiki/Gradient_boosting)
module to train non-
linear classifiers. It is a powerful model that can work quite well if you have
a **few dense** features. If gradient boosting doesn't get us anywhere, then we
probably want to engineer more features.

<span style="color:red">**Question 15:**</span>
Create a gradient boosted tree model (on **train_sf**) with the same features as
the above logistic regression module. You must use the **objective** as
**classification** and use the **same features as above** i.e:

* ReputationAtPostCreation
* OwnerUndeletedAnswerCountAtPostTime
* num_tags
* BodyMarkdown-Length
* Title-Length

Again, set the target as **is_closed**.


```
model = gl.boosted_trees.create(train_sf, target_column ='is_closed',
                                objective='classification',
                                feature_columns = ['ReputationAtPostCreation',
                                                   'OwnerUndeletedAnswerCountAtPostTime',
                                                   'num_tags',
                                                   'BodyMarkdown-Length',
                                                   'Title-Length'])
print model.evaluate(test_sf)
```
```json
{'accuracy': 0.6542947888374329,
 'confusion_table': {'false_negative': 4873,
  'false_positive': 9294,
  'true_negative': 8517,
  'true_positive': 18296}}
```


That is much better. But I think we can do more if we use our data well.

###### Advanced Features: Using tag data

This is now a clear indication that we need to use some more features. How about
we use the **tag_dict** as a feature directly. Graphlab Create's logistic
regression module makes it super easy to add dictionaries into your model. Think
of dictionaries as a collection of columns.

<span style="color:red">**Hint for Question 17:**</span>
For example, the dictionary *{a: 1, b:1, c:2}* feature implies that the feature
*a* has value 1, feature *b* has value 1 and so on. Any features that are not
explicitly in the dictionary are assumed to be zero. This way, you can only
encode those features that are non-zero. This is perfect for the *tag*
information because different posts may have a different number of tags and it
is quite annoying to worry about what the total number of tags are.

<span style="color:red">**Question 17:**</span>
Now, create a **logistic regression** module with **tags_dict** as the feature
as well as the same features as above:

* tags_dict (**dictionary**)
* ReputationAtPostCreation
* OwnerUndeletedAnswerCountAtPostTime
* num_tags
* BodyMarkdown-Length
* Title-Length

**Note**: Gradient boosted trees are not suitable for datasets with lots of
features. Logistic regression is a better choice here.


```
model = gl.logistic_regression.create(train_sf, target ='is_closed',  
                                      features = ['ReputationAtPostCreation',
                                                  'OwnerUndeletedAnswerCountAtPostTime',
                                                  'num_tags',
                                                  'tags_dict',
                                                  'BodyMarkdown-Length',
                                                  'Title-Length'])
```

<span style="color:red">**Question 17:**</span>
Again, evaluate the model on the test set (**test_sf**)


```
print model.evaluate(test_sf)
```
```json
 {'accuracy': 0.6728892142508541,
  'confusion_table': {'false_negative': 6209,
   'false_positive': 7196,
   'true_negative': 10615,
   'true_positive': 16960}}
```



###### Bonus section: Text data

*Title* and *Body-Markdown* are two useful columns with raw text data. Let use
the
[count words](https://dato.com/products/create/docs/generated/graphlab.text_analytics.count_words.html)
function to get some raw word counts.

<span style="color:red">**Bonus question 1:**</span>
Add a column called **title_word_count** that counts the number of words in the
column **Title** and a column called **body_mark_down_word_count** that adds the
same for the column **BodyMarkdown**.

**Note**: Add this to both your test and train data.


```
# Train data
train_sf['title_word_count'] = train_sf['Title'].count_words()
train_sf['body_markdown_count'] = train_sf['BodyMarkdown'].count_words()

# Test data
test_sf['title_word_count'] = test_sf['Title'].count_words()
test_sf['body_markdown_count'] = test_sf['BodyMarkdown'].count_words()
```


<span style="color:red">**Bonus question 2:**</span>
Add the features **title_word_count** and **body_mark_down_word_count** to the
logistic regression classifier.


```
model = gl.logistic_regression.create(train_sf, target ='is_closed',  
                                      features = ['ReputationAtPostCreation',
                                                 'OwnerUndeletedAnswerCountAtPostTime',
                                                 'num_tags',
                                                 'title_word_count',
                                                 'body_markdown_count',
                                                 'tags_dict',
                                                 'BodyMarkdown-Length',
                                                 'Title-Length'])
```


<span style="color:red">**Bonus Question 3:**</span>
Again, evaluate the model on the test set (**test_sf**)


```
print model.evaluate(test_sf)
```
```json
{'accuracy': 0.704123962908736,
 'confusion_table': {'false_negative': 6399,
  'false_positive': 5726,
  'true_negative': 12085,
  'true_positive': 16770}}
```
