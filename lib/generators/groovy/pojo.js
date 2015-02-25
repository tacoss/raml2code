var originalParser, schema2groovy, utilSchemas;

schema2groovy = require('json-schema-2-groovy-pojo/lib/generators/pojo');

utilSchemas = require('raml2code-utils/lib/schemas');

originalParser = schema2groovy.parser;

schema2groovy.parser = function(datos) {
  datos.schemas = utilSchemas.loadSchemas(datos);
  return originalParser(datos);
};

module.exports = schema2groovy;
