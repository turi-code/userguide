# Deep Feature Extractor

Takes an input dataset, propagates each example through the network, and
returns an SArray of dense feature vectors. These feature vectors can be used
as input to train another classifier such as a LogisticClassifier,
SVMClassifier, BoostedTreesClassifier, or NeuralNetClassifier.

Deep features can be used to extract features from your own models or using a
pre-trained model for ImageNet (NIPS 2012, Alex Krizhevsky et al.).  Dato provides 
a free pre-trained model for use as demonstrated below. 

#### Introductory Example 

```python

# Create data.
import graphlab as gl

# Import data from MNIST
data = gl.SFrame('http://s3.amazonaws.com/dato-datasets/mnist/sframe/train6k')

# Create a DeepFeatureExtractorObject
#If `model='auto'` is used, an appropriate model is chosen from a collection 
#of pre-trained models hosted by Dato.
extractor = gl.feature_engineering.DeepFeatureExtractor(feature = 'image', 
                                                        model='auto')

# Fit the encoder for a given dataset.
extractor = extractor.fit(data)

# Return the model used for the deep feature extraction.
extracted_model = extractor['model']
```

Once a DeepFeatureExtractor object is constructed, it must first be fitted and
then the transform function can be called to extract features. The extracted 
features can then be used as a part of a LogisticClassifier. 

```
# Extract features.
features_sf = extractor.transform(data)

+-------+----------------------+-------------------------------+
| label |        image         |      deep_features_image      |
+-------+----------------------+-------------------------------+
|   5   | Height: 28 Width: 28 | [0.0531935989857, 0.653152... |
|   8   | Height: 28 Width: 28 | [0.0531935989857, 1.006503... |
|   1   | Height: 28 Width: 28 | [0.0531935989857, 0.053193... |
|   4   | Height: 28 Width: 28 | [0.0531935989857, 0.063806... |
|   2   | Height: 28 Width: 28 | [0.0531935989857, 0.347246... |
|   7   | Height: 28 Width: 28 | [0.0531935989857, 0.758747... |
|   0   | Height: 28 Width: 28 | [0.0531935989857, 0.252766... |
|   2   | Height: 28 Width: 28 | [0.0531935989857, 0.526395... |
|   5   | Height: 28 Width: 28 | [0.0531935989857, 0.053193... |
|   9   | Height: 28 Width: 28 | [0.0531935989857, 1.276176... |
+-------+----------------------+-------------------------------+
[6000 rows x 3 columns]

# Train a classifier using the deep features!.
model = gl.logistic_classifier.create(features_sf, target='label', 
                              features =  ['deep_features_image'])
```



