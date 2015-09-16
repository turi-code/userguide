# Frequent Pattern Mining

A frequent pattern is a substructure that appears frequently in a data set.
Finding the frequent patterns of a dataset is a essential step in data mining
tasks such as feature extraction and association rule learning.  The frequent
pattern mining toolkit provides tools for extracting and analyzing frequent
patterns in pattern data.

##### Introductory Example

Let us look a simple example of receipt data from a bakery. The dataset
consists of items like *ApplePie* and *GanacheCookie*. The task is to identify
sets of items that are frequently bought together. The dataset consists of
*266209 rows* and *6 columns* which look like the following.

```no-highlight
Data:
+---------+-------------+-------+----------+----------+-----------------+
| Receipt |   SaleDate  | EmpId | StoreNum | Quantity |       Item      |
+---------+-------------+-------+----------+----------+-----------------+
|    1    | 12-JAN-2000 |   20  |    20    |    1     |  GanacheCookie  |
|    1    | 12-JAN-2000 |   20  |    20    |    5     |     ApplePie    |
|    2    | 15-JAN-2000 |   35  |    10    |    1     |   CoffeeEclair  |
|    2    | 15-JAN-2000 |   35  |    10    |    3     |     ApplePie    |
|    2    | 15-JAN-2000 |   35  |    10    |    4     |   AlmondTwist   |
|    2    | 15-JAN-2000 |   35  |    10    |    3     |    HotCoffee    |
|    3    |  8-JAN-2000 |   13  |    13    |    5     |    OperaCake    |
|    3    |  8-JAN-2000 |   13  |    13    |    3     |   OrangeJuice   |
|    3    |  8-JAN-2000 |   13  |    13    |    3     | CheeseCroissant |
|    4    | 24-JAN-2000 |   16  |    16    |    1     |   TruffleCake   |
+---------+-------------+-------+----------+----------+-----------------+
[266209 rows x 6 columns]
```

In order to run a frequent pattern mining algorithm, we require an **item
columns**, (the column *Item* in this example), and a set of **feature
columns** that uniquely identify a transaction (the column *Receipt* in this
example).

In just a few lines of code we can do the following:

* Find the most frequently occurring patters satisfying various conditions.
* Extract features from the dataset by transforming it from the *Item* space
into the *Reciept* space. These features can then be used for applications like
clustering, classification, churn prediction, recommender systems etc. 
* Make predictions based on new data using rules learned from sets of items that
occur frequently together.

Here is a simple end-to-end example:

```python
import graphlab as gl

# Load the dataset 
bakery_sf = gl.SFrame("http://s3.amazonaws.com/dato-datasets/bakery.sf")

# Make a train-test split.
train, test = bakery_sf.random_split(0.8)

# Build a frequent pattern miner model.
model = gl.frequent_pattern_mining.create(train, 'Item', 
                features=['Receipt'], min_length=4, max_patterns=500)


# Obtain the most frequent patterns.
patterns = model.get_frequent_patterns()

# Extract features from the dataset and use in other models!
features = model.extract_features(train)


# Make predictions based on frequent patterns.
predictions = model.predict(test)
```


###### Interpreting Results

Frequent pattern mining can provide valuable insight about the sets of items
that occur frequently together. When a model is trained, the `model.summary()` output
shows the most frequently occurring patterns together. 

```python
patterns = model.get_frequent_patterns()
print patterns 
```
```no-highlight
+-------------------------------------------------------------+---------+
|                           pattern                           | support |
+-------------------------------------------------------------+---------+
|       [CoffeeEclair, HotCoffee, ApplePie, AlmondTwist]      |   860   |
| [LemonLemonade, LemonCookie, RaspberryCookie, RaspberryL... |   775   |
| [LemonLemonade, RaspberryCookie, RaspberryLemonade, Gree... |   667   |
| [LemonCookie, RaspberryCookie, RaspberryLemonade, GreenTea] |   646   |
|   [LemonLemonade, LemonCookie, RaspberryCookie, GreenTea]   |   641   |
|  [LemonLemonade, LemonCookie, RaspberryLemonade, GreenTea]  |   635   |
|     [AppleDanish, AppleTart, AppleCroissant, CherrySoda]    |   623   |
| [LemonLemonade, LemonCookie, RaspberryCookie, RaspberryL... |   514   |
|     [CherryTart, ApricotDanish, OperaCake, WalnutCookie]    |    37   |
|     [CherryTart, ApricotDanish, OperaCake, AppleDanish]     |    33   |
+-------------------------------------------------------------+---------+
[500 rows x 2 columns]
```

Note that the **pattern** column contains the patterns that occur frequently
together and the **support** column contains the number of times these patterns
occur together in the entire dataset. In this example, the pattern
*[CoffeeEclair, HotCoffee, ApplePie, AlmondTwist]* occurred *860* times in the
training data.


###### Minimum support 

A **frequent pattern** is a set of items with a support greater than
user-specified **minimum support** threshold.  However, there is significant
redundancy in mining frequent patterns; every subset of a frequent pattern is
also frequent (e.g. *Bread* must be frequent if *Bread*, *Butter* is frequent).
Mining **closed frequent patterns** partially avoids this redundancy by mining
only frequent patterns with no superset of the same support. One can change the
minimum support above which patterns are considered frequent using the
**min_support** setting:
 

```python
model = gl.frequent_pattern_mining.create(train, 'Item', 
                features=['Receipt'], min_support = 20)
print model
```
```no-highlight
Class                         : FrequentPatternMiner

Model fields
------------
Min support                   : 5000
Max patterns                  : 100
Min pattern length            : 1

Most frequent patterns
----------------------
['CoffeeEclair']              : 6554
['HotCoffee']                 : 6199
['TuileCookie']               : 6028
['CherryTart']                : 5602
['ApricotDanish']             : 5584
['StrawberryCake']            : 5513
['OrangeJuice']               : 5481
['GongolaisCookie']           : 5422
['MarzipanCookie']            : 5416
['BerryTart']                 : 5137
```

###### Top-k frequent patterns. 

In practice, we rarely know the appropriate *min_support* threshold to use.  As
an alternative to specifying a minimum support, we can specify a maximum number
of patterns to mine using the **max_patterns** parameter.  Instead of mining
all patterns above a minimum support threshold, we mine the most frequent
patterns until the maximum number of closed patterns are round.  For large data
sets, this mining process can be time-consuming.  We recommend specifying a
large initial minimum support bound to speed up the mining.

```python
model = gl.frequent_pattern_mining.create(train, 'Item', 
                features=['Receipt'], max_patterns = 10)
print model
```
```no-highlight
Class                         : FrequentPatternMiner

Model fields
------------
Min support                   : 20
Max patterns                  : 100
Min pattern length            : 1

Most frequent patterns
----------------------
['CoffeeEclair']              : 6554
['HotCoffee']                 : 6199
['TuileCookie']               : 6028
['CherryTart']                : 5602
['ApricotDanish']             : 5584
['StrawberryCake']            : 5513
['OrangeJuice']               : 5481
['GongolaisCookie']           : 5422
['MarzipanCookie']            : 5416
['BerryTart']                 : 5137
```

**Note**: The algorithm for extracting the top-k most frequent occurring
patterns can be severely sped up with a good estimate for the lower bound on
*min_support*.
 

###### Minimum Length 

In practice, patterns of length *1* may not very useful. There might be a need
to search for patterns that are are of a certain length. We can do so with the
**min_length** parameter.


```python
model = gl.frequent_pattern_mining.create(train, 'Item', 
                features=['Receipt'], min_length = 5)
print model
```
```no-highlight
Model fields
------------
Min support                   : 1
Max patterns                  : 100
Min pattern length            : 5

Most frequent patterns
----------------------
['LemonLemonade', 'LemonCookie', 'RaspberryCookie', 'RaspberryLemonade', 'GreenTea']: 514
['CoffeeEclair', 'HotCoffee', 'ApplePie', 'AlmondTwist', 'LemonCookie']: 9
['CoffeeEclair', 'HotCoffee', 'ApplePie', 'AlmondTwist', 'BottledWater']: 9
['CoffeeEclair', 'HotCoffee', 'ApplePie', 'AlmondTwist', 'VanillaFrappuccino']: 9
['CoffeeEclair', 'HotCoffee', 'NapoleonCake', 'ApplePie', 'AlmondTwist']: 8
['CoffeeEclair', 'HotCoffee', 'ApricotDanish', 'ApplePie', 'AlmondTwist']: 8
['CoffeeEclair', 'HotCoffee', 'MarzipanCookie', 'ApplePie', 'AlmondTwist']: 8
['CoffeeEclair', 'HotCoffee', 'ApplePie', 'AlmondTwist', 'LemonLemonade']: 8
['AppleDanish', 'AppleTart', 'AppleCroissant', 'GreenTea', 'CherrySoda']: 7
['BerryTart', 'AppleDanish', 'AppleTart', 'AppleCroissant', 'CherrySoda']: 7
```

**Note**: The three parameters *min_support*, *max_patterns*, and *min_length*
can be combined to find patterns that satisfy all conditions.

###### Extracting Features

Using the set of closed patterns, we can convert pattern data to binary
features vectors.  These feature vectors can be used for other machine learning
tasks, such as clustering or classification. For each pattern $$x$$, the j-th
extracted feature $$f_x[j]$$ is a binary indicator of whether the j-th closed
pattern is contained in $$x$$.


```python
model = gl.frequent_pattern_mining.create(train, 'Item', 
                features=['Receipt'], min_length = 5)
features = model.extract_features()
```
```no-highlight
Columns:
	Receipt	int
	extracted_features	array

Rows: 73492

Data:
+---------+-------------------------------+
| Receipt |       extracted_features      |
+---------+-------------------------------+
|  21855  | [0.0, 0.0, 0.0, 0.0, 0.0, ... |
|  63664  | [0.0, 0.0, 0.0, 0.0, 0.0, ... |
|   7899  | [0.0, 0.0, 0.0, 0.0, 0.0, ... |
|  25263  | [0.0, 0.0, 0.0, 0.0, 0.0, ... |
|  30621  | [0.0, 0.0, 0.0, 0.0, 0.0, ... |
|  43116  | [0.0, 0.0, 0.0, 0.0, 0.0, ... |
|  27112  | [0.0, 0.0, 0.0, 0.0, 0.0, ... |
|  26319  | [0.0, 0.0, 0.0, 0.0, 0.0, ... |
|  26439  | [0.0, 0.0, 0.0, 0.0, 0.0, ... |
|  62361  | [0.0, 0.0, 0.0, 0.0, 0.0, ... |
+---------+-------------------------------+
[73492 rows x 2 columns]
```

Once the features are extracted, we can use them downstream in other
applications such as clustering, classification, churn prediction, recommender
systems etc.

###### Making Predictions

An **association rule** is an ordered pair of item sets (prefix $$A$$,
prediction $$B$$) denoted $$A \Rightarrow B$$ such that $$A, B$$ are disjoint 
and $$A \cup B$$ is frequent. Because every frequent pattern generates multiple
association rules (a rule for each subset), we evaluate and filter rules using
a score criteria.  The most popular criteria for scoring association rules is
to measure the **confidence** of the rule: the ratio of the support of $$A \cup B$$ 
to the support of $$A$$. The **confidence** of the rule $$A \Rightarrow B$$ is
our empirical estimate of the conditional probability for $$B$$ given $$A$$:

$$ Confidence( A \Rightarrow B ) = \frac{Supp(A \cup B)}{Supp(A)}$$

One can make predictions using the *predict* or *predict_topk* method for
single and multiple predictions respectively. The output of both the methods is
an SFrame with the following columns: 

* **prefix**: The *antecedent* or *left-hand side* of an association
rule. It must be a frequent pattern and a subset of the associated pattern.
* **prediction**: The *consequent* or *right-hand side* of the
association rule. It must be disjoint of the prefix.
* **confidence**: The confidence of the association rule as defined above.
* **prefix support**: The frequency of the *prefix* pattern in the
training data.
* **joint support**: The frequency of the co-occurrence
( *prefix* + *prediction*) in the training data

If no valid association rule exists for an pattern, then ``predict`` will
return a row of Nones.
 
```python
predictions = model.predict(test)
```
```no-highlight
Columns:
	Receipt	int
	prefix	list
	prediction	list
	confidence	float
	prefix support	int
	joint support	int

Rows: 39279

Data:
+---------+-------------------+----------------------+-----------------+----------------+
| Receipt |       prefix      |      prediction      |    confidence   | prefix support |
+---------+-------------------+----------------------+-----------------+----------------+
|  63664  |  [ChocolateCake]  |  [ChocolateCoffee]   |  0.41842000794  |      5038      |
|   7899  |  [SingleEspresso] |    [CoffeeEclair]    |  0.346368715084 |      4117      |
|  25263  |   [TruffleCake]   |  [GongolaisCookie]   |  0.421684296176 |      4916      |
|  30621  |         []        |    [CoffeeEclair]    | 0.0891797746694 |     73492      |
|  43116  |    [CherryTart]   |   [ApricotDanish]    |  0.461085326669 |      5602      |
|  26319  |    [OperaCake]    |     [CherryTart]     |  0.424884049203 |      4959      |
|   5288  |    [CasinoCake]   |   [ChocolateCake]    |  0.384816184468 |      4597      |
|  19584  |   [AppleDanish]   |   [AppleCroissant]   |  0.330241640225 |      4097      |
|  21925  | [CheeseCroissant] |    [OrangeJuice]     |  0.416700201207 |      4970      |
|  18357  |   [WalnutCookie]  | [VanillaFrappuccino] |  0.331369661267 |      4074      |
+---------+-------------------+----------------------+-----------------+----------------+
+---------------+
| joint support |
+---------------+
|      2108     |
|      1426     |
|      2073     |
|      6554     |
|      2583     |
|      2107     |
|      1769     |
|      1353     |
|      2071     |
|      1350     |
+---------------+
[39279 rows x 6 columns]
```


**Note**: If the number of patterns extracted is large, then prediction could
potentially be a slow operation. 

##### Additional Features

We will now go over some more advanced options with the linear regression
module. This includes advanced options for pattern mining, model
interpretation, extracting features, and making predictions via rule mining.
 
The attributes of all GraphLab Create models, which include training
statistics, model hyper-parameters, and model results can be accessed in the
same way as python dictionaries. To get a list of all fields that can be
accessed, you can use the
[list_fields()](https://dato.com/products/create/docs/generated/graphlab.pattern_mining.FrequentPatternMiner.list_fields.html)
function:


```python
fields = model.list_fields()
print fields
['features',
 'frequent_patterns',
 'item',
 'max_patterns',
 'min_length',
 'min_support',
 'num_examples',
 'num_features',
 'num_frequent_patterns',
 'num_items',
 'training_time']
```

Each of these fields can be accessed using dictionary-like lookups. For
example, the ``num_frequent_patterns`` is the number of frequent patterns
extracted by the model.
```python
model['num_frequent_patterns']
500
```

The [API
docs](https://dato.com/products/create/docs/generated/graphlab.pattern_mining.FrequentPatternMiner.get.html)
provide a detailed description of each of the model attributes.

##References
- Han, Jiawei, et al. *Frequent pattern mining: current status and future
  directions.* Data Mining and Knowledge Discovery 15.1 (2007): 55-86.
- Han, Jiawei, Micheline Kamber, and Jian Pei. *Data mining: concepts and
  techniques: concepts and techniques*. Elsevier, 2011.
- Wang, Jianyong, et al. *TFP: An efficient algorithm for mining top-k frequent
  closed patterns.* Knowledge and Data Engineering, IEEE Transactions on 17.5
  (2005): 652-663.


