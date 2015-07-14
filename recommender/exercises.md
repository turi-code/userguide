#Exercises 
In the code block below, import the StackOverflow dataset SFrame that you saved
during earlier exercises. Note that
[this data is shared](http://blog.stackexchange.com/category/cc-wiki-dump/)
courtesy of
StackExchange and is under the Creative Commons Attribution-ShareAlike 3.0
Unported License. This particular version of the data set was used in a recent
[Kaggle competition](https://www.kaggle.com/c/predict-closed-questions-on-stack-overflow).


```python
import os
if os.path.exists('stack_overflow'):
    sf = graphlab.SFrame('stack_overflow')
else:
    sf= graphlab.SFrame('http://s3.amazonaws.com/dato-datasets/stack_overflow')
    sf.save('stack_overflow')
```

<span style="color:red">**Question 1:**</span>
Visually explore the above data using GraphLab Canvas.


```python
sf.show()
```

In this section we will make a model that can be used to recommend new tags to
users.

<span style="color:red">**Question 2:**</span>
Create a new column called `Tags` where each element is a list of all the tags
used for that question. (Hint: Check out
[sf.pack_columns](https://dato.com/products/create/docs/generated/graphlab.SFrame.html)
.)


```python
sf = sf.pack_columns(column_prefix='Tag', new_column_name='Tags')
```

<span style="color:red">**Question 3:**</span>
Make your SFrame only contain the `OwnerUserId` column and the `Tags` column you
created in the previous step.


```python
sf = sf[['OwnerUserId', 'Tags']]
```

<span style="color:red">**Question 4:**</span>
Use the following Python function to modify the `Tags` column to not have any
empty strings in the list.


```python
def remove_empty(tags):
    return [tag for tag in tags if tag != '']
```


```python
sf['Tags'] = sf['Tags'].apply(remove_empty)
```

<span style="color:red">**Question 5:**</span>
Create a new SFrame called `user_tag` that has a row for every (user, tag) pair.
(Hint: See
[sf.stack](https://dato.com/products/create/docs/generated/graphlab.SFrame.stack.html#graphlab.SFrame.stack)
.)


```python
user_tag = sf.stack(column_name='Tags', new_column_name='Tag')
```

<span style="color:red">**Question 6:**</span>
Create a new SFrame called `user_tag_count` that has three columns:

    - `OwnerUserId`
    - `Tag`
    - `Count`

where `Count` contains the number of times the given `Tag` was used by that
particular `OwnerUserId`. Hint: See
[groupby](https://dato.com/products/create/docs/graphlab.data_structures.html#graphlab.aggregate.COUNT)
.


```python
user_tag_count = user_tag.groupby(['OwnerUserId', 'Tag'], graphlab.aggregate.COUNT)
```

<span style="color:red">**Question 7:**</span>
Visually explore this summarized version of your data set with GraphLab Canvas.


```python
user_tag_count.show()
```

##### Creating a Model


<span style="color:red">**Question 8:**</span>
Use `graphlab.recommender.create()` to create a model that can be used to
recommend tags to each user.

```python
m = graphlab.recommender.create(user_tag_count, user_id='OwnerUserId', item_id='Tag')
```

<span style="color:red">**Question 9:**</span>
Print a summary of the model by simply entering the name of the object.


```python
m
```

<span style="color:red">**Question 10:**</span>
Get all unique users from the first 10000 observations and save them as a
variable called `users`.


```python
users = user_tag_count.head(10000)['OwnerUserId'].unique()
```

<span style="color:red">**Question 11:**</span>
Get 20 recommendations for each user in your list of users. Save these as a new
SFrame called `recs`.


```python
recs = m.recommend(users, k=20)
```

When people use recommendation systems for online commerice, it's often useful
to be able to recommending products from a single category of items, e.g.
recommending shoes to somebody who typically buys shirts.

To illustrate how this can be done with GraphLab Create, suppose we have a
Javascript user who is trying to learn Python. Below we will take just the
Javascript users and see what Python tags to recommend them.

<span style="color:red">**Question 12:**</span>
Create a variable called `javascript_users` that contains all unique users who
have used the `javascript` tag.


```python
javascript_users = user_tag_count['OwnerUserId'][user_tag_count['Tag'] == 'javascript'].unique()
```

<span style="color:red">**Question 13:**</span>
Use the model you created above to find the 20 most similar items to the tag
"python". Create a variable called `python_items` containing just these similar
items.


```python
python_items = m.get_similar_items(['python'], k=20)
python_items = python_items['similar']
```

<span style="color:red">**Question 14:**</span>
For each user in `javascript_users`, make 5 recommendations among the items in
`python_items`.


```python
python_recs = m.recommend(users=javascript_users, items=python_items, k=5)
```

<span style="color:red">**Question 15:**</span>
Use GraphLab Canvas to find out the 10 most often recommended items.


```python
python_recs.show()  # Then click on the Summary tab and look at the histogram in the second column.
```

<span style="color:red">**Question 16:**</span>
Save your model to a file.


```python
m.save('my_model')
```

##### Experimenting with new models

<span style="color:red">**Question 17:**</span>
Create a train/test split of the `user_tag_count` data from the section above.
Hint: Use
[random_split_by_user](https://dato.com/products/create/docs/generated/graphlab.recommender.util.random_split_by_user.html)
.


```python
train, test = graphlab.recommender.util.random_split_by_user(user_tag_count,
                                                             user_id='OwnerUserId',
                                                             item_id='Tag')
```

<span style="color:red">**Question 18:**</span>
Create a recommender model like you did above that only uses the training set.


```python
m1 = graphlab.recommender.create(train, user_id='OwnerUserId', item_id='Tag')
```

<span style="color:red">**Question 19:**</span>
Create a matrix factorization model that is better at ranking by setting
`unobserved_rating_regularization` argument to 1.


```python
m2 = graphlab.ranking_factorization_recommender.create(train,
                                                       user_id='OwnerUserId',
                                                       item_id='Tag',
                                                       target='Count',
                                                       ranking_regularization=1)
```

<span style="color:red">**Question 20:**</span>
Retrieve the coefficients for each user that were learned by this algorithm.


```python
m2['coefficients']['OwnerUserId']
```

<span style="color:red">**Question 21:**</span>
Compare the predictive performance of the two models. Given the ability to make
10 recommendations, which model predicted the highest proportion of items in the
test set (on average)?


```
results = graphlab.recommender.util.compare_models(test, [m1, m2],
                                                   metric='precision_recall')
```
