fs = require('fs')
commonHelpers = require("../helpers/common.js").helpers()
util = require('./util.js')
path = require('path')

generator = {}
generator.helpers = commonHelpers
dirname = path.dirname(__filename)
template = path.resolve(dirname, "tmpl/pojo.hbs")
generator.template = fs.readFileSync(template).toString()

deref = require('deref')();

sanitize = (str)->
  aux = str.split(".")
  res = ''
  aux.forEach (it)->
    res += util.capitalize(it)
  res

generator.parser = (datos) ->
  parsed = []
  schemas = []
  if datos.extra
    datos.extra.package = "#{datos.extra.package}.#{datos.version}"
  for row in datos.schemas

    for schemaName of row
      data = JSON.parse(row[schemaName])
      schemas.push data


  for schema in schemas
    expandedSchema = deref(schema, schemas, true)

    model = {}
    model.className = expandedSchema.title
    model.classMembers = []
    model.classDescription = expandedSchema.description ? ""

    for key of expandedSchema.properties
      p = expandedSchema.properties[key]
      model.classMembers.push util.mapProperty(p, key)

    model.extra = datos.extra
    parsed.push {name: datos.version + "/" + util.capitalize("#{model.className}.groovy") , model}



  parsed

module.exports = generator


