# Deployment

In this chapter we demonstrate how GraphLab Create makes it easy to take predictive applications to production, by enabling batch processing with asynchronous and distributed job execution through Dato Distributed, and real-time querying and consumption of predictive objects (models or custom functions) with Dato Predictive Services. Note that jobs can be arbitrary python code.

Here is a short summary of what you can do with each of these features:

#### Batch processing with Dato Distributed

- Run distributed jobs in your Hadoop cluster.
- Run distributed jobs in Amazon's EC2 cloud computing environment.
- Scale out your scenario using map-reduce concepts.
- Transparently scale out the execution of GraphLab Create toolkits through Distributed Machine Learning (DML).

[<img alt="Jobs Dashboard in GraphLab Canvas" src="images/jobs-dashboard.png" style="max-height: 500px; max-width: 60%; margin-left: 15%;" />](images/jobs-dashboard.png)

#### GraphLab Predictive Services

- Deploy trained GraphLab Create models into a elastic web service with a single line of code.
- Incorporate business logic with the ability to deploy arbitrary python code.
- Scale up/down the number of nodes in the web service based on needs.
- Easily update or switch the deployed models without any downtime.
- Monitor, manage, and gather feedback from the service to help improve models.
- Run experiments with multiple models.
- GraphLab predictive services come fully equipped with load balancers, caching layers,
  and many other functionalities that make it suitable for live deployments.

[<img alt="Example Predictive Service Deployment in GraphLab Canvas" src="images/predictive-services-dashboard-glc1.1.png" style="max-height: 500px; max-width: 60%; margin-left: 15%;" />](images/predictive-services-dashboard-glc1.1.png)
