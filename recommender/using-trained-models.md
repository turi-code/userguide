## Using trained models

All recommender objects in the [graphlab.recommender](https://dato.com/products/create/docs/graphlab.toolkits.recommender.html) module expose a common set of methods, such as [recommend](https://dato.com/products/create/docs/generated/graphlab.recommender.factorization_recommender.FactorizationRecommender.recommend.html#graphlab.recommender.factorization_recommender.FactorizationRecommender.recommend)
and [evaluate](https://dato.com/products/create/docs/generated/graphlab.recommender.factorization_recommender.FactorizationRecommender.evaluate.html). 

### Making recommendations

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

### Finding Similar Items 

Many of the above models make recommendations based on some notion of similarity between a pair of items. Querying for similar items can help you understand the model's behavior on your data.  

We have made this process very easy with the [get_similar_items](https://dato.com/products/create/docs/generated/graphlab.recommender.item_similarity_recommender.ItemSimilarityRecommender.get_similar_items.html#graphlab.recommender.item_similarity_recommender.ItemSimilarityRecommender.get_similar_items) function:

```
similar_items = m.get_similar_items(my_list_of_items, k=20)
```

The above will return an SFrame containing the 20 nearest items for every item in `my_list_of_items`. The definition of "nearest" depends on the type of similarity used by the model. For instance, "jaccard" similarity measures the two item's overlapping users. The 'score' column contains a similarity score ranging between 0 and 1, where larger values indicate increasing similarity. The mathematical formula used for each type of similarity can be found in the API documentation for
[ItemSimilarityRecommender](https://dato.com/products/create/docs/generated/graphlab.recommender.item_similarity_recommender.ItemSimilarityRecommender.html#graphlab.recommender.item_similarity_recommender.ItemSimilarityRecommender).

For a factorization-based model, the similarity used for is the Euclidean distance between the items' two factors, which can be obtained using m['coefficients'].

### Saving a model

The model can be saved for later use, either on the local machine or in an AWS S3 bucket.  The saved model sits in its own directory, and can be loaded back in later to make more predictions.

```python
# Save the model for later use
model.save("my_model")
```


