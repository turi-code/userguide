# GraphLab Create User Guide

Our mission at Dato is to build the most powerful and usable data
science tools that enable you to go quickly from inspiration to production.

[GraphLab Create](https://dato.com/products/create/) is a Python package that
allows programmers to perform end-to-end large-scale data analysis and data
product development.

- **Data ingestion and cleaning with SFrames**. SFrame is an efficient
  disk-based tabular data structure that is not limited by RAM. This lets you
  scale your analysis and data processing to handle terabytes of data, even on
  your laptop.

- **Data exploration and visualization with GraphLab Canvas**. GraphLab Canvas
  is a browser-based interactive GUI that allows you to explore tabular data,
  summary plots and statistics.

- **Network analysis with SGraph**. SGraph is a disk-based graph data structure
  that stores vertices and edges in SFrames.

- **Predictive model development with machine learning toolkits**. GraphLab
  Create includes several toolkits for quick prototyping with fast, scalable
  algorithms.

- **Production automation with data pipelines**. Data pipelines allow you to
  assemble reusable code tasks into jobs and automatically run them on common
  execution environments (e.g. Amazon Web Services, Hadoop).

In this User Guide, you will learn how to use GraphLab Create to:

- munge and explore both structured and unstructured data
- use advanced machine learning methods to build predictive models and
  recommender systems
- put your code into production and use it for real-world applications

Each chapter contains hands-on exercises with solutions and pointers to
additional resources where you may learn more. Please do not hesitate to ask any
questions you may have at our
[Forum](http://forum.dato.com/categories/graphlab-create).

### Open source

The source for this userguide is [available on Github](https://github.com/dato-code/userguide)
under the 3-clause [BSD license](LICENSE).
If you have suggestions or bug reports, we welcome Github issues and pull requests! See the chapter about [contributing](contributing.md) on guidelines for adding content.

To build the userguide, install npm and run the following:
```
npm install
npm run gitbook-dep
npm run gitbook
```
The generated html will be located at `_book/index.html`.
