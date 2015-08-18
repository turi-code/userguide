#Choosing a Model
In this section, we give some intuition for which modeling choices you may make depending on your data and your task.

If your data is *implicit*, i.e., you only observe interactions between users and items, without a rating, then use item_similarity_recommender with Jaccard similarity (default) or the `ranking_factorization_recommender`.

If your data is *explicit*, i.e., the observations include an actual rating given by the user, then you have a wide array of options.  `item_similarity_recommender` with cosine or Pearson similarity can incorporate ratings when computing similarity between items.  In addition, `factorization_recommender` and `popularity_recommender` both support rating prediction.  If you care about *ranking performance*, instead of simply predicting the rating accurately, then choose `item_similarity_recommender` or `ranking_factorization_recommender`.  Both can work well with either implicit or explicit data. Sometimes one works better, sometimes the other, depending on the data set.

If you have ratings data and care about ratings prediction, then we typically recommend you use `factorization_recommender`.  In this model the observed ratings are modeled as a weighted combination of terms, where the weights (along with some of the terms, also known as factors) are learned from data.  All of these models can easily incorporate user or item side features.  

A linear model assumes that the rating is a linear combination of user features, item features, user bias, and item popularity bias.  The `factorization_recommender` goes one step further and allows each rating to also depend on a term representing the inner product of two vectors, one representing the user's affinity to a set of latent preference modes, and one representing the item's affinity to these modes.  These are commonly called latent factors and are automatically learned from observation data.  When side data is available, the model allows for interaction terms between these learned latent factors and all the side features.  As a rule of thumb, the presence of side data can make the model more finicky to learn (due to its power and flexibility).  

Note that all of these models come with a handful of regularization parameters which can affect test-time prediction accuracy, such as `num_factors` and `regularization`.  We recommend tuning them using the hyper-parameter search function, `graphlab.toolkits.model_params_search()`.

If you have implicit interaction data and you want to compare results
against the default item_similarity_recommender, then try the
`ranking_factorization_recommender`.  The ranking factorization model
has two solvers, one which uses a randomized sgd-based method to tune
the results, and the other which uses an implicit form of alternating
least squares (ALS).  On some datasets, these can yield better
precision-recall scores than `item_similarity_recommender`.

The sgd-based method samples unobserved items along with the observed
ones, then treats them as negative examples.  This is the default
solver.  

Implicit ALS is a version of the popular Alternating Least Squares
(ALS) algorithm that attempts to find factors that distinguish between
the given user-item pairs and all other negative examples.  This
algorithm can be faster than the sgd method, particularly if there are
many items, but it does not currently support side features.  This
solver can be activated by passing in ``solver = "ials"`` to
``ranking_factorization_recommender.create``


When the target ratings are binary, i.e., if they come from thumbs up/thumbs down flags, try the `factorization_recommender` with input parameter `binary_targets = True`.

The latent factors learned by both factorization recommenders can be used as features for other tasks.  In this case, it can help to have non-negative factors for improved interpretability.  Simply set `nmf=True` as an input parameter to create(), and the matrix factorization model will learn non-negative factors.

Lastly, here are a couple of common data issues that can affect the performance of a recommender.  First, if the observation data is very sparse, i.e., contains only one or two observations for a large number of users, then none of the models will perform much better than the simple baselines available via the `popularity_recommender`.  In this case, it might help to prune out the rare users and rare items and try again.  Also, re-examine the data collection and data cleaning process to see if mistakes were made.  Try to get more observation data per user and per item, if you can.

Another issue often occurs when usage data is treated as ratings.  Unlike explicit ratings that lie on a nice linear interval, say 0 to 5, usage data can be badly skewed.  For instance, in the Million Song dataset, one user played a song more than 16,000 times.  All the models would have a difficult time fitting to such a badly skewed target.  The fix is to bucketize the usage data.  For instance, any play count greater than 50 can be mapped to the maximum rating of 5.  You can also clip the play counts to be binary, e.g., any number greater than 2 is mapped to 1, otherwise it's 0.

For more on this check out our recent blog post, [Choosing a Recommender Model](http://blog.dato.com/choosing-a-recommender-model).

#### Evaluating Model Performance

When trying out different recommender models, it's critical to have a
principled way of evaluating their performance.  The standard approach
to this is to split the observation data into two parts, a training
set and a test set.  The model is trained on the training set, and
then evaluated on the test set -- evaluating your model on the same
dataset that it was trained on gives a very bad idea of how well it
will perform in practice.  Once the model type and associated parameters
are chosen, the model can be trained on the full dataset.

With recommender systems, we can evaluate models using two different
metrics, RMSE and precision-recall.  RMSE measures how well the model
predicts the score of the user, while precision-recall measures how
well the recommend() function recommends items that the user also
chooses.  For example, the best RMSE value is when the model exactly
predicts the value of all the ratings in the test set.  Similarly, the
best precision-recall value is when the user has 5 items in the test
set and recommend() recommends exactly those 5 items.  While both can
be important depending on the type of data and desired task,
precision-recall is often more useful in evaluating how well a
recommender system will perform in practice.

The GraphLab Create recommender toolkit includes a function,
[gl.recommender.random_split_by_user](https://dato.com/products/create/docs/generated/graphlab.recommender.random_split_by_user.html#graphlab.recommender.random_split_by_user),
to easily generate training and test sets from observation data.
Unlike `gl.SFrame.random_split`, it only puts data for a subset of the
users into the test set.  This is typically sufficient for evaluating
recommender systems.

`gl.recommender.random_split_by_user` generates a test set by first
choosing a subset of the users at random, then choosing a random
subset of that user's items.  By default, it chooses 1000 users and,
for each of these users, 20% of their items on average.  Note that not
all users may be represented by the test set, as some users may not
have any of their items randomly selected for the test set.

Once training and test set are generated, the
[gl.recommender.util.compare_models](https://dato.com/products/create/docs/generated/graphlab.recommender.util.compare_models.html#graphlab.recommender.util.compare_models)
function allows easy evaluation of several models using either RMSE or
precision-recall.  These models may the same models with different
parameters or completely different types of model.

The GraphLab Create recommender toolkit provides several ways of
working with rating data while ensuring good precision-recall.  To
acurately evaluate the precision-recall of a model trained on explicit
rating data, it's important to only include highly rated items in your
test set as these are the items a user would likely choose.  Creating
such a test set can be done with a handful of SFrame operations and
`gl.recommender.random_split_by_user`:

```
high_rated_data = data[data["rating"] >= 4]
low_rated_data = data[data["rating"] < 4]
train_data_1, test_data = gl.recommender.random_split_by_user(
                                    high_rated_data, user_id='user', item_id='movie')
train_data = train_data_1.append(low_rated_data)
```

Other examples of comparing models can be found in the API
documentation for
[gl.recommender.util.compare_models](https://dato.com/products/create/docs/generated/graphlab.recommender.util.compare_models.html#graphlab.recommender.util.compare_models).
