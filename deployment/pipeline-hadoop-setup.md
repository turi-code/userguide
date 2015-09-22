# Setting up Dato Distributed on Hadoop

Dato Distributed runs either in the Cloud (using AWS) or on-premises (Hadoop/YARN). If you use it in the Cloud the setup of Dato Distributed happens behind the scenes, all you need is to provide your credentials for AWS. If you decide to use Dato Distributed in your own Hadoop cluster, you will first need to download and install it there.

#### Prerequisites

We assume that you already downloaded and installed GraphLab Create on a machine that you will use to interact with your Dato Distributed deployment. This can, but doesn't have to be the same machine you used for downloading and installing Dato Distributed. For more information on obtaining and installing GraphLab Create see [Getting Started](https://dato.com/learn/userguide/install.html).

You will need the Dato Distributed package as well as a Dato Distributed product key. Both can be obtained on the [installation page on dato.com](https://dato.com/download/install-dato-distributed.html).

You install Dato Distributed from a host that can access the cluster, which usually means to use the Hadoop client tool, together with the appropriate YARN configuration files. After downloading the Dato Distributed package, you unpack it on this machine. Currently Dato Distributed can only be setup from a Mac or Linux machine (not from a Windows machine).

##### Hadoop
The Hadoop version has to be version 2.6.0 or later. You may setup a Hadoop cluster through:

* The [Apache website](http://hadoop.apache.org/docs/r2.6.0/). We support Hadoop 2.6.0 or later.
* [Cloudera](http://www.cloudera.com/content/cloudera/en/downloads.html), we support CDH 5.0 or later.
* [Hortonworks](http://hortonworks.com/hdp/downloads/), we support HDP 2.2 or later.

The machine running the Dato Distributed setup needs to be able to access the Hadoop cluster. That means you need to have Java, the Hadoop client, and an appropriate Hadoop configuration in your client machine. Check with your Hadoop administrator to get the Hadoop configuration file.

#### Deploy
After you downloaded the Dato Distributed package you will need to unpack it:

```
tar xzvf dato-distrib-0.177.tar.gz
```

Deploying the Dato bits to the cluster happens through the script `setup_dato-distributed.sh` that was extracted as part of the package. You will need to provide a destination path (on HDFS) to the script using the -d parameter. This path serves as a deployment location that the user refers to when working with the cluster through the Python API. The script connects to the cluster, creates a folder structure in the destination path, and copies the binaries needed for GraphLab Create's distributed runtime there.

Another required parameter is the Dato Distributed product key file, which you obtained as part of the sign-up process (see above). You specify its location through -k.

In order to access the cluster, if not already included in your local environment, you might need to tell the script where to find your YARN configuration files using the parameter -c:

```
cd dato-distrib-0.177

./setup_dato-distributed.sh -d hdfs://my.cluster:8020/user/name/dd
                            -k ~/Downloads/Dato-Distributed-License.ini
                            -c ~/yarn-conf

```

This deploys Dato Distributed using the YARN config specified in `~/yarn-conf` to the path `hdfs://my.cluster:8020/user/name/dd`, with the GraphLab Create license in `~/Downloads/Dato-Distributed-License.ini`.


#### Important Parameters
Let’s call out a few other parameters that you might have to specify, depending on your cluster environment.

**`-p <NODE_TMP_DIR>`**
For a typical Dato Distributed use case we recommend at least 10GB of free space for temporary files that are needed locally on nodes during distributed job execution. Usually this means free space in your cluster nodes’ /tmp folder. You can override this location by specifying the -p parameter when calling the setup script. Note that the provided location needs to exist on all nodes of the cluster. Moreover, make sure that YARN has r/w/x access to this location.

**`-h <HDFS_TMP_DIR>`**
Dato Distributed runs the GraphLab Create engine, which has the ability to spill its large data structures to disk if necessary. The engine will use the default local tmp location, or NODE_TMP_DIR if it is set. However, it also has the ability to spill over to a location on HDFS, which you can explicitly specify using the -h parameter. If set, this will take precedence over the local tmp location.

#### Use
Using a Dato Distributed deployment in a Hadoop cluster is described in the following sections. Here is a quick start.

In order to submit jobs to the cluster, you use a cluster object that is based on the Dato Distributed deployment. As an example, let’s assume you have used the path `hdfs://my.cluster.com:8020/user/name/dd` when executing the setup script. You can create the cluster object now as follows:

```python
import graphlab as gl

# Create cluster
c = gl.deploy.hadoop_cluster.create(
    name=’test-cluster’,
    dato_dist_path='hdfs://my.cluster.com:8020/user/name/dd',
    hadoop_conf_dir='~/yarn-config')

def echo(input):
    return input

j = graphlab.deploy.job.create(echo, environment=c, input='hello world!')

j.get_results()
```

This example also assumes that you have a folder yarn-config with the YARN configuration files in your home directory.

The cluster object `c` can be used as environment for [`job.create`](https://dato.com/learn/userguide/deployment/pipeline-ec2-hadoop.html) (like in the example above), [`map_job.create`](https://dato.com/learn/userguide/deployment/pipeline-distributed.html), or [distributed model parameter search](https://dato.com/learn/userguide/model_parameter_search/distributing.html).
