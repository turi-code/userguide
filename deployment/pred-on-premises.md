<script src="../dato/js/recview.js"></script>
# Predictive Services On-Premises

While providing a convenient and flexible environment for running a predictive service, not all scenarios are suited for a cloud-based deployment. For reasons of privacy, security, or cost you might prefer to host your predictive service locally, on a machine you own and control. We call this a Predictive Services on-premises deployment.

#### Prerequisites

To configure a Predictive Services on-premises deployment, you will need the
Predictive Services package as well as a Predictive Services product key. Both
can be obtained on the [installation page on
dato.com](https://dato.com/download/install-dato-predictive-services.html).

We assume that you already downloaded and installed GraphLab Create on a machine that you will later use to interact with your local Predictive Services deployment. For more information on obtaining and installing GraphLab Create see [Getting Started](https://dato.com/learn/userguide/install.html). However, GraphLab Create is not necessary to configure the service.

##### Linux Systems

On Linux systems, you will need install [Docker](http://docker.com/). Unlike OS X and Windows,
which uses Virtualbox to create a Linux host to run docker, your Linux system will be
running Docker directly. Depending on which Linux distribution you are using,
docker may or may not be available in your package repository. The version
available in your repository may also be out of date. Please [install the latest
version of Docker from their website](https://docs.docker.com/linux/step_one/),
or ensure your repository is using a recent version and install that.

Note that the docker service must be running for the installation script to work.
Refer to the docker manual for instructions on how to do this. Usually, this is
simply a matter of running:

```bash
sudo service docker start
```

or the related command for your distribution and system.

To test to see if the Docker service is running and operational, run the following command:

```bash
sudo docker images
```

This should list the Docker images on your system, if any.

Also note that the `docker` command must be run as root. This is because
running `docker` as a normal user may be a security risk. See
https://docs.docker.com/engine/security/security/ for more details about the
security implications of Docker. For this reason, you are encouraged to run our
installation script as root. This is not necessary on Windows and OS X because
they do not run docker directly.

If you plan on using S3 to host the runtime files, you will need to install
[awscli](http://docs.aws.amazon.com/cli/latest/userguide/installing.html). The
installation script runs `aws s3` commands to initialize the runtime files.

If you run our installation script with `sudo` and use an S3 URL for the runtime
data, there may be a small complication with the `aws` command. When running
`sudo`, the `$PATH` is set to the `secure_path` configured in `/etc/sudoers`, which
typically doesn't include `/usr/local/bin`, where your awscli may be installed.
You may want to ensure that awscli is installed under `/usr/bin` rather than
`/usr/local/bin`, or ensure that `/usr/local/bin` is part of the `secure_path` in
`/etc/sudoers`. To test that `sudo` can run aws commands, try:

```bash
sudo aws --help
```


##### OS X and Windows

Follow the instructions on the Docker website for [creating a Docker VM in Mac OS X](http://docs.docker.com/mac/step_one/) or [creating a Docker VM in Windows](https://docs.docker.com/windows/step_one/). Once you have Docker installed, you can begin installation by starting the Docker Quickstart Terminal.

The Docker Quickstart Terminal does the following things:
* Creates a Virtualbox instance called `default` that will serve as the docker machine instance, if it is not yet created.
* Starts the default instance.
* Configures the environment variables to point to the default instance.

You can verify that this is setup properly by running:

```bash
echo $DOCKER_MACHINE_NAME
```

which should print something like "default".

You can also check the status of the docker machine with:

```bash
docker-machine status
```

If you'd prefer to run on another docker machine you've created, create the machine and be sure to run the command:

```bash
eval $(docker-machine env <your machine name>)
```

The installation script is aware of the `$DOCKER_MACHINE_NAME` environment variable and will load and run the docker instances appropriately, so the environment variables need to be set appropriately.

You might run into an incompatibility issue with the included VirtualBox version, causing an error during the docker-machine create call. The current (8/31/2015) workaround is to install a more recent VirtualBox test build from https://www.virtualbox.org/wiki/Testbuilds. See also https://www.virtualbox.org/ticket/14412.

#### Installation
Deployment of a predictive service is achieved by installing and running a set of Docker containers. The containers as well as a setup script are included in the package you downloaded from dato.com.

Follow these steps to install Dato Predictive Services:

1. Download the installation package (for example, dato-predictive-services-1.8.3.tar.gz or a later version) and your license file.
2. Move the package and license file to the computer you want to install Dato Predictive Services on. For Windows hosts, be sure to do all of the work from your C drive where Docker is installed. Trying to setup from another drive may lead to problems.
3. Unzip the file to a temporary folder:
```
tar zxvf dato_ps_setup_1.8.3.tar.gz
```
4. Create a Predictive Services working directory in the host machine where Predictive Services files (include docker images) will be copied to. On Windows, this must be on the same drive as your Docker installation, which is the C drive. On Linux, we typically recommend a folder like `/opt/dato-ps/binaries`.
```
mkdir -p <deployment_path>
```
5. Decide where the Predictive Services runtime data (state files, logs, etc.) will be stored; this path should be network-accessible, to enable data scientists to manage the predictive service later through the GraphLab Create Python API (currently, a client needs to acquire a handle to the service by accessing a state file under that path). Typically this is an S3 file path, an HDFS path, or a path accessible through NFS. A common path is usually a HDFS path, like `hdfs://<hdfs-name-node>:8020/user/<ps-service-user>/dato_predictive_service`. Within the local filesystem of the server, we typically recommend a folder like `/opt/dato-ps/runtime`.
We will call this path the “ps path”. Note that the application that will query models in the service does _not_ need access to this location. Models and custom methods are queried at an HTTP URL through a regular REST call.
6. Modify predictive_service.cfg file included in the package. You will need to make the following changes for a local setup:
    * `internal_ip`: The internal IP address of your host, usually a private IP address such as 10.X.X.X or 192.168.X.X.
    * `external_ip`: The external IP address of your host, which is not one of the private IP addresses. This is how other machines can find your host.
    * `ps_path`: the path you chose in step 5 above
    * `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: Specify these if you gave an S3 address for `ps_path`.
    * `deployment_path`: the path you chose in step 4 above
    * `server_memory`: The memory size, in MB, of your predictive service container. The default of 4096 is fine for most purposes.
    * `server_port`: The internal server port. When Predictive Services is configured, there is a load balancer configured to forward traffic to a server. This port will not be used externally.
    * `use_ssl`: If you'd like to use SSL, set this to `true`. You'll also need to specify `certificate_path` and `certificate_is_self_signed`.
    * `certificate_path`: The path to the SSL certificate.
    * `certificate_is_self_signed`: If you're using SSL and a self-signed certificate, set this to `true`.
    * `lb_port`: The port used to query predictive services through the load balancer. Setting this to `default` will cause it to be set to 80 for non-SSL installations or 443 for SSL installations.
    * `lb_stats_port`: The port used for querying statistics.
    * `metrics_port`: The port used for querying metrics.
    * `max_cache_memory`: The maximum size of the cache, in MB. The default of 2048 should be fine for most applications.
7. Run the setup script, providing the path to your Predictive Services product key file. Note that if you are using a Linux system, you should run this command as root.
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


#### Configuring the Network

Once your server is running, you need to make sure it is accessible to your clients. On Windows and OS X, you'll need to setup port forwarding rules. On Linux systems, you'll need to open up various ports.

##### Default Ports

By default, the following ports are used. Some of these are configurable.

* 80: `$lb_port`, the main port for the load balancer.
* 9000: `$lb_stats_port`, the stats port for the load balancer.
* 9015: `$metrics_port`, the metrics port.
* 9005: `$server_port`, the port of the actual service behind the load balancer. (internal only)
* 9016, 19016: redis ports (internal only)


#### Ports used in Linux

On Linux systems, you'll need to open the ports in the firewall using the appropriate commands. Only the external ports, `lb_port`, `lb_stats_port`, and `metrics_port` need to be opened.

If your Linux system is running in AWS EC2, you'll need to set the appropriate security group with internal and external ports opened. The internal ports need only be accessible from the server itself and should not be publicly accessible.

#### Port Forwarding for Windows and OS X

In order to access predictive services from outside your Windows or OS X host, you'll need to set up port forwarding in addition to opening the firewall on your Windows or OS X system. Port forwarding will direct incoming network to specific ports on your system to the docker machine instance.

In Virtualbox, there are two network interfaces configured for your docker machine instance. The first is a NAT interface. You can add to the "Port Forwarding" configuration ports for the query, metrics, and admin interfaces.

Note that you do not need to stop your docker machine instance to make these changes.

To configure port forwarding:

1. Open up the Virtualbox application.
2. Click on the instance that serves as the docker machine. It should have the same name as your docker machine, which is `default` if you haven't changed it.
3. Configure the instance by clicking on the "Settings" button with the instance highlighted.
4 Click on the "Network" tab.
5. Choose the "Adapter 1" tab. You should see that it is "Attached to" "NAT". This means that the interface is attached to a NAT managed by Virtualbox itself.
6. Click on the "Port Forwarding" button.
7. Add the three rules below by clicking on the "add rule" icon and editing the fields. Please substitute the ports appropriately. IE, if you're using SSL, then you would use 443 rather than 80.
8. Click "OK" on the port forwarding dialogue
9. Click "OK" on the network interface dialogue to save your changes.

| Name    | Protocol | Host IP       | Host Port | Guest IP      | Guest Port |
| ------- | -------- | ------------- | --------- | ------------- | ---------- |
| ps      | TCP      | (leave blank) | `$lb_port` | (leave blank) | `$lb_port`|
| stats   | TCP      | (leave blank) | `$lb_stats_port` | (leave blank) | `$lb_stats_port` |
| metrics | TCP      | (leave blank) | `$lb_metrics_port` | (leave blank) | `$lb_metrics_port` |

Note that the Host Ports can be assigned to whichever ports you like. The Guest Port must match the configuration in `predictive_service.cfg`. IE, you could have incoming traffic on port 8080 (the Host Port) mapped to port 80 (the Guest Port).

On Windows, when you make these changes, you will be prompted to open up your firewall to allow incoming connections on these ports. Accept the dialogue. If you don't accept this, you can change your firewall settings in the firewall configuration program.

#### Use

GraphLab Create is required to connect to Dato Predictive Services and deploy/monitor/manage the service. For more information on obtaining and installing GraphLab Create see [Getting Started](https://dato.com/learn/userguide/install.html).

After you have installed GraphLab Create, you can connect to the predictive service; In the code sample below remember to replace `ps-path` with your actual ps path specified in installation step 5 above. If this is an HDFS path, you need to have set up your environment to have access to HDFS (either by setting HADOOP_CLASSPATH or HADOOP_CONF_DIR).

```python
import graphlab
deployment = graphlab.deploy.predictive_service.load("<ps-path>")
deployment.get_status()
```

For more information about the API see https://dato.com/learn/userguide/deployment/pred-intro.html and https://dato.com/products/create/docs/generated/graphlab.deploy.predictive_services.html

#### Shutdown

If you need to shut down your predictive service (which is also necessary if you want to change any of the configuration parameters), you use the `shutdown_dato_ps.sh` script. This script removes the Docker containers used by the predictive service.

#### Restart

To restart the service, run the setup script again.

#### Troubleshooting

Common issues that may arise are included below.

##### setup_dato_ps.sh fails to run

Please verify that you've followed all the steps above. Note any errors. Here are some of the more common ones you might encounter:

* (Windows) Fails to read in predictive_service.cfg: This is likely because your predictive_service.cfg has been modified to use '\r\n' instead of '\n' for the linebreaks, probably because you used notepad or a similar program to edit the file. Try modifying the line endings by using a different text editor and configuring the line endings appropriately. You can also run the following AWK script from the Docker terminal which will replace '\r\n' with '\n':

```bash
awk '{ sub("\r$", ""); print }' predictive_service.cfg > predictive_service_new.cfg
mv predictive_service_new.cfg predictive_service.cfg
```

* (Windows) `docker load` fails: This may be due to the docker image file existing on a separate drive than the docker installation. Try running the script from the same drive as your docker installation, and ensure the configuration points to directories on the same drive. It may also be due to the docker host virtual instance not running. Try `docker-machine start` to get it running again.

* (Linux) `docker load` fails: This is likely due to the service not running, or you are not running the script as root. Install docker, start the docker service, and run the script as root.

* (Linux) Strange errors concerning mounting docker devices: This is likely caused by using an older version of Docker. Install the latest version from Docker.com.

* (Linux) `aws` fails to run. This is likely caused by the awscli not being installed, or being installed in a place that is not recognized by `$PATH`. If you're running `sudo` to run the script as root, you may want to modify the `secure_path` in `/etc/sudoers` to include the path to awscli, or install awscli in one of the paths listed. If you're running it as root, then you'll want to check your `$PATH` and modify it appropriately.

* (All) Can't access / modify `ps_path` with AWS / S3: Please check that
  your `AWS_ACCESS_KEY` and `AWS_SECRET_KEY` are set appropriately. On the
  server, they need to be uncommented and set in `predictive_service.cfg`. On
  the client, they should be exported as environmental variables or otherwise
  configured. You may want to generate new keys for your user account or ensure
  that the user has access to the path.

##### Server is not working

First, check that you can access the service from within the Docker host. If it is not accessible from within the host, then:

* Ensure that Docker is running.
* Ensure that the predictive services docker processes are running by executing setup_dato_ps.sh again.

You may want to run through your network configuration to ensure that the
service is accessible. Note that on OS X and Windows you need to add port
forwarding rules to VirtualBox so that network traffic originating from outside
of the server can reach the predictive service running in docker in Virtualbox. On Linux systems, you need to open the firewall. On EC2, you need the security group appropriately configured.

Other issues that may arise:

* When I add an endpoint, it doesn't appear in the service: This is caused by your client and server not sharing the same `ps_path`. Use S3 or one of the other recommended systems to share `ps_path` between client and server.

* Server is slow. You may want to profile your server and see if it needs more
  resources such as memory, CPU, or network bandwidth. You may also want to
  modify the cache configuration. See "Administering"

* On Windows, when I use a local directory for `ps_path`, the client can't find it. This is likely due to the fact that the file path in the Docker Quickstart Terminal follows Unix convention (IE, /c/...) rather than Windows convention (C:\\...) All you need to do is translate the path appropriately.


Please contact us if you need further help at <support@dato.com>.
