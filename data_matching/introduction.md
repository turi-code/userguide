#Introduction
**Data matching** is the identification of data records that correspond to the
same real-world entity. Typically these kinds of tasks arise when aggregating
datasets from different sources, but the field of data matching encompasses
several types of problems that have quite different data contexts. The GraphLab
Create data matching toolkit provides three tools to help you quickly accomplish
some of the most common data matching tasks.

**Autotagging** involves matching unstructured text queries to a structured
tabular dataset. Examples of this include finding product names in unstructured
customer reviews or blog posts, and matching unstructured merchant product
offers to product catalogs.

**Deduplication** is the task of identifying records in one or more tabular
datasets that correspond to the same entity, then aggregating information from
matching records so that the output has one clean record for each entity.
Deduplication examples include combining records about customers who sign up for
a service multiple times, or aggregating location information about businesses
obtained from multiple listings services.

**Similarity search** takes high level data objects like images, documents, or
even combinations of the two, and finds similar items in a reference set of
items. Typically, implementing a system to accomplish this task requires
substantial domain knowledge to convert the raw data objects into numeric
vectors, followed by a nearest neighbors search.

Feedback about the data matching toolkit is very welcome, particularly regarding
the new Similarity search toolkit. Please post questions and comments on our
forum or send a note to <support@dato.com>.