<script src="../turi/js/recview.js"></script>
#Introduction
There are two ways to read data from a SQL database in to GraphLab Create:

- [Python DBAPI2](./sql_integration.md#DBAPI2_Integration)
- [ODBC](./sql_integration.md#ODBC_Integration)

DBAPI2 support is a new feature and currently released as beta, but we strongly
encourage you to try it first. The ease of getting started with DBAPI2 far
surpasses using ODBC.

<a name="DBAPI2_Integration"></a>
#DBAPI2 Integration
[DBAPI2](https://www.python.org/dev/peps/pep-0249/) is a standard written to
encourage database providers to expose a common interface for executing SQL
queries when making Python modules for their database. Common usage of a
DBAPI2-compliant module from Python looks something like this:

```python
import sqlite3
conn = sqlite3.connect('example.db')
c = conn.cursor()

# Create table
c.execute('''CREATE TABLE stocks
             (date text, trans text, symbol text, qty real, price real)''')

# Insert a row of data
c.execute("INSERT INTO stocks VALUES ('2006-01-05','BUY','RHAT',100,35.14)")

# Save (commit) the changes
conn.commit()

c.execute("SELECT * FROM stocks")
results = c.fetchall()
```
(example adapted from [here](https://docs.python.org/2/library/sqlite3.html))

SFrame offers a DBAPI2 integration that enables you to read and write SQL data in a similar, concise fashion. Using the connection object in the previous example, here
is how you would read the data as an SFrame using the [`from_sql`](https://turi.com/products/create/docs/generated/graphlab.SFrame.from_sql.html) method:

```python
import graphlab as gl
stocks_sf = gl.SFrame.from_sql(conn, "SELECT * FROM stocks")
```

If you would like to then write this table to the database, that's easy too,
using the [`to_sql`](https://turi.com/products/create/docs/generated/graphlab.SFrame.to_sql.html) method. `to_sql` simply attempts to append to an already
existing table, so if you intend to write the data to a new table in your
database, then you must use the "CREATE TABLE" syntax, including the type
syntax supported by your database. Here's an example of creating a new table
and then appending more data to the table.
```python
import datetime as dt
c = conn.cursor()

c.execute('''CREATE TABLE more_stocks
             (date text, trans text, symbol text, qty real, price real)''')
c.commit()
stocks_sf.to_sql(conn, "more_stocks")

# Append another row
another_row = gl.SFrame({'date':[dt.datetime(2006, 3, 28)],
                         'trans':['BUY'],
                         'symbol':['IBM'],
                         'qty':[1000],
                         'price':[45.00]})
another_row.to_sql(conn, "more_stocks")
```

That is all there is to know to get started using SFrames with Python DBAPI2
modules! For more details you can consult the API documentation of
[`from_sql`](https://turi.com/products/create/docs/generated/graphlab.SFrame.from_sql.html)
and
[`to_sql`](https://turi.com/products/create/docs/generated/graphlab.SFrame.to_sql.html).
Currently, we have tested our DBAPI2 support with these modules:
 - [MySQLdb](https://github.com/PyMySQL/mysqlclient-python)
 - [psycopg2](http://initd.org/psycopg/)
 - [sqlite3](https://docs.python.org/2/library/sqlite3.html)

This means that our DBAPI2 support may or may not work on other modules
claiming to be DBAPI2-compliant. We will be adding more modules to this list as
driven by what our users are interested in, so if you are interested in other
modules, please try them out and let us know! If there is an issue with using
one, please file an issue on [our GitHub
page](https://github.com/turi-code/SFrame/issues) and include the error output
you received and/or some small code sample that exhibits the error.  You can
even [submit a pull
request](https://github.com/turi-code/SFrame) if you are able to fix the issue.

If your database does not support a DBAPI2 python module, but does support an
ODBC driver, keep reading.

<a name="ODBC_Integration"></a>
#ODBC Integration
[ODBC](http://en.wikipedia.org/wiki/Open_Database_Connectivity) stands
for "Open Database Connectivity". It is an old standard (first version was
released in 1992) that provides a language-agnostic interface for programs to
access data in SQL databases. There are a few extra steps to set it up and
extra concepts to learn before you start using it, but it remains one of the
most universal ways to communicate with SQL databases. The ODBC connector
included in SFrame only supports Linux and OS X. Windows is not supported at
this time.

#### ODBC Overview
ODBC provides maximum portability by requiring the database vendor to write a
driver that implements a common SQL-based interface.  One or more of these
drivers are managed by a system-wide ODBC driver manager.  This means that in
order to use ODBC, you must first install an ODBC driver manager, and then find
your database's ODBC driver, download it, and install it into the driver
manager.  The database itself need not be installed on your computer; it can be
installed on a remote machine. It is very important to make sure your ODBC
driver works with your database before trying GraphLab Create's ODBC functions
to make sure you are debugging the correct problem. The next section will help
you do this.

#### Setting Up An ODBC Environment
The only ODBC driver manager we officially support is
[unixODBC](http://www.unixodbc.org/). You are welcome to try others if you
really want to, but we do not guarantee that this will work.  If you are so
bold, let us know what happened!

Execute this command to install unixODBC on Ubuntu:

```bash
sudo apt-get install unixodbc
```

this on CentOS 6:
```bash
sudo yum install unixODBC.x86_64
```

and this on OS X (if you use Homebrew):
```
brew install unixodbc
```


Once you have this installed, try executing this command:
```bash
odbcinst -j
```


```ini
[SQLite]
Description=SQLite ODBC Driver
; Replace with your own path
Driver=/path/to/lib/libsqliteodbc.so
Setup=/path/to/lib/libsqliteodbc.so
UsageCount=1

[myodbc]
Description = mySQL ODBC driver
Driver = /path/to/lib/libmyodbc.so
Setup = /path/to/lib/libodbcmyS.so
Debug = 0
CommLog = 1
UsageCount = 1
```

##### Setting Up A Data Source
ODBC has the concept of a "data source" (or DSN for "data source name"), which
corresponds to a specific
database. For
example, if you have mySQL installed on your system, you'll need to create a
data source to point to a specific database within that system. To do this, you
must add an entry to the file that is responsible for either "SYSTEM DATA
SOURCES" or "USER DATA SOURCES" from the output of your "odbcinst -j" command.
Here is an example of how you could set up a SQLite DSN, adapted from
[here](http://ch-werner.de/sqliteodbc/html/index.html):

```ini
[sqlite_dsn_name]
Description=My SQLite test database
; corresponds to above driver installation entry
Driver=SQLite
Database=/home/johndoe/databases/mytest.db
; optional lock timeout in milliseconds
Timeout=2000
```

and an example for mySQL, adapted from [here](http://www.unixodbc.org/unixODBCsetup.html):

```ini
[mysql_dsn_name]
Description=myodbc
; Assumes your driver is installed with the name "myodbc"
Driver=myodbc
; Name of the database you want to connect to within mySQL
Database=test
Server=localhost
Port=3306
```

It's a great idea to test that all of this works before unleashing GraphLab
Create on your database.  UnixODBC comes with a command line utility called
isql that will access your database through ODBC.  This is not a very
full-featured command line tool, so we only recommend using it for testing if
your ODBC setup works.  Invoke it like this to access our example mySQL DSN:

```bash
isql mysql_dsn_name username password
```

If you are able to do something simple to your database, then feel free to move
on to GraphLab Create's ODBC functions.  Just so you don't have to use your
brain, here's what your isql output should roughly look like when you do
something simple:

```bash
$ isql mysql_dsn_name myusername mypassword
+---------------------------------------+
| Connected!                            |
|                                       |
| sql-statement                         |
| help [tablename]                      |
| quit                                  |
|                                       |
+---------------------------------------+
SQL> CREATE TABLE foo (a INTEGER, b INTEGER)
SQLRowCount returns 1
SQL> INSERT INTO foo VALUES(1, 2)
SQLRowCount returns 1
SQL> SELECT * FROM foo
+-----------+-----------+
| a         | b         |
+-----------+-----------+
| 1         | 2         |
+-----------+-----------+
SQLRowCount returns 0
1 rows fetched
```

If you aren't able to do something like the above, make sure to read the
documentation of your specific ODBC driver to see if you missed any part of
setup.  Since there are so many drivers, we can't possibly test them all and
document their many intricacies.

<a name="MySQL_on_OSX"></a>
#### Example: Step-by-Step Instructions for MySQL on OSX

##### 1\. Install the ODBC Driver Manager, unixodbc

```bash
brew install unixodbc
```
Note: If you do not have Homebrew installed on OSX, see installation instructions [here](http://brew.sh).

##### 2\. Confirm ODBC Driver Manager Installation and Configuration Settings

```bash
odbcinst -j
```

Sample output:
```bash
rajat@fourier ~> odbcinst -j
unixODBC 2.3.2
DRIVERS............: /usr/local/Cellar/unixodbc/2.3.2_1/etc/odbcinst.ini
SYSTEM DATA SOURCES: /usr/local/Cellar/unixodbc/2.3.2_1/etc/odbc.ini
FILE DATA SOURCES..: /usr/local/Cellar/unixodbc/2.3.2_1/etc/ODBCDataSources
USER DATA SOURCES..: /Users/rajat/.odbc.ini
SQLULEN Size.......: 8
SQLLEN Size........: 8
SQLSETPOSIROW Size.: 8
```

This command will also let you know where the .ini files for the drivers and data sources need to be created.

From this, the Drivers go here: ```/usr/local/Cellar/unixodbc/2.3.2_1/etc/odbcinst.ini```
and User Data Sources (DSN definitions for databases) go here: ```/Users/rajat/.odbc.ini```.

##### 3\. Install MySQL ODBC Driver for Mac

```bash
brew install mysql-connector-odbc
```

This will install in ```/usr/local/Cellar/mysql-connector-odbc```

##### 4\. Find Installed MySQL Driver

We need to find the .so file for the actual driver (so it can be registered with the ODBC Driver Manager), for this installation it is here:

```no-highlight
rajat@fourier ~> ll /usr/local/Cellar/mysql-connector-odbc/5.3.2_1/lib
total 14152
-r--r--r--  1 rajat  admin  3623032 Dec 18 12:14 libmyodbc5a.so
-r--r--r--  1 rajat  admin  3619008 Dec 18 12:14 libmyodbc5w.so
```

We want ```libmyodbc5w.so``` so we can support Unicode.

Now that we know this, we need to register this driver with the ODBC Driver Manager by manually creating the .ini file for the driver in the location we learned earlier from ```odbcinst -j```.

##### 5\. Register driver with ODBC Driver Manager

Manually create the entry for the driver in the DRIVERS .ini mentioned from ```odbcinst -j```, here is what it should look like:

```no-highlight
rajat@fourier ~> cat /usr/local/Cellar/unixodbc/2.3.2_1/etc/odbcinst.ini
```
```ini
[myodbc]
Description = MySQL ODBC Driver
Driver = /usr/local/Cellar/mysql-connector-odbc/5.3.2_1/lib/libmyodbc5w.so
Setup = /usr/local/Cellar/mysql-connector-odbc/5.3.2_1/lib/libmyodbc5w.so
Debug = 0
CommLog = 1
UsageCount = 1
```

##### 6\. Create the Database definition as a DSN

Now we need to create the DSN definition in the USER DATA SOURCES location returned by ```odbcinst -j```, from this output we need to edit ```/Users/rajat/.odbc.ini```. Notice that the Driver field below refers to the name of the section added in the previous step (myodbc).

Remember to update the Database, Server, and Port fields appropriately for your machine.

```ini
[mysqltest]
Description=myodbc
Driver=myodbc
Database=test
Server=localhost
Port=3306
```

##### 7\. Done! Test from GraphLab Create

```no-highlight
import graphlab
conn = graphlab.connect_odbc('DSN=mysqltest;UID=root;PWD=foo')
print conn.dbms_name
'MySQL'
```

#### Other Resources

Here are some posts that we found to be helpful when testing specific database
drivers.  Don't follow them blindly, but take them in context.  This is just to
save you a bit of googling if you're stuck setting up your ODBC environment.
When in doubt, always rely on the driver's official documentation.

* [SAP HANA DB](http://scn.sap.com/community/developer-center/hana/blog/2012/09/14/hana-with-odbc-on-ubuntu-1204)
* [PostgreSQL](http://docs.adaptivecomputing.com/mwm/Content/topics/databases/postgreSql.html)
* [Microsoft SQL Server](http://richbs.org/post/43142767072/connecting-to-microsoft-sql-server-from-unix-linux-mac)
* [SQLite](http://ch-werner.de/sqliteodbc/html/index.html)
* [Various drivers](http://www.unixodbc.org/odbcinst.html)
* [Help with forming connection strings](http://www.connectionstrings.com)

<a name="Using_ODBC"></a>
#### Using ODBC Within GraphLab Create

Adding a DSN makes forming your connection string much easier.  An ODBC connection string is similar to the database connection strings you may be familiar with, but slightly different.  For our running mySQL example, this would be the connection string:

```bash
'DSN=mysql_dsn_name;UID=myusername;PWD=mypassword'
```

Therefore, to connect to this database through GraphLab Create, you would execute this in Python:

```
import graphlab as gl
db = gl.connect_odbc('DSN=mysql_dsn_name;UID=myusername;PWD=mypassword')
```

As long as you did not receive an error message in that last step, you can read the result of any SQL query like so:
```
sf = gl.SFrame.from_odbc(db, "SELECT * FROM foo")
```

Now feel free to use your SFrame as you please!  If you would like to write an SFrame to a table in your database, we support creating a new table, and appending to an existing table.  Both can be achieved through the same function call:

```
sf.to_odbc(db, 'a_table_name')
```

If the table name is found to exist in your database,`to_odbc` will attempt to
append each row to the table it finds.  There is nothing sophisticated about
this, as `to_odbc` does not do any sort of type checking or column matching in this case.

If the table name is not found, `to_odbc` will use a heuristic to pick the best
type specific to your database for each column of the SFrame and create the table.

If you find yourself needing do execute arbitrary SQL commands to prepare your environment for a query (and which may not return results), you can call
`execute_query` on your database connection object:

```
db.execute_query("SET SCHEMA foo_schema")
```

#### Notes
We do not support writing all types that are possible to hold in an SFrame,
namely list, dict, or image types.  This is because there is no clean mapping to an
ODBC type.

We support reading all [ODBC types](http://msdn.microsoft.com/en-us/library/ms710150.aspx) except
time intervals.  Reading SQL time intervals may work for certain drivers, but
your mileage may vary so we are not officially supporting it at this time.
Also, SFrames do not support timestamps that use fractions of seconds, so the
fraction portion of a timestamp will be ignored when reading.
