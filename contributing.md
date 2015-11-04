# Style Guide

In order to keep the appearance of the User Guide consistent, we are recommending the following guidelines:

#### Headers
* Each page has a top-level header(`# Linear Regression`)
* Headers in pages are fourth-level headers (`#### Experimentation Policies`)
* Fifth-level headers should only be used if they are in a fourth-level section.
* Capitalize headers according to http://web.archive.org/web/20130117225252/http://writersblock.ca/tips/monthtip/tipmar98.htm

#### Text
* No line breaks within a paragraph
* When referring to APIs inline:
 * Wrap the string in backticks: `graphlab.deploy.map_job.create`
 * Use the entire namespace chain upon first mention, then just the member: `create`
 * Don't use parentheses, unless you include the entire signature.
 * Link an inline API to the public API docs on dato.com, at least upon first mention.

#### Code Snippets
* Annotate Python code with `python`
* For readability, include an empty line before the code snippet
* line breaks within code snippets: 80 columns
