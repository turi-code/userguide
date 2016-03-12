# Recommender systems 

Building a recommender system is easy with GraphLab Create:  simply load data, create a recommender model, and start making recommendations. The data we will use for an example is sitting on an AWS S3 bucket as a csv file.  We can load it into a GraphLab Create SFrame with `read_csv()`, specifying the "rating" column to be loaded as integers.  For other ways of creating an SFrame and doing data munging, see the [SFrame chapter](../sframe/tabular-data.md).


```python
# Download data if you haven't already
import os
if os.path.exists('movie_ratings'):
    data = graphlab.SFrame('movie_ratings')
else:

    data = graphlab.SFrame.read_csv("http://s3.amazonaws.com/dato-datasets/movie_ratings/training_data.csv", column_type_hints={"rating":int})
    data .save('movie_ratings')

data.head()
```

<div style="max-height:1000px;max-width:1500px;overflow:auto;"><table frame="box" rules="cols">
    <tr>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">user</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">movie</th>
        <th style="padding-left: 1em; padding-right: 1em; text-align: center">rating</th>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Jacob Smith</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Flirting with Disaster</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">4</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Jacob Smith</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Indecent Proposal</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Jacob Smith</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Runaway Bride</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Jacob Smith</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Swiss Family Robinson</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Jacob Smith</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">The Mexican</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">2</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Jacob Smith</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Maid in Manhattan</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">4</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Jacob Smith</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">A Charlie Brown<br>Thanksgiving / The ...</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Jacob Smith</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Brazil</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">1</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Jacob Smith</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Forrest Gump</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">3</td>
    </tr>
    <tr>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">Jacob Smith</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">It Happened One Night</td>
        <td style="padding-left: 1em; padding-right: 1em; text-align: center; vertical-align: top">4</td>
    </tr>
</table>
[10 rows x 3 columns]<br/>
</div>



We have the data.  It's time to build a model.  There are many good models for making recommendations, but sometimes even knowing the right names can be a challenge, much less typing them time after time.

This is why GraphLab Create provides a default recommender called ... `recommender`.  You can build a default recommender with `recommender.create()`.
It requires a dataset to use for training the model, as well as the names of the columns that contain the user IDs, the item IDs, and the ratings (if present).

```python
# The data needs to contain at least three columns: user, movie, and rating.
model = graphlab.recommender.create(data,
                                    user_id="user",
                                    item_id="movie",
                                    target="rating")
```

Under the hood, the type of recommender is chosen based on the
provided data and whether the desired task is ranking (default) or
rating prediction.  The default recommender for this type of data and
the default ranking task is a matrix factorization model, implemented
on top of the disk-backed SFrame data structure.  The default solver
is stochastic gradient descent, and the recommender model used is the
[RankingFactorizationModel](https://dato.com/products/create/docs/generated/graphlab.recommender.ranking_factorization_model.RankingFactorizationModel.html), which balances rating prediction with
a ranking objective.  The default `create()` function does not allow
changes to the default parameters of a specific model, but it is just
as easy to build a recommender with your own parameters using
the appropriate model-specific `create()` function.


The trained model can now make recommendations of new items for users.
To do so, call `recommend()` with an SArray of user ids.  If `users`
is set to None, then `recommend()` will make recommendations for all
the users seen during training, automatically excluding the items that
are observed for each user.  In other words, if `data` contains a row
"Alice, The Great Gatsby", then `recommend()` will not recommend "The
Great Gatsby" for user "Alice".  It will return at most `k` new items
for each user, sorted by their rank.  It will return fewer than `k`
items if there are not enough items that the user has not already
rated or seen.

The `score` column of the output contains the *unnormalized*
prediction scores for each user-item pair.  The semantic meanings of
these scores may differ between models.  For the linear regression
model, for instance, a higher average score for a user means that the
model thinks that this user is generally more enthusiastic than
others.

```python
# You can now make recommendations for all the users you've just trained on
results = model.recommend()
```

The model can be saved for later use, either on the local machine or in an AWS S3 bucket.  The saved model sits in its own directory, and can be loaded back in later to make more predictions.


```python
# Save the model for later use
model.save("my_model")
```

Et voil&agrave;! You've just built your first recommender with GraphLab Create.

#### Implicit vs. Explicit data
The above example included ratings given to items by users. In situations where users do not provide ratings, a dataset would instead have just two columns -- user ID and item ID. We can still use collaborative filtering techniques to make recommendations. In this case we are leveraging "implicit" data about items that users watched, liked, etc., in contrast to the "explicit" ratings data in the previous example.

Training a model and making recommendations with such data is straightforward.

```python
m = graphlab.recommender.create(data,
                                user_id='user',
                                item_id='movie')
recs = m.recommend()
```

When no `target` is available, as above, then by default this returns an [ItemSimilarityRecommender](https://dato.com/products/create/docs/generated/graphlab.recommender.item_similarity_recommender.ItemSimilarityRecommender.html) which computes the similarity between each pair of items and recommends items to each user that are closest to items she has already used or liked. It measures item similarity with either Jaccard or cosine distance, which can be set
manually using a keyword argument called ``similarity_type`` when creating that
recommender directly:

```python
m = graphlab.item_similarity_recommender.create(data,
                                                user_id='user',
                                                item_id='movie',
                                                similarity_type='jaccard')
```

When a `target` is provided, the default GraphLab Create recommender is a
matrix factorization model. The matrix factorization model can also be
called explicitly with
[factorization_recommender.create](https://dato.com/products/create/docs/generated/graphlab.recommender.factorization_recommender.create.html).
When using the model-specific create function, other arguments can be
provided to better tune the model, such as `num_factors` or
`regularization`.  See the documentation on
[FactorizationRecommender](https://dato.com/products/create/docs/generated/graphlab.recommender.factorization_recommender.FactorizationRecommender.html) for more information.

```python
m = graphlab.factorization_recommender.create(data,
                                              user_id='user',
                                              item_id='movie',
                                              target='rating',
                                              regularization=0.05,
                                              num_factors=16)
```

All recommender objects in the [graphlab.recommender](https://dato.com/products/create/docs/graphlab.toolkits.recommender.html) module expose a common set of methods, such as [recommend](https://dato.com/products/create/docs/generated/graphlab.recommender.factorization_recommender.FactorizationRecommender.recommend.html#graphlab.recommender.factorization_recommender.FactorizationRecommender.recommend)
and [evaluate](https://dato.com/products/create/docs/generated/graphlab.recommender.factorization_recommender.FactorizationRecommender.evaluate.html). These will be covered in the next few sections.

#### Side information for users, items, and observations

In many cases, additional information about the users or items can
improve the quality of the recommendations.  For example, including
information about the genre and year of a movie can be useful
information in recommending movies.  We call this type of information
user side data or item side data depending on whether it goes with the
user or the item.

Including side data is easy with the `user_data` or `item_data`
parameters to the `recommender.create()` function.  These arguments
are SFrames and must have a user or item column that corresponds to
the `user_id` and `item_id` columns in the observation data.  Internally,
the data is joined to the particular user or item when training the
model, the data is saved with the model and also used to make
recommendations.

In particular, the
[FactorizationRecommender](https://dato.com/products/create/docs/generated/graphlab.recommender.factorization_recommender.FactorizationRecommender.html) and the [RankingFactorizationRecommender](https://dato.com/products/create/docs/generated/graphlab.recommender.ranking_factorization_recommender.RankingFactorizationRecommender.html) both incorporate the side data into the prediction through additional interaction terms between the user, the item, and the side feature. For the actual formula, see the API docs for the [FactorizationRecommender](https://dato.com/products/create/docs/generated/graphlab.recommender.factorization_recommender.FactorizationRecommender.html). Both of these models also allow you to obtain the parameters that have been learned for each of the side features via the `m['coefficients']` argument.

Side data may also be provided for each observation. For example, it might be useful to have recommendations change based on the time at which the query is being made. To do so, you could create a model using an SFrame that contains a time column, in addition to a user and item column. For example, a "time" column could include a string indicating the hour; this will be treated as a categorical variable and the model will learn a latent factor for each unique hour.

```
# sf has columns: user_id, item_id, time
m = gl.ranking_factorization_recommender.create(sf)
```

In order to include this information when requesting observations, you may include the desired additional data as columns in an SFrame for the `users` argument to `m.recommend()`. In our example above, when querying for recommendations, you would include the time that you want to use for each set of recommendations.

```
users_query = gl.SFrame({'user_id': [1, 2, 3], 'time': ['10pm', '10pm', '11pm']})
m.recommend(users=user_query)
```

In this case, recommendations for user 1 and 2 would use the parameters learned from observations that occurred at 10pm, whereas the recommendations for user 3 would incorporate parameters corresponding to 11pm. For more details, check out
  [recommend](https://dato.com/products/create/docs/generated/graphlab.recommender.factorization_recommender.FactorizationRecommender.recommend.html#graphlab.recommender.factorization_recommender.FactorizationRecommender.recommend) in the API docs.

You may check the number of columns used as side information by querying `m['observation_column_names']`, `m['user_side_data_column_names']`, and `m['item_side_data_column_names']`. By printing the model, you can also see this information. In the following model, we had four columns in the observation data (two of which were `user_id` and `item_id`) and four columns in the SFrame passed to `item_side_data` (one of which was `item_id`):

```
Class                           : RankingFactorizationRecommender

Schema
------
User ID                         : user_id
Item ID                         : item_id
Target                          : None
Additional observation features : 2
Number of user side features    : 0
Number of item side features    : 3
```

If new side data exists when recommendations are desired, this can be passed in via the `new_observation_data`, `new_user_data`, and `new_item_data` arguments. Any data provided there will take precedence over the user and item side data stored with the model.

Not all of the models make use of side data: the `popularity_recommender` and `item_similarity_recommender` create methods currently do not use it.  
