<script src="../dato/js/recview.js"></script>
# Alternate data formats

The churn predictor model supports data with 3 formats
- [Raw event logs](quick-start.md)
- [Aggregated logs](#aggregated-event-logs)
- [User side data](#user-side-data)

#### <a name="aggregated-event-logs"></a> Aggregated event logs

The churn prediction model performs a series of feature engineering steps.  The
first of the many feature transformations involves a re-sample operation which
aggregates data into a fixed granularity/time-scale e.g. daily, weekly, or
monthly (defined by `time_period`). If your data is already aggregated at a
granularity level that is of interest to you, then you can skip this step with
the option `is_data_aggregated = True`.

```no-highlight
+------------+---------------------+---------------+---------------+
| CustomerID |     InvoiceDate     |    Quantity   |   UnitPrice   |
+------------+---------------------+---------------+---------------+
|   17850    | 2010-12-01 00:00:00 | 8.62741312741 | 4.15194658945 |
|   17850    | 2010-12-02 00:00:00 | 9.96823138928 | 3.23171171171 |
|   17850    | 2010-12-03 00:00:00 | 6.73478655767 | 5.04727066303 |
|   17850    | 2010-12-04 00:00:00 |      None     |      None     |
|   17850    | 2010-12-05 00:00:00 | 6.01651376147 | 2.89657614679 |
|   17850    | 2010-12-06 00:00:00 | 5.52320783909 | 4.55873646209 |
|   17850    | 2010-12-07 00:00:00 | 8.43570705366 | 28.7384711441 |
|   17850    | 2010-12-08 00:00:00 | 8.59123536079 | 3.76957310162 |
|   17850    | 2010-12-09 00:00:00 | 6.37530266344 | 5.07181943964 |
|   13047    | 2010-12-10 00:00:00 | 7.35931834663 | 4.65013052937 |
+------------|---------------------+---------------+---------------+
```

The above data is already aggregated by day. This data can be used as is while
training the model. 

```python
# Train a churn prediction model.
model = gl.churn_predictor.create(train, user_id='CustomerID', 
                  features = ['Quantity'], 
                  churn_period = churn_period, 
                  is_data_aggregated = True)
```

#### <a name="user-side-data"></a> Using user side data

In many cases, additional metadata about the users can improve the quality of
the predictions. This includes geographic location, age, profession etc. We
call this type of information user side data.

The `user_data` parameter is an SFrame and must have a user column that
corresponds to the `user_id` column in the `observation_data`.  The churn
prediction toolkit will automatically incorporate the user side data while
training the model.

```python
side_data = gl.SFrame(
  'http://s3.amazonaws.com/dato-datasets/churn-prediction/online_retail_side_data.csv')

# Train a churn prediction model.
model = gl.churn_predictor.create(train, user_id='CustomerID',
                      features = ['Quantity'],
                      churn_period = churn_period, 
                      user_data = side_data)

# Make predictions
predictions = model.predict(valid, user_data = side_data)

# Evaluate the model
evaluation_time = datetime.datetime(2011, 10, 1)
metrics = model.evaluate(valid, evaluation_time, user_data = side_data)
```

**Note**: Once a model is trained with user side information, the model does
not store a copy of the user side data. That must be provided during every
[predict](https://dato.com/products/create/docs/generated/graphlab.churn_predictor.ChurnPredictor.predict.html#graphlab.churn_predictor.ChurnPredictor.predict)
and
[evaluate](https://dato.com/products/create/docs/generated/graphlab.churn_predictor.ChurnPredictor.explain.html#graphlab.churn_predictor.ChurnPredictor.explain)
call.
