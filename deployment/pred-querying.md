# Querying Predictive Services

In this section we cover the various ways to query a Predictive Service.

The deployment serves models through a REST API. The API takes JSON input, and returns JSON results.

#### Python Client

To make it easy to validate deployment changes, and to manually warm up the distributed cache, we offer a [query](https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.query.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.query) method as part of the Predictive Services API. This makes it is easy to query the deployment directly from within your GraphLab Create session.

For the example deployment, the code below demonstrates how we query for recommendations for user ```Jacob Smith```:

```python
deployment = gl.deploy.predictive_services.load('s3://sample-testing/first')
recs = deployment.query('recs', method='recommend', data={'users': ['Jacob Smith']})
```

This query results in a call to the `recommend` method on the deployed predictive object named `recs`, and returns a set of recommendations as JSON.

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
curl -X POST -d '{"api_key": "b0a1c056-30b9-4468-9b8d-c07289017228",
                  "data": {
                    "method": "recommend",
                    "data": { "users": [ "Jacob Smith" ] }
                    }
                  }'
     http://first-8410747484.us-west-2.elb.amazonaws.com/query/recs
```

The possible HTTP response codes are:
* 200: The query was successful, a response is returned.
* 400: The execution of a custom predictive object failed due to an exception in the code. Further details are provided in the response body.
* 404: The queried endpoint is not known to the predictive service.
* 500: An internal error in the predictive service caused the query to fail. Further details are provided in the response body.

If you are querying a custom predictive object, the JSON body only requires the object's parameter names and values:

```no-highlight
curl -X POST -d '{"api_key": "b0a1c056-30b9-4468-9b8d-c07289017228",
                  "data": { "product_id": 1 }
                 }'
     http://first-8410747484.us-west-2.elb.amazonaws.com/query/get-similar-products
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

Because querying the API is easy using ```curl```, building a client library that depends on ```libcurl``` is straightforward, since ```libcurl``` has bindings for all recent programming languages.
