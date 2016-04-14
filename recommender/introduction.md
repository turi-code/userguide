# Recommender systems 

A recommender system allows you to provide personalized recommendations to users. With this toolkit, you can train a model based on past interaction data and use that model to make recommendations.

The code and data for the example below is available in the [sample-movie-recommender](https://github.com/dato-code/sample-movie-recommender/blob/master/movie_recommender.py).

## Input data

Creating a recommender model requires a data set to use for training the model, with columns that contain the user IDs, the item IDs, and (optionally) the ratings.

```no-highlight
+--------+---------+--------+------------+
| userId | movieId | rating | timestamp  |
+--------+---------+--------+------------+
|   1    |    2    |  3.5   | 1112486027 |
|   1    |    29   |  3.5   | 1112484676 |
|   1    |    32   |  3.5   | 1112484819 |
|   1    |    47   |  3.5   | 1112484727 |
|   1    |    50   |  3.5   | 1112484580 |
|   1    |   112   |  3.5   | 1094785740 |
|   1    |   151   |  4.0   | 1094785734 |
|   1    |   223   |  4.0   | 1112485573 |
|   1    |   253   |  4.0   | 1112484940 |
|   1    |   260   |  4.0   | 1112484826 |
+--------+---------+--------+------------+
```

You may have additional data about users or items. For example we might have a dataset of movie metadata.

```no-highlight
+---------+---------------------+---------------------+------+
| movieId |        title        |        genres       | year |
+---------+---------------------+---------------------+------+
|    1    |      Toy Story      | [Adventure, Anim... | 1995 |
|    2    |       Jumanji       | [Adventure, Chil... | 1995 |
|    3    |   Grumpier Old Men  |  [Comedy, Romance]  | 1995 |
|    4    |  Waiting to Exhale  | [Comedy, Drama, ... | 1995 |
|    5    | Father of the Br... |       [Comedy]      | 1995 |
+---------+---------------------+---------------------+------+
```

## Building a model

There are a variety of machine learning techniques that can be used to build a recommender model. 
GraphLab Create provides a method `graphlab.recommender.create` that will automatically choose an appropriate model for your data set. 

First we create a random split of the data to produce a validation set that can be used to evaluate the model. 

```python
training_data, validation_data = gl.recommender.util.random_split_by_user(actions, 'userId', 'movieId')
model = gl.recommender.create(training_data, 'userId', 'movieId')
```

Now that you have a model, you can make recommendations

```python
# You can now make recommendations for all the users you've just trained on
results = model.recommend()
```
See [Using trained models](using-trained-models.md) for more details on

* making recommendations
* finding similar items and users
* evaluating the model
* saving models
* and more

If you want to choose a particular kind of model to train, check out [Choosing a Model](choosing-a-model.md), where we discuss types of data you might encounter (implicit or explicit) and the types of models worth considering (item-based similarity, factorization-based models, and so on).

Et voil&agrave;! You've just built your first recommender with GraphLab Create.

## Visualizations

You can explore, explain, and evaluate the model. 



