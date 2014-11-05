util = {}
util.getUriParameter = (resource)->
  uriParameters = []
  for key of resource.uriParameters
    p = resource.uriParameters[key]
    uriParameters.push util.mapProperty(p, key)
  uriParameters

util.mapProperty = (property, name)->
  p = {}
  p.name = name
  p.comment =  property.description
  switch property.type
    when 'array'
      p.type = "List"
      p.name = "items"
    when 'string' then p.type = "String"
    when 'boolean' then p.type = "Boolean"
    when 'number' then p.type = "Double"
    when 'integer' then p.type = "Integer"
  p.kind = "@Path(\"#{p.name}\")"
  console.log p
  p



util.parseResource = (resource, parsed, parentUri = "", parentUriArgs = []) ->
  # console.log "resource>", resource
  for m in resource.methods
    methodDef = {}
    methodDef.uri = parentUri + resource.relativeUri
    uriArgs = util.getUriParameter(resource)
    methodDef.args = parentUriArgs.concat(uriArgs)
    request = util.parseSchema(m.body,  "#{methodDef.uri} body" )
    respond = util.parseSchema(util.getBestValidResponse(m.responses).body,  "#{methodDef.uri} response" )
    if request.title
      methodDef.args = methodDef.args ? []
      methodDef.args.push {'kind': '@Body', 'type': request.title, 'name': request.title.toLowerCase()}

    methodDef.request = request.title ? null
    methodDef.respond = if respond.type is "array" then "List<#{respond.title}>" else respond.title
    methodDef.annotation = m.method.toUpperCase()
    methodDef.name = m.method + resource.displayName
    methodDef.displayName = resource.displayName
    parsed.push methodDef
  if resource.resources
    for innerResource in resource.resources
      util.parseResource(innerResource, parsed, resource.relativeUri, uriArgs)
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


module.exports = util
