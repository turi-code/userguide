#Making Recommendations 
There are a number of ways to make recommendations: for known users or new users, with new observation data or side information, and with different ways to explicitly control item inclusion or exclusion.  Let's walk through these options together.

##### Making recommendations for all users

By default, calling `m.recommend()` without any arguments returns the top 10 recommendations for all users seen during training.  It automatically excludes items that were seen during training. Hence all generated recommendations are for items that the user has not already seen.

```python
data = graphlab.SFrame({'user_id': ["Ann", "Ann", "Ann", "Brian", "Brian", "Brian"],
                  		'item_id': ["Item1", "Item2", "Item4", "Item2", "Item3", "Item5"],
                  		'rating': [1, 3, 2, 5, 4, 2]})
m = graphlab.factorization_recommender.create(data, target='rating')

recommendations = m.recommend()
```

##### Making recommendations for specific users

If you specify a `list` or `SArray` of users, `recommend()` returns recommendations for only those user(s). The user names must correspond to strings in the `user_id` column in the training data.

```python
recommendations = m.recommend(users=['Brian'])
```

##### Making recommendations for specific users and items

In situations where you build a model for all of your users and items, you may wish to limit the recommendations for particular users based on known item attributes. For example, for US-based customers you may want to limit recommendations to US-based products. The following code sample restricts recommendations to a subset of users and items -- specifically those users and items whose value in the 'country' column is equal to "United States".

```
country = 'United States'
m.recommend(users=users['user_id'][users['country']==country].unique(),
            items=items['item_id'][items['country']==country])
```

##### Making recommendations for new users

This is known as the "cold-start" problem.  The `recommend()` function works seamlessly with new users. If the model has never seen the user, then it defaults to recommending popular items:

```python
m.recommend(['Charlie'])
```

Here 'Charlie' is a new user that does not appear in the training data.  Also note that you don't need to explicitly write down `users=`; Python automatically assumes that arguments are provided in order, so the first unnamed argument to `recommend()` is taken to be the user list.


##### Incorporating information about a new user

To improve recommendations for new users, it helps to have side information or new observation data for the user.

##### Incorporating new side information

To incorporate side information, you must have already trained a recommender model that knows how to incorporate side features.  This can be done by passing in side information to `create()`.  For example:

```python
user_info = graphlab.SFrame({'user_id': ['Ann', 'Brian'],
                       		 'age_category': ['2', '3']})
m_side_info = graphlab.factorization_recommender.create(data, target='rating',
           		      		                            user_data=user_info)
```

Now, we can add side information for the new user at recommendation time. The new side information must contain a column with the same name as the column in the training data that's designated as the 'user_id'.  (For more details, please see the API documentation for [graphlab.recommender.create](https://dato.com/products/create/docs/generated/graphlab.recommender.create.html#graphlab.recommender.create).)

```python
new_user_info = graphlab.SFrame({'user_id' : ['Charlie'],
								 'age_category' : ['2']})
recommendations = m_side_info.recommend(['Charlie'],
										new_user_data = new_user_info)
```

Given Charlie's age category, the model can incorporate what it knows about the importance of age categories for item recommendations.  Currently, the following models can take side information into account when making recommendations: [LinearRegressionModel](https://dato.com/products/create/docs/generated/graphlab.linear_regression.LinearRegression.html), [MatrixFactorizationModel](https://dato.com/products/create/docs/generated/graphlab.recommender.MatrixFactorizationModel.html#graphlab.recommender.MatrixFactorizationModel), [FactorizationModel](https://dato.com/products/create/docs/generated/graphlab.recommender.FactorizationModel.html#graphlab.recommender.FactorizationModel).  LinearRegressionModel is the simplest model, and FactorizationModel the most powerful.  For more details on how each model makes use of side information, please refer to the model definition sections in the individual models' API documentation.

#### Incorporating new observation data

`recommend()` accepts new observation data. Currently, the [ItemSimilarityModel](https://dato.com/products/create/docs/generated/graphlab.recommender.item_similarity_recommender.ItemSimilarityRecommender.html) makes the best use of this information.

```python
m_item_sim = graphlab.item_similarity_recommender.create(data)
new_obs_data = graphlab.SFrame({'user_id' : ['Charlie', 'Charlie'],
	                        	'item_id' : ['Item1', 'Item5']})
recommendations = m_item_sim.recommend(['Charlie'], new_observation_data = new_obs_data)
```

##### Controlling the number of recommendations

The input parameter `k` controls how many items to recommend for each user.

```python
recommendations = m.recommend(k = 5)
```

##### Excluding specific items from recommendation

Suppose you make some recommendations to the user and they ignored them.  So now you want other recommendations.  This can be done by explicitly excluding those undesirable items via the `exclude` keyword argument.

```python
exclude_pairs = graphlab.SFrame({'user_id' : ['Ann'],
                           		 'item_id' : ['Item3']})

recommendations = m.recommend(['Ann'], k = 5, exclude = exclude_pairs)
```

By default, `recommend()` excludes items seen during training, so that it would not recommend items that the user has already seen.  To change this behavior, you can specify `exclude_known=False`.

```python
recommendations = m.recommend(exclude_known = False)
```

##### Including specific items in recommendation

Suppose you want to see only recommendations within a subset of items.  This can be done via the `items` keyword argument.  The input must be an SArray of items.

```python
item_subset = graphlab.SArray(["Item3", "Item5", "Item2"])
recommendations = m.recommend(['Ann'], items = item_subset)
```

##### Digging deeper

Behind the scenes, `recommend()` calls `predict()` to score each candidate item for each user.  To dig deeper into the recommendations, you can inspect the scores for specific user-item pairs.

```python
pairs_to_inspect = graphlab.SFrame({'user_id': ['Ann', 'Ann', 'Bob', 'Bob', 'Charlie', 'Charlie', 'Charlie'],
									'item_id': ['Item3', 'Item4', 'Item5', 'Item1', 'Item1', 'Item2', 'Item4']})
scores = m.predict(pairs_to_inspect)

# And you can give it the same new user side info
scores_with_side_info = m.predict(pairs_to_inspect, new_user_data = new_user_info)
```
