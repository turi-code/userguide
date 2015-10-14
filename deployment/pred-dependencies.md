# Handling Dependencies

In this section we explain how you can
* specify the dependency of your methods on Python packages or files, and how to
* upload custom files globally to the predictive service.

#### Python Package Dependencies

If your custom logic depends on other Python packages, you can use the `@graphlab.deploy.required_packages` decorator for your custom query function.

For example, if your query depends on a package called 'names', then you would do the following:

```no-highlight
@graphlab.deploy.required_packages(['names=0.3.0'])
def generate_names(num_names):
    import names
    # your query logic here
```

Notice the format for the required_packages parameter is consistent with the format required by the [Python distutils module](https://docs.python.org/2.7/library/distutils.html).


#### Dependent Python Files

If your custom query is defined in another Python file, or if it depends on other Python files you’ve created, you may instruct GraphLab Create to package those files for you by using the @graphlab.deploy.required_files decorator.

For example, if you have a set of Python scripts in a folder called ‘product_recommender’, and your custom query depends on all Python files in that folder:

```no-highlight
@graphlab.deploy.required_files('product_recommender', '*.py')
    def recommend_similar_products(product_id):
        from product_recommend import query_db
        ...
```

The first parameter to `required_files` can be a file name, a folder name or a list containing both file or folder names. GraphLab Create automatically extracts the required files and ships them to the Predictive Service cluster. The second parameter is a file name "glob" pattern that is used to select only the files that are needed. It is implemented using the [fnmatch](https://docs.python.org/2/library/fnmatch.html) Python package.


#### Adding Custom Files

Your predictive service might depend on data or configurations that are stored in a separate file. To support this scenario, we provide a set of APIs to upload files to a location you can explicitly refer to.

You can upload a custom file to the service and add it to the deployment:

```python
ps.add_files('path/to/my/file.txt')
```

The file `file.txt` is now available in the predictive service under a folder named `dependent_files/` inside the root location of the predictive service as specified when you created (or loaded) the service. For example, if you created as follows:

```python
import graphlab

ec2 = graphlab.deploy.Ec2Config(...)

deployment = graphlab.deploy.predictive_service.create(
    'first', ec2, 's3://sample-testing/first')
```

Then the location of the added file will be `s3://sample-testing/first/dependent_files/`.

Three new APIs are added:
  1. add_file -- add one or more files to the Predictive Service
  2. remove_file -- remove one or more files from the Predictive Service
  3. list_file -- list files available in the Predictive Service
In Predictive Service state folder, all files are put under:
   <ps-root>/dependent_files/
In Predictive Service nodes, all files are put under:
   /tmp/dependent_files
Add file examples:
  ps.add('path/to/my/file.txt') -- will add to dependent_files/file.txt
  ps.add('path/to/my/file.txt', 'file2.txt') -- will add to dependent_files/file2.txt
  ps.add('path/to/my/file.txt', 'pings_file/file.txt') -- will add to dependent_files/pings_file/file.txt
  ps.add('path/to/my/*.py') -- will add all *.py files to dependent_files, including sub folders
Remove file examples:
  ps.remove_file('*') -- remove all files
  ps.remove_file('a.py') -- remove the file under dependent_files/a.py
  ps.remove_file('some_dir') -- remove all files/paths with prefix some_dir
  ps.remove_file('path/to/a.py') -- remove the file under dependent_files/path/to/a.py
List file examples:
  ps.list_file() -- list root of files
  ps.list_file('path/to/a/folder') -- list all files under a folder
With this change, existing reqquired_files() decorator is still supported. The
implementation of required_files is changed to use this upload_file functionality.
Since now any kind of files can be uploaded, user code may potentially upload
any files, like R files and run an R algorithm. The environment variable called
'DATO_PS_DEPENDENT_FILE_PATH' is added to all process. Custom code can potentially
access the files they need by doing the following:
  def my_func():
    my_file = os.environ['DATO_PS_DEPENDENT_FILE_PATH'] + '/' + 'my_file'
    # do whatever with the file
