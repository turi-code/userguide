#Introduction to Graph Analytics
Going from inspiration to production with graph models requires knowledge of several of the graph's attributes:
influential and outlier nodes, clusters and communities, hidden
connections between nodes, and the ability to compare different graphs based on
these attributes. The
[Graph Analytics toolkit](https://dato.com/products/create/docs/graphlab.toolkits.graph_analytics.html)
enables this depth of understanding by providing several methods:

- [Connected components](https://dato.com/products/create/docs/generated/graphlab.connected_components.create.html)
- [Graph coloring](https://dato.com/products/create/docs/generated/graphlab.graph_coloring.create.html)
- [K-Core decomposition](https://dato.com/products/create/docs/generated/graphlab.kcore.create.html)
- [PageRank](https://dato.com/products/create/docs/generated/graphlab.pagerank.create.html)
- [Single-source shortest path](https://dato.com/products/create/docs/generated/graphlab.shortest_path.create.html)
- [Triangle count](https://dato.com/products/create/docs/generated/graphlab.triangle_counting.create.html#graphlab.triangle_counting.create)

Each method takes an input graph and returns a model object, which contains the
run time, an SFrame with the desired output for each vertex, and a new graph
whose vertices contain the output as an attribute.
