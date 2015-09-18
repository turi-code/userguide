#Spark Integration
<a name="Spark_Integration"></a>
GraphLab Create has the ability to convert [Apache
Spark's](http://spark.apache.org) [Resilient Distributed
Datasets](http://spark.apache.org/docs/latest/programming-guide.html#resilient-distributed-datasets-rdds)
(RDD) to an SFrame and back.

## Setup the Environment
To use GraphLab Create within PySpark, you need to set the ``$SPARK_HOME`` and ``$PYTHONPATH`` environment variables on the driver. A common usage:
```shell 
export PYTHONPATH=$SPARK_HOME/python/:$SPARK_HOME/python/lib/py4j-0.8.2.1-src.zip:$PYTHONPATH
export SPARK_HOME =<your-spark-home-dir>
```

### Run from the PySpark Python Shell
```bash
cd $SPARK_HOME
bin/pyspark
```

### Run from a standard Python Shell
Make sure you have exported the `PYTHONPATH` and `SPARK_HOME` environment variables.  Then run (for example):
```bash
ipython
```
Then you need to start spark:
```python
from pyspark import SparkContext
from pyspark.sql import SQLContext
# Launch spark by creating a spark context
sc = SparkContext()
# Create a SparkSQL context to manage dataframe schema information.
sql = SQLContext(sc)
```

### Make an SFrame from an RDD
```python
from graphlab import SFrame
rdd = sc.parallelize([(x,str(x), "hello") for x in range(0,5)])
sframe = SFrame.from_rdd(rdd, sc)
print sframe
```
```python
+---------------+
|       X1      |
+---------------+
| [0, 0, hello] |
| [1, 1, hello] |
| [2, 2, hello] |
| [3, 3, hello] |
| [4, 4, hello] |
+---------------+
[5 rows x 1 columns]
```
### Make an SFrame from a Dataframe (preferred)
```python
from graphlab import SFrame
rdd = sc.parallelize([(x,str(x), "hello") for x in range(0,5)])
df = sql.createDataFrame(rdd)
sframe = SFrame.from_rdd(df, sc)
print sframe
```
```python
+----+----+-------+
| _1 | _2 |   _3  |
+----+----+-------+
| 0  | 0  | hello |
| 1  | 1  | hello |
| 2  | 2  | hello |
| 3  | 3  | hello |
| 4  | 4  | hello |
+----+----+-------+
[5 rows x 3 columns]
```

### Make an RDD from an SFrame
```python
from graphlab import SFrame
sf = gl.SFrame({'x': [1,2,3], 'y': ['fish', 'chips', 'salad']})
rdd = sf.to_rdd(sc)
rdd.collect()
```
```python
[(0, '0', 'hello'),
 (1, '1', 'hello'),
 (2, '2', 'hello'),
 (3, '3', 'hello'),
 (4, '4', 'hello')]
```
### Make a DataFrame from an SFrame (preferred)
```python
from graphlab import SFrame
sf = gl.SFrame({'x': [1,2,3], 'y': ['fish', 'chips', 'salad']})
df = sf.to_spark_dataframe(sc,sql)
df.show()
```
```python
+---+-----+
|  x|    y|
+---+-----+
|  1| fish|
|  2|chips|
|  3|salad|
+---+-----+
```
# Requirements and Caveats
* The currently release requires Python 2.7, Spark 1.3 or later, and the `hadoop` binary must be within the `PATH` of the driver when running on a cluster or interacting with `Hadoop` (e.g., you should be able to run `hadoop classpath`).

* We also currently only support Mac and Linux platforms but will have Windows support soon. 
* The GraphLab integration with Spark supports Spark execution modes `local`,`yarn-client`, and standalone `spark://<hostname:port>`.
("yarn-cluster" is not available through PySpark)

# Recommended Settings for Spark Installation on a Cluster
We recommend downloading ``Pre-built for Hadoop 2.4 and later`` version of <a href="http://spark.apache.org/">Apache Spark</a>.

# Notes
1. RDD conversion works with GraphLab Create **right out of the box**. No additional Spark setup is required. 
When you install GraphLab Create, it comes with a JAR that enables this feature.  To find the location of the JAR file, execute this command:
```
graphlab.get_spark_integration_jar_path()
```
2. GraphLab Create can only convert to types it supports. This means that if
you have an RDD with Python types other than int, long, str, list, dict,
array.array, or datetime.datetime (image is not supported for conversion
currently), your conversion may fail (when using Spark locally, you may get
lucky and successfully convert an unsupported type, but it will probably fail
on a YARN cluster).

3. SFrames fit most naturally with DataFrame.  Both have strict column types
and a they have a similar approach to storing data.  This is why we also have a
[graphlab.SFrame.to_spark_dataframe](https://dato.com/products/create/docs/generated/graphlab.SFrame.to_spark_dataframe.html#graphlab.SFrame.to_spark_dataframe)
method.  The [graphlab.SFrame.from_rdd](https://dato.com/products/create/docs/generated/graphlab.SFrame.from_rdd.html#graphlab.SFrame.from_rdd)
method works with both DataFrame and any other rdd, so there is no
`from_dataframe` method.

