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
recs_sim = deployment.query('sim_model', method=recommend', data={'users':['Jacob Smith']})
recs_fact = deployment.query('fact_model', method=recommend', data={'users':['Jacob Smith']})
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
deployment.query_endpoint('recommender', method=recommend', data={'users':['Jacob Smith']})
```

(note that you can still query each model directly using the ``.../query/modelname`` URL)

Note that any of the above changes to the deployment still needs to be published to the predictive service by calling the [apply_changes](https://tbd) API.
