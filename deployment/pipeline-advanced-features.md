# Advanced Features

In order for functions to be portable, any additional Python packages need to
be known to the framework in order to ensure those packages are installed prior
to running the function. To support this, and to make it convenient to keep
tasks self-contained. To specify required packages for a function:

```
import graphlab
from graphlab.deploy import required_packages

@required_packages(['names == 0.3.0'])
def my_function(number = 10):
    import names
    people = [names.get_full_name() for i in range(number)]
    sf = graphlab.SFrame({'names':people})
    return sf

job = graphlab.deploy.job.create(my_function, number = 20)
```

Required packages follow the same format as
 [pip requirements](https://pip.readthedocs.org/en/1.1/requirements.html#the-requirements-file-format).
If required packages are not from Pypi or are considered insecure, please
specify them as follows:

