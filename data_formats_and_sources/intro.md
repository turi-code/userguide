#Introduction to SFrames
SFrames are the primary data structure for extracting data from other sources for use in GraphLab Create.

SFrames can extract data from the following static file formats:

* [CSV](https://dato.com/products/create/docs/generated/graphlab.SFrame.read_csv.html#graphlab.SFrame.read_csv)
* [JSON](https://dato.com/products/create/docs/generated/graphlab.SFrame.read_csv.html#graphlab.SFrame.read_json)
* [Apache Avro](https://dato.com/products/create/docs/generated/graphlab.SArray.from_avro.html#graphlab.SArray.from_avro)

and these other sources:

* [Apache Spark RDDs](spark_integration.md)
* [SQL databases (through ODBC)](odbc_integration.md)
