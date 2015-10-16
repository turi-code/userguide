#Getting Started
In order to install GraphLab Create, please visit the [installation page on dato.com](https://dato.com/download/install.html) in order to

- register for a product key, and
- install the `graphlab-create` Python package.

Once installed, you will be able to read or run the example code and datasets by copying code into your terminal. Throughout the User Guide we assume you have imported the package via

```python
import graphlab
```

Sometimes it is useful shorthand to use `gl` instead of `graphlab`. This can be done via
```python
import graphlab as gl
```

### Quick start

Here are a few commands to get started.
<table class="table table-bordered table-striped">
  <thead>
    <tr>
      <th>Task</th>
      <th>code</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Importing and parsing data</td>
      <td><pre><code class="hljs python">url = 'http://s3.amazonaws.com/dato-datasets/millionsong/song_data.csv'<br/>songs = graphlab.SFrame.read_csv(url)</code></pre></td>
    </tr>
    <tr>
      <td>Visualizations</td>
      <td><pre><code class="hljs python">songs.show()</code></pre></td>
    </tr>
    <tr>
      <td>Computation on columns</td>
      <td><pre><code class="hljs python">songs['year'].mean()</code></pre></td>
    </tr>
    <tr>
      <td>Transforming columns</td>
      <td><pre><code class="hljs python">songs['num_words'] = songs['title'].apply(lambda x: len(x.split(' ')))</code></pre></td>
    </tr>
    <tr>
      <td>Aggregations</td>
      <td><pre><code class="hljs python">songs.groupby('artist_name', {'total': graphlab.aggregate.COUNT})</code></pre></td>
    </tr>
    <tr>
      <td>Create models</td>
      <td><pre><code class="hljs python">url = 'http://s3.amazonaws.com/dato-datasets/regression/Housing.csv'<br/>x = graphlab.SFrame.read_csv(url)<br/>m = graphlab.linear_regression.create(x, target='price')
      </code></pre></td>
    </tr>
  </tbody>
</table>
