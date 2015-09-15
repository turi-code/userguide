# Querying Predictive Services
In this section we cover the various ways to query a Predictive Service.

The deployment serves models through a REST API. The API takes JSON input, and
returns JSON results.

#### Python Client

To make it easy to validate deployment changes, and to manually warm up the
distributed cache, we offer a [query](
https://dato.com/products/create/docs/generated/graphlab.deploy._predictive_service._predictive_service.PredictiveService.query.html#graphlab.deploy._predictive_service._predictive_service.PredictiveService.query)
method. This makes it is easy to query the deployment directly from within your
GraphLab Create session.

For the example deployment, the code below demonstrates how we query for
recommendations for user ```Jacob Smith```:

```python
deployment = gl.deploy.predictive_services.load('s3://sample-testing/first')
recs = deployment.query('recs', method='recommend', data={'users':['Jacob Smith']})
```

This query results in a call to the `recommend` method on the deployed
Predictive Object named `recs`, and returns a set of recommendations as JSON.

We also offer a standalone Python client package, which makes it easy for Python
applications to query the Predictive Service. You can download that client
package from [pypi](https://pypi.python.org/pypi)

```no-highlight
pip install graphlab-service-client
```

##### Using curl

Another way to query the REST API is with the Unix ```curl``` command. Recall,
that we can get the DNS name of the load balancer and the deployment's API key
by printing the deployment
[(PredictiveService)](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.html?highlight=predictiveservice)
object:

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
No Pending changes.
```

The example below demonstrates how to reproduce the same query shown above using
curl:

```no-highlight
curl -X POST -d '{"api_key": "b0a1c056-30b9-4468-9b8d-c07289017228",
                  "data": {
                    "method": "recommend",
                    "data": { "users": [ "Jacob Smith" ] }
                    }
                  }'
     http://first-8410747484.us-west-2.elb.amazonaws.com/data/recs
```

Remember that the API key is a parameter optionally specified when creating the
Predictive Service Deployment. If an API key is not specified at the time the
Predictive Service is created and launched, then one is generated for you.

#### Writing your own client library

Because querying the API is easy using ```curl```, building a client library
that depends on ```libcurl``` is really easy, since ```libcurl``` has bindings
for all recent programming languages.
