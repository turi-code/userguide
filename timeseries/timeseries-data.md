#Working with TimeSeries Data
There are many instances of data used for machine learning tasks that has a
timestamp feature which provides an implicit temporal ordering on the
observations, e.g., log data, sensor data, market data. Under such
circumstances it is important to be able to build more functionality treating
the timestamp column as an index - time series. With this we will provide the
ability to group the data with respect to various intervals of time, aggregate
within each of those time slices, impute the values in those time slices, etc.
This greatly simplifies the development time for manipulating such data.

## TimeSeries Abstraction in GraphLab Create

*TimeSeries* is the fundamental data-structure to hold multi-variate timeseries data with GraphLab Create. 
TimeSeries object is backed by a single [SFrame](https://dato.com/products/create/docs/generated/graphlab.SFrame.html)
,the tabular data structure included with GraphLab Create for complicated data analysis.

GraphLab Create stores TimeSeries object like the following:
```python
====== ====== ====== ===== ======
   T     V_0    V_1   ...    V_n 
====== ====== ====== ===== ======
  t_0   v_00   v_10   ...   v_n0 
  t_1   v_01   v_11   ...   v_n1 
  t_2   v_02   v_12   ...   v_n2 
  ...   ...    ...    ...   ...  
  t_k   v_0k   v_1k   ...   v_nk 
====== ====== ====== ===== ======
```

Each column pair `(V_i,T)` in the table corresponds to a uni-variate `TimeSeries_i`. 
`V_i` is the value column for `TimeSeries_i` and `T` is the index column that is shared 
among all the single (uni-variate) `TimeSeries_k k={0,1,...,n}` in this TimeSeries object. 

## TimeSeries Functionality in GraphLab Create
We illustrate the TimeSeries functionalities in GraphLab Create throughout an example. Imagine we have access to 
measurements of electric power consumption in one household through two
electric meters. We store their measurements in two separate SFrames.

```python
import graphlab
import datetime as dt
from datetime import timedelta
```
```python
electric_meter_sf1 = gl.SFrame("http://s3.amazonaws.com/dato-datasets/household_electric_power1.sf")
electric_meter_sf2 = gl.SFrame("http://s3.amazonaws.com/dato-datasets/household_electric_power2.sf")
print electric_meter_sf1
```
```python
Columns:
	Global_active_power	float
	Global_reactive_power	float
	Voltage	float
	Global_intensity	float
	Sub_metering_1	float
	Sub_metering_2	float
	Sub_metering_3	float
	DateTime	datetime

Rows: 1025260

Data:
+---------------------+-----------------------+---------+------------------+----------------+
| Global_active_power | Global_reactive_power | Voltage | Global_intensity | Sub_metering_1 |
+---------------------+-----------------------+---------+------------------+----------------+
|        4.216        |         0.418         |  234.84 |       18.4       |      0.0       |
|        5.374        |         0.498         |  233.29 |       23.0       |      0.0       |
|        3.666        |         0.528         |  235.68 |       15.8       |      0.0       |
|         3.52        |         0.522         |  235.02 |       15.0       |      0.0       |
|         3.7         |          0.52         |  235.22 |       15.8       |      0.0       |
|        3.668        |          0.51         |  233.99 |       15.8       |      0.0       |
|         3.27        |         0.152         |  236.73 |       13.8       |      0.0       |
|        3.728        |          0.0          |  235.84 |       16.4       |      0.0       |
|        5.894        |          0.0          |  232.69 |       25.4       |      0.0       |
|        7.026        |          0.0          |  232.21 |       30.6       |      0.0       |
+---------------------+-----------------------+---------+------------------+----------------+
+----------------+----------------+---------------------+
| Sub_metering_2 | Sub_metering_3 |       DateTime      |
+----------------+----------------+---------------------+
|      1.0       |      17.0      | 2006-12-16 17:24:00 |
|      2.0       |      17.0      | 2006-12-16 17:26:00 |
|      1.0       |      17.0      | 2006-12-16 17:28:00 |
|      2.0       |      17.0      | 2006-12-16 17:29:00 |
|      1.0       |      17.0      | 2006-12-16 17:31:00 |
|      1.0       |      17.0      | 2006-12-16 17:32:00 |
|      0.0       |      17.0      | 2006-12-16 17:40:00 |
|      0.0       |      17.0      | 2006-12-16 17:43:00 |
|      0.0       |      16.0      | 2006-12-16 17:44:00 |
|      0.0       |      16.0      | 2006-12-16 17:46:00 |
+----------------+----------------+---------------------+
[1025260 rows x 8 columns]
```
###TimeSeries Construction
We construct a TimeSeries object from `electric_meter1_sf` as follow:

```python
electric_meter_ts1 = graphlab.TimeSeries(electric_meter_sf1,index="DateTime")
```
```python
+---------------------+---------------------+-----------------------+---------+
|       DateTime      | Global_active_power | Global_reactive_power | Voltage |
+---------------------+---------------------+-----------------------+---------+
| 2006-12-16 17:24:00 |        4.216        |         0.418         |  234.84 |
| 2006-12-16 17:26:00 |        5.374        |         0.498         |  233.29 |
| 2006-12-16 17:28:00 |        3.666        |         0.528         |  235.68 |
| 2006-12-16 17:29:00 |         3.52        |         0.522         |  235.02 |
| 2006-12-16 17:31:00 |         3.7         |          0.52         |  235.22 |
| 2006-12-16 17:32:00 |        3.668        |          0.51         |  233.99 |
| 2006-12-16 17:40:00 |         3.27        |         0.152         |  236.73 |
| 2006-12-16 17:43:00 |        3.728        |          0.0          |  235.84 |
| 2006-12-16 17:44:00 |        5.894        |          0.0          |  232.69 |
| 2006-12-16 17:46:00 |        7.026        |          0.0          |  232.21 |
+---------------------+---------------------+-----------------------+---------+
+------------------+----------------+----------------+----------------+
| Global_intensity | Sub_metering_1 | Sub_metering_2 | Sub_metering_3 |
+------------------+----------------+----------------+----------------+
|       18.4       |      0.0       |      1.0       |      17.0      |
|       23.0       |      0.0       |      2.0       |      17.0      |
|       15.8       |      0.0       |      1.0       |      17.0      |
|       15.0       |      0.0       |      2.0       |      17.0      |
|       15.8       |      0.0       |      1.0       |      17.0      |
|       15.8       |      0.0       |      1.0       |      17.0      |
|       13.8       |      0.0       |      0.0       |      17.0      |
|       16.4       |      0.0       |      0.0       |      17.0      |
|       25.4       |      0.0       |      0.0       |      16.0      |
|       30.6       |      0.0       |      0.0       |      16.0      |
+------------------+----------------+----------------+----------------+
```
`electric_meter_ts1` is a TimeSeries object sorted by its index column `DateTime`.
### TimeSeries Save and Load

Let's see how we can materialize TimeSeries objects. `TimeSeries.save` and `graphlab.load_timeseries` are two useful 
operators to save/load your TimeSeries object.
```python
electric_meter_ts1.save("/tmp/first_copy")
second_copy = graphlab.load_timeseries("/tmp/first_copy")
```
We can also construct a TimeSeries object directly from a file path.
```python
third_copy = graphlab.TimeSeries("/tmp/first_copy")
```
### TimeSeries ReSample

Now assume we are interested in TimeSeries data in 3 minute-granularity. We
can use `TimeSeries.resample` operator to accomplish this task.
```python
ts1_resample_3m = electric_meter_ts1.resample(dt.timedelta(0,180),downsample_method='sum',upsample_method='none')
```
```python
+---------------------+---------------------+-----------------------+---------+
|       DateTime      | Global_active_power | Global_reactive_power | Voltage |
+---------------------+---------------------+-----------------------+---------+
| 2006-12-16 17:24:00 |         9.59        |         0.916         |  468.13 |
| 2006-12-16 17:27:00 |        7.186        |          1.05         |  470.7  |
| 2006-12-16 17:30:00 |        7.368        |          1.03         |  469.21 |
| 2006-12-16 17:33:00 |         None        |          None         |   None  |
| 2006-12-16 17:36:00 |         None        |          None         |   None  |
| 2006-12-16 17:39:00 |         3.27        |         0.152         |  236.73 |
| 2006-12-16 17:42:00 |        9.622        |          0.0          |  468.53 |
| 2006-12-16 17:45:00 |         12.2        |          0.0          |  466.4  |
| 2006-12-16 17:48:00 |        10.958       |          0.0          |  707.46 |
| 2006-12-16 17:51:00 |        3.258        |          0.0          |  235.49 |
+---------------------+---------------------+-----------------------+---------+
+------------------+----------------+----------------+----------------+
| Global_intensity | Sub_metering_1 | Sub_metering_2 | Sub_metering_3 |
+------------------+----------------+----------------+----------------+
|       41.4       |      0.0       |      3.0       |      34.0      |
|       30.8       |      0.0       |      3.0       |      34.0      |
|       31.6       |      0.0       |      2.0       |      34.0      |
|       None       |      None      |      None      |      None      |
|       None       |      None      |      None      |      None      |
|       13.8       |      0.0       |      0.0       |      17.0      |
|       41.8       |      0.0       |      0.0       |      33.0      |
|       52.6       |      0.0       |      0.0       |      33.0      |
|       46.6       |      0.0       |      0.0       |      51.0      |
|       13.8       |      0.0       |      0.0       |      17.0      |
+------------------+----------------+----------------+----------------+
[691753 rows x 8 columns]
```
There are two important parameters here: First, `downsample_method` determines the
aggregation function in each bucket. In this example, resample operators calculates the `sum` of all the 
meterings in each bucket. Second, `upsample_method` determines the method to
fill the empty buckets. Here we choose to fill those buckets with `None` values. 

There exists other useful parameters in `resample` operator. For example, `label` identifies which edge label to label bucket with.
`label` is by default 'left'. Notice how the index column changes when we set `label` to 'right'.
```python
ts1_resample_3m = electric_meter_ts1.resample(dt.timedelta(0,180),downsample_method='sum',upsample_method='none',label='right')
+---------------------+---------------------+-----------------------+---------+
|       DateTime      | Global_active_power | Global_reactive_power | Voltage |
+---------------------+---------------------+-----------------------+---------+
| 2006-12-16 17:27:00 |         9.59        |         0.916         |  468.13 |
| 2006-12-16 17:30:00 |        7.186        |          1.05         |  470.7  |
| 2006-12-16 17:33:00 |        7.368        |          1.03         |  469.21 |
| 2006-12-16 17:36:00 |         None        |          None         |   None  |
| 2006-12-16 17:39:00 |         None        |          None         |   None  |
| 2006-12-16 17:42:00 |         3.27        |         0.152         |  236.73 |
| 2006-12-16 17:45:00 |        9.622        |          0.0          |  468.53 |
| 2006-12-16 17:48:00 |         12.2        |          0.0          |  466.4  |
| 2006-12-16 17:51:00 |        10.958       |          0.0          |  707.46 |
| 2006-12-16 17:54:00 |        3.258        |          0.0          |  235.49 |
+---------------------+---------------------+-----------------------+---------+
+------------------+----------------+----------------+----------------+
| Global_intensity | Sub_metering_1 | Sub_metering_2 | Sub_metering_3 |
+------------------+----------------+----------------+----------------+
|       41.4       |      0.0       |      3.0       |      34.0      |
|       30.8       |      0.0       |      3.0       |      34.0      |
|       31.6       |      0.0       |      2.0       |      34.0      |
|       None       |      None      |      None      |      None      |
|       None       |      None      |      None      |      None      |
|       13.8       |      0.0       |      0.0       |      17.0      |
|       41.8       |      0.0       |      0.0       |      33.0      |
|       52.6       |      0.0       |      0.0       |      33.0      |
|       46.6       |      0.0       |      0.0       |      51.0      |
|       13.8       |      0.0       |      0.0       |      17.0      |
+------------------+----------------+----------------+----------------+
[691753 rows x 8 columns]
```
`upsample_method` accepts many other options. For example, we can assign empty buckets to receive values from their *nearest* bucket.
Notice how index column corresponding to '2006-12-16 17:36:00' and '2006-12-16 17:39:00' 
are filled with values from their above and below neighbors,respectively. 

```python
ts1_resample_3m = electric_meter_ts1.resample(dt.timedelta(0,180),downsample_method='sum',upsample_method='nearest',label='right')
+---------------------+---------------------+-----------------------+---------+
|       DateTime      | Global_active_power | Global_reactive_power | Voltage |
+---------------------+---------------------+-----------------------+---------+
| 2006-12-16 17:27:00 |         9.59        |         0.916         |  468.13 |
| 2006-12-16 17:30:00 |        7.186        |          1.05         |  470.7  |
| 2006-12-16 17:33:00 |        7.368        |          1.03         |  469.21 |
| 2006-12-16 17:36:00 |        7.368        |          1.03         |  469.21 |
| 2006-12-16 17:39:00 |         3.27        |         0.152         |  236.73 |
| 2006-12-16 17:42:00 |         3.27        |         0.152         |  236.73 |
| 2006-12-16 17:45:00 |        9.622        |          0.0          |  468.53 |
| 2006-12-16 17:48:00 |         12.2        |          0.0          |  466.4  |
| 2006-12-16 17:51:00 |        10.958       |          0.0          |  707.46 |
| 2006-12-16 17:54:00 |        3.258        |          0.0          |  235.49 |
+---------------------+---------------------+-----------------------+---------+
+------------------+----------------+----------------+----------------+
| Global_intensity | Sub_metering_1 | Sub_metering_2 | Sub_metering_3 |
+------------------+----------------+----------------+----------------+
|       41.4       |      0.0       |      3.0       |      34.0      |
|       30.8       |      0.0       |      3.0       |      34.0      |
|       31.6       |      0.0       |      2.0       |      34.0      |
|       31.6       |      0.0       |      2.0       |      34.0      |
|       13.8       |      0.0       |      0.0       |      17.0      |
|       13.8       |      0.0       |      0.0       |      17.0      |
|       41.8       |      0.0       |      0.0       |      33.0      |
|       52.6       |      0.0       |      0.0       |      33.0      |
|       46.6       |      0.0       |      0.0       |      51.0      |
|       13.8       |      0.0       |      0.0       |      17.0      |
+------------------+----------------+----------------+----------------+
[691753 rows x 8 columns]
```
### Shifting TimeSeries Data
One of the important features in TimeSeries data is the ability to shift its
column along the time dimension. GraphLab Create provides two methods
`TimeSeries.shift` and `TimeSeries.tshift` for this purpose. 

`tshift` operator shift the index column of the TimeSeries object along the time dimension while keeping other columns intact.
For example, we can shift the `electric_meter_ts1` by 5 mintues, so all the tuples move 5 minutes ahead:
```point 
electric_meter_ts1.tshift(dt.timedelta(0,300))
+---------------------+---------------------+-----------------------+---------+
|       DateTime      | Global_active_power | Global_reactive_power | Voltage |
+---------------------+---------------------+-----------------------+---------+
| 2006-12-16 17:29:00 |        4.216        |         0.418         |  234.84 |
| 2006-12-16 17:31:00 |        5.374        |         0.498         |  233.29 |
| 2006-12-16 17:33:00 |        3.666        |         0.528         |  235.68 |
| 2006-12-16 17:34:00 |         3.52        |         0.522         |  235.02 |
| 2006-12-16 17:36:00 |         3.7         |          0.52         |  235.22 |
| 2006-12-16 17:37:00 |        3.668        |          0.51         |  233.99 |
| 2006-12-16 17:45:00 |         3.27        |         0.152         |  236.73 |
| 2006-12-16 17:48:00 |        3.728        |          0.0          |  235.84 |
| 2006-12-16 17:49:00 |        5.894        |          0.0          |  232.69 |
| 2006-12-16 17:51:00 |        7.026        |          0.0          |  232.21 |
+---------------------+---------------------+-----------------------+---------+
+------------------+----------------+----------------+----------------+
| Global_intensity | Sub_metering_1 | Sub_metering_2 | Sub_metering_3 |
+------------------+----------------+----------------+----------------+
|       18.4       |      0.0       |      1.0       |      17.0      |
|       23.0       |      0.0       |      2.0       |      17.0      |
|       15.8       |      0.0       |      1.0       |      17.0      |
|       15.0       |      0.0       |      2.0       |      17.0      |
|       15.8       |      0.0       |      1.0       |      17.0      |
|       15.8       |      0.0       |      1.0       |      17.0      |
|       13.8       |      0.0       |      0.0       |      17.0      |
|       16.4       |      0.0       |      0.0       |      17.0      |
|       25.4       |      0.0       |      0.0       |      16.0      |
|       30.6       |      0.0       |      0.0       |      16.0      |
+------------------+----------------+----------------+----------------+
[1025260 rows x 8 columns]
```
`shift` does the opposite. This operator shifts forward/backward all the value columns while keeping the index column intact.
Notice that this operator does not change the *range* of the TimeSeries object and it fills those edge tuples that lost their value with `None`.
```python
electric_meter_ts1.shift(3)
+---------------------+---------------------+------------------+-----------------------+
|       DateTime      | Global_active_power | Global_intensity | Global_reactive_power |
+---------------------+---------------------+------------------+-----------------------+
| 2006-12-16 17:24:00 |         None        |       None       |          None         |
| 2006-12-16 17:26:00 |         None        |       None       |          None         |
| 2006-12-16 17:28:00 |         None        |       None       |          None         |
| 2006-12-16 17:29:00 |        4.216        |       18.4       |         0.418         |
| 2006-12-16 17:31:00 |        5.374        |       23.0       |         0.498         |
| 2006-12-16 17:32:00 |        3.666        |       15.8       |         0.528         |
| 2006-12-16 17:40:00 |         3.52        |       15.0       |         0.522         |
| 2006-12-16 17:43:00 |         3.7         |       15.8       |          0.52         |
| 2006-12-16 17:44:00 |        3.668        |       15.8       |          0.51         |
| 2006-12-16 17:46:00 |         3.27        |       13.8       |         0.152         |
+---------------------+---------------------+------------------+-----------------------+
+----------------+----------------+----------------+---------+
| Sub_metering_1 | Sub_metering_2 | Sub_metering_3 | Voltage |
+----------------+----------------+----------------+---------+
|      None      |      None      |      None      |   None  |
|      None      |      None      |      None      |   None  |
|      None      |      None      |      None      |   None  |
|      0.0       |      1.0       |      17.0      |  234.84 |
|      0.0       |      2.0       |      17.0      |  233.29 |
|      0.0       |      1.0       |      17.0      |  235.68 |
|      0.0       |      2.0       |      17.0      |  235.02 |
|      0.0       |      1.0       |      17.0      |  235.22 |
|      0.0       |      1.0       |      17.0      |  233.99 |
|      0.0       |      0.0       |      17.0      |  236.73 |
+----------------+----------------+----------------+---------+
[1025260 rows x 8 columns]
```
### TimeSeries Index Join
Another important feature of TimeSeries objects in GraphLab Create is the ability to efficiently join them across the index column. 
So far we created a resampled TimeSeries from one of the electeric meters. Now is the time to join the first resampled TimeSeries object 
`ts1_resample_3m` with the second TimeSeries object `electric_meter_ts2`.
```python
electric_meter_ts2 = graphlab.TimeSeries(electric_meter_sf2,index="DateTime")
ts1_resample_3m = electric_meter_ts1.resample(dt.timedelta(0,180),downsample_method='sum',upsample_method='none')
ts1_resample_3m.index_join(electric_meter_ts2,how='inner')
```

```python
+---------------------+---------------------+-----------------------+---------+
|       DateTime      | Global_active_power | Global_reactive_power | Voltage |
+---------------------+---------------------+-----------------------+---------+
| 2006-12-16 17:24:00 |         9.59        |         0.916         |  468.13 |
| 2006-12-16 17:27:00 |        7.186        |          1.05         |  470.7  |
| 2006-12-16 17:30:00 |        7.368        |          1.03         |  469.21 |
| 2006-12-16 17:33:00 |         None        |          None         |   None  |
| 2006-12-16 17:36:00 |         None        |          None         |   None  |
| 2006-12-16 17:39:00 |         3.27        |         0.152         |  236.73 |
| 2006-12-16 17:42:00 |        9.622        |          0.0          |  468.53 |
| 2006-12-16 17:45:00 |         12.2        |          0.0          |  466.4  |
| 2006-12-16 17:48:00 |        10.958       |          0.0          |  707.46 |
| 2006-12-16 17:51:00 |        3.258        |          0.0          |  235.49 |
+---------------------+---------------------+-----------------------+---------+
+------------------+----------------+----------------+----------------+-----------------------+
| Global_intensity | Sub_metering_1 | Sub_metering_2 | Sub_metering_3 | Global_active_power.1 |
+------------------+----------------+----------------+----------------+-----------------------+
|       41.4       |      0.0       |      3.0       |      34.0      |          None         |
|       30.8       |      0.0       |      3.0       |      34.0      |         5.388         |
|       31.6       |      0.0       |      2.0       |      34.0      |         3.702         |
|       None       |      None      |      None      |      None      |         3.662         |
|       None       |      None      |      None      |      None      |         5.224         |
|       13.8       |      0.0       |      0.0       |      17.0      |         3.384         |
|       41.8       |      0.0       |      0.0       |      33.0      |         3.266         |
|       52.6       |      0.0       |      0.0       |      33.0      |         7.706         |
|       46.6       |      0.0       |      0.0       |      51.0      |          None         |
|       13.8       |      0.0       |      0.0       |      17.0      |         3.228         |
+------------------+----------------+----------------+----------------+-----------------------+
+-------------------------+-----------+--------------------+------------------+
| Global_reactive_power.1 | Voltage.1 | Global_intensity.1 | Sub_metering_1.1 |
+-------------------------+-----------+--------------------+------------------+
|           None          |    None   |        None        |       None       |
|          0.502          |   233.74  |        23.0        |       0.0        |
|           0.52          |   235.09  |        15.8        |       0.0        |
|           0.51          |   233.86  |        15.8        |       0.0        |
|          0.478          |   232.99  |        22.4        |       0.0        |
|          0.282          |   237.14  |        14.2        |       0.0        |
|           0.0           |   237.13  |        13.8        |       0.0        |
|           0.0           |   230.98  |        33.2        |       0.0        |
|           None          |    None   |        None        |       None       |
|           0.0           |   235.6   |        13.6        |       0.0        |
+-------------------------+-----------+--------------------+------------------+
+------------------+------------------+
| Sub_metering_2.1 | Sub_metering_3.1 |
+------------------+------------------+
|       None       |       None       |
|       1.0        |       17.0       |
|       1.0        |       17.0       |
|       2.0        |       16.0       |
|       1.0        |       16.0       |
|       0.0        |       17.0       |
|       0.0        |       18.0       |
|       0.0        |       17.0       |
|       None       |       None       |
|       0.0        |       17.0       |
+------------------+------------------+
[691753 rows x 15 columns]
Note: Only the head of the Time
```
`how` parameter in `index_join` operator determines the join method. The acceptable values are 
'inner','left','right', and 'outer'. The behavior is exactly like the *SQL*
join methods. For example, `how='right'` alos brings all the tuples of the right
TimeSeries object that is not matched with any tuple in the left TimeSeries
object to the output result.
```python
ts1_resample_3m.index_join(electric_meter_ts2,how='right')
```
```python
+---------------------+---------------------+-----------------------+---------+
|       DateTime      | Global_active_power | Global_reactive_power | Voltage |
+---------------------+---------------------+-----------------------+---------+
| 2006-12-16 17:25:00 |         None        |          None         |   None  |
| 2006-12-16 17:27:00 |        7.186        |          1.05         |  470.7  |
| 2006-12-16 17:30:00 |        7.368        |          1.03         |  469.21 |
| 2006-12-16 17:33:00 |         None        |          None         |   None  |
| 2006-12-16 17:34:00 |         None        |          None         |   None  |
| 2006-12-16 17:35:00 |         None        |          None         |   None  |
| 2006-12-16 17:36:00 |         None        |          None         |   None  |
| 2006-12-16 17:37:00 |         None        |          None         |   None  |
| 2006-12-16 17:38:00 |         None        |          None         |   None  |
| 2006-12-16 17:39:00 |         3.27        |         0.152         |  236.73 |
+---------------------+---------------------+-----------------------+---------+
+------------------+----------------+----------------+----------------+-----------------------+
| Global_intensity | Sub_metering_1 | Sub_metering_2 | Sub_metering_3 | Global_active_power.1 |
+------------------+----------------+----------------+----------------+-----------------------+
|       None       |      None      |      None      |      None      |          5.36         |
|       30.8       |      0.0       |      3.0       |      34.0      |         5.388         |
|       31.6       |      0.0       |      2.0       |      34.0      |         3.702         |
|       None       |      None      |      None      |      None      |         3.662         |
|       None       |      None      |      None      |      None      |         4.448         |
|       None       |      None      |      None      |      None      |         5.412         |
|       None       |      None      |      None      |      None      |         5.224         |
|       None       |      None      |      None      |      None      |         5.268         |
|       None       |      None      |      None      |      None      |         4.054         |
|       13.8       |      0.0       |      0.0       |      17.0      |         3.384         |
+------------------+----------------+----------------+----------------+-----------------------+
+-------------------------+-----------+--------------------+------------------+
| Global_reactive_power.1 | Voltage.1 | Global_intensity.1 | Sub_metering_1.1 |
+-------------------------+-----------+--------------------+------------------+
|          0.436          |   233.63  |        23.0        |       0.0        |
|          0.502          |   233.74  |        23.0        |       0.0        |
|           0.52          |   235.09  |        15.8        |       0.0        |
|           0.51          |   233.86  |        15.8        |       0.0        |
|          0.498          |   232.86  |        19.6        |       0.0        |
|           0.47          |   232.78  |        23.2        |       0.0        |
|          0.478          |   232.99  |        22.4        |       0.0        |
|          0.398          |   232.91  |        22.6        |       0.0        |
|          0.422          |   235.24  |        17.6        |       0.0        |
|          0.282          |   237.14  |        14.2        |       0.0        |
+-------------------------+-----------+--------------------+------------------+
+------------------+------------------+
| Sub_metering_2.1 | Sub_metering_3.1 |
+------------------+------------------+
|       1.0        |       16.0       |
|       1.0        |       17.0       |
|       1.0        |       17.0       |
|       2.0        |       16.0       |
|       1.0        |       17.0       |
|       1.0        |       17.0       |
|       1.0        |       16.0       |
|       2.0        |       17.0       |
|       1.0        |       17.0       |
|       0.0        |       17.0       |
+------------------+------------------+
[1024020 rows x 15 columns]
Note: Only the head of the TimeSeries
```
### TimeSeries Data Manipulation
Let's do some pre-processing on `electric_meter_ts1` TimeSeries object to make it ready for further analysis. 
First we are interested in the *range* of this TimeSeries object.
```python
electric_meter_ts1.range
(datetime.datetime(2006, 12, 16, 17, 24),
  datetime.datetime(2010, 11, 26, 21, 2))
```
Notice this TimeSeries object covers almost four years of data. Imagine we are more interested in data of the year '2010'.
We achieve this by using:

```python
ts1_2010 = electric_meter_ts1.datetime_range(dt.datetime(2010,1,1),datetime.datetime(2010, 11, 26, 21, 2))
or
ts1_2010 = electric_meter_ts1[dt.datetime(2010,1,1):datetime.datetime(2010, 11, 26, 21, 2)]
```
Next, we want to remove all the value columns except `Global_active_power`. 
```python
for name in ts1_2010.column_names():
  if name not in ['Global_active_power','DateTime']:
     ts1_2010.remove_column(name)
```
```python
+---------------------+---------------------+
|       DateTime      | Global_active_power |
+---------------------+---------------------+
| 2010-01-01 00:00:00 |         1.79        |
| 2010-01-01 00:01:00 |         1.78        |
| 2010-01-01 00:03:00 |        1.746        |
| 2010-01-01 00:06:00 |         1.68        |
| 2010-01-01 00:07:00 |        1.688        |
| 2010-01-01 00:08:00 |        1.676        |
| 2010-01-01 00:11:00 |        1.618        |
| 2010-01-01 00:13:00 |        1.618        |
| 2010-01-01 00:14:00 |        1.622        |
| 2010-01-01 00:15:00 |        1.622        |
+---------------------+---------------------+
[229026 rows x 2 columns]
```
Finally, we only want to keep those tuples with `Global_active_power` more than '1.5':
```python
ts1_final = ts1_2010[ts1_2010['Global_active_power'] > 1.5]
```
```python
+---------------------+---------------------+
|       DateTime      | Global_active_power |
+---------------------+---------------------+
| 2010-01-01 00:00:00 |         1.79        |
| 2010-01-01 00:01:00 |         1.78        |
| 2010-01-01 00:03:00 |        1.746        |
| 2010-01-01 00:06:00 |         1.68        |
| 2010-01-01 00:07:00 |        1.688        |
| 2010-01-01 00:08:00 |        1.676        |
| 2010-01-01 00:11:00 |        1.618        |
| 2010-01-01 00:13:00 |        1.618        |
| 2010-01-01 00:14:00 |        1.622        |
| 2010-01-01 00:15:00 |        1.622        |
+---------------------+---------------------+
[58906 rows x 2 columns]
```
### TimeSeries Grouping
TimeSeries `Group` is a very powerful operator that separates a TimeSeries by
the distinct values in one or more columns. The output of this operator is a `graphlab.timeseries.GroupedTimeSeries` object, 
which provides an interface for retrieving one or more groups by their group name, or iterating through all groups. 
Each group is a separate TimeSeries, which possesses the same columns as the original TimeSeries.
To group the TimeSeries by a part of it's timestamp (e.g. "DAY" or "HOUR"), 
use the special types declared in `graphlab.TimeSeries.date_part`.

Consider the previous example. We created `ts1_final` TimeSeries object. Imagine a scenario that we are interested in 
individual TimeSeries that are *grouped* by day of the week. 

```python
tsg = ts1_final.group(ts1_final.date_part.WEEKDAY)
```
```python
tsg.groups()
Rows: 7
[0, 1, 2, 3, 4, 5, 6]
```
tsg is a GroupedTimeSeries containing 7 groups where each group is a single TimeSeries. 
In this example groups are named between 0 and 6 where 0 is Monday. We can easily access each group in the GroupedTimeSeries object.
For instance, the following return a TimeSeries object that represents all the metering tuples of the `ts1_final` on 'Tuesdays'.
```python
ts_tues = tsg.get_group(1)
+---------------------+---------------------+
|       DateTime      | Global_active_power |
+---------------------+---------------------+
| 2010-01-05 06:42:00 |        2.672        |
| 2010-01-05 06:43:00 |        3.184        |
| 2010-01-05 06:44:00 |        3.692        |
| 2010-01-05 06:46:00 |        3.062        |
| 2010-01-05 06:47:00 |        3.016        |
| 2010-01-05 06:48:00 |         2.88        |
| 2010-01-05 06:50:00 |        1.632        |
| 2010-01-05 06:53:00 |        1.564        |
| 2010-01-05 06:55:00 |        1.582        |
| 2010-01-05 06:56:00 |        1.582        |
+---------------------+---------------------+
```
We can also iterate over all the groups in this GroupedTimeSeries object:
```python 
day_mapping = {0:'Monday',1:'Tuesday',2:'Wednesday',3:'Thursday',4:'Friday',5:'Saturday',6:'Sunday'}
for name, group in tsg:
  print "Group name: " + day_mapping[name]
  print group
  print "\n"
```
```python
Group name: Monday
+---------------------+---------------------+
|       DateTime      | Global_active_power |
+---------------------+---------------------+
| 2010-01-04 03:06:00 |        1.584        |
| 2010-01-04 03:10:00 |        1.542        |
| 2010-01-04 03:14:00 |        1.506        |
| 2010-01-04 03:27:00 |        1.536        |
| 2010-01-04 03:28:00 |        1.518        |
| 2010-01-04 03:31:00 |        1.522        |
| 2010-01-04 06:40:00 |        1.828        |
| 2010-01-04 06:41:00 |        2.456        |
| 2010-01-04 06:43:00 |        2.456        |
| 2010-01-04 06:48:00 |        2.014        |
+---------------------+---------------------+
[7756 rows x 2 columns]

Group name: Tuesday
+---------------------+---------------------+
|       DateTime      | Global_active_power |
+---------------------+---------------------+
| 2010-01-05 06:42:00 |        2.672        |
| 2010-01-05 06:43:00 |        3.184        |
| 2010-01-05 06:44:00 |        3.692        |
| 2010-01-05 06:46:00 |        3.062        |
| 2010-01-05 06:47:00 |        3.016        |
| 2010-01-05 06:48:00 |         2.88        |
| 2010-01-05 06:50:00 |        1.632        |
| 2010-01-05 06:53:00 |        1.564        |
| 2010-01-05 06:55:00 |        1.582        |
| 2010-01-05 06:56:00 |        1.582        |
+---------------------+---------------------+
[8204 rows x 2 columns]

Group name: Wednesday
+---------------------+---------------------+
|       DateTime      | Global_active_power |
+---------------------+---------------------+
| 2010-01-06 00:03:00 |        2.612        |
| 2010-01-06 00:04:00 |        2.606        |
| 2010-01-06 00:05:00 |         2.6         |
| 2010-01-06 00:10:00 |        2.594        |
| 2010-01-06 00:11:00 |        2.594        |
| 2010-01-06 00:15:00 |         2.61        |
| 2010-01-06 00:16:00 |        1.524        |
| 2010-01-06 06:12:00 |        1.514        |
| 2010-01-06 06:14:00 |        1.554        |
| 2010-01-06 06:15:00 |        1.624        |
+---------------------+---------------------+
[8633 rows x 2 columns]

Group name: Thursday
+---------------------+---------------------+
|       DateTime      | Global_active_power |
+---------------------+---------------------+
| 2010-01-07 05:55:00 |        1.518        |
| 2010-01-07 05:56:00 |        1.514        |
| 2010-01-07 05:57:00 |        1.502        |
| 2010-01-07 05:59:00 |        1.508        |
| 2010-01-07 06:20:00 |        1.578        |
| 2010-01-07 06:21:00 |        1.552        |
| 2010-01-07 06:22:00 |        1.582        |
| 2010-01-07 06:35:00 |        2.102        |
| 2010-01-07 06:36:00 |        2.344        |
| 2010-01-07 07:33:00 |        2.162        |
+---------------------+---------------------+
[7294 rows x 2 columns]

Group name: Friday
+---------------------+---------------------+
|       DateTime      | Global_active_power |
+---------------------+---------------------+
| 2010-01-01 00:00:00 |         1.79        |
| 2010-01-01 00:01:00 |         1.78        |
| 2010-01-01 00:03:00 |        1.746        |
| 2010-01-01 00:06:00 |         1.68        |
| 2010-01-01 00:07:00 |        1.688        |
| 2010-01-01 00:08:00 |        1.676        |
| 2010-01-01 00:11:00 |        1.618        |
| 2010-01-01 00:13:00 |        1.618        |
| 2010-01-01 00:14:00 |        1.622        |
| 2010-01-01 00:15:00 |        1.622        |
+---------------------+---------------------+
[8065 rows x 2 columns]

Group name: Saturday
+---------------------+---------------------+
|       DateTime      | Global_active_power |
+---------------------+---------------------+
| 2010-01-02 00:34:00 |        1.528        |
| 2010-01-02 00:35:00 |        1.568        |
| 2010-01-02 00:36:00 |        1.566        |
| 2010-01-02 00:38:00 |        1.542        |
| 2010-01-02 00:40:00 |         1.54        |
| 2010-01-02 00:43:00 |        1.626        |
| 2010-01-02 00:44:00 |         1.63        |
| 2010-01-02 00:46:00 |        1.622        |
| 2010-01-02 00:50:00 |        1.524        |
| 2010-01-02 09:34:00 |         2.25        |
+---------------------+---------------------+
[9907 rows x 2 columns]

Group name: Sunday
+---------------------+---------------------+
|       DateTime      | Global_active_power |
+---------------------+---------------------+
| 2010-01-03 02:01:00 |        1.508        |
| 2010-01-03 08:46:00 |        3.022        |
| 2010-01-03 08:48:00 |        2.806        |
| 2010-01-03 08:49:00 |        2.664        |
| 2010-01-03 08:50:00 |        2.666        |
| 2010-01-03 08:52:00 |        1.968        |
| 2010-01-03 08:53:00 |         1.53        |
| 2010-01-03 08:59:00 |         1.72        |
| 2010-01-03 09:00:00 |        1.738        |
| 2010-01-03 09:01:00 |        1.742        |
+---------------------+---------------------+
[9047 rows x 2 columns]
```
