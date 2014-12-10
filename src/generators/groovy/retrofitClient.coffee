fs = require('fs')
commonHelpers = require("../helpers/common.js").helpers()
util = require('./util.js')
path = require('path')

generator = {}
generator.helpers = commonHelpers
dirname = path.dirname(__filename)
template = path.resolve(dirname, "tmpl/retrofitClient.hbs")
generator.template = fs.readFileSync(template).toString()

generator.parser = (data) ->
  parsed = []
  methodParse = []
  annotations =
    path: "@Path"
    query: "@Query"
    body: "@Body"
    multiPart: "@Part"
    form: "@Field"
  mapping =
   'string' : "String"
   'boolean' : "Boolean"
   'number' : "BigDecimal"
   'integer' : "Long"
   'array' : "List"
   'object' : "Map"
   'file' : "TypedFile"

  for resource in data.resources
    util.parseResource(resource, methodParse, annotations, mapping)
  model = {}
  model.methods = methodParse
  model.version = data.version
  if data.extra
    data.extra.package = "#{data.extra.package}.#{data.version}"
    data.extra.importPojos = "#{data.extra.importPojos}.#{data.version}"
    model.extra = data.extra
  model.className = data.title.split(" ").join("")
  parsed.push {name: "#{data.version}/#{model.className}.java" , model}
  parsed

module.exports = generator
