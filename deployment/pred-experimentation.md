#Experimentation

A core feature of serving a model as a service in a production environment is the ability to experiment with multiple models and measure their respective success.

The previous chapter [Predictive Objects](https://dato.com/learn/userguide/deployment/pred-working-with-objects.html) describes how to deploy and serve a single Predictive Object through a RESTful endpoint. Beyond that Dato Predictive Services offers interfaces to support model management and experimentation:

* Aliasing: An alias is an endpoint that redirects to an existing Predictive Object.
* Policies: A Policy selects one model out of a set and serves it at a specified endpoint.

#### Endpoints

In the previous chapters we used the notion of an endpoint implicitly when talking about models or other Predictive Objects. In this section, we will elaborate on the endpoint concept a bit further.

Each deployed Predictive Object can be queried through its associated endpoint, which is composed by

* the load balancer's DNS name, for example `http://first-8410747484.us-west-2.elb.amazonaws.com`
* the path `/query/`, and
* the name of the Predictive Object, for example `sim_model`

Besides Predictive Objects endpoints can also be backed by an _alias_ or a _policy_, as explained below. At any point you can retrieve the list of all active endpoints in your Predictive Service through the [`PredictiveService.get_endpoints()`](TBD) API:

```no-highlight
print deployment.get_endpoints()
```

```no-highlight
+-------------------------+-------+---------+----------------+
|       endpoint URI      | info  | version |  description   |
+-------------------------+-------+---------+----------------+
|    /query/sim_model     | model |    1    |                |
|   /query/fact_model     | model |    2    |  Just testing  |
+-------------------------+-------+---------+----------------+
```

The _info_ column displays the type of the endpoint, while the _description_ is the string you can optionally provide when adding the model to the Predictive Service deployment.

#### Aliasing

When developing an application that consumes the predictive service, it is desirable to maintain a single endpoint physical endpoint that can be redirected to different models. Hence the application code does not need to be changed when testing and comparing multiple models. Dato Predictive Service provides the concept of an _alias_:

```no-highlight
deployment.alias('recommender', 'sim_model')
deployment.apply_changes();
```

This call creates a new endpoint ending in ``recommender``, serving the model ``sim_model``. This allows you to switch the underlying model without having to re-deploy any predictive objects. For example, you can replace ``fact_model`` by ``sim_model`` without changing the URI path ``/query/recommender`` in your application:

```no-highlight
deployment.alias('recommender', 'fact_model')
deployment.apply_changes();
```

At this point, the existing endpoint ending in ``recommender`` is redirected to ``fact_model``. The URL schema is the same as for any predictive object:

```no-highlight
http://first-8410747484.us-west-2.elb.amazonaws.com/query/recommender
```

Aliases show up in the list of the Predictive Service's endpoints:

```no-highlight
print deployment.get_endpoints()
```

```no-highlight
+-------------------------+------------------------+---------+----------------+
|       endpoint URI      |         info           | version |  description   |
+-------------------------+------------------------+---------+----------------+
|    /query/sim_model     |         model          |    1    |                |
|   /query/fact_model     |         model          |    2    |  Just testing  |
|   /query/recommender    | alias for `fact_model` |    2    |                |
+-------------------------+------------------------+---------+----------------+
```

Subsequent calls to `alias()` with the same alias name (like we did in the example above) will increment the version number of the associated endpoint.

The predictive object the alias is created for needs to exist in the Predictive Service deployment. Moreover, an alias cannot be created for another alias.

An alias can be removed from a Predictive Service like a Custom Predictive Object:

```no-highlight
deployment.remove('recommender')
deployment.apply_changes();
```

This does not affect the predictive object that has been served under this alias. However, it will affect any application that has been using the corresponding endpoint.

#### Experimentation

Experimenting with multiple models usually implies to serve them through one endpoint, with some policy determining which model should be served. Commonly this policy picks a model randomly, with a given probability. Dato Predictive Service provides a predefined policy called ``SimpleProbabilityPolicy`` that you can use to serve a set of models behind one endpoint.

```no-highlight
from graphlab.deploy import SimpleProbabilityPolicy

p = SimpleProbabilityPolicy({'sim_model': 0.9, 'fact_model': 0.1})

ps.add(name='ab test', obj=p, description='Trying out fact_model')
ps.apply_changes()
```

This endpoint will now serve models 'sim_model' for 90% of requests, and 'fact_model' for 10% of requests. (This example assumes you have deployed both models with these names before, as outlined above.)

The URL schema is no different from serving a single model:

```no-highlight
curl -X POST
     -d '{"api_key": "b0a1c056-30b9-4468-9b8d-c07289017228",
          "data": {
            "method": "recommend",
            "data": { "users": [ "Jacob Smith" ] }
            }
          }'
     http://first-8410747484.us-west-2.elb.amazonaws.com/query/ab%20test
```

Also the GLC query API is the same as for any other predictive object:

```no-highlight
deployment.query('ab test', method='recommend', data={ 'users': [ 'Jacob Smith' ] })
```

Of course you can still query each model directly using its ``.../query/<modelname>`` URL. Moreover you can point an alias to a policy:

```no-highlight
ps.alias('recommender', 'ab test')
ps.apply_changes()
```

The endpoint list contains the policy as well as the new alias:

```no-highlight
print deployment.get_endpoints()
```

```no-highlight
+-------------------------+------------------------------------+---------+----------------+
|       endpoint URI      |                info                | version |  description   |
+-------------------------+------------------------------------+---------+----------------+
|    /query/sim_model     |               model                |    1    |                |
|   /query/fact_model     |               model                |    2    |  Just testing  |
|   /query/recommender    |        alias for 'ab test'         |    3    |                |
|     /query/ab test      | SimpleProbabilityPolicy: {'sim...' |    1    |  Trying ou...  |
+-------------------------+------------------------------------+---------+----------------+
```
