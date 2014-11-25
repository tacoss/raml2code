deref = require('deref')();
util = {}
util.getUriParameter = (resource, annotation)->
  uriParameters = []
  for key of resource.uriParameters
    p = resource.uriParameters[key]
    uriParameters.push util.mapProperty(p, key, annotation).property
  uriParameters

util.getQueryparams = (queryParams, annotation)->
  params = []
  for key of queryParams
    p = queryParams[key]
    params.push util.mapProperty(p, key, annotation).property
  params

util.mapProperties = (expandedSchema, refMap)->
  data = {}
  data.classMembers = []
  data.innerClasses = []
  for key of expandedSchema.properties
    property = expandedSchema.properties[key]
    propParsed = util.mapProperty(property, key, '', refMap)
    data.classMembers.push propParsed.property
    data.innerClasses.push propParsed.innerClass if propParsed.innerClass

  data

util.mapProperty = (property, name, annotation, refMap)->
  data = {}
  data.property = {}
  data.property.name = name
  data.property.comment =  property.description
  if property.items and property.items["$ref"]
    keyRef = property.items["$ref"].split("#")[0]
  else if property["$ref"] 
    keyRef = property["$ref"].split("#")[0]
  switch property.type
    when 'array'
      auxType = "List"
      innnerSchema = refMap[keyRef]
      if innnerSchema and innnerSchema.title
        auxType += "<#{util.capitalize(innnerSchema.title)}>"
      else
        console.error "$ref not found: #{keyRef}"

      data.property.type = auxType

    when 'object'
      #if object has no references we made a inner class
      if property.properties
        if not property.title
          console.error "please provide a title for property:", name
        data.property.type = util.capitalize(property.title)
        data.innerClass = {}
        data.innerClass.className = data.property.type
        data.innerClass.classDescription = property.description
        aux = util.mapProperties(property, refMap)
        data.innerClass.classMembers = aux.classMembers
      else
        data.property.type = 'Map'
    when 'string' then data.property.type = "String"
    when 'boolean' then data.property.type = "Boolean"
    when 'number' then data.property.type = "Double"
    when 'integer' then data.property.type = "Integer"

  #if object has $references we map on the POJO
  if property["$ref"]
    innnerSchema = refMap[keyRef]
    if innnerSchema and innnerSchema.title
      data.property.type = util.capitalize(innnerSchema.title)
    else
      console.error "$ref not found: #{keyRef}"

  data.property.kind = annotation + "(\"#{data.property.name}\")"
  data



util.parseResource = (resource, parsed, annotations,  parentUri = "", parentUriArgs = []) ->

  for m in resource.methods
    methodDef = {}
    methodDef.uri = parentUri + resource.relativeUri
    uriArgs = util.getUriParameter(resource, annotations.path)
    methodDef.args = parentUriArgs.concat(uriArgs)
    methodDef.args = methodDef.args.concat(util.getQueryparams(m.queryParameters, annotations.query))
    request = util.parseSchema(m.body,  "#{methodDef.uri} body" )
    respond = util.parseSchema(util.getBestValidResponse(m.responses).body,  "#{methodDef.uri} response" )
    if request.title
      methodDef.args = methodDef.args ? []
      methodDef.args.push {'kind': annotations.body, 'type': util.capitalize(request.title), 'name': request.title.toLowerCase()}

    methodDef.request = request.title ? null
    methodDef.respond = respond.title
    methodDef.annotation = m.method.toUpperCase()
    methodDef.name = m.method + resource.displayName
    methodDef.displayName = resource.displayName
    parsed.push methodDef
  if resource.resources
    for innerResource in resource.resources
      util.parseResource(innerResource, parsed, annotations, methodDef.uri, uriArgs)
  undefined


util.parseSchema = (body, meta = '') ->
  schema = {}
  if body and body['application/json']
    try
      schema = JSON.parse(body['application/json'].schema)
    catch e
      console.log "-----JSON ERROR on #{meta}---------"
      console.log body['application/json'].schema
      throw e

  schema

util.getBestValidResponse = (responses) ->
  response = responses["304"] ?
    response = responses["204"] ?
    response = responses["201"] ?
    response = responses["200"] ?
    response

util.capitalize = (str)->
  str.charAt(0).toUpperCase() + str.slice(1)

util.sanitize = (str)->
  aux = str.split(".")
  res = ''
  aux.forEach (it)->
    res += util.capitalize(it)
  res

module.exports = util
