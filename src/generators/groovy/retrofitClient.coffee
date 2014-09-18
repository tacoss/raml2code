fs = require('fs')
commonHelpers = require("../helpers/common.js").helpers()
path = require('path')

generator = {}
generator.helpers = commonHelpers
dirname = path.dirname(__filename)
template = path.resolve(dirname, "retrofitClient.hbs")
generator.template = fs.readFileSync(template).toString()

generator.parser = (data) ->
  parsed = []
  methodParse = []
  for resource in data.resources
    parseResource(resource, methodParse)

  model = {}
  model.methods = methodParse
  model.extra = data.extra if data.extra

  model.className = data.title.split(" ").join("")
  parsed.push {name: model.className + ".java" , model}
  parsed


parseResource = (resource, parsed, parentUri = "") ->
  # console.log "resource>", resource
  for m in resource.methods
    methodDef = {}
    methodDef.args =  getUriParameter(resource) 
    respond = parseSchema(getBestValidResponse(m.responses).body)
    request = parseSchema(m.body)
    if request.title 
      methodDef.args = methodDef.args ? []
      methodDef.args.push {'kind': '@Body', 'type': request.title, 'name': request.title.toLowerCase()} 

    methodDef.request = request.title ? null
    methodDef.respond = if respond.type is "array" then "List<#{respond.title}>" else respond.title 
    methodDef.annotation = m.method.toUpperCase()
    methodDef.name = m.method + resource.displayName
    methodDef.uri = parentUri + resource.relativeUri
    parsed.push methodDef
  if resource.resources
    for innerResource in resource.resources
      parseResource(innerResource, parsed, resource.relativeUri)


getUriParameter = (resource)->
  uriParameters = []
  if resource.uriParameters
    for key of resource.uriParameters
      p = resource.uriParameters[key]
      property = {}
      property.name = key
      switch p.type
        when 'array'
          property.type = "List"
          property.name = "items"
        when 'string' then property.type = "String"
        when 'boolean' then property.type = "Boolean"
        when 'number' then property.type = "Double"
        when 'integer' then property.type = "Integer"
      property.kind = "@Path(\"#{property.name}\")"
      uriParameters.push property
    uriParameters
  else 
    null


getBestValidResponse = (responses) ->
  response = responses["304"] ?
  response = responses["201"] ?
  response = responses["204"] ?
  response = responses["200"] ?
  response 


parseSchema = (body) ->

  schema = {}
  if body and body['application/json']
    schema = JSON.parse(body['application/json'].schema)
  schema


module.exports = generator
