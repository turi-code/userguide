<b>Q:</b> Why can't GraphLab Create read from my HDFS installation?

<b>A:</b> This usually happens because GraphLab Create failed to find a suitable java installation.  Your server log (the location of this log is printed when GraphLab Create starts) will let you know if this is the issue.  

If using GraphLab Create >= 1.3, you can simply make sure JAVA_HOME is set to your preferred java installation.  If you prefer to use a different java just for GraphLab Create, you can set GRAPHLAB_JAVA_HOME, and it will be checked before JAVA_HOME.  If you prefer to use a JVM other than the standard one that comes with java, you'll have to specify the directory that holds libjvm.so with the environment variable GRAPHLAB_LIBJVM_DIRECTORY.

If using GraphLab Create < 1.3, you can quickly solve this by upgrading :).  If you don't want to upgrade, then you must set LD_LIBRARY_PATH to the directory that holds libjvm.so.

If nothing above fixes your issue, the problem may be that the version of Java is unsupported.  Our HDFS support requires Java 6+.
