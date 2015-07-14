#ODBC Integration
<a name="ODBC_Integration"></a>
GraphLab Create supports reading data from a SQL database and storing
it in an SFrame, as well as writing SFrames to the database.  It does this via
[ODBC](http://en.wikipedia.org/wiki/Open_Database_Connectivity).  ODBC stands
for "Open Database Connectivity", and while there are a few extra steps to set
it up and extra concepts to learn before you start using it, it is the most
universal way to communicate with a wide range of databases.  Let's get
started.

Note: If you are already familiar with ODBC (especially unixODBC), you can skip the next section and go [here](#Using_ODBC).

If you are looking for accessing MySQL from OSX, see the step-by-step instructions [here](#MySQL_on_OSX).

#### ODBC Overview
ODBC provides maximum portability by requiring the database vendor to write a
driver that implements a common SQL-based interface.  One or more of
these drivers are managed by a system-wide ODBC driver manager.  This means
that in order to use ODBC, you must install the driver manager and the driver
for the database you want to use.  The database itself need not be installed on
your computer; it can be installed on a remote machine.  It is very
important to make sure your ODBC driver works with your database before
trying GraphLab Create's ODBC functions to make sure you are debugging the
correct problem. The next section will help you do this.

#### Setting Up An ODBC Environment
The only ODBC driver manager we officially support is [unixODBC](http://www.unixodbc.org/). You are welcome to try others if you really want to, but we do not guarantee that this will work.  If you are so bold, let us know what happened!

Execute this command to install unixODBC on Ubuntu:

```bash
sudo apt-get install unixodbc
```

this in CentOS 6:
```bash
sudo yum install unixODBC.x86_64
```

and this in Mac OS X (if you use Homebrew):
```
brew install unixodbc
```


Once you have this installed, try executing this command:
```bash
odbcinst -j
```

A driver is installed into the driver manager when a corresponding entry in the
correct configuration file has been entered. The output for the above command
shows which file the driver manager will use to look for drivers. Often, if you
are able to use your system's package manager to install your
database's ODBC driver, it will add the correct entry to install the driver to the correct place. If
your ODBC driver does not do this, you will have to either add the entry
yourself or use one of unixODBC's utilities (either the odbcinst command-line
utility or their GUI program) to help you through the process. This is a
minimal example of such an entry, for SQLite and mySQL, which will be just fine
to get you started:

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
Servername=localhost
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
document their many intricacies.  If you're really having trouble with
setup after exhausting all of your possiblities, feel free to post on our
[forum](http://forum.dato.com) and we'll try to help you out.

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

Remember to update the Database, Servername, and Port fields appropriately for your machine.

```ini
[mysqltest]
Description=myodbc
Driver=myodbc
Database=test
Servername=localhost
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

We support reading all [ODBC types](http://msdn.microsoft.com/en-us/library/ms710150(v=vs.85).aspx) except
time intervals.  Reading SQL time intervals may work for certain drivers, but
your mileage may vary so we are not officially supporting it at this time.
Also, SFrames do not support timestamps that use fractions of seconds, so the
fraction portion of a timestamp will be ignored when reading.
