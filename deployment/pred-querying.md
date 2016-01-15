# Querying Predictive Services

In this section we cover the various ways to query a Predictive Service.

The deployment serves models through a REST API. The API takes JSON input, and returns JSON results.

#### Python Client

To make it easy to validate deployment changes, and to manually warm up the distributed cache, we offer a [query](https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.query.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.query) method as part of the Predictive Services API. This makes it is easy to query the deployment directly from within your GraphLab Create session.

##### GraphLab Create Models

For the example deployment, the code below demonstrates how we query for recommendations for user ```Jacob Smith```:

```python
deployment = gl.deploy.predictive_services.load('s3://sample-testing/first')
recs = deployment.query('recs', method='recommend', data={'users': ['Jacob Smith']})
```

This query results in a call to the `recommend` method on the deployed predictive object named `recs`, and returns a set of recommendations as JSON. We are using a `PopularityRecommender` model in this example (which we have deployed in the chapter about [Launching a Predictive Service](pred-launching.md)). All `recommend` methods of GraphLab Create recommender models take a `users` parameter. The array can contain one or more user names, for which an equal number of recommendations will be returned by the predictive service.

If we were using a classifier or regression model to make predictions, the signature looks different. The `predict` method of these models takes a parameter named `dataset`, which needs to contain values for the features the model was trained for (for more information on model training see for instance [`LinearRegression.predict`](https://dato.com/products/create/docs/generated/graphlab.linear_regression.LinearRegression.predict.html)).

Assume, for instance, we had deployed a model named `house_prices` trained on features `zipcode`, `sqft`, and `year`. Now we want to query the model with a specific sample:
the query call could look as follows:

```python
example_house
```

```python
{'zipcode': '98125',
 'sqft': 2170,
 'year': 1951}
```

```python
preds = deployment.query('house_prices', method='predict',
                         data={'dataset': example_house})
```

Note that `example_house` could include other features as well; they will be ignored if they have not been used for model training.

You can also specify the dictionary of feature key-value pairs explicitly:

```python
preds = deployment.query('house_prices', method='predict',
                         data={'dataset': {'zipcode': 98102,
                                           'sqft': 1350,
                                           'year': 1985}
                              })
```

Just like the regular `predict` method can take an SFrame with multiple rows, a predictive service can return batch predictions based on an SFrame:

```python
preds = deployment.query('house_prices', method='predict',
                         data={'dataset': house_data[:10]})
```

Or explicitly specified:

```python
preds = deployment.query('house_prices', method='predict',
                         data={'dataset': [{'zipcode': 98102,
                                            'sqft': 1350,
                                            'year': 1985},
                                           {'zipcode': 98103,
                                            'sqft': 1800,
                                            'year': 1978}]
                              })
```

##### Custom Predictive Objects

To query a custom predictive object you use its signature directly. Assume your method is defined as `my_method(a, b)`, and deployed as `my_method` you would query it as follows:

```python
result = deployment.query('my_method', a='foo', b='bar')
```

We also offer a standalone Python client package, which makes it easy for Python applications to query the Predictive Service. You can download that client package from [pypi](https://pypi.python.org/pypi):

```no-highlight
pip install graphlab-service-client
```

The package is imported as follows:

```python
import graphlab_service_client as gls

gls.query(...)
```

#### Using the REST Endpoint directly

We will use the Unix tool [cURL](http://curl.haxx.se/docs/manpage.html) to demonstrate how to submit the raw JSON body as a POST request to a predictive service. We can get the DNS name of the load balancer and the deployment's API key by printing the [PredictiveService](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.html) object:

```python
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
No Pending changes.
```

The HTTP endpoint of a predictive object (GraphLab Create model or custom method) is composed of the DNS name and the path `/query/<object name>`. For our previous example that would be `/query/recs`. The JSON body needs to contain the API key and the input to the object. In case of a GraphLab Create model it also requires the name of the model's method to call:

```no-highlight
curl -u api_key:b0a1c056-30b9-4468-9b8d-c07289017228 -d '{
  "data": {
    "method": "recommend",
    "data": { "users": [ "Jacob Smith" ] }
  }
}' http://first-8410747484.us-west-2.elb.amazonaws.com/query/recs
```

The possible HTTP response codes are:
* 200: The query was successful, a response is returned.
* 400: The execution of a custom predictive object failed due to an exception in the code. Further details are provided in the response body.
* 401: The request was not authorized, because the API key is missing or wrong.
* 404: The queried endpoint is not known to the predictive service.
* 500: An internal error in the predictive service caused the query to fail. Further details are provided in the response body.

In the case of a classifier or regression model you need to pass a dataset. Following our example from above, the call would be:

```no-highlight
curl -u api_key:b0a1c056-30b9-4468-9b8d-c07289017228 -d '{
  "data": {
    "method": "recommend",
    "data": {
      "dataset": {'zipcode': 98102, 'sqft': 1350, 'year': 1985}
    }
  }
}' http://first-8410747484.us-west-2.elb.amazonaws.com/query/get-similar-products
```

Or for batch predictions:

```no-highlight
curl -u api_key:b0a1c056-30b9-4468-9b8d-c07289017228 -d '{
  "data": {
    "method": "recommend",
    "data": {
      "dataset": [{'zipcode': 98102, 'sqft': 1350, 'year': 1985},
                  {'zipcode': 98103, 'sqft': 1800, 'year': 1978}]
    }
  }
}' http://first-8410747484.us-west-2.elb.amazonaws.com/query/get-similar-products
```

If you are querying a custom predictive object, the JSON body only requires the object's parameter names and values, inside a `data` object:

```no-highlight
curl -u api_key:b0a1c056-30b9-4468-9b8d-c07289017228 -d '{
  "data": { "product_id": 1 }
}' http://first-8410747484.us-west-2.elb.amazonaws.com/query/get-similar-products
```

For more information about custom predictive object see Chapter [Working with Objects](pred-working-with-objects.md).

Remember that the API key is a parameter optionally specified when creating the predictive service. If an API key is not specified at the time the service is created and launched, then one is generated for you.

#### Using JavaScript

We provide a JS library to query a predictive service. With this library querying becomes as simple as this:

```js
// replace these values with your endpoint configuration
var endpoint = "https://your-predictive-service-endpoint.com"
var api_key = "AN_API_KEY_STRING_GOES_HERE";

// create client
var client = new PredictiveServiceClient(endpoint, api_key);

// construct data
var data = {'users': ['Jacob Smith'] };

// construct query
var request_data = {"method": "recommend", "data": data};

// query
client.query('recs', request_data, function(err, resp) {
  console.log(resp.statusCode); // status code of the response
  console.log(resp.data); // response data
});
```

For more information on how to install and use the JS library visit [its GitHub repository](https://github.com/dato-code/Dato-Predictive-Service-Client-JS).

#### Writing your own client library

Because querying the API is easy using cURL, building a client library that depends on [libcurl](http://curl.haxx.se/libcurl/) is straightforward, since libcurl has bindings for all recent programming languages.
