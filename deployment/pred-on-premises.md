# Predictive Services On-Premises
While providing a convenient and flexible environment for running a predictive service, not all scenarios are suited for a cloud-based deployment. For reasons of privacy, security, or cost you might prefer to host your predictive service locally, on a machine you own and control. We call this a Predictive Services on-premises deployment.

#### Prerequisites
You need to download the [Dato Predictive Services on-premises package](https://d1wdo1t4yti371.cloudfront.net/dato_ps_setup_latest.tar.gz). Note that you will need about 800MB of free space to locally store the package.

Predictive Services on-premises uses [Docker](https://www.docker.com/) as its packaging and deployment mechanism. To install Docker on the machine that will host the predictive service, please download from https://docs.docker.com/installation/. Make sure to pick the installation that matches the host’s operating system.

You will also need a valid product key, which is contained in the GraphLab Create config file (usually ~/.graphlab/config). You will need to have run GraphLab Create at least once for this file to be created at its default location.

##### OS X
On OS X the newly introduced Docker Toolbox replaced the boot2docker tool (internally docker-machine still uses boot2docker). Follow the instructions on the Docker website for [creating a Docker VM in Mac OS X](http://docs.docker.com/mac/step_one/). These instructions entail:

* installing the Docker Toolbox (which include VirtualBox),
* creating a Docker VM, and
* setting required environment variables to use the new VM.

You might run into an incompatibility issue with the included VirtualBox version, causing an error during the docker-machine create call. The current (8/31/2015) workaround is to install a more recent VirtualBox test build from https://www.virtualbox.org/wiki/Testbuilds. See also https://www.virtualbox.org/ticket/14412.

#### Installation
Deployment of a predictive service is achieved by installing and running a set of Docker containers. The containers as well as a setup script are included in the package you downloaded from dato.com.

Follow these steps to install Dato Predictive Services:

1. Move the downloaded setup package to the computer you want to install Dato Predictive Services on.
2. Unzip the file to a temporary folder:
```
tar zxvf dato_ps_setup_latest.tar.gz
```
3. Create a Predictive Services working directory in the host machine where Predictive Services files (include docker images) will be copied to.
```
mkdir -p <deployment_path>
```
4. Decide where the Predictive Services runtime data (state files, logs, etc.) will be stored; this could be a network file system, a S3 file path, or an HDFS file path. This path will be used by data scientists to manage the predictive service later through the GraphLab Create Python API. A common path is usually a HDFS path, like `hdfs://<hdfs-name-node>:8020/user/<ps-service-user>/dato_predictive_service`
We will call this path the “ps path”.
5. Modify predictive_service.cfg file included in the package. You will need to make the following changes for a local setup:
 * `hostname=localhost` (unless you need to deploy on a different machine, see below)
 * `ps_path`: the path you chose in step ‘4’ above
 * `deployment_path`: the path you chose in step ‘3’ above
 * `hdfs_conf_dir`: optional, needed if you decide to use HDFS as ps path. If you want to use HDFS for storing the predictive service's runtime data the setup script needs to know where to find the Hadoop/HDFS configuration files in order to access HDFS. This is the same folder that you would specify to the Hadoop client command.
6. Other parameters that are set to defaults, but might need to be changed for your scenario (also depending on the size of your VirtualBox VM), are:
 * `server_memory`: Memory in MB to be used by the predictive service's container.
 * `max_cache_memory`: Maximum amount of cache the predictive service can use.
6. If you are setting up the predictive service on a machine other than localhost, you also need to provide credentials to the remote machine:
 * `remote_user_name`: a user name that can log into the remote machine
 * `pem_file_path`: path to key file required for accessing the remote machine
7. Run setup, providing the path to your GLC license file:
```
./setup_dato_ps.sh /home/name/.graphlab/config
```

If the predictive service is setup correctly, you should see this message after the script has finished:
```
Predictive Service has been successfully launched!
You may check your Predictive Service stats on the load balancer's dashboard:
  open http://<host-name>:9000/stats
```

#### Use
GraphLab Create is required to connect to Dato Predictive Services and deploy/monitor/manage the service. You can download GraphLab Create through https://dato.com/download/, where you can get a trial license valid for 30 days. We recommend to use pip or Conda to create a self-contained environment for hosting your GraphLab Create installation.

After you have installed GraphLab Create, you can connect to the predictive service; In the code sample below remember to replace `ps-path` with your actual ps path specified in installation step 4 above. If this is an HDFS path, you need to have set up your environment to have access to HDFS (either by setting HADOOP_CLASSPATH or HADOOP_CONF_DIR).

```
import graphlab as gl
ps = gl.deploy.predictive_service.load(“<ps-path>”)
ps.get_status()
```

For more information about the API see https://dato.com/learn/userguide/deployment/pred-intro.html and https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_services.html

#### Shutdown
If you need to shut down your predictive service (which is also necessary if you want to change any of the configuration parameters), you use the `shutdown_dato_ps.sh` script. This script removes the Docker containers used by the predictive service. To restart the service, run the setup script again.
