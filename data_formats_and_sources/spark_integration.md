<a name="Spark_Integration"></a>
GraphLab Create has the ability to convert [Apache
Spark's](http://spark.apache.org) [Resilient Distributed
Datasets](http://spark.apache.org/docs/latest/programming-guide.html#resilient-distributed-datasets-rdds)
(RDD) to an SFrame and back.  This enables you to write code like this:
```
from pyspark import SparkContext
import graphlab as gl

sc = SparkContext('yarn-client')

t = sc.textFile("hdfs://some/large/file")
sf = gl.SFrame.from_rdd(t)

# do stuff...

out_rdd = sf.to_rdd(sc)
```
In order to use this feature, you must access your RDD through PySpark 1.1+ and
use it in either "local" or "yarn-client" execution modes ("yarn-cluster" is
not available through PySpark).  For this guide, we assume that you have an
installed version of Spark 1.1 that is able to successfully submit jobs to a
YARN cluster, and that the environment variable SPARK_HOME points to Spark's
top level directory.

#### Setting Up Spark Support

RDD conversion will not work with GraphLab Create right out of the box.  When you install GraphLab Create, it comes with a JAR that is required to enable this feature.  To find the location of the JAR file, execute this command:

```
gl.get_spark_integration_jar_path()
```

This path must be in the CLASSPATH used by Spark before it launches.  BE CAREFUL
though, as Spark does not by default read the CLASSPATH environment variable.
In Spark 1.1, you may either:

1. start Spark with the runtime flag '--driver-class-path' set to the path of
the GraphLab Create JAR. Here is an example using spark-submit:

```bash
$SPARK_HOME/bin/spark-submit --driver-class-path /path/to/graphlab-create-spark-integration.jar --master yarn-client my_awesome_code.py
```

OR

```bash
$SPARK_HOME/bin/pyspark --driver-class-path /path/to/graphlab-create-spark-integration.jar --master yarn-client
```

1. add this path to $SPARK_HOME/conf/spark-defaults.conf under the property
'spark.driver.extraClassPath' and restart Spark.  Remember, setting this
property in other ways (such as 'setLocalProperty', or the SparkConf object)
will have no effect since Spark would have already started. It must be set in
the configuration file.  The config file entry will look something like this:

```bash
spark.driver.extraClassPath    /path/to/graphlab-create-spark-integration.jar
```


If you forget this step and try to use `from_rdd`/`to_rdd`, our error message will remind you of this step.

#### Using Spark support

In most cases, you won't have to think too much about this conversion.
However, there are a few considerations to keep in mind:

1. GraphLab Create can only convert to types it supports. This means that if
you have an RDD with Python types other than int, long, str, list, dict,
array.array, or datetime.datetime (image is not supported for conversion
currently), your conversion may fail (when using Spark locally, you may get
lucky and successfully convert an unsupported type, but it will probably fail
on a YARN cluster).

1. SFrames fit most naturally with SchemaRDDs.  Both have strict column types
and a they have a similar approach to storing data.  This is why we also have a
[to_schema_rdd](https://dato.com/products/create/docs/generated/graphlab.SFrame.to_schema_rdd.html#graphlab.SFrame.to_schema_rdd)
method.  The
[from_rdd](https://dato.com/products/create/docs/generated/graphlab.SFrame.from_rdd.html#graphlab.SFrame.from_rdd)
method works with both SchemaRDDs and any other rdd, so there is no
`from_schema_rdd`.
