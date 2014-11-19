fs = require('fs')
commonHelpers = require("../helpers/common.js").helpers()
util = require('./util.js')
path = require('path')

generator = {}
generator.helpers = commonHelpers
dirname = path.dirname(__filename)
template = path.resolve(dirname, "tmpl/pojo.hbs")
generator.template = fs.readFileSync(template).toString()


sanitize = (str)->
  aux = str.split(".")
  res = ''
  aux.forEach (it)->
    res += util.capitalize(it)
  res

generator.parser = (datos) ->
  parsed = []
  if datos.extra
    datos.extra.package = "#{datos.extra.package}.#{datos.version}"
  for row in datos.schemas
    for schemaName of row
      data = JSON.parse(row[schemaName])
      model = {}
      model.className = data.title
      model.classMembers = []
      model.classDescription = data.description ? ""

      if data.type is "array"
        ref = data.items['$ref'].replace("#/", "").split(".")[0]
        ref = util.capitalize(ref)
        model.classMembers.push {name: "items", type: "List<#{ref}>"}
      for key of data.properties
        p = data.properties[key]
        model.classMembers.push util.mapProperty(p, key)
      model.extra = datos.extra
      parsed.push {name: datos.version + "/" + util.capitalize("#{sanitize(schemaName)}.groovy") , model}
  parsed

module.exports = generator


