#Experimentation

A core feature of serving a model as a service in a production environment is the ability to experiment with multiple models and measure their respective accuracy.

The previous chapter [Predictive Objects](https://dato.com/learn/userguide/deployment/pred-working-with-objects.html) describes how to deploy and serve a single model through a RESTful endpoint. Beyond that you have the option of deploying multiple models and associating them with a single endpoint, together with a model selection policy.

##### Deploy multiple models

The [deployment.add](https://tbd) API can be called repeatedly to deploy multiple models or predictive objects:

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

Or, directly through HTTP (assuming an example DNS name):

```no-highlight
curl -X POST
     -d '{"api_key": "b0a1c056-30b9-4468-9b8d-c07289017228",
          "data":{"method":"recommend",
          "data":{"users":["Jacob Smith"]}}}'
     http://first-8410747484.us-west-2.elb.amazonaws.com/query/sim_model

curl -X POST
     -d '{"api_key": "b0a1c056-30b9-4468-9b8d-c07289017228",
          "data":{"method":"recommend",
          "data":{"users":["Jacob Smith"]}}}'
     http://first-8410747484.us-west-2.elb.amazonaws.com/query/fact_model
```

#### Experimentation

The [set_endpoint](https://tbd) API enables you to experiment with multiple models by serving them transparently from the same endpoint:

```no-highlight
deployment.set_endpoint('recommender', policy={‘mymodel’: 0.2,’mymodel2’: 0.8})
```

Now you have created a new REST endpoint that serves two models, with each request going to one model with the specified probability:

```no-highlight
curl -X POST
     -d '{"api_key": "b0a1c056-30b9-4468-9b8d-c07289017228",
          "data":{"method":"recommend",
          "data":{"users":["Jacob Smith"]}}}'
     http://first-8410747484.us-west-2.elb.amazonaws.com/endpoint/recommender
```

Using the GLC query API:

```no-highlight
deployment.query_endpoint('recommender',
                          method='recommend',
                          data={'users':['Jacob Smith']})
```

(note that you can still query each model directly using the ``.../query/modelname`` URL)

Note that any of the above changes to the deployment still needs to be published to the predictive service by calling the [apply_changes](https://tbd) API.

To remove an endpoint entirely, call ``remove_endpoint``:

```no-highlight
deployment.remove_endpoint('recommender')
deployment.apply_changes();
```

This will not remove the model(s) that this endpoint served, it sill simply stop serving them through the ``.../endpoint/recommender`` URL.

Endpoints under a Predictive Service deployment can be listed as follows:

```no-highlight
deployment.endpoints
```

```no-highlight
Endpoint(s):
+-------+-------------+-------------------------------+----------------------------------+
| Index |  Endpoint   |              URL              |              Models              |
+-------+-------------+-------------------------------+----------------------------------+
|   0   | recommender | http://first-8410747484.us... | {‘mymodel’: 0.2,’mymodel2’: 0.8} |
|   1   |   testing   | http://first-8410747484.us... |         {‘testmodel’: 1}         |
|   2   |   staging   | http://first-8410747484.us... |         {‘new_model’: 1}         |
+-------+-------------+-------------------------------+----------------------------------+
[3 rows x 4 columns]
```

#### Managing models

A common challenge is the transition of a new model from a test/dev environment into production, without disrupting an existing application that accesses the model. Let's assume you have a model that already runs in production, at a specific endpoint:

```no-highlight
deployment.add(name='sim_model', obj=item_similarity_model)
deployment.set_endpoint('production', 'sim_model')
deployment.apply_changes();
```

Your application (e.g., a web UI) is using this model to serve the user experience, at the following URL:

```no-highlight
http://<dns-name>/endpoint/production
```

Moreover, you have a model that is still in testing, served at a separate endpoint:

```no-highlight
deployment.add(name='fact_model', obj=factorization_model)
deployment.set_endpoint('staging', 'sim_model')
deployment.apply_changes();
```

This model is accessible at:
```no-highlight
http://<dns-name>/endpoint/staging
```

Both URIs are used by your application, the production endpoint as well as the test endpoint (by activating a test/debug mode).

If you decide that the tested model is ready for production, you would add it to the production endpoint, possibly by slowly ramping up its traffic:

```no-highlight
deployment.set_endpoint('production',
                        policy={'sim_model': 0.9, 'fact_model': 0.1})
```

Now you are ready to push the changes:

```no-highlight
deployment.apply_changes();
```

At this point your production endpoint will start serving 10% of requests with the new model, and warm up its cache.

Note that the model `fact_model` is also still served through the `testing` endpoint. You might want to replace it with some other model (or models) there:

```no-highlight
deployment.add(name='pop_model', obj=popularity_model)
deployment.set_endpoint('staging', 'pop_model')
deployment.apply_changes();
```

Alternatively you could have deleted the staging endpoint entirely:

```no-highlight
deployment.remove_endpoint('staging')
deployment.apply_changes();
```

However, that could affect any application that is still trying to access this endpoint, as we assumed above.
