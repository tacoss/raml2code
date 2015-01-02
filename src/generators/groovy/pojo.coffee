fs = require('fs')
commonHelpers = require("../helpers/common").helpers()
path = require('path')
utilText = require('../util/text')
utilSchemas = require('../util/schemas')
utilMapProperty = require('../util/mapProperty')


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
  schemas = utilSchemas.loadSchemas(datos)

  if datos.extra
    datos.extra.package = "#{datos.extra.package}.#{datos.version}"
    datos.extra.enableAnnotations ?= true


  for schema in schemas

#   normSchema = deref(schema, schemas, true)  #Expanded
    normSchema = deref(schema, schemas) 

    model = {}
    model.className = utilText.capitalize(normSchema.title)
    model.classDescription = normSchema.description ? ""

    someData = utilMapProperty.mapProperties(normSchema, deref.refs, mapping)

    model.classMembers = someData.classMembers
    model.innerClasses = someData.innerClasses


    model.extra = datos.extra
    if someData.classMembers.length > 0
      parsed.push {name: datos.version + "/#{model.className}.groovy" , model}
    else
      #if there is not properties it must be a Map maps are not created
      console.log "----> #{model.className}.groovy is too abstract to create a file using List or Map"

  parsed

module.exports = generator


