fs = require('fs')
_ = require('lodash')
util = require('./util.js')
commonHelpers = require("../helpers/common.js").helpers()
path = require('path')

generator = {}
generator.helpers = commonHelpers
dirname = path.dirname(__filename)
template = path.resolve(dirname, "tmpl/jaxrsResources.hbs")
generator.template = fs.readFileSync(template).toString()

generator.parser = (data) ->
  parsed = []
  methodParse = []
  annotations =
    path: "@PathParam"
    query: "@QueryParam"
    body: ""
    multiPart: "@FormDataParam"
    form: "@FormDataParam"

  mapping =
    'string' : "String"
    'boolean' : "Boolean"
    'number' : "BigDecimal"
    'integer' : "Long"
    'array' : "List"
    'object' : "Map"
    'file' : "InputStream"

  for resource in data.resources
    util.parseResource(resource, methodParse, annotations, mapping)

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
