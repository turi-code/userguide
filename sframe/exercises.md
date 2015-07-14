#Excercises
The following hands-on exercises will help you learn how to work with data
using GraphLab Create.

For these exercises we will use a StackOverflow dataset, which can be obtained
as follows as a prepackaged SFrame.
```python
# Downloads the data from S3 if you haven't already.
import os
if os.path.exists('stack_overflow'):
    sf = graphlab.SFrame('stack_overflow')
else:
    sf = graphlab.SFrame('http://s3.amazonaws.com/dato-datasets/stack_overflow')
    sf.save('stack_overflow')
```


<span style="color:red">**Question 1:**</span> Unfortunately, there are lots of missing values in this data that weren't
given when parsing.  Can you discover what these values are and replace them so
GraphLab Create recognizes them as missing? Hint: Some columns are not the type they should be.  Use `astype` to cast to the type you need.
```python
for i in sf.column_names():
    sf[i] = sf[i].apply(lambda x: None if x == '' else x)
```
<span style="color:red">**Question 2:**</span> Come up with criteria for a "double post" and filter out duplicates.  How many
duplicates did you filter?  If predicting if a question will be closed, would
you filter these posts out?
```python
# This is just one of many definitions of a "double post".  If I was to predict
# whether a question will be closed, I would not filter these out.
tmp = sf.groupby(['Title','OwnerUserId', 'BodyMarkdown'], {'PostId':gl.aggregate.SELECT_ONE('PostId')})
filtered = sf.filter_by(tmp['PostId'], 'PostId')
print len(sf)-len(filtered)
```
<span style="color:red">**Question 3:**</span> Convert all of the "tag" columns to one column with a list of tags and called
'tags'.

```python
sf = sf.pack_columns(['Tag1','Tag2','Tag3','Tag4','Tag5'], new_column_name='tags')
```







<span style="color:red">**Question 4:**</span> Display the top 10 question askers.

```python
sf.groupby(['OwnerUserId'], {'post_count':gl.aggregate.COUNT()}).topk('post_count', k=10)
```

```
Columns:
        OwnerUserId     str
        post_count      int

Rows: 10

Data:
+-------------+------------+
| OwnerUserId | post_count |
+-------------+------------+
|    39677    |    1781    |
|     4653    |    1437    |
|    34537    |    1423    |
|    179736   |    1234    |
|    149080   |    1190    |
|    117700   |    1172    |
|    84201    |    1164    |
|    434051   |    1093    |
|    325418   |    995     |
|     4639    |    974     |
+-------------+------------+
[10 rows x 2 columns]
```

<span style="color:red">**Question 5:**</span> Find the highest rated asker for the 'not constructive' question type.


```python
sf['ReputationAtPostCreation'] = sf['ReputationAtPostCreation'].astype(int)
notc = sf[sf['OpenStatus'] == 'not constructive']
notc.topk('ReputationAtPostCreation', k=1)
```

```
Columns:
        PostId  str
        PostCreationDate        str
        OwnerUserId     str
        OwnerCreationDate       str
        ReputationAtPostCreation        int
        OwnerUndeletedAnswerCountAtPostTime     str
        Title   str
        BodyMarkdown    str
        PostClosedDate  str
        OpenStatus      str
        tags    list

Rows: 1

Data:
+----------+---------------------+-------------+---------------------+--------------------------+
|  PostId  |   PostCreationDate  | OwnerUserId |  OwnerCreationDate  | ReputationAtPostCreation |
+----------+---------------------+-------------+---------------------+--------------------------+
| 11058483 | 06/15/2012 21:32:26 |    16417    | 09/17/2008 17:02:31 |          98265           |
+----------+---------------------+-------------+---------------------+--------------------------+
+--------------------------------+--------------------------------+
| OwnerUndeletedAnswerCountA ... |             Title              |
+--------------------------------+--------------------------------+
|              1000              | PHP - Justify string algorithm |
+--------------------------------+--------------------------------+
+--------------------------------+---------------------+------------------+
|          BodyMarkdown          |    PostClosedDate   |    OpenStatus    |
+--------------------------------+---------------------+------------------+
| Just tanked a job intervie ... | 06/22/2012 13:01:37 | not constructive |
+--------------------------------+---------------------+------------------+
+--------------------------------+
|              tags              |
+--------------------------------+
| ['php', 'algorithm', None, ... |
+--------------------------------+
[1 rows x 11 columns]
```
