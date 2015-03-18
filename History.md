1.8.4 / 2015-03-18
==================
  * Updating raml-js-parser to 0.8.10
1.8.0 / 2015-03-06
==================
  * Making a refactor, separating generators to it's own module, updating reamde

0.8.41 / 2015-03-05
==================
  * Adding default values to retrofit arguments

0.8.40 / 2015-02-09
==================

  * Now the pojo generator can handle nested resources and fix primitives types on list issue #7

0.8.39
==================
Fixing issue #4

0.8.38
==================
Changing version schema, adding support to generate a js client

- Moving retrofit client to src/generators/java this could break some already setup projects
- Now it generates jsClient it uses [raml-client-generator](https://github.com/mulesoft/raml-client-generator)
- Updating data2code to 0.0.3

0.0.37
==================
Adding support to optional properties for retrofit client, now it generates a permutations of the methods with the optional arguments

- Refactor on util.js
- Some test where change to support the new properties
