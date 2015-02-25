schema2groovy = require('json-schema-2-groovy-pojo/lib/generators/pojo');
utilSchemas = require('raml2code-utils/lib/schemas')

originalParser = schema2groovy.parser
schema2groovy.parser = (datos) ->
  datos.schemas = utilSchemas.loadSchemas(datos)
  originalParser(datos)

module.exports = schema2groovy


