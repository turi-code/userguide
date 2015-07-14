#Introduction
**Data matching** is the identification of data records that correspond to the
same real-world entity. Typically these kinds of task arise when aggregating
datasets from different sources, but the field of data matching encompasses
several types of problems that have quite different data contexts. The GraphLab
Create data matching toolkit provides two tools to help you quickly accomplish
some of the most common data matching tasks.

**Autotagging** involves matching unstructured text queries to a fixed
structured tabular dataset. Examples of this include finding product names in
unstructured customer reviews or blog posts, and matching unstructured merchant
product offers to product catalogs. **Deduplication** is the task of identifying
records in tabular datasets that correspond to the same entity, then aggregating
information from matching records so that the output has one clean record for
each entity. Deduplication examples include combining records about customers
who sign up for a service multiple times, or aggregation location information
about local businesses derived from multiple listings services.

The new data matching toolkit is a beta version in GraphLab Create 1.3, and some
aspects---particularly how users specify and interact with distance
functions---may change in future releases. Feedback about the data matching
toolkit is very welcome; please post questions and comments on our forum or send
a note to <support@dato.com>.