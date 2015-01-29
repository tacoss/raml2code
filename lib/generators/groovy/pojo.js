var originalParser, schema2groovy, utilSchemas;

schema2groovy = require('json-schema-2-groovy-pojo/lib/generators/pojo');

utilSchemas = require('../util/schemas');

console.log(schema2groovy);

originalParser = schema2groovy.parser;

schema2groovy.parser = function(datos) {
  datos.schemas = utilSchemas.loadSchemas(datos);
  return originalParser(datos);
};

module.exports = schema2groovy;
