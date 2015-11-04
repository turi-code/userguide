# Handling Dependencies

In this section we explain how you can specify the dependency of your methods on Python packages or files.

#### Python Package Dependencies

If your custom logic depends on other Python packages, you can use the `@graphlab.deploy.required_packages` decorator for your custom query function.

For example, if your query depends on the specific version '0.3.0' of a package called 'names', then you would do the following:

```python
@graphlab.deploy.required_packages(['names==0.3.0'])
def generate_names(num_names):
    import names
    # your query logic here
```

The predictive service will ensure that the package is installed and available whenever the custom method needs to be executed.
Notice the format for the required_packages parameter is consistent with the format required by the [Python distutils module](https://docs.python.org/2.7/library/distutils.html).

Aside from packages available in the python package index pypi, you can also specify custom python packages in the form of local file names:

```python
@graphlab.deploy.required_packages(
    ['/home/user/mypackages/fluxcapacitor-85.1.1-py27_0.tar.bz2'])
def my_method(input):
    # your query logic using your custom package here
```

The parameter to `required_packages` is an array, so you can list a set of packages (local or from pypi).

#### Dependent Python Files

If your custom query is defined in another Python file, or if it depends on other Python files you have created, you may instruct GraphLab Create to package those files for you by using the `@graphlab.deploy.required_files` decorator.

For example, if you have a set of Python scripts in a folder called ‘product_recommender’ and your custom query depends on these scripts, you can specify this dependency as follows:

```python
@graphlab.deploy.required_files('product_recommender', '*.py')
def recommend_similar_products(product_id):
    from product_recommend import query_db
    ...
```

The first parameter to `required_files` describes the location(s) that will be searched. This can be a file name, a folder name or a list containing both file or folder names, either as absolute paths, or relative to the current working directory. GraphLab Create automatically extracts the required files and ships them to the Predictive Service cluster. The second parameter is a file name "glob" pattern that is used to select only the files that are needed. It is implemented using the [fnmatch](https://docs.python.org/2/library/fnmatch.html) Python package.
