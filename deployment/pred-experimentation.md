# Experimentation
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

Besides Predictive Objects endpoints can also be backed by an _alias_ or a _policy_, as explained below. At any point you can retrieve the list of all active endpoints in your Predictive Service through the [`PredictiveService.get_endpoints`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_endpoints.html) API:

```python
print deployment.get_endpoints()
```

```no-highlight
+-----------------+-------+---------+----------------+
|  endpoint name  | info  | version |  description   |
+-----------------+-------+---------+----------------+
|    sim_model    | model |    1    |                |
|   fact_model    | model |    2    |  Just testing  |
+-----------------+-------+---------+----------------+

```

The _info_ column displays the type of the endpoint, while the _description_ is the string you can optionally provide when adding the model to the Predictive Service deployment.

#### Aliasing

When developing an application that consumes the predictive service, it is desirable to maintain a single endpoint physical endpoint that can be redirected to different models. Hence the application code does not need to be changed when testing and comparing multiple models. Dato Predictive Service provides the concept of an _alias_:

```python
deployment.alias('recommender', 'sim_model')
deployment.apply_changes();
```

This call creates a new endpoint ending in ``recommender``, serving the model ``sim_model``. This allows you to switch the underlying model without having to re-deploy any predictive objects. For example, you can replace ``fact_model`` by ``sim_model`` without changing the URI path ``/query/recommender`` in your application:

```python
deployment.alias('recommender', 'fact_model')
deployment.apply_changes();
```

At this point, the existing endpoint ending in ``recommender`` is redirected to ``fact_model``. The URL schema is the same as for any predictive object:

```no-highlight
http://first-8410747484.us-west-2.elb.amazonaws.com/query/recommender
```

Aliases show up in the list of the Predictive Service's endpoints:

```python
print deployment.get_endpoints()
```

```no-highlight
+-----------------+------------------------+---------+----------------+
|  endpoint name  |         info           | version |  description   |
+-----------------+------------------------+---------+----------------+
|    sim_model    |         model          |    1    |                |
|   fact_model    |         model          |    2    |  Just testing  |
|   recommender   | alias for 'fact_model' |    2    |                |
+-----------------+------------------------+---------+----------------+
```

Subsequent calls to `alias()` with the same alias name (like we did in the example above) will increment the version number of the associated endpoint.

The predictive object the alias is created for needs to exist in the Predictive Service deployment. Moreover, an alias cannot be created for another alias.

An alias can be removed from a Predictive Service like a Custom Predictive Object:

```python
deployment.remove('recommender')
deployment.apply_changes();
```

This does not affect the predictive object that has been served under this alias. However, it will affect any application that has been using the corresponding endpoint.

#### Experimentation

Experimenting with multiple models usually implies to serve them through one endpoint, with some policy determining which model should be served. Dato Predictive Services provides the ability to add such a policy to a deployment, just like a regular single model, with a name that translates to a single endpoint:

```python
from graphlab.deploy.predictive_service import ProbabilityPolicy

p = ProbabilityPolicy({'sim_model': 0.9, 'fact_model': 0.1})

ps.add(name='ab test', obj=p, description='Trying out fact_model')
ps.apply_changes()
```

This endpoint will now serve models 'sim_model' for 90% of requests, and 'fact_model' for 10% of requests. (This example assumes you have deployed both models with these names before, as outlined above.) For more information about experimentation policies, see below.

The URL schema is no different from serving a single model:

```no-highlight
curl -u api_key:b0a1c056-30b9-4468-9b8d-c07289017228 -d '{
  "data": {
    "method": "recommend",
    "data": { "users": [ "Jacob Smith" ] }
  }
}' http://first-8410747484.us-west-2.elb.amazonaws.com/query/ab%20test
```

Also the GLC query API is the same as for any other predictive object:

```python
deployment.query('ab test', method='recommend', data={ 'users': [ 'Jacob Smith' ] })
```

Of course you can still query each model directly using its ``.../query/<modelname>`` URL. Moreover you can point an alias to a policy:

```python
ps.alias('recommender', 'ab test')
ps.apply_changes()
```

The endpoint list contains the policy as well as the new alias:

```python
print deployment.get_endpoints()
```

```no-highlight
+-------------+--------+-------------+---------+---------------------+
|    name     |  type  | cache_state | version |     description     |
+-------------+--------+-------------+---------+---------------------+
|  sim_model  | model  |   enabled   |    1    |                     |
| fact_model  | model  |   enabled   |    2    |    Just testing     |
| recommender | alias  |   disabled  |    3    | alias for 'ab test' |
|   ab test   | policy |   disabled  |    1    | Trying out fact ... |
+-------------+--------+-------------+---------+---------------------+
```

##### Available Policies

As of version 1.6 Dato Predictive Services provides two experimentation policies:

* **ProbabilityPolicy**: enables simple A/B testing.
* **EpsilonGreedyPolicy**: lets you implement a multi-armed bandit.

Both are described in the following sections.

##### A/B Testing

Regular A/B testing involves a set of experiments and associated probabilities. Each request to an endpoint is routed to one of the experiments with its associated probability. This is considered a pure _exploration_ approach, as the evaluation of a model's success and the according adjustment of the probabilities happens manually.

In the context of Dato Predictive Services, this methodology is implemented through a ``ProbabilityPolicy`` endpoint. It is instantiated as follows:

```python
from graphlab.deploy.predictive_service import ProbabilityPolicy

p = ProbabilityPolicy({'sim_model': 0.9, 'fact_model': 0.1})
```

Any model listed in the dictionary passed to the policy must have been added to the predictive service before. The policy just consolidates them under a new endpoint, with the given probabilities. The object `p` can now be used as a predictive object when calling `add` on a predictive service deployment object.

##### Multi-armed Bandits

The idea of multi-armed bandits is to balance exploration (exposing experiments of unknown quality to the user to evaluate them) with exploitation (serving experiences with known, good quality). One of the simplest algorithms to strike this balance is known as the _epsilon-Greedy Algorithm_. Plenty of literature is available to elaborate on the details of the algorithm, so let us just scratch the surface here: epsilon-Greedy decides with a given probability (the value of epsilon) whether to explore or exploit. If the algorithm decides to explore, it randomly picks one of  given set of experiments. If it decides to exploit (1 - epsilon), it picks the experiment that has proven most successful so far, based on the notion of _reward_ that has been assigned to previous results.

Let's look at how to use this policy:

```python
from graphlab.deploy.predictive_service import EpsilonGreedyPolicy

p = EpsilonGreedyPolicy(['sim_model', 'fact_model'], epsilon=0.1)

ps.add(name='bandit', obj=p, description='Let the best one win')
ps.apply_changes()
```

This policy takes two required parameters:

1. a list of predictive objects that should be explored, and
2. a value for epsilon.

Because this policy includes an exploitation path, it requires to be aware of some notion of success of a model. If you use this policy, you will need to supply feedback for results of queries to the policy's endpoint. Predictive Services already provides an API to submit feedback, based on the unique ID of a query result. The epsilon-greedy policy uses the same mechanism, but expects the specific keyword `reward` that denotes the reward for a query result.

Here is an example, assuming the policy has been deployed according to the previous code snippet. The example uses a method `isSuccessful` which applies some measure of success to the query result (for instance, user engagement).

```python
r = ps.query('bandit', data={'users':['Jacob Smith']})

...

if isSuccessful(r['response']):
  ps.feedback(r['uuid'], reward = 1)
else:
  ps.feedback(r['uuid'], reward = 0)
```

The epsilon-greedy policy uses the feedback mechanism built into Dato Predictive Services to update the success measure of each predictive object. Specifically it looks for the keyword `reward` and expects a float value for it. Upon receiving such feedback, the policy then updates the average reward of the predictive object that served this request. As you can see, this makes the policy stateful, as it maintains the average rewards of all of its predictive objects.

Over time, the predictive object with the highest rewards will be favored by the exploitation branch of the policy, while it keeps exploring all of its predictive objects equally. This ensures that a different object can emerge as the best one if the success metric (and hence the reward feedback) changes.
