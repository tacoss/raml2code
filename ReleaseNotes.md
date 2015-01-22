## 0.8.38
Changing version values to RAML spec version supported, adding support to generate a js client

- Moving retrofit client to src/generators/java this could break some already setup projects
- Generating jsClient wrapping  [raml-client-generator](https://github.com/mulesoft/raml-client-generator)
- Updating data2code to 0.0.3

## 0.0.37
Adding support to optional properties for retrofit client, now it generates a permutations of the methods with the optional arguments

- Refactor on util.js
- Some test where change to support the new properties