<script src="../turi/js/recview.js"></script>
#Advanced Deep Learning with MXNet

MXNet is an open source deep learning framework designed for efficiency and flexibility.
GraphLab Create integrates MXNet for creating advanced deep learning models.

MXNet makes it easy to create state-of-the-art network architectures including
deep convolution neural networks (CNN), and recurrent neural networks (RNN).
MXNet supports multiple CPUs and GPUs out-of-the-box: the computation
is represented as symbolic graph and automatically parallelized across multiple
devices.  Recent benchmarks showed MXNet performed equally or faster than other
frameworks such as TensorFlow, Torch or Caffe.

GraphLab Create embraces MXNet as its own module, and adds features like SFrame
integration to further accelerate the creation or fine tuning your own advanced
deep learning models with numerical, text, or image data.

For documentation on the MXNet design, please visit http://mxnet.readthedocs.io/en/latest/

##### Introductory Example: Linear Regression

```python
  import graphlab as gl
  from graphlab import mxnet as mx

  # Define the network symbol, equivalent to linear regression
  net = mx.symbol.Variable('data')
  net = mx.symbol.FullyConnected(data=net, name='fc1', num_hidden=1)
  net = mx.symbol.LinearRegressionOutput(data=net, name='lr')

  # Load data into SFrame and normalize features
  sf = gl.SFrame.read_csv('https://static.turi.com/datasets/regression/houses.csv')
  features = ['tax', 'bedroom', 'bath', 'size', 'lot']
  for f in features:
      sf[f] = sf[f] - sf[f].mean()
      sf[f] = sf[f] / sf[f].std()

  # Prepare the input iterator from SFrame
  # `data_name` must match the first layer's name of the network.
  # `label_name` must match the last layer's name plus "_label".
  dataiter = mx.io.SFrameIter(sf, data_field=features, label_field='price',
                              data_name='data', label_name='lr_label',
                              batch_size=1)

  # Train the network
  model = mx.model.FeedForward.create(symbol=net, X=dataiter, num_epoch=20,
                                      learning_rate=1e-2,
                                      eval_metric='rmse')

  # Make prediction
  model.predict(dataiter)
```

##### Introductory Example: Logistic Regression

```python
  import graphlab as gl
  import numpy as np
  from graphlab import mxnet as mx

  # Define the network symbol, equivalent to logistic regression
  net = mx.symbol.Variable('data')
  net = mx.symbol.FullyConnected(data=net, name='fc1', num_hidden=1)
  net = mx.symbol.LinearRegressionOutput(data=net, name='lr')

  # Load data into SFrame and normalize features
  sf = gl.SFrame.read_csv('https://static.turi.com/datasets/regression/houses.csv')
  sf['expensive'] = sf['price'] > 100000
  features = ['tax', 'bedroom', 'bath', 'size', 'lot']
  for f in features:
      sf[f] = sf[f] - sf[f].mean()
      sf[f] = sf[f] / sf[f].std()

  # Prepare the input iterator from SFrame
  # `data_name` must match the first layer's name of the network.
  # `label_name` must match the last layer's name plus "_label".
  dataiter = mx.io.SFrameIter(sf, data_field=features, label_field='expensive',
                              data_name='data', label_name='lr_label',
                              batch_size=1)

  # Define the custom evaluation function for binary accuracy
  def binary_acc(label, pred):
      return int(label[0]) == int(pred[0] >= 0.5)

  model = mx.model.FeedForward.create(symbol=net, X=dataiter, num_epoch=20,
                                      learning_rate=1e-2,
                                      eval_metric=mx.metric.np(binary_acc))

  # Make prediction
  model.predict(dataiter)
```

##### Train your own Convolution Neural Network (CNN) for Image Classification

```python
  import graphlab as gl
  from graphlab import mxnet as mx
  import numpy as np

  # Define the network symbol
  data = mx.symbol.Variable('data')
  conv1= mx.symbol.Convolution(data = data, name='conv1', num_filter=32, kernel=(3,3), stride=(2,2))
  bn1 = mx.symbol.BatchNorm(data = conv1, name="bn1")
  act1 = mx.symbol.Activation(data = bn1, name='relu1', act_type="relu")
  mp1 = mx.symbol.Pooling(data = act1, name = 'mp1', kernel=(2,2), stride=(2,2), pool_type='max')

  conv2= mx.symbol.Convolution(data = mp1, name='conv2', num_filter=32, kernel=(3,3), stride=(2,2))
  bn2 = mx.symbol.BatchNorm(data = conv2, name="bn2")
  act2 = mx.symbol.Activation(data = bn2, name='relu2', act_type="relu")
  mp2 = mx.symbol.Pooling(data = act2, name = 'mp2', kernel=(2,2), stride=(2,2), pool_type='max')

  fl = mx.symbol.Flatten(data = mp2, name="flatten")
  fc2 = mx.symbol.FullyConnected(data = fl, name='fc2', num_hidden=10)
  softmax = mx.symbol.SoftmaxOutput(data = fc2, name = 'sm')

  # Load MINST image data into SFrame
  sf =  gl.SFrame('https://static.turi.com/datasets/mnist/sframe/train')

  batch_size = 100
  num_epoch = 1

  # Prepare the input iterator from SFrame
  # `data_name` must match the first layer's name of the network.
  # `label_name` must match the last layer's name plus "_label".
  dataiter = mx.io.SFrameImageIter(sf, data_field=['image'],
                              label_field='label',
                              data_name='data',
                              label_name='sm_label', batch_size=batch_size)

  # Train the network
  model = mx.model.FeedForward.create(softmax, X=dataiter,
                                      num_epoch=num_epoch,
                                      learning_rate=0.1, wd=0.0001,
                                      momentum=0.9,
                                      eval_metric=mx.metric.Accuracy())

  # Make prediction
  model.predict(dataiter)
```

Model Creation
==============

Model Training
--------------

As the examples above showed, `model.FeedForward.create` is the high level
for training all kinds of neural networks. The main parameters are `symbol` and `X`, binding
to the network architectures and the data iterator respectively. Additional parameters such as
`num_epoch`, `optimizer` are used to control the optimization procedure. The default optimizer is
`optimizer.SGD`. For convenience, `model.FeedForward.create` also takes optimization
related parameters as `kwargs`, i.e. `learning_rate`, `momentum`. For instance:

```python

  model = mx.model.FeedForward.create(symbol=net, X=dataiter, learning_rate=0.01)
```

is equivalent to

```python
  sgd = mx.optimizer.SGD(learning_rate=0.01, rescale_grad=1.0/batch_size)
  model = mx.model.FeedForward.create(symbol=net, X=dataiter, optimizer=sgd)
```

Callback functions can be used to print progress or checkpoint model during training.
There are two types of callbacks: `epoch_end_callback` and `batch_end_callback`.
Both are arguments to the `model.FeedForward.create` function. For instance, the following
example does model check point every epoch and print progress every 10 batches.

```python
  model = mx.model.FeedForward.create(symbol=net, X=dataiter,
                                      batch_end_callback=mx.callback.Speedometer(batch_size=batch_size, frequent=10),
                                      epoch_end_callback=mx.callback.do_checkpoint(prefix='model_checkpoint'))
```


`epoch_end_callback` is called at the end of each epoch and `batch_end_callback` is called
at then end of each batch. `epoch_end_callback` types include `callback.do_checkpoint` and
`callback.log_train_metric`. `batch_end_callback` types include `callback.Speedometer`
and `callback.ProgressBar`.


Multiple GPU support
--------------------

MXNet supports using multiple GPUs for model training and prediction. 
GPU support is available for Linux operating systems that have

1. Nvidia CUDA 7.0 capable GPU(s)
2. CUDA toolkit v7.0
3. Minimum driver version of 346.xx. (`Link <http://www.nvidia.com/Download/index.aspx>`_)
   
By default, the CUDA toolkit library is installed at
``/usr/local/cuda``. If the CUDA toolkit is installed at a non-default location,
please set the environment variable ``LD_LIBRARY_PATH`` to include the CUDA
toolkit location. The following code shows an example that MXNet GPU capability
is activated:

```python
  >>> from graphlab import mxnet as mx
  2016-04-15 11:37:22,580 [INFO] graphlab.mxnet.base, 42: CUDA GPU support is activated
```

By default, model training and prediction uses CPU. When Nvidia CUDA-enabled GPU is available
and drivers are properly installed, you can specify using a single GPU
or multiple GPUs to speedup computation.

Devices in MXNet are called `context`. For example, the following code uses
two GPUs for training a FeedForward network.

```python
  gpus = [mx.context.gpu(0), mx.context.gpu(1)]
  model = mx.model.FeedForward.create(symbol=net, X=data, ctx=gpus, ...)
  model2 = mx.model.FeedForward.load(..., ctx=gpus)
```

Data Input from SFrame Iterator
===============================

`graphlab.SFrame` is a scalable data frame object that can hold numericals, text, and images.
Training deep neural network requires large amount of data, usually much larger than memory can hold.
SFrame makes it easy to transform your large dataset and feed it to MXNet for training without the need
of writing to disk with a custom file format or using a database.

MXNet integrates with `graphlab.SFrame` via `io.SFrameIter` which implements the
`io.DataIter` interface. `io.SFrameIter` supports SFrame with either a single
image-typed column or general tabular data with multiple numerical columns, in which the numerical columns
can be of different dimensions.

`io.SFrameImageIter` is a specialized iterator for image typed data. `io.SFrameImageIter`
supports image augmentation operations such as "subtracting mean pixel values" or "rescale pixel values".

These iterators can be created as follows. 

SFrameImageIter:

```python
# Load MINST image data into SFrame
  sf =  gl.SFrame('https://static.turi.com/datasets/mnist/sframe/train')

  batch_size = 100
  num_epoch = 1

  # Prepare the input iterator from SFrame
  # `data_name` must match the first layer's name of the network.
  # `label_name` must match the last layer's name plus "_label".
  dataiter = mx.io.SFrameImageIter(sf, data_field=['image'],
                              label_field='label',
                              data_name='data',
                              label_name='sm_label', batch_size=batch_size)


```

SFrameIter

```python
  # Load data into SFrame and normalize features
  sf = gl.SFrame.read_csv('https://static.turi.com/datasets/regression/houses.csv')
  features = ['tax', 'bedroom', 'bath', 'size', 'lot']
  for f in features:
      sf[f] = sf[f] - sf[f].mean()
      sf[f] = sf[f] / sf[f].std()

  # Prepare the input iterator from SFrame
  # `data_name` must match the first layer's name of the network.
  # `label_name` must match the last layer's name plus "_label".
  dataiter = mx.io.SFrameIter(sf, data_field=features, label_field='price',
                              data_name='data', label_name='lr_label',
                              batch_size=1)

```

These iterators can then directly be passed to the FeedForwardModel creation
function.

```python
  # Define the custom evaluation function for binary accuracy
  def binary_acc(label, pred):
      return int(label[0]) == int(pred[0] >= 0.5)

  model = mx.model.FeedForward.create(symbol=net, X=dataiter, num_epoch=20,
                                      learning_rate=1e-2,
                                      eval_metric=mx.metric.np(binary_acc))

  # Make prediction
  model.predict(dataiter)
```

Builtin Networks
================

The following shows the built-in state-of-the-art network architechtures for 
image classification.


* [builtin_symbols.symbol_alexnet.get_symbol()](https://dato.com/products/create/docs/generated/graphlab.mxnet.builtin_symbols.symbol_alexnet.get_symbol.html#graphlab.mxnet.builtin_symbols.symbol_alexnet.get_symbol) : Return the "AlexNet" architechture for image classification.
* [builtin_symbols.symbol_googlenet.get_symbol()](https://dato.com/products/create/docs/generated/graphlab.mxnet.builtin_symbols.symbol_googlenet.get_symbol.html#graphlab.mxnet.builtin_symbols.symbol_googlenet.get_symbol) : Return the "GoogLeNet" architechture for image classification
* [builtin_symbols.symbol_vgg.get_symbol()](https://dato.com/products/create/docs/generated/graphlab.mxnet.builtin_symbols.symbol_vgg.get_symbol.html#graphlab.mxnet.builtin_symbols.symbol_vgg.get_symbol) : Return the "VGG" architechture for image classification
* [builtin_symbols.symbol_inception_v3.get_symbol()](https://dato.com/products/create/docs/generated/graphlab.mxnet.builtin_symbols.symbol_inception_v3.get_symbol.html#graphlab.mxnet.builtin_symbols.symbol_inception_v3.get_symbol) : Return the "Inception-v3" architechture for image classification
* [builtin_symbols.symbol_inception_bn.get_symbol()](https://dato.com/products/create/docs/generated/graphlab.mxnet.builtin_symbols.symbol_inception_bn.get_symbol.html#graphlab.mxnet.builtin_symbols.symbol_inception_bn.get_symbol) : Return the "BN-Inception" architechture for image classification
* [builtin_symbols.symbol_inception_bn_28_small.get_symbol()](https://dato.com/products/create/docs/generated/graphlab.mxnet.builtin_symbols.symbol_inception_bn_28_small.get_symbol.html#graphlab.mxnet.builtin_symbols.symbol_inception_bn_28_small.get_symbol) : Return a simplified version of "BN-Inception" architechture for image classification
* [builtin_symbols.symbol_inception_bn_full.get_symbol()](https://dato.com/products/create/docs/generated/graphlab.mxnet.builtin_symbols.symbol_inception_bn_full.get_symbol.html#graphlab.mxnet.builtin_symbols.symbol_inception_bn_full.get_symbol) : Return a variant of "BN-Inception" architechture for image classification


Task Oriented Pretrained Models for Image Classification
========================================================

Pretrained models are deep neural networks trained on large datasets for specific tasks.
For general purpose tasks such as image classification or object detection, the quickest 
way to get value from deep learning is to directly apply the pretrained models.

MXNet in GLC streamlines the process of using pretrained models in the following ways:

- Provides task oriented API designed to simplify the common use cases
- Integrates with SFrame for scalable data loading and transformation
- Allows model download and management via a simple API

The following example shows the end to end process of downloading a pretrained image classifier
and classifying thousands of images. 

```python
  import graphlab as gl
  from graphlab import mxnet as mx

  mx.pretrained_model.download_model('https://static.turi.com/models/mxnet_models/release/image_classifier/imagenet1k_inception_bn-1.0.tar.gz')

  mx.pretrained_model.list_models()

  image_classifier = mx.pretrained_model.load_model('imagenet1k_inception_bn', ctx=mx.gpu(0))

  # Load image data into SFrame
  sf = gl.SFrame('https://static.turi.com/datasets/cats_dogs_sf')

  # Predict using the pretrained image classifier
  prediction = image_classifier.predict_topk(sf['image'], k=1)

  # Extract features from images
  features = image_classifier.extract_features(sf['image'])
```

Task Oriented Pretrained Models for Object Detection
====================================================

Turi also provides a pre-trained object detector. Object detection is the task
of identifying objects in an image, and also providing bounding boxes for them.
This is generally a challenging task, but neural networks have proven to be 
quite effective.

```python
  import graphlab as gl
  from graphlab import mxnet as mx

  mx.pretrained_model.download_model('https://static.turi.com/models/mxnet_models/release/image_detector/coco_vgg_16-1.0.tar.gz')

  mx.pretrained_model.list_models()

  image_detector = mx.pretrained_model.load_model('coco_vgg_16', ctx=mx.gpu(0))

  # Load image data into SFrame
  sf = gl.SFrame('http://s3.amazonaws.com/dato-datasets/image_classification/imagenet_sample')

  # Predict using the pretrained image classifier
  prediction = image_detector.detect(sf['image'][0], k=1)

  image_detector.visualize_detection(sf['image'][0],prediction)
```


Pretrained Image Classifiers
============================

InceptionBN (ImageNet ILVRC 2012)
---------------------------------
URL: https://static.turi.com/models/mxnet_models/release/image_classifier/imagenet1k_inception_bn-1.0.tar.gz

This model is provided by DMLC's `mxnet-model-gallery` project. More details
about the training of the model can be found at
[This://github.com/dmlc/mxnet-model-gallery/blob/master/imagenet-1k-inception-bn.md]

InceptionV3 (ImageNet ILVRC 2012)
---------------------------------
URL: https://static.turi.com/models/mxnet_models/release/image_classifier/imagenet1k_inception_v3-1.0.tar.gz

This model is provided by DMLC's `mxnet-model-gallery` project. More details
about the training of the model can be found at
[This://github.com/dmlc/mxnet-model-gallery/blob/master/imagenet-1k-inception-v3.md]

Inception21k (Full ImageNet)
----------------------------
URL: https://static.turi.com/models/mxnet_models/release/image_classifier/imagenet21k_inception_bn-1.0.tar.gz

This model is provided by DMLC's `mxnet-model-gallery` project. More details
about the training of the model can be found at
[This://github.com/dmlc/mxnet-model-gallery/blob/master/imagenet-21k-inception.md]

FastNet (ImageNet ILVRC 2012)
-----------------------------
URL: https://static.turi.com/models/mxnet_models/release/image_classifier/imagenet21k_fastnet-1.0.tar.gz

This model is trained with a modified architecture from AlexNet with reduced number of parameters while
keeping similar accuracy.

PlacesVGG (Places2 2015)
-----------------------------
URL: https://static.turi.com/models/mxnet_models/release/image_classifier/places_vgg_16-1.0.tar.gz

This model is trained with VGG-16 architechture, on the Places2 dataset. The 
Places2 dataset contains 8 million images of 400 different scene categories. 
More details about the dataset can be found at http://places2.csail.mit.edu/

LeNet (MNIST)
-----------------------------
URL: https://static.turi.com/models/mxnet_models/release/image_classifier/mnist_lenet.tar.gz

This model is trained with the classic LeNet architechture, on the MNIST dataset. 
The MNIST dataset contains 70,000 images of handwritten digits. 
More details about the dataset can be found at http://yann.lecun.com/exdb/mnist/.
More information about the LeNet architechture can be found at http://yann.lecun.com/exdb/lenet/. 

Pretrained Image Detectors
============================

COCO_VGG_16 (COCO)
-----------------------------
URL: https://static.turi.com/models/mxnet_models/release/image_detector/coco_vgg_16-1.0.tar.gz

This model is trained with VGG-16 architechture, on the Microsoft COCO dataset. 
The COCO dataset is a recent dataset often used for detection. More details 
:about the dataset can be found at http://mscoco.org/.



Symbols (Layers)
================

`symbol.Symbol` is the building block of a neural network. Every symbol can be viewed as a functional object
with forward and backward operation. Individual symbols can be composed into more complexed symbol which becomes
a neural network. An example is below:

```python
  data = mx.symbol.Variable('data')
  conv1= mx.symbol.Convolution(data = data, name='conv1', num_filter=32, kernel=(3,3), stride=(2,2))
  bn1 = mx.symbol.BatchNorm(data = conv1, name="bn1")
  act1 = mx.symbol.Activation(data = bn1, name='relu1', act_type="relu")
  mp1 = mx.symbol.Pooling(data = act1, name = 'mp1', kernel=(2,2), stride=(2,2), pool_type='max')

  conv2= mx.symbol.Convolution(data = mp1, name='conv2', num_filter=32, kernel=(3,3), stride=(2,2))
  bn2 = mx.symbol.BatchNorm(data = conv2, name="bn2")
  act2 = mx.symbol.Activation(data = bn2, name='relu2', act_type="relu")
  mp2 = mx.symbol.Pooling(data = act2, name = 'mp2', kernel=(2,2), stride=(2,2), pool_type='max')

  fl = mx.symbol.Flatten(data = mp2, name="flatten")
  fc2 = mx.symbol.FullyConnected(data = fl, name='fc2', num_hidden=10)
  softmax = mx.symbol.SoftmaxOutput(data = fc2, name = 'sm')
```

For a more detailed tutorial on the Symbolic API, please see:

Debugging and Monitoring
========================

`monitor.Monitor` is used to track outputs, weights and gradients during training.
Create a `monitor.Monitor` object and pass to the `model.FeedForward.create` function to enable
monitoring.

    [monitor.Monitor](https://dato.com/products/create/docs/generated/graphlab.mxnet.monitor.Monitor.html#graphlab.mxnet.monitor.Monitor)

Extract Features from a Model
============================

The following shows how to extract features from a given model. `model.extract_features` is an
API for extracting features from a given model for data. The main parameters are
`model` and `data`, for given `model.FeedForward` model and iterator of data. There is an
optional parameter `top_layer`, which indicates from which layer features will be extracted;
If `top_layer` is not set, it will automatically extract the second-to-last layer as features.

Note: Default ```top_layer``` is only correct for single output network

```python
  # net is a FeedForward model
  # This will extract features in the second last layer (the last layer is classifier)
  fea = mx.model.extract_features(model=net, data=dataiter)
```

or

```python
  # net is a FeedForward model
  # This will extract features in layer `fc_output`
  fea = mx.model.extract_features(model=net, data=dataiter, top_layer='fc1_output')
```

If a wrong `top_layer` name is given, correct candidates for `top_layer` will be given in exception.

Finetune a Model
===============

There is a helper function for finetuning, which is `model.get_feature_symbol`.
This function will generate a feature symbol from a given `FeedForward` model. Similar to extract
features, an optional parameter `top_layer` is used for setting until which layer the network will
be kept. If no value is set, the layer before the linear classifier will be used as features.

Note: Default ```top_layer``` is only correct for single output network

```python
  # net is a FeedForward model
  # This will get symbol of the second last layer and below (the last layer is classifier)
  feature_symbol = mx.model.get_feature_symbol(net)
```

or

```python
  # net is a FeedForward model
  # This will get symbol of `fc1_output` and below
  feature_symbol = mx.model.get_feature_symbol(net, top_layer='fc1_output')
```

After we get feature symbol, we can make new symbol for different task:

```python
  # net is a FeedForward model
  # This will build a classifier symbol based on feature symbol
  feature_symbol = mx.model.get_feature_symbol(net)
  classifier = mx.sym.FullyConnected(data=feature, num_hidden=18, name='new_classifier')
  classifier = mx.sym.SoftmaxOutput(data=classifier, name='softmax')
```

or

```python
  # net is a FeedForward model
  # This will build a regressor symbol based on feature symbol
  feature_symbol = mx.model.get_feature_symbol(net)
  regressor = mx.sym.FullyConnected(data=feature, num_hidden=1, name='new_regressor')
  regressor =  mx.symbol.LinearRegressionOutput(data=net, name='lr')
```

Then the API `model.finetune` is used for finetuning a model.
The main parameters are `symbol` and `model`, for new task network symbol and
the given `model.FeedForward` model to be used for finetuning. Other parameters are same to
`model.FeedForward.create`, for indicating training data, validation data and optimization.

Note: Usually, smaller learning rate is used for finetuning.

```python
  # classifier is the new symbol
  # net is a FeedForward model
  new_model = mx.model.finetune(symbol=classifier, model=net, num_epoch=2, learning_rate=1e-3,
                                X=train, eval_data=val,
                                batch_end_callback=mx.callback.Speedometer(100))
```
