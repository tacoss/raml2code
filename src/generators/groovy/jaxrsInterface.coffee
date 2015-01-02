fs = require('fs')
_ = require('lodash')
utilSchemas = require('../util/schemas')
parseResource = require('../util/parseResource')
commonHelpers = require("../helpers/common").helpers()
path = require('path')

generator = {}
generator.helpers = commonHelpers
dirname = path.dirname(__filename)
template = path.resolve(dirname, "tmpl/jaxrsResources.hbs")
generator.template = fs.readFileSync(template).toString()

customAdapter = (method, methodParsed) ->

  if methodParsed.formData
    methodParsed.consumes = "MediaType.MULTIPART_FORM_DATA"

generator.parser = (data) ->
  parsed = []
  schemas = utilSchemas.loadSchemas(data)

  options =
    annotations :
      path: "@PathParam"
      query: "@QueryParam"
      body: ""
      multiPart: "@FormDataParam"
      form: "@FormDataParam"
    mapping :
      'string' : "String"
      'boolean' : "Boolean"
      'number' : "BigDecimal"
      'integer' : "Long"
      'array' : "List"
      'object' : "Map"
      'file' : "InputStream"

  methodParse = []

  for resource in data.resources
    methodParse.push parseResource(resource, options, schemas, customAdapter)

  methodParse = _.flatten(methodParse)
  resourceGroup = _.groupBy(methodParse, (method) ->
    method.displayName
  )

  if data.extra
    data.extra.package = "#{data.extra.package}.#{data.version}"
    data.extra.importPojos = "#{data.extra.importPojos}.#{data.version}"
  for k,v of resourceGroup
    model = {}
    model.extra = data.extra
    first = _.first(v)
    model.uri = first.uri
    model.className = "#{first.displayName}Resource"
    model.methods = v
    parsed.push {name: "#{data.version}/#{model.className}.groovy" , model}
  parsed


module.exports = generator
