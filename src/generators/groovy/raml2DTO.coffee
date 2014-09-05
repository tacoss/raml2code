fs = require('fs')
commonHelpers = require("../helpers/common.js").helpers()
path = require('path')

generator = {}
generator.helpers = commonHelpers
dirname = path.dirname(__filename)
template = path.resolve(dirname, "dto.hbs")
console.log "raml2DTO", template
generator.template = fs.readFileSync(template).toString()

capitalize = (str)->
  str.charAt(0).toUpperCase() + str.slice(1)

generator.parser = (datos) ->
  parsed = []
  for row in datos.schemas
    for schemaName of row
      data = JSON.parse(row[schemaName])
      model = {}
      model.className = data.title
      model.classMembers = []
      model.classDescription = data.description ? ""

      if data.type is "array"
        ref = data.items['$ref'].replace("#/", "")
        ref = capitalize(ref)
        model.classMembers.push {name: "items", type: "List<#{ref}>"}
      for key of data.properties
        p = data.properties[key]
        property = {}
        property.name = key
        property.comment =  p.description
        switch p.type
          when 'array'
            property.type = "List"
            property.name = "items"
          when 'string' then property.type = "String"
          when 'boolean' then property.type = "Boolean"
          when 'Number' then property.type = "Double"
          when 'integer' then property.type = "Integer"

        model.classMembers.push property
      model.extra = datos.extra if datos.extra
      parsed.push {name: capitalize("#{schemaName}DTO.groovy") , model}
  parsed

 module.exports = generator


