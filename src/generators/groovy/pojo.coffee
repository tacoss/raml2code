fs = require('fs')
commonHelpers = require("../helpers/common.js").helpers()
util = require('./util.js')
path = require('path')

generator = {}
generator.helpers = commonHelpers
dirname = path.dirname(__filename)
template = path.resolve(dirname, "tmpl/pojo.hbs")
cmPartial = path.resolve(dirname, "tmpl/classMembersPartial.hbs")
generator.template = fs.readFileSync(template).toString()
generator.partials = [
  name : "classMembers"
  str : fs.readFileSync(cmPartial).toString()
]

deref = require('deref')();

generator.parser = (datos) ->
  mapping =
    'string' : "String"
    'boolean' : "Boolean"
    'number' : "BigDecimal"
    'integer' : "Long"
    'array' : "List"
    'object' : "Map"
    'file' : "InputStream"

  parsed = []
  schemas = []
  if datos.extra
    datos.extra.package = "#{datos.extra.package}.#{datos.version}"
    datos.extra.enableAnnotations ?= true
  for row in datos.schemas

    for schemaName of row
      data = JSON.parse(row[schemaName])
      schemas.push data


  for schema in schemas

#   normSchema = deref(schema, schemas, true)  #Expanded
    normSchema = deref(schema, schemas)  #Expanded

    model = {}
    model.className = util.capitalize(normSchema.title)
    model.classDescription = normSchema.description ? ""

    someData = util.mapProperties(normSchema, deref.refs, mapping)

    model.classMembers = someData.classMembers
    model.innerClasses = someData.innerClasses


    model.extra = datos.extra
    if someData.classMembers.length > 0
      parsed.push {name: datos.version + "/#{model.className}.groovy" , model}
    else
      #if there is not properties it must be a Map maps are not created
      console.log "----> #{model.className}.groovy is a Map because it doesn't have properties"

  parsed

module.exports = generator


