# Predictive Services On-Premises
While providing a convenient and flexible environment for running a predictive service, not all scenarios are suited for a cloud-based deployment. For reasons of privacy, security, or cost you might prefer to host your predictive service locally, on a machine you own and control. We call this a Predictive Services on-premises deployment.

#### Prerequisites
We assume that you already downloaded and installed GraphLab Create on a machine that you will later use to interact with your local Predictive Services deployment. For more information on obtaining and installing GraphLab Create see [Getting Started](https://dato.com/learn/userguide/install.html).

You will need the Predictive Services package as well as a Predictive Services product key. Both can be obtained on the [installation page on dato.com](https://dato.com/download/install-dato-predictive-services.html).

Predictive Services on-premises uses [Docker](https://www.docker.com/) as its packaging and deployment mechanism. To install Docker on the machine that will host the predictive service, please download from https://docs.docker.com/installation/. Make sure to pick the installation that matches the host’s operating system.

##### OS X and Windows

Follow the instructions on the Docker website for [creating a Docker VM in Mac OS X](http://docs.docker.com/mac/step_one/) or [creating a Docker VM in Windows](https://docs.docker.com/windows/step_one/). Once you have Docker installed, you can begin installation by starting the Docker Quickstart Terminal.

The Docker Quickstart Terminal does the following things:
* Creates a Virtualbox instance called `default` that will serve as the docker machine instance, if it is not yet created.
* Starts the default instance.
* Configures the environment variables to point to the default instance.

You can verify that this is setup properly by running:

    $ echo $DOCKER_MACHINE_NAME

which should print something like "default".

You can start and stop the machine with:

    $ docker-machine start
    $ docker-machine stop

If you'd prefer to run on another docker host you've created, just run the command:

    $ eval $(docker-machine env <your machine name>)

The installation script is aware of the `$DOCKER_MACHINE_NAME` environment variable and will load and run the docker instances appropriately.

You might run into an incompatibility issue with the included VirtualBox version, causing an error during the docker-machine create call. The current (8/31/2015) workaround is to install a more recent VirtualBox test build from https://www.virtualbox.org/wiki/Testbuilds. See also https://www.virtualbox.org/ticket/14412.

After installation is complete, be sure to configure port forwarding as noted below. This is not necessary on a Linux machine, since it is not run from inside of a Virtualbox instance.

#### Installation
Deployment of a predictive service is achieved by installing and running a set of Docker containers. The containers as well as a setup script are included in the package you downloaded from dato.com.

Follow these steps to install Dato Predictive Services:

1. Download the dato-predictive-services-1.8.3.tar.gz (or the latest version) and your license file.
2. Move the package and license file to the computer you want to install Dato Predictive Services on. For Windows hosts, be sure to do all of the work from your C drive where Docker is installed. Trying to setup from another drive may lead to problems.
2. Unzip the file to a temporary folder:
```
tar zxvf dato_ps_setup_1.8.3.tar.gz
```
3. Create a Predictive Services working directory in the host machine where Predictive Services files (include docker images) will be copied to. On Windows, this must be on the same drive as your Docker installation, which is the C drive.
```
mkdir -p <deployment_path>
```
4. Decide where the Predictive Services runtime data (state files, logs, etc.) will be stored; this could be a network file system, a S3 file path, or an HDFS file path. This path will be used by data scientists to manage the predictive service later through the GraphLab Create Python API. A common path is usually a HDFS path, like `hdfs://<hdfs-name-node>:8020/user/<ps-service-user>/dato_predictive_service`
We will call this path the “ps path”.
5. Modify predictive_service.cfg file included in the package. You will need to make the following changes for a local setup:
    * `internal_ip`: The internal IP address of your host, usually a private IP address such as 10.X.X.X or 192.168.X.X.
    * `external_ip`: The external IP address of your host, which is not one of the private IP addresses. This is how other machines can find your host.
    * `ps_path`: the path you chose in step 4 above
    * `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: Specify these if you gave an S3 address for `ps_path`.
    * `deployment_path`: the path you chose in step 3 above
    * `server_memory`: The memory size, in MB, of your predictive service container. The default of 4096 is fine for most purposes.
    * `server_port`: The internal server port. When Predictive Services is configured, there is a load balancer configured to forward traffic to a server. This port will not be used externally.
    * `use_ssl`: If you'd like to use SSL, set this to `true`. You'll also need to specify `certificate_path` and `certificate_is_self_signed`.
    * `certificate_path`: The path to the SSL certificate.
    * `certificate_is_self_signed`: If you're using SSL and a self-signed certificate, set this to `true`.
    * `lb_port`: The port used to query predictive services through the load balancer. Setting this to `default` will cause it to be set to 80 for non-SSL installations or 443 for SSL installations.
    * `lb_stats_port`: The port used for querying statistics.
    * `metrics_port`: The port used for querying metrics.
    * `max_cache_memory`: The maximum size of the cache, in MB. The default of 2048 should be fine for most applications.
7. Run the setup script, providing the path to your Predictive Services product key file:
```
./setup_dato_ps.sh <path-to-predictive-service-license-file>
```

If the predictive service is setup correctly, you should see this message after the script has finished:
```
Predictive Service has been successfully launched!
You may check your Predictive Service stats on the load balancer's dashboard:
  open http://<host-name>:9000/stats
```

Note that in Windows and OS X, the setup script will configure iptables of the docker machine instance to forward traffic appropriately, mirroring the ports you configured.

At this point the docker containers are deployed. Now the predictive service needs to start up, which will take up to 1 minute (commonly not more than a few seconds). After that period the service is ready.

#### Use
GraphLab Create is required to connect to Dato Predictive Services and deploy/monitor/manage the service. For more information on obtaining and installing GraphLab Create see [Getting Started](https://dato.com/learn/userguide/install.html).

After you have installed GraphLab Create, you can connect to the predictive service; In the code sample below remember to replace `ps-path` with your actual ps path specified in installation step 4 above. If this is an HDFS path, you need to have set up your environment to have access to HDFS (either by setting HADOOP_CLASSPATH or HADOOP_CONF_DIR).

```
import graphlab as gl
ps = gl.deploy.predictive_service.load(“<ps-path>”)
ps.get_status()
```

For more information about the API see https://dato.com/learn/userguide/deployment/pred-intro.html and https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_services.html

#### Shutdown
If you need to shut down your predictive service (which is also necessary if you want to change any of the configuration parameters), you use the `shutdown_dato_ps.sh` script. This script removes the Docker containers used by the predictive service. To restart the service, run the setup script again.

#### Port Forwarding for Windows and OS X

In order to access predictive services from outside your Windows or OS X host, you'll need to set up port forwarding. Port forwarding will direct incoming network to specific ports on your host to the docker machine instance.

In Virtualbox, there are two network interfaces configured for your docker machine instance. The first is a NAT interface. You can add to the "Port Forwarding" configuration ports for the query, metrics, and admin interfaces.

Note that you do not need to stop your docker machine instance to make these changes.

To configure port forwarding:

1. Open up the Virtualbox application.
2. Click on the instance that serves as the docker machine. It should have the same name as your docker machine, which is `default` if you haven't changed it.
3. Configure the instance by clicking on the "Settings" button with the instance highlighted.
4 Click on the "Network" tab.
5. Choose the "Adapter 1" tab. You should see that it is "Attached to" "NAT". This means that the interface is attached to a NAT managed by Virtualbox itself.
6. Click on the "Port Forwarding" button.
7. Add the following three rules by clicking on the "add rule" icon and editing the fields. Please substitute the ports appropriately. IE, if you're using SSL, then you would use 443 rather than 80.

  | Name    | Protocol | Host IP       | Host Port | Guest IP      | Guest Port |
  |---------|----------|---------------|-----------|---------------|------------|
  | ps      | TCP      | (leave blank) | 80        | (leave blank) | 80         |
  | stats   | TCP      | (leave blank) | 9000      | (leave blank) | 9000       |
  | metrics | TCP      | (leave blank) | 9015      | (leave blank) | 9015       |

8. Click "OK" on the port forwarding dialogue
9. Click "OK" on the network interface dialogue to save your changes.

On Windows, when you make these changes, you will be prompted to open up your firewall to allow incoming connections on these ports. Accept the dialogue. If you don't accept this, you can change your firewall settings in the firewall configuration.

Once the configuration is complete, when your predictive services are running, you should be able to access your predictive services installation from outside your Windows or Mac OS X host through its IP address and the appropriate port.
