#### Managing Dependencies

In order for functions to be portable, any additional Python packages need to
be known to the framework in order to ensure those packages are installed prior
to running the function within a job. 

In order to install packages in a cluster and make them available to any job running in the cluster, they need to be specified as part of the cluster object:

```
import graphlab as gl

c = gl.deploy.hadoop_cluster.create(
  name='hadoop-cluster',
  dato_dist_path=<HDFS path to dato distributed deployment>,
  additional_packages='names==0.3.0')

def my_function(number = 10):
    import names
    people = [names.get_full_name() for i in range(number)]
    sf = graphlab.SFrame({'names':people})
    return sf

job = graphlab.deploy.job.create(my_function, number=20, environment=c)
```

The `additional_packages` parameter can be a single string or a list of strings, describing packages in the pypi or Anaconda format. Equivalent to Hadoop it can also be provided to `graphlab.deploy.ec2_cluster.create` for EC2 clusters.

Alternatively, dependent packages can be specified on an already created cluster, by setting the cluster's `additional_packages` property, before submitting a job:

```
# load a previously created EC2 cluster:
ec2c = gl.deploy.ec2_cluster.load('s3://my-workspace/ec2-cluster')

ec2c.additional_packages = 'names'
```

##### Hadoop

Because Hadoop clusters are not generally connected to the internet, Dato Distributed provides functionality to manage packages in such an environment, namely uploading, listing, and removing packages. These operations are accesible either through the command line (scripts provided by Dato Distributed) or the GraphLab Create API.

Packages available for installation (as described above) are shown as follows:

```
gl.deploy.hadoop_cluster.show_available_packages(dato_dist_path='my-cluster-setup')
```
(In this example we assume (i) that the YARN config folder to access the cluster has been set as default, and (ii) that a Dato Distributed deployment in a folder `my-cluster-setup` in the user's home directory in the cluster exists.)

Output:
```
{'default_packages': ['_license==1.1',
  'abstract-rendering==0.5.1',
  'anaconda==2.2.0',
  ...
  'yaml==0.1.4',
  'zeromq==4.0.4',
  'zlib==1.2.8'],
 'user_packages': ['names-0.3.0.tar.gz']}
 ```

A package can be uploaded through the following API:
```
gl.deploy.hadoop_cluster.upload_packages(
  dato_dist_path='my-cluster-setup',
  filename_or_dir='./names-0.3.0.tar.gz')
```
Alternatively to a single package filename, a folder can be provided; all files within that folder will be uploaded to the cluster, assuming they are Python packages.

Packages can be removed from the cluster as follows:
```
gl.deploy.hadoop_cluster.remove_package(
  dato_dist_path='my-cluster-setup',
  filename='names-0.3.0.tar.gz')
```
