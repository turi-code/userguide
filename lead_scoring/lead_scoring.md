# Lead Scoring

Prioritizing new leads is critical for sales and marketing teams. Traditionally, this is done by giving each open sales account a point value,  adding a predetermined number points each time an account interacts with your business in some way. The accounts with the point totals are declared to be the highest priority.

The ***Lead Scoring toolkit*** in GraphLab Create (GLC) is more intelligent. By using historical data to learn the relationship between account behavior and the successful conversions, this tool can predict future conversions much more accurately. In turn, this allows sales and marketing resources to be allocated more efficiently to accounts or market segments with the most value, saving time and money.

There are two tasks that people typically want to accomplish with a lead scoring model:

1. predict whether specific open accounts will successfully convert to a sale
2. segment the market into accounts with similar features and conversion probabilities.

The GLC Lead Scoring toolkit accomplishes both of these tasks simultaneously with a combination of advanced feature engineering, a gradient boosted trees  model to predict conversions, and a decision tree model to construct market segments.

#### Basic Usage

The primary unit of interest in lead scoring is the sales ***account***. This is typically a company or an individual user. Accounts fall into one of three buckets, depending on their ***conversion status***:

1. **Successful conversions**. Accounts which have purchased your product or service.

2. **Failures**. Accounts which you have determined will not purchase.
  
3. **Open**. Accounts which have not yet decided whether they will buy or not.

The lead scoring toolkit uses the accounts in the first two buckets (together called ***training accounts***) to learn the relationship between account features and the conversion outcome, then predicts the outcome for the accounts that remain open.

The simplest possible usage of the lead scoring toolkit requires only this information. To illustrate, we use data from the [AirBnB New User Bookings challenge on Kaggle](https://www.kaggle.com/c/airbnb-recruiting-new-user-bookings), although we will change the task. Let's imagine we are an online travel agency, and our goal is to convince users to book trips outside of the United States. That is, successfully converted accounts are users with non-US bookings, failed accounts are US bookings, and the competition's "test users" are our open accounts.

```python
import graphlab as gl
users = gl.SFrame('airbnb_users.sfr')
users.print_rows(5)
```
```no-highlight
+------------+----------------------+---------------------+--------+------+
|     id     | date_account_created |  date_first_booking | gender | age  |
+------------+----------------------+---------------------+--------+------+
| 4ft3gnwmtx | 2010-09-28 00:00:00  | 2010-08-02 00:00:00 | FEMALE | 56.0 |
| bjjt8pjhuk | 2011-12-05 00:00:00  | 2012-09-08 00:00:00 | FEMALE | 42.0 |
| lsw9q7uk0j | 2010-01-02 00:00:00  | 2010-01-05 00:00:00 | FEMALE | 46.0 |
| 0d01nltbrs | 2010-01-03 00:00:00  | 2010-01-13 00:00:00 | FEMALE | 47.0 |
| a1vcnhxeij | 2010-01-04 00:00:00  | 2010-07-29 00:00:00 | FEMALE | 50.0 |
+------------+----------------------+---------------------+--------+------+
+---------------+------------+-------------------+---------------+------------+
| signup_method | signup_app | first_device_type | first_browser | conversion |
+---------------+------------+-------------------+---------------+------------+
|     basic     |    Web     |  Windows Desktop  |       IE      |     -1     |
|    facebook   |    Web     |    Mac Desktop    |    Firefox    |     1      |
|     basic     |    Web     |    Mac Desktop    |     Safari    |     -1     |
|     basic     |    Web     |    Mac Desktop    |     Safari    |     -1     |
|     basic     |    Web     |    Mac Desktop    |     Safari    |     -1     |
+---------------+------------+-------------------+---------------+------------+
[73067 rows x 10 columns]
```

Note the values in the "conversion" column: **-1 values indicate a failed account, +1 values indicate a successful conversion, and 0 values indicate an account this open and needs to be scored**.

The `account_schema` parameter lets us specify which columns of the data should be used as conversion status, ID, features, etc. For the most basic usage, the only required entry is `conversion_status`, but we will manually  specify the features we want to use as well. 

```python
user_schema = {
    'conversion_status': 'conversion',
    'features': ['gender', 'age', 'signup_method', 'signup_app',
                 'first_device_type', 'first_browser']}

model = gl.lead_scoring.create(users, user_schema)
print(model)
```
```no-highlight
Class                                    : LeadScoringModel

Model schema
------------
Number of accounts                       : 73067
Number of interactions                   : 0
Number of account features               : 6
Number of interaction features           : 0
Verbose                                  : True

Training summary
----------------
Number of training accounts              : 52321
Number of open accounts                  : 20746
Number of successful conversions         : 15454
Number of explicit failures              : 36867
Number of implicit failures              : 0
Number of final features                 : 6
Total training time (seconds)            : 5.1916

Accessible fields
-----------------
open_account_scores                     : Lead scores, segment IDs, and final
                                          features for open accounts.
training_account_scores                 : Lead scores, segment IDs, and final 
                                          features for training accounts.
segment_descriptions                    : Statistics about market segments of 
                                          training (i.e. closed) accounts.
scoring_model                           : Underlying GBT model for predicting 
                                          account conversion.
segmentation_model                      : A trained decision tree to create 
                                          account segments.
account_schema                          : Schema for the 'accounts' input.
interaction_schema                      : Schema for the 'interactions'SFrame 
                                          (if provided).
```

The model summary indicates the breakdown of our accounts by status: of the total 73,067 users, 20,746 are *open* and need to be scored, 36,867 have *failed*, and 15,454 have *successfully converted*.

The summary also shows the fields that are accessible in a trained lead scoring model. The three most important outputs are `open_account_scores`, `training_account_scores`, and `segment_descriptions`.

`model.open_account_scores` contains the model's lead score ("conversion_prob") and market segment assignment ("segment_id") for each open account, as well as the features used to obtain those results. Use the [`SFrame.topk`](https://turi.com/products/create/docs/generated/graphlab.SFra
me.topk.html) function to see which open accounts are mostly likely to convert.

```python
print(model.open_account_scores.topk('conversion_prob', 3))
```
```no-highlight
+--------+------+---------------+------------+-------------------+---------------+
| gender | age  | signup_method | signup_app | first_device_type | first_browser |
+--------+------+---------------+------------+-------------------+---------------+
| FEMALE | 21.0 |    facebook   |  Android   |        iPad       | Mobile Safari |
| FEMALE | 20.0 |    facebook   |  Android   |    Mac Desktop    |     Chrome    |
| FEMALE | 20.0 |    facebook   |  Android   |    Mac Desktop    |     Safari    |
+--------+------+---------------+------------+-------------------+---------------+
+--------------------+------------+
|  conversion_prob   | segment_id |
+--------------------+------------+
| 0.7992937564849854 |     8      |
| 0.7661644816398621 |     9      |
| 0.6897352337837219 |     9      |
+--------------------+------------+
[3 rows x 8 columns]
```

`model.training_account_scores` contains the estimated conversion probability (i.e. fitted value) and market segment assignment for training accounts, i.e known failures and successful conversions, as well as the final features used by the model.

```python
print(model.training_account_scores.head(3))
```
```no-highlight
+-------------------+--------+------+---------------+------------+
| conversion_status | gender | age  | signup_method | signup_app |
+-------------------+--------+------+---------------+------------+
|         -1        | FEMALE | 56.0 |     basic     |    Web     |
|         1         | FEMALE | 42.0 |    facebook   |    Web     |
|         -1        | FEMALE | 46.0 |     basic     |    Web     |
+-------------------+--------+------+---------------+------------+
+-------------------+---------------+---------------------+------------+
| first_device_type | first_browser |   conversion_prob   | segment_id |
+-------------------+---------------+---------------------+------------+
|  Windows Desktop  |       IE      | 0.31177377700805664 |     14     |
|    Mac Desktop    |    Firefox    | 0.29692044854164124 |     12     |
|    Mac Desktop    |     Safari    | 0.28300952911376953 |     12     |
+-------------------+---------------+---------------------+------------+
[3 rows x 9 columns]
```

`model.segment_descriptions` includes the definitions of the market segments in terms of features and summary statistics about each segment, based on the training accounts in each segment. The segment IDs match the segment assignments in the previous two tables (although note that segment IDs they are *not* consecutive integers).

```python
description_cols = ['segment_id', 'mean_conversion_prob',
                    'num_training_accounts', 'segment_features']
model.segment_descriptions[description_cols].print_rows(max_row_width=100,
                                                        max_column_width=20)
```
```no-highlight
+------------+----------------------+---------------------+---------------------+
| segment_id | mean_conversion_prob | num_training_acc... |   segment_features  |
+------------+----------------------+---------------------+---------------------+
|     10     |  0.4148872411475996  |         1590        | [age < 23.5, fir... |
|     7      |  0.3678121355204087  |         212         | [age < 19.5, fir... |
|     13     | 0.34964851351919246  |         3970        | [age >= 47.5, ge... |
|     14     |  0.3159698655685296  |         4568        | [age >= 47.5, ge... |
|     8      |  0.3104554163716394  |         834         | [age in [19.5, 2... |
|     12     | 0.29343331186282434  |        38936        | [age in [23.5, 4... |
|     9      |  0.2874973431229591  |          60         | [age < 23.5, fir... |
|     11     | 0.22564662272142622  |         2151        | [age in [23.5, 4... |
+------------+----------------------+---------------------+---------------------+
[8 rows x 4 columns]
```

The feature descriptions in this table are *conjunctions*; all of the conditions must be true for an account to belong to a given segment. For example, the first row of the current model's segment descriptions is:

```python
model.segment_descriptions[description_cols][0]
```
```no-highlight
{'mean_conversion_prob': 0.4148872411475996,
 'num_training_accounts': 1590,
 'segment_features': ['age < 23.5',
  'first_device_type = Mac Desktop',
  'signup_app = Web'],
 'segment_id': 10}
```

This means that segment 10 includes accounts where the user's age is less than 23.5, the user first used a Mac on the site, and signed up for the site on the web. Of the 52,321 training accounts, 1,590 belong to this segment, and the average estimated conversion probability for these training accounts is 41.5%.


#### Accessing the scoring and segmentation models

The GLC Lead Scoring tool uses a [gradient boosted trees classifier](https://turi.com/products/create/docs/generated/graphlab.boosted_trees_classifier.create.html) to make conversion predictions for the open accounts and a [decision tree regression](https://turi.com/products/create/docs/generated/graphlab.decision_tree_regression.create.html) (trained with the scoring model's fitted values as the target) to create the market segments. These internal models are available if we want to see more details about model training.

Furthermore, unlisted keyword arguments provided to the lead scoring create function are passed directly to gradient boosted trees classifier. For example, to change the maximum number of iterations in the classifier:

```python
model2 = gl.lead_scoring.create(users, user_schema, max_iterations=4)
print(model2.scoring_model.num_trees)
```
```no-highlight
4
```


#### Changing the number of market segments without re-training

By default the lead scoring model creates a maximum of 8 market segments. Because constructing features can take a lot of time for large datasets, the number of market segments can be changed without re-training from scratch.

```python
model3 = model2.resize_segmentation_model(max_segments=20)

cols = ['segment_id', 'mean_conversion_prob', 'num_training_accounts']
model3.segment_descriptions[cols].print_rows(20)
```
```no-highlight
+------------+----------------------+-----------------------+
| segment_id | mean_conversion_prob | num_training_accounts |
+------------+----------------------+-----------------------+
|     17     |  0.471079124212265   |           25          |
|     20     |  0.4438464700342365  |          1359         |
|     19     | 0.40474249764438336  |          231          |
|     18     |  0.3997719212373097  |           75          |
|     25     | 0.39968570421986016  |          2112         |
|     28     |  0.3719579402764305  |          476          |
|     26     | 0.37104689669108587  |          1858         |
|     16     |  0.3704947256043207  |          561          |
|     9      |  0.3675870239734649  |           60          |
|     27     | 0.35521498641849497  |          4092         |
|     24     |  0.3442292154445932  |         26648         |
|     15     |  0.3331256714734163  |          385          |
|     23     |  0.3284739826243221  |         12288         |
|     21     |  0.3015555249550801  |          1493         |
|     22     |  0.2513098390178477  |          658          |
+------------+----------------------+-----------------------+
[15 rows x 3 columns]
```


#### Incorporating interaction data

Often the interactions between accounts and business assets (e.g. websites, products, email campaigns) contain more information about each account's intent to advance to the next stage of the sales process. The GLC Lead Scoring tool accepts this type of data through the `interactions` parameter.

In addition to a `users` table, the AirBnB Kaggle challenge provides "session" data that describes every interaction between a user and the site, in terms of the action done by the user, the time elapsed for the action, and the user's device type. For this demo, I have generated random timestamps and converted the sessions table to a `TimeSeries` object (required for the GLC lead scoring tool).

```python
sessions = gl.load_timeseries('airbnb_sessions.sfr')
sessions.print_rows(3)
```
```no-highlight
+----------------------------+------------+-----------------------+-------------+
|         timestamp          |  user_id   |         action        | action_type |
+----------------------------+------------+-----------------------+-------------+
| 2013-12-30 00:09:05.777678 | jrqykh9y8x |          show         |     None    |
| 2013-12-30 00:51:37.515840 | jrqykh9y8x | ajax_refresh_subtotal |    click    |
| 2013-12-30 00:55:48.004325 | mrvjvk6ycy |     confirm_email     |    click    |
+----------------------------+------------+-----------------------+-------------+
+-----------------------------+-------------+--------------+
|        action_detail        | device_type | secs_elapsed |
+-----------------------------+-------------+--------------+
|             None            | Mac Desktop |    106.0     |
| change_trip_characteristics | Mac Desktop |    408.0     |
|      confirm_email_link     | Mac Desktop |   42711.0    |
+-----------------------------+-------------+--------------+
[3267114 rows x 7 columns]
```

The lead scoring tool uses interaction data to construct additional account-level features. To make sure this happens cleanly, additional information about each account must be provided.

- `account_id`: allows the toolkit to link interactions back to the appropriate account.
- `open_date`: the date on which each account was opened.
- `decision_date`: the date on which training accounts either converted or were determined to be failures. Values in this column are ignored for the open accounts.

As with the accounts, the `interaction_schema` parameter is used to indicate columns in the interactions table that are relevant to the model. In this case, we specify that the account ID column is called "user_id", that the items of interest on the website are actually user "actions", and our additional interaction features are the device type used for the interaction and the length of the interaction in seconds.

```python
user_schema.update({'account_id': 'id',
                    'decision_date': 'date_first_booking',
                    'open_date': 'date_account_created'})

session_schema = {'account_id': 'user_id',
                  'item': 'action',
                  'features': ['device_type', 'secs_elapsed']}
```

When interaction data is provided, we also must define a ***trial_duration***; in combination with an account's open date, this defines the time window for the interactions the model will use to construct features. In this example we use a 2-year trial period.

```python
import datetime as dt

model = gl.lead_scoring.create(users, user_schema, sessions, session_schema,
                               trial_duration=dt.timedelta(days=365 * 2))
model.summary()
```
```no-highlight
Class                                    : LeadScoringModel

Model schema
------------
Number of accounts                       : 73067
Number of interactions                   : 3267114
Number of account features               : 6
Number of interaction features           : 2
Verbose                                  : True

Training summary
----------------
Number of training accounts              : 52299
Number of open accounts                  : 20746
Number of successful conversions         : 15448
Number of explicit failures              : 36851
Number of implicit failures              : 0
Number of final features                 : 8
Total training time (seconds)            : 16.1299

Accessible fields
-----------------
open_account_scores                     : Lead scores, segment IDs, and final
                                          features for open accounts.
training_account_scores                 : Lead scores, segment IDs, and final 
                                          features for training accounts.
segment_descriptions                    : Statistics about market segments of 
                                          training (i.e. closed) accounts.
scoring_model                           : Underlying GBT model for predicting 
                                          account conversion.
segmentation_model                      : A trained decision tree to create 
                                          account segments.
account_schema                          : Schema for the 'accounts' input.
interaction_schema                      : Schema for the 'interactions'SFrame 
                                          (if provided).
```

The names of interaction-based features created by the lead scoring tool are contained in the model's `open_account_scores` and `training_account_scores` outputs, along with the features we specified explicitly (as well as other fields specified in the account schema, plus the conversion probability and segment assignment). In this example, the model has created the 'num_events' and 'num_items' features.

```python
model.open_account_scores.topk('conversion_prob', k=3).print_rows()
```
```no-highlight
+---------------+------------+---------------------+--------+------+---------------+
| decision_date | account_id |      open_date      | gender | age  | signup_method |
+---------------+------------+---------------------+--------+------+---------------+
|      None     | i8gtf1xp47 | 2014-09-07 00:00:00 |  MALE  | 50.0 |     basic     |
|      None     | 1keciux9mq | 2014-07-20 00:00:00 |  MALE  | 57.0 |    facebook   |
|      None     | c7qo76yvql | 2014-07-30 00:00:00 |  MALE  | 57.0 |    facebook   |
+---------------+------------+---------------------+--------+------+---------------+
+------------+-------------------+-----------------+----------------------+
| signup_app | first_device_type |  first_browser  |      num_events      |
+------------+-------------------+-----------------+----------------------+
|   Moweb    |  Windows Desktop  |        IE       | 0.12677302896224676  |
|   Moweb    |   Android Phone   | Android Browser | 0.03372674152253726  |
|   Moweb    |   Android Phone   |  Chrome Mobile  | 0.024230278704218698 |
+------------+-------------------+-----------------+----------------------+
+----------------------+--------------------+------------+
|      num_items       |  conversion_prob   | segment_id |
+----------------------+--------------------+------------+
| 0.04678528449797202  | 0.5703257918357849 |     11     |
| 0.011242247174179086 | 0.5598494410514832 |     11     |
| 0.008551863072077188 | 0.5598494410514832 |     11     |
+----------------------+--------------------+------------+
[3 rows x 13 columns]
```

#### Implicit failure accounts

Many sales and marketing teams do not explicitly label accounts that fail to convert; they record only successful conversions and open accounts. In this case the lead scoring tool can automatically determine ***implicit failure accounts***, which are are accounts that have been open for so long their chances of converting to a sale are effectively nil. In order to find implicit failures, three key dates about the accounts need to be provided to the model:

- `open_date`: date on which the account opened. Applies to both training and open accounts.

- `decision_date`: date on which a training account's outcome was decided. This date must occur after the account open date, or the account is declared invalid. Decision dates for open accounts are ignored; by definition an open account has not been decided.

- `trial_duration`: length of the trial period. An open account that's still in its trial period is not declared an implicit failure, no matter how quickly the training accounts convert.

In the event that failures are not defined explicitly, and no implicit failures are found, the lead scoring toolkit will return an error and ask us to define failures manually. In our running illustration we currently have no implicit failures, but decreasing the trial period changes the situation.

```python
model2 = gl.lead_scoring.create(users, user_schema, sessions, session_schema,
                               trial_duration=dt.timedelta(days=365 * 1.9))

print(model2.num_implicit_failures)
```
```no-highlight
8630
```

#### References and more information

- [GraphLab Create Lead Scoring API documentation](https://turi.com/products/create/docs/graphlab.toolkits.lead_scoring.html)

- [AirBnB New User Bookings Kaggle competition](https://www.kaggle.com/c/airbnb-recruiting-new-user-bookings)
