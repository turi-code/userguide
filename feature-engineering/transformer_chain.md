#Transformer Chain 

Sequentially apply a list of transforms. Each of the individual steps in the
chain must be transformers (ie., a child class of TransformerBase), which can be
one of the following:

 - Native transformer modules in GraphLab Create (e.g. FeatureHasher).
 - User-created modules (defined by inheriting TransformerBase).

#### Introductory Example 

```python
# Create data.
sf = graphlab.SFrame({'a': [1,2,3], 'b' : [2,3,4]})

# Create a chain a transformers.
from graphlab.toolkits.feature_engineering import *

# Create a chain of transformers.
chain = graphlab.feature_engineering.create(sf,[QuadraticFeatures(),
                                                   FeatureHasher() ])

# Create a chain of transformers with names for each of the steps.
chain = graphlab.feature_engineering.create(sf,[('quadratic', QuadraticFeatures()),
                                                   ('hasher', FeatureHasher())])

# Transform the data.
transformed_sf = chain.transform(sf)

# Save the transformer.
chain.save('save-path')

# Access each of the steps in the transformer by name or index
steps = chain['steps']
steps = chain['steps_by_name']
```



