# Setting up Dato Distributed on Hadoop

If you decide to use Dato Distributed in your own Hadoop cluster, you will first need to install it there.

#### Preliminaries
We assume that you already downloaded and installed GraphLab Create on a client machine. For more information see [Getting Started](https://dato.com/learn/userguide/install.html).

You will also need a GraphLab Create license file with a valid Dato Distributed license. This can be an installed license file (usually ~/.graphlab/config) or a license file that you download from dato.com.

You need to download Dato Distributed from (dato.com)[TODO: insert reference]. Note that you will need about 400MB of free space to locally store the package.

You install Dato Distributed from a host that can access the cluster, which usually means to use the hadoop client tool, together with the appropriate YARN configuration files. After downloading the Dato Distributed package, you unpack it on this machine. Currently Dato Distributed can only be setup from a Mac or Linux machine (not from a Windows machine).

#### Deploy
After you downloaded the Dato Distributed package you will need to unpack it. Typically this involves the following step:

```
tar xzvf dato-distrib-0.177.tar.gz
```

(Alternatively you could just copy the URL from the download page and `wget` it.)

Then deploy the Dato bits to the cluster. This happens through the script `setup_dato-distributed.sh` that was extracted as part of the package. You will need to provide a destination path (on HDFS) to the script using the -d parameter, as well as a license file license using the -k parameter. This path serves as a deployment location that the user refers to when working with the cluster through the Python API. Additionally, if not already included in your environment, you might need to tell the script where to find your YARN configuration files using the parameter -c:

```
cd dato-distrib-0.177

./setup_dato-distributed.sh -c ~/yarn-conf
                            -k ~/.graphlab/config
                            -d hdfs://my.cluster:8020/user/name/dd
```

This deploys Dato Distributed using the YARN config specified in `~/yarn-conf` to the path `hdfs://my.cluster:8020/user/name/dd`, with the GraphLab Create license in `~/.graphlab/config`.


#### Important Parameters
Let’s call out a few other parameters that you might have to specify, depending on your cluster environment.

**`-p <NODE_TMP_DIR>`**
For a typical Dato Distributed use case we recommend at least 10GB of free space for temporary files that are needed locally on nodes during distributed job execution. Usually this means free space in your cluster nodes’ /tmp folder. You can override this location by specifying the -p parameter when calling the setup script. Note that the provided location needs to exist on all nodes of the cluster. Moreover, make sure that YARN has r/w/x access to this location.

**`-h <HDFS_TMP_DIR>`**
Dato Distributed runs the GraphLab Create engine, which has the ability to spill its large data structures to disk if necessary. The engine will use the default local tmp location, or NODE_TMP_DIR if it is set. However, it also has the ability to spill over to a location on HDFS, which you can explicitly specify using the -h parameter. If set, this will take precedence over the local tmp location.

#### Use
Using a Dato Distributed deployment in a Hadoop cluster is described in the following sections. Here is a quick start.

In order to submit jobs to the cluster, you use a cluster object that is based on the Dato Distributed deployment. As an example, let’s assume you have used the path `hdfs://my.cluster.com:8020/user/name/dd` when executing the setup script. You can create the cluster object now as follows:

```no-highlight
import graphlab as gl

# Create cluster
c = gl.deploy.hadoop_cluster.create(
    name=’test-cluster’,
    dato_dist_path='hdfs://my.cluster.com:8020/user/name/dd',
    hadoop_conf_dir='~/yarn-config')
```

This example also assumes that you have a folder yarn-config with the YARN configuration files in your home directory.

The cluster object `c` can now be used as environment for [`job.create`](https://dato.com/learn/userguide/deployment/pipeline-ec2-hadoop.html), [`map_job.create`](https://dato.com/learn/userguide/deployment/pipeline-distributed.html), or [distributed model parameter search](https://dato.com/learn/userguide/model_parameter_search/distributing.html).
