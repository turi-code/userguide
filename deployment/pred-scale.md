# Scaling a Predictive Service

A predictive service can scale with its performance requirements in two ways:

* Scale out by adding mode physical nodes,
* Scale up by parallelizing code execution.

In this chapter, we will outline both methods.

#### Scale out

Adjusting the number of nodes within a predictive service is very straightforward. The `PredictiveService` object provides a function [`add_nodes`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.add_nodes.html#graphlab.deploy.PredictiveService.add_nodes), which spins up one or more additional nodes and adds them to the predictive service. Adding a node has the following implications:

* A predictive service treats its nodes as entirely symmetrical, which means that all service components as well as all currently deployed objects need to be replicated onto the new node(s). This process can take a few minutes.
* Due to the nature of the distributed cache, adding nodes will flush the cache across the entire service. This could result in increased latency for a limited time.

There exists a corresponding function [`remove_nodes`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.remove_nodes.html#graphlab.deploy.PredictiveService.remove_nodes), which terminates one or more nodes, specified by their instance IDs.

#### Scale up

In order to optimally utilize the system resources within each node, you can adjust the degree of parallelism of the model evaluator component and hence increase the service's througput. By default, only a single model evaluator process is running within each node. Increasing this number through the [`set_scale_factor`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.set_scale_factor.html#graphlab.deploy.PredictiveService.set_scale_factor) API will spin up additional model evaluator processes, consuming not only CPU cycles, but also additional memory.

We recommend that you increase this number slowly, while closely monitoring the memory consumption of the service as it is put under load. Specifically for models with a large memory footprint increasing the scale factor will have a significant effect. You can get a momentary snapshot of memory usage through [`get_status`](https://dato.com/products/create/docs/generated/graphlab.deploy.PredictiveService.get_status.html#graphlab.deploy.PredictiveService.get_status) and track the behavior over time on CloudWatch.

Note that the number of cores is the upper limit for the scale factor. Any number higher than that will not have a beneficial effect on throughput anymore.
