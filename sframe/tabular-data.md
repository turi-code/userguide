# Working with Tabular Data

It's quite common that when you first get your hands on a dataset, it will be
in a format that resembles a table. Tables are a straightforward format to use
when cleaning data in preparation for more complicated data analysis, and the
[SFrame](https://dato.com/products/create/docs/generated/graphlab.SFrame.html)
is the tabular data structure included with GraphLab Create. The SFrame is
designed to scale to datasets much larger than will fit in memory.

We will introduce the basics of the SFrame in the following chapters:

* [Loading and Saving](sframe-intro.md) focuses on creating an SFrame from existing data in CSV format and how to persist an SFrame.

* The Frame supports a large number of common data manipulation operations and we will review a number of common ones in the chapter [Data Manipulation](data-manipulation.md).

* [Apache Spark RDDs](../data_formats_and_sources/spark_integration.md) goes into more detail about getting data in and out of Apache Spark RDDs.

* The chapter about [SQL databases (through ODBC)](../data_formats_and_sources/odbc_integration.md) explains how to interface with relational data sources through ODBC.
