#Finding Similar Items 
Many of the above models make recommendations based on some notion of similarity between a pair of items. Querying for similar items can help you understand the model's behavior on your data.  

We have made this process very easy with the [get_similar_items](https://dato.com/products/create/docs/generated/graphlab.recommender.item_similarity_recommender.ItemSimilarityRecommender.get_similar_items.html#graphlab.recommender.item_similarity_recommender.ItemSimilarityRecommender.get_similar_items) function:

```
similar_items = m.get_similar_items(my_list_of_items, k=20)
```

The above will return an SFrame containing the 20 nearest items for every item in `my_list_of_items`. The definition of "nearest" depends on the type of similarity used by the model. For instance, "jaccard" similarity measures the two item's overlapping users. The 'score' column contains a similarity score ranging between 0 and 1, where larger values indicate increasing similarity. The mathematical formula used for each type of similarity can be found in the API documentation for
[ItemSimilarityRecommender](https://dato.com/products/create/docs/generated/graphlab.recommender.item_similarity_recommender.ItemSimilarityRecommender.html#graphlab.recommender.item_similarity_recommender.ItemSimilarityRecommender).

For a factorization-based model, the similarity used for is the Euclidean distance between the items' two factors, which can be obtained using m['coefficients'].
