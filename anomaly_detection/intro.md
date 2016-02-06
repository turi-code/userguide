# Anomaly Detection
**Anomalies** are data points that are different from other observations in some day, typically measured against a model fit to the data.

We assume the anomaly detection task is unsupervised, i.e. we don’t have training data with points labeled as anomalous. Each data point passed to an anomaly detection model is given an score from 0 to infinity indicating how different the point is relative to the rest of the dataset. The calculation of this score varies between models, but a higher score always indicates a point is more anomalous. Often a threshold is chosen to make a final classification of each point as typical or anomalous; this post-processing step is left to the user.

The [GraphLab Create Anomaly Detection toolkit](https://dato.com/products/create/docs/graphlab.toolkits.anomaly_detection.html) currently includes three models for two different data contexts: **local outlier factor**, for detecting outliers in multivariate data that are assumed to be independently and identically distributed, **moving Z-score**, for scoring outliers in a univariate, sequential dataset, typically a time series, and **bayesian changepoints** for identifying changes in the mean or variance of a sequential series. 

The anomaly detection toolkit is in active development, and feedback is very welcome.
