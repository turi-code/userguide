#Churn Prediction
The Churn Prediction toolkit allows predicting which users will churn (stop using) a product or website given user activity logs.

Given data in the form: user id, time stamp, and user events, the churn prediction model will learn historical user behavior patterns that predict whether they are likely to stop using the website/product. Given the same, or a different set of user logs, the toolkit will compute the probability of a user churning.

##### Background

The core piece of the churn prediction toolkit is the organization of the log data into a format that can be used to learn user behavior patterns from. The log data needs to contain user IDs as well as a time stamp. Every other column will be used to generate features. 

In a nutshell, the toolkit does:
* Receive as input data in the form User Id, Time stamp, user actions
* Organize the user actions by time (from oldest to most current)
* Group the actions into blocks of a certain resolution (by default, one day)
* Aggregate the data by User Id

Once the data is organized into blocks of a certain resolution for each user:

* From the entire time range available (beginning to end of log), a number of time boundaries are determined (10 by default)
* For each time boundary, for each User Id: 
 * Build user behavior features looking back a number of time blocks (by default, [7, 14, 21, 60, 90] blocks)
 * Compute a label by looking at whether the user id is still present after the time boundary

At this point, for each user, for each time boundary, for each look-back period, we have a set of features as well as a label:

* Train a model (currently only decision tree model is supported)
* Store the model (can be saved, etc...)
* Allow prediction on the same data set as training, or on a new data set

Predictions can be executed on the training data set safely. This is because the portion of the data that is at the very end (ordered by time) cannot be used to generate labels; and therefore is not used for training. Another data set of the same form as the training data can also be used.

##### Introductory Example

First, let us load sample data. In this data, we have sales receipts for baked goods. The first step of the process is to prepare our data. In this particular case, the time stamps are entered as strings. The toolkit requires either time stamps in seconds or milliseconds since January 1st 1970 (unix time stamps); or Python `datetime.datetime` objects. 

Let us make use Python `datetime.datetime` here.

```python
import graphlab as gl

def replace(x):
  for i in range(1, 10):
    if x[1] == '-':
      x = x.replace('%s-' % i, '0%s-' % i)
  return x

sf = gl.SFrame("http://s3.amazonaws.com/dato-datasets/bakery.sf")
sf['SaleDateTime'] = sf['SaleDate'].apply(replace).str_to_datetime('%d-%b-%Y')
sf.remove_column("SaleDate")
```

Our data looks like:

```python
>>> sf

Columns:
	Receipt	int
	EmpId	int
	StoreNum	int
	Quantity	int
	Item	str
	SaleDateTime	datetime

Rows: 266209

Data:
+---------+-------+----------+----------+-----------------+---------------------+
| Receipt | EmpId | StoreNum | Quantity |       Item      |     SaleDateTime    |
+---------+-------+----------+----------+-----------------+---------------------+
|    1    |   20  |    20    |    1     |  GanacheCookie  | 2000-01-12 00:00:00 |
|    1    |   20  |    20    |    5     |     ApplePie    | 2000-01-12 00:00:00 |
|    2    |   35  |    10    |    1     |   CoffeeEclair  | 2000-01-15 00:00:00 |
|    2    |   35  |    10    |    3     |     ApplePie    | 2000-01-15 00:00:00 |
|    2    |   35  |    10    |    4     |   AlmondTwist   | 2000-01-15 00:00:00 |
|    2    |   35  |    10    |    3     |    HotCoffee    | 2000-01-15 00:00:00 |
|    3    |   13  |    13    |    5     |    OperaCake    | 2000-01-08 00:00:00 |
|    3    |   13  |    13    |    3     |   OrangeJuice   | 2000-01-08 00:00:00 |
|    3    |   13  |    13    |    3     | CheeseCroissant | 2000-01-08 00:00:00 |
|    4    |   16  |    16    |    1     |   TruffleCake   | 2000-01-24 00:00:00 |
+---------+-------+----------+----------+-----------------+---------------------+
[266209 rows x 6 columns]
```

Now, we can train a churn prediction model on top of this data:

```python
>>> model = gl.churn_predictor.create(sf, timestamp='SaleDateTime', user_id='EmpId', features=['Item'])

PROGRESS: Initializing churn predictor
PROGRESS: Sorting input data by time order
PROGRESS: Aggregating input data by groups of 1 day, 0:00:00
PROGRESS: No time boundaries specified, computing 10 boundaries from 2000-01-01 00:00:00 to 2000-12-29 00:00:00
PROGRESS: Generating user data for aggregate 2000-02-06 07:12:00
PROGRESS: Generating user data for aggregate 2000-03-13 14:24:00
PROGRESS: Generating user data for aggregate 2000-04-18 21:36:00
PROGRESS: Generating user data for aggregate 2000-05-25 04:48:00
PROGRESS: Generating user data for aggregate 2000-06-30 12:00:00
PROGRESS: Generating user data for aggregate 2000-08-05 19:12:00
PROGRESS: Generating user data for aggregate 2000-09-11 02:24:00
PROGRESS: Generating user data for aggregate 2000-10-17 09:36:00
PROGRESS: Generating user data for aggregate 2000-11-22 16:48:00
PROGRESS: Training model
PROGRESS: Random forest classifier:
PROGRESS: --------------------------------------------------------
PROGRESS: Number of examples          : 441
PROGRESS: Number of classes           : 2
PROGRESS: Number of feature columns   : 765
PROGRESS: Number of unpacked features : 765
PROGRESS: Starting Boosted Trees
PROGRESS: --------------------------------------------------------
PROGRESS:   Iter    Accuracy Elapsed time
PROGRESS:      0   1.000e+00        0.13s
PROGRESS: All done!
```

The accuracy reported here is the training accuracy, and given the very small amount of training data (441 rows, for 50 unique EmpId), this is not really surprising. On a real data set, this would not be the case.

However, the interesting thing here is that the model does output progress for each step of the process described earlier on. The data is aggregated in blocks of 1 day, and 10 boundaries are automatically chosen. Finally, 441 rows of data generated from the 50 unique users are generated internally and used to train the model.

Finally, we can perform predictions or save the model for later use:

```python
>>> predictions = model.predict(sf)

PROGRESS: Sorting input data by time order
PROGRESS: Aggregating input data by groups
PROGRESS: Generating user data for aggregate
PROGRESS: Performing predictions
PROGRESS: All done!

>>> predictions

Columns:
	EmpId	int
	stay_probability	float

Rows: 49

Data:
+-------+------------------+
| EmpId | stay_probability |
+-------+------------------+
|   1   |  0.841130895119  |
|   2   |  0.121616783954  |
|   3   |  0.121616783954  |
|   4   |  0.121616783954  |
|   5   |  0.121616783954  |
|   6   |  0.121616783954  |
|   7   |  0.121616783954  |
|   8   |  0.121616783954  |
|   9   |  0.121616783954  |
|   10  |  0.121616783954  |
+-------+------------------+
[49 rows x 2 columns]
```

It is important to notice that the output of the model is the User Id, as well as the Probability of the user Staying (not churning). This means that 100% means the user will stay (not churn), and 0% means the user will definitely churn.

```python
>>> model.save("model_file")

>>> load_model = gl.load_model("model_file")
```
