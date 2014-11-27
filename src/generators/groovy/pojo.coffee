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
    datos.extra.enableAnnotations ?= true
  for row in datos.schemas

    for schemaName of row
      data = JSON.parse(row[schemaName])
      schemas.push data


  for schema in schemas
    normSchema = deref(schema, schemas)
    model = {}
    model.className = util.capitalize(normSchema.title)
    model.classDescription = normSchema.description ? ""

    someData = util.mapProperties(normSchema, deref.refs)
    model.classMembers = someData.classMembers
    model.innerClasses = someData.innerClasses

    model.extra = datos.extra
    parsed.push {name: datos.version + "/#{model.className}.groovy" , model}

  parsed

module.exports = generator


