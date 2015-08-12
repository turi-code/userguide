#Model Management

The previous chapter [Predictive Objects](https://dato.com/learn/userguide/deployment/pred-working-with-objects.html) describes how to serve a single model through an endpoint. Beyond that Dato Predictive Service offers a more flexible interface to manage multiple models, by serving them through a single endpoint using a selection policy. This enables a/b testing functionality.

Model management in a predictive service distinguishes between three concepts:

* An Endpoint
* A Model
* A Policy

After adding an endpoint to a predictive service deployment, you can add one or more models to the endpoint, as well as a policy that defines probabilities of each model being served for a request.

##### Define an Endpoint

An endpoint is added using the deployment's [add_endpoint](https://tbd) method:

```no-highlight
deployment.add_endpoint(endpoint_name='recommendations')
```

This endpoint is functional (tbd: what could that mean in practice? just returning 200 and an empty body?), but does not serve a model yet. Serving a model requires two steps:

1. adding a model to the predictive service deployment, and
2. attaching the model to an endpoint.

##### Add a Model

In order to add a model, you would use the deployment's [add_model](https://tbd) method. The same API can be used repeatedly to add more models:

```no-highlight
deployment.add_model(model_name='sim_model', item_similarity_model)
deployment.add_model(model_name='fact_model', factorization_model)
```

Just like [deployment.add](https://tbd) this API also allows for the submission of custom predictive objects.

##### Attach a Model to an Endpoint

The [attach_model](https://tbd) API associates the model with an endpoint that has been added to the deployment earlier:

```no-highlight
deployment.attach_model(model_name='sim_model', endpoint='recommendations')
deployment.attach_model(model_name='fact_model', endpoint='recommendations')
```

##### Set a Policy

By default, each model attached to an endpoint will get an equal amount of requests. In the above example, each model would serve 50% of the traffic. A custom policy allows to modify this behavior.

```no-highlight
deployment.set_policy(endpoint='recommendations', [{sim_model: 0.2}, {fact_model: 0.8}])
```

Any change to the deployment object needs to be published to the predictive service by calling the [apply_changes](https://tbd)
