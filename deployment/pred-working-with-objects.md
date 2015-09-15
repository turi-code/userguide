# Working with Objects
Predictive Services host your models in a scalable REST-ful webservice. All GraphLab Create Models are Predictive Objects. In addition to deploying GraphLab Create Models, we support Custom Predictive Objects for composing multiple Models and GraphLab Create data structures. With Custom Predictive Objects, you can deploy arbitrary business logic on top of your Models simply by defining a Python function. In this chapter we will demonstrate both the usage of a model as well as a Custom Predictive Object in a Predictive Service.

Let's train a GraphLab Create Model. For the rest of this chapter we will utilize this model when interacting with Predictive Services.

```no-highlight
data_url = 'https://s3.amazonaws.com/dato-datasets/movie_ratings/sample.small'
data = graphlab.SFrame.read_csv(data_url,delimiter='\t',column_type_hints={'rating':int})
model = graphlab.popularity_recommender.create(data, 'user', 'movie', 'rating')
```

#### Add a Predictive Object to the deployment

The Predictive Service Deployment's [`add()`](https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.add.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.add) method stages a Predictive Object for deployment to the cluster.

```no-highlight
deployment.add('recs', model)
```

Now if you print the deployment there will be pending change for the newly added object.

```no-highlight
print deployment
```

```
Name                  : first
S3 Path               : s3://sample-testing/first
Description           : None
API Key               : b0a1c056-30b9-4468-9b8d-c07289017228
CORS origin           :
Global Cache State    : enabled
Load Balancer DNS Name: first-8410747484.us-west-2.elb.amazonaws.com

Deployed predictive objects:
Pending changes:
	Adding: recs description:
```

To finish publishing this Predictive Object -- a recommender model -- call the
[`apply_changes()`](https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.apply_changes.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.apply_changes) method. When you call this API, the pending Predictive Objects will be uploaded to S3, and the cluster will be notified to download them from S3.

```no-highlight
deployment.apply_changes()
```

Of course you can deploy more than one Predictive Object. The [`PredictiveService.add`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.add.html) API can be called repeatedly to deploy multiple predictive objects (models or custom predictive functions):

```no-highlight
deployment.add(name='sim_model', obj=item_similarity_model)
deployment.add(name='fact_model', obj=factorization_model)
```

Each object can be queried explicitly and directly, using its name:

```no-highlight
recs_sim = deployment.query('sim_model',
                            method='recommend',
                            data={'users':['Jacob Smith']})
recs_fact = deployment.query('fact_model',
                             method='recommend',
                             data={'users':['Jacob Smith']})
```

Each deployment of a Predictive Object creates an endpoint for the object, which can be queried directly through HTTP (assuming an example DNS name):

```no-highlight
http://first-8410747484.us-west-2.elb.amazonaws.com/query/sim_model
```

```no-highlight
http://first-8410747484.us-west-2.elb.amazonaws.com/query/fact_model
```


#### Update an existing Predictive Object

The Predictive Service Deployment's
[update](https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.update.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.update) method stages an existing Predictive Object for this deployment to be updated, which results in the object's version being incremented. Once ```apply_changes()``` is called, the updated object will be proactively warmed in the distributed cache, and existing cached entries for this model will be expired and purged in 15 minutes. Using this method to update an existing object ensures rolling updates with zero downtime. By pre-emptively warming the cache you can be confident that latencies will not spike with popular requests during an update.

```no-highlight
new_model = graphlab.recommender.create(...)
deployment.update('recs', new_model)
deployment.apply_changes()
```

#### Define a Custom Predictive Object

Often times, you want to be able to include some additional logic with your predictive model&mdash;you may want to combine results from multiple models and return a prediction; you my want to apply some transformations to the output of a model before returning; you may want to join your input data with other dataset(s) before passing it to the model. With GraphLab Create, it's easy to deploy your custom logic in a Predictive Service.

Let's look at an example. Suppose you want to take as input a product ID and recommend similar products to a user. You have already trained a nearest neighbor model that you want to use, but the input from your website is simply a product ID, so you need to join the product ID with other information in your database before feeding the product information to the model. Let's say we have an SFrame that captures production information:

```no-highlight
import graphlab as gl
products = gl.SFrame({
    'id'        :[1,    2,    3],
    'name'      :['p1', 'p2', 'p3' ],
    'category'  :['c1', 'c2', 'c1']})
```

And we have trained a nearest neighbor model on the products:

```no-highlight
nn_m = gl.nearest_neighbors.create(products, label='id')
```

Now in order to be able to take a product ID as input, query your nearest neighbor model and return similar products, you can define a custom query function:

```no-highlight
def recommend_similar_products(product_id):
    ''' Takes product id and returns two similar products

    Input:  integer, product ID to query
    Output: a list of products that are similar to input product
    '''

    # find full product information by join with products
    # in reality, you may query from database or cache, etc.
    product_info = products.filter_by([product_id], 'id')

    # query 2 similar products, return format looks like
    # {'distance': 0.0, 'query_label': 0, 'rank': 1, 'reference_label': 1}
    neighbors = nn_m.query(product_info, k = 2)

    # add more product information and return
    return products.filter_by(neighbors['reference_label'], 'id')
```

Now add the custom Predictive Object to your Predictive Service with the
[add](https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.add.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.add) or [update](https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.update.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.update) methods.

Given an existing Predictive Service deployment, and a handle to it (by way of a variable named "deployment"), the snippet below demonstrates how you would add your own custom logic to the Predictive Service deployment:

```no-highlight
deployment.add('get-similar-products', recommend_similar_products,
               description='Get two similar products given a product id')
```

In fact, what we've done is simply to define a query function and add it to our Predictive Service deployment. Behind the scenes, that function is used to instantiate a Predictive Object.

Before you deploy your new custom query to production, it's a good idea to do a local test of the query using [test_query](https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.test_query.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.test_query). This method runs your query locally, but simulates the actual end-to-end flow of serializing inputs, running the query and returning the serialized result.

```no-highlight
deployment.test_query('get-similar-products', product_id=1)
```

After you are done, deploy to production and run the query:

```no-highlight
deployment.apply_changes()
deployment.query('get-similar-products', product_id=1)
```

To help the consumer of your custom query, the doc string for your query is automatically extracted from your custom query function. You can get the doc string back via the `get_doc_string()` API:

```no-highlight
print deployment.describe('get-similar-products')
```

```
Takes product id and returns two similar products

    Input:  integer, product ID to query
    Output: a list of products that are similar to input product
None
```

To list all currently deployed predictive objects, you can use the following API:

```no-highlight
print deployment.deployed_predictive_objects
```

```no-highlight
{'recommender_one': 2, 'recommender_two': 1}
```

##### Type Considerations for Custom Predictive Objects

Parameters that are passed to or returned by a Custom Predictive Object need to be JSON serializable. This requirement puts a restriction on possible types for such parameters, especially if you use a Python package that returns non uniform float types (like numpy.float64).

##### Logging in a Custom Predictive Object

You may want to do some custom logging in your Custom Predictive Object. We inject a `log` method into your function just for this purpose. Any information logged using this function would automatically be written to a custom log file. The log file is rotated periodically and shipped to the same S3 log location you specified when creating your Predictive Service, exactly like the
query and feedback logs (see [Logging and Feedback](pred-logging-feedback.md)).

Here is an example of logging from within your custom method:

```python
def my_query(param1, param2):
    # log the information
    my_query.log(info='some information')
    # other logic continues
```

If you want to inspect the custom log immediately, you can call the Predictive Service's
[`flush_logs`](https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.flush_logs.html) method to force logs to be shipped to your S3 log path.

To consume the log, see the [Logging and Feedback](pred-logging-feedback.md) section in this user guide.

##### Python Package Dependencies

If your custom logic depends on other Python packages, you should use the `@graphlab.deploy.required_packages` decorator for your custom query function.

For example, if your query depends on a package called 'names', then you would do the following:

```no-highlight
@graphlab.deploy.required_packages(['names=0.3.0'])
def generate_names(num_names):
    import names
    # your query logic here
```

Notice the format for the required_packages parameter is consistent with the format required by the [Python distutils module](https://docs.python.org/2.7/library/distutils.html).

##### Dependent Python Files

If your custom query is defined in another Python file, or if it depends on other Python files you’ve created, you may instruct GraphLab Create to package those files for you by using the @graphlab.deploy.required_files decorator.

For example, if you have a set of Python scripts in a folder called ‘product_recommender’, and your custom query depends on all Python files in that folder:

```no-highlight
@graphlab.deploy.required_files('product_recommender', '*.py')
    def recommend_similar_products(product_id):
        from product_recommend import query_db
        ...
```

The first parameter to `required_files` can be a file name, a folder name or a list containing both file or folder names. GraphLab Create automatically extracts the required files and ships them to the Predictive Service cluster. The second parameter is a file name "glob" pattern that is used to select only the files that are needed. It is implemented using the [fnmatch](https://docs.python.org/2/library/fnmatch.html) Python package.

#### Removing a Predictive Object

To remove a Predictive Object from your deployment, simply call the [remove](https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.remove.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.remove) method, which takes the name of the object to be removed as a parameter. Like the ```add``` method, this has the effect of staging a change, but it will not take affect until ```apply_changes``` is called.

For example, the following command will remove a previously added Predictive Object with the name `get-similar-products`:

```no-highlight
deployment.remove('get-similar-products')
```

Note that this call will fail if the model is referred to by a policy or an alias (see [chapter about experimentation](pred-experimentation.html)). You can find out whether such a dependency exist by calling [PredictiveService.get_endpoint_dependencies](TBD).
