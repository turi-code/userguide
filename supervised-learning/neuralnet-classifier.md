#Neuralnet Classifier
The deep learning module is useful to create and manipulate different neural
network architectures. The core of this module is the
[NeuralNet](https://dato.com/products/create/docs/generated/graphlab.neuralnet_classifier.NeuralNetClassifier.html)
class, which stores the definition of each layer of a neural network and
a dictionary of learning parameters.

A **NeuralNet** object can be obtained from [`graphlab.deeplearning.create`](https://dato.com/products/create/docs/generated/graphlab.deeplearning.create.html).
The function, selects a *default* network architecture depending on the input
dataset using simple rules: it creates a 2-layer Perceptron Network for dense
numeric input, and a 1-layer Convolution Network for image data input.

**Warning**: Due to the high complexity of netualnet models, the default
network does not always work out of the box, and you will often need to tweak
the architectures a bit to make it work for your problem.


#### Introductory Example: Digit Recognition on MNIST Data


In this example, we will train a covolutional neural network for digit
recognition.  We need to make sure all of the images are the same size, since
neural nets have fixed input size. We can use the resize function. The setup
code to get started is as follows:

```python
import graphlab as gl

# Load the MNIST data (from an S3 bucket)
data = gl.SFrame('http://s3.amazonaws.com/dato-datasets/mnist/sframe/train')
test_data = gl.SFrame('http://s3.amazonaws.com/dato-datasets/mnist/sframe/test')

# Random split the training-data
training_data, validation_data = data.random_split(0.8)

# Make sure all images are of the same size (Required by Neuralnets)
for sf in [training_data, validation_data, test_data]:
  sf['image'] = gl.image_analysis.resize(sf['image'], 28, 28, 1)
```


We will use the builtin NeuralNet architecture for MNIST (a one layer
convolutional neuralnet work). The layers of the network can be viewed
as follows.

```python
net = gl.deeplearning.get_builtin_neuralnet('mnist')

print "Layers of the network "
print "--------------------------------------------------------"
print net.layers

print "Parameters of the network "
print "--------------------------------------------------------"
print net.params
```
```no-highlight
Layers of the network
--------------------------------------------------------
layer[0]: ConvolutionLayer
  padding = 1
  stride = 2
  random_type = xavier
  num_channels = 32
  kernel_size = 3
layer[1]: MaxPoolingLayer
  stride = 2
  kernel_size = 3
layer[2]: FlattenLayer
layer[3]: DropoutLayer
  threshold = 0.5
layer[4]: FullConnectionLayer
  init_sigma = 0.01
  num_hidden_units = 100
layer[5]: SigmoidLayer
layer[6]: FullConnectionLayer
  init_sigma = 0.01
  num_hidden_units = 10
layer[7]: SoftmaxLayer

Parameters of the network
--------------------------------------------------------
{'batch_size': 100,
 'divideby': 255,
 'init_random': 'gaussian',
 'l2_regularization': 0.0,
 'learning_rate': 0.1,
 'momentum': 0.9}
```

We can now train the neural network using the specified network as follows:

```python
model = gl.neuralnet_classifier.create(training_data, target='label',
                                       network = net,
                                       validation_set=validation_data,
                                       metric=['accuracy', 'recall@2'],
                                       max_iterations=3)
```

#### Making Predictions

We can now classify the test data, and output the most likely class label. The
score corresponds to the learned probability of the testing instance belonging
to the predicted class.

**Note** that this is inherently a **multi-class** classification problem, so
the classify provides the **top** label predictions for each data point along
with a probability/confidence of the class prediction.

```python
predictions = model.classify(test_data)
print predictions
```
```no-highlight
+--------+-------+----------------+
| row_id | class |     score      |
+--------+-------+----------------+
|   0    |   0   | 0.998417854309 |
|   1    |   0   | 0.999230742455 |
|   2    |   0   | 0.999326109886 |
|   3    |   0   | 0.997855246067 |
|   4    |   0   | 0.997171103954 |
|   5    |   0   | 0.996235311031 |
|   6    |   0   | 0.999143242836 |
|   7    |   0   | 0.999519705772 |
|   8    |   0   | 0.999182283878 |
|   9    |   0   | 0.999905228615 |
|  ...   |  ...  |      ...       |
+--------+-------+----------------+
[10000 rows x 3 columns]
```


#### Making Detailed Predictions

We can use the [`predict_topk`](https://dato.com/products/create/docs/generated/graphlab.neuralnet_classifier.NeuralNetClassifier.predict_topk.html) interface if we want prediction scores for
each class in the **top-k** classes (sorted in decreasing order of score).

Predict the top 2 most likely digits

```python
pred_top2 = model.predict_topk(test_data, k=2)
print pred_top2
```
```no-highlight

+--------+-------+-------------------+
| row_id | class |       score       |
+--------+-------+-------------------+
|   0    |   0   |   0.998417854309  |
|   0    |   6   | 0.000686840794515 |
|   1    |   0   |   0.999230742455  |
|   1    |   2   | 0.000284609268419 |
|   2    |   0   |   0.999326109886  |
|   2    |   8   | 0.000261707202299 |
|   3    |   0   |   0.997855246067  |
|   3    |   8   |  0.00118813838344 |
|   4    |   0   |   0.997171103954  |
|   4    |   6   |  0.00115600414574 |
|  ...   |  ...  |        ...        |
+--------+-------+-------------------+
[20000 rows x 3 columns]
```

#### Evaluating the Model

We can evaluate the classifier on the test data. Default metrics are accuracy,
and confusion matrix.

```python
result = model.evaluate(test_data)
print "Accuracy         : %s" % result['accuracy']
print "Confusion Matrix : \n%s" % result['confusion_matrix']
```
```no-highlight
Accuracy         : 0.977599978447
Confusion Matrix :
+--------------+-----------------+-------+
| target_label | predicted_label | count |
+--------------+-----------------+-------+
|      0       |        0        |  973  |
|      2       |        0        |   4   |
|      4       |        0        |   1   |
|      5       |        0        |   2   |
|      6       |        0        |   9   |
|      7       |        0        |   1   |
|      8       |        0        |   1   |
|      9       |        0        |   3   |
|      1       |        1        |  1122 |
|      2       |        1        |   1   |
|     ...      |       ...       |  ...  |
+--------------+-----------------+-------+
[65 rows x 3 columns]
Note: Only the head of the SFrame is printed.
You can use print_rows(num_rows=m, num_columns=n) to print more rows and columns.
```

#### Using a Neural Network for Feature Extraction

A previously trained model can be used to extract dense features for a given input. The[`extract_features`](https://dato.com/products/create/docs/generated/graphlab.neuralnet_classifier.NeuralNetClassifier.extract_features.html) function takes an input dataset, propagates each example through the network, and returns an SArray of dense feature vectors, each of which is the concatenation of all the hidden unit values at `layer[layer_id]`. These feature vectors can be used as input to train another classifier such as a [`LogisticClassifier`](https://dato.com/products/create/docs/generated/graphlab.logistic_classifier.LogisticClassifier.html), an [`SVMClassifier`](https://dato.com/products/create/docs/generated/graphlab.svm_classifier.SVMClassifier.html), another [`NeuralNetClassifier`](https://dato.com/products/create/docs/generated/graphlab.neuralnet_classifier.NeuralNetClassifier.html), or [`BoostedTreesClassifier`](https://dato.com/products/create/docs/generated/graphlab.boosted_trees_classifier.BoostedTreesClassifier.html). Input dataset size must be the same as for the training of the model, except for images which are automatically resized.

If the original network is trained on a large dataset, these deep features can be very powerful. This is especially true in the context of image analysis, where a model trained on the very large ImageNet dataset can learn [general purpose features](http://blog.dato.com/deep-learning-blog-post).

In this example, we will build a neural network for classification of digits, then build a generic classifier on top of those extracted features.

```python
# The data is the MNIST digit recognition dataset
data = graphlab.SFrame('http://s3.amazonaws.com/dato-datasets/mnist/sframe/train6k')
net = graphlab.deeplearning.get_builtin_neuralnet('mnist')
m = graphlab.neuralnet_classifier.create(data,
                                         target='label',
                                         network=net,
                                         max_iterations=3)
# Now, let's extract features from the last layer
data['features'] = m.extract_features(data)
# Now, let's build a new classifier on top of extracted features
m = graphlab.classifier.create(data,
                               features = ['features'],
                               target='label')
```

We also provide a [model trained on Imagenet](http://www.cs.toronto.edu/~fritz/absps/imagenet.pdf).This pre-trained model gives pre-trained features of excellent quality for images, and the way you would use such a model is demonstrated below:

```python
imagenet_path = 'http://s3.amazonaws.com/dato-datasets/deeplearning/imagenet_model_iter45'
imagenet_model = graphlab.load_model(imagenet_path)
data['image'] = graphlab.image_analysis.resize(data['image'], 256, 256, 3)
data['imagenet_features'] = imagenet_model.extract_features(data)
```

One can also use our [feature engineering](../feature-engineering/deep_feature_extractor.md) tools for extracting deep features.
