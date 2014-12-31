_ = require('lodash')
Deref = require('deref');
utilText = require('../util/text')
utilSchemas = require('../util/schemas')

util = {}

util.getUriParameter = (resource, annotation, mapping)->
  uriParameters = []
  for key of resource.uriParameters
    p = resource.uriParameters[key]
    uriParameters.push util.mapProperty(p, key, annotation, mapping).property
  uriParameters

util.getQueryparams = (queryParams, annotation, mapping)->
  params = []
  for key of queryParams
    p = queryParams[key]
    params.push util.mapProperty(p, key, annotation, mapping).property
  params

util.parseForm = (body, annotations, mapping) ->
  args = []
  if body and (body['multipart/form-data'] or body["application/x-www-form-urlencoded"])
    form = body["multipart/form-data"] or body["application/x-www-form-urlencoded"]
    if body["multipart/form-data"] isnt undefined
      annotation = annotations.multiPart
    else
      annotation = annotations.form
    data = form.formParameters or form.formParameters
    for key of data
      p = data[key]
      parsedProperty = util.mapProperty(p, key, annotation, mapping).property
      args.push parsedProperty
      if parsedProperty.type is "InputStream"
        args.push {name: parsedProperty.name + "Data", type: "FormDataContentDisposition", kind: annotation + "(\"#{parsedProperty.name}\")"}
  args

util.mapProperties = (expandedSchema, refMap, mapping)->
  data = {}
  data.classMembers = []
  data.innerClasses = []

  if expandedSchema.properties and expandedSchema.properties.$ref
    keyRef = expandedSchema.properties.$ref
    expandedSchema.properties = Deref.util.findByRef(keyRef, refMap)

  for key of expandedSchema.properties
    property = expandedSchema.properties[key]
    #Canonical dereferencing and inline dereferencing
    #http://json-schema.org/latest/json-schema-core.html#anchor30
    if typeof property isnt 'string'
      property.required = true if expandedSchema.required and _.contains(expandedSchema.required, key)
      propParsed = util.mapProperty(property, key, '', mapping, refMap)
      data.classMembers.push propParsed.property
      data.innerClasses.push propParsed.innerClass if propParsed.innerClass

  data

util.resolveTypeByRef = (keyRef, refMap, propertyName, isArray = false)->
  data = {}
  data.type = ""
  innerSchema = Deref.util.findByRef(keyRef, refMap)
  if innerSchema
    if isArray
      data.innnerSchema = {}
      data.innnerSchema.items = innerSchema
    else
      data.innnerSchema = innerSchema

    data.type = util.resolveType(innerSchema, propertyName)

  else if keyRef
    console.error "$ref not found: #{keyRef} RefMap.keys -> [#{Object.keys(refMap)}]"
    console.error JSON.stringify(refMap)

  data

util.resolveType = (schema, propertyName)->
  type = ""
  if schema
    if schema.title
      type = utilText.capitalize(schema.title)
    else
      type = utilText.capitalize(propertyName)

  type

util.mapProperty = (property, name, annotation, mapping, refMap)->
  data = {}
  data.property = {}
  data.property.name = name
  data.property.notNull = true if property.required
  data.property.size = []
  data.property.size.push {"name": "min", "value": property.minLength} if property.minLength
  data.property.size.push {"name": "max", "value": property.maxLength} if property.maxLength

  data.property.comment = property.description
  if property.items and property.items["$ref"]
    keyRef = property.items["$ref"]
    keyRefData =
      keyRefData = util.resolveTypeByRef(keyRef, refMap, name, true)
  else if property["$ref"]
    keyRef = property["$ref"]
    keyRefData = util.resolveTypeByRef(keyRef, refMap, name)
    data.property.type = keyRefData.type
    if keyRefData.innnerSchema.type
      property.type = keyRefData.innnerSchema.type
    else
      property.properties = keyRefData.innnerSchema
      data.innerClass = util.resolveInnerClass(keyRefData.type, property, refMap, mapping)
      property.type = util.resolveType(data.innerClass, name)


  data.property.comment = property.description
  switch property.type
    when 'array'
      auxType = "List"
      if keyRefData and keyRefData.innnerSchema.items isnt undefined
        primitiveType = mapping[keyRefData.innnerSchema.items.type]
        if keyRefData.innnerSchema.items.title
          auxType += "<#{keyRefData.type}>"
        else if primitiveType
          auxType += "<#{primitiveType}>"

      data.property.type = auxType

    when 'object'

    #if object has no references we made a inner class
      if property.properties
        if keyRefData and keyRefData.type
          data.property.type = keyRefData.type
        else
          data.property.type = util.resolveType(property, name)
          innerClass = util.resolveInnerClass(data.property.type, property, refMap, mapping)
          data.innerClass = innerClass

      else if keyRefData and keyRefData.innnerSchema and keyRefData.innnerSchema.properties
        data.property.type = keyRefData.type
        property.properties = keyRefData.innnerSchema
        data.innerClass = util.resolveInnerClass(keyRefData.type, property, refMap, mapping)
      else
        data.property.type = 'Map'
    else
      data.property.type = mapping[property.type] ? property.type


  if data.property.type == "BigDecimal"
    data.property.decimalMax = property.maximum
    data.property.decimalMin = property.minimum
  else if data.property.type == "Long"
    data.property.max = property.maximum
    data.property.min = property.minimum


  data.property.kind = annotation + "(\"#{data.property.name}\")"
  data

util.resolveInnerClass = (name, property, refMap, mapping)->
  data = null
  #if the property has #ref and title we don't need innerClass
  #because it should be already mapped
  if property and not property.properties.title
    data = {}
    data.className = name
    data.classDescription = property.description
    aux = util.mapProperties(property, refMap, mapping)
    data.classMembers = aux.classMembers
  data



util.parseResource = (resource, parsed, annotations, mapping, schemas, parentUri = "", parentUriArgs = []) ->

  for m in resource.methods
    methodDef = {}
    methodDef.uri = parentUri + resource.relativeUri
    uriArgs = util.getUriParameter(resource, annotations.path, mapping)
    methodDef.args = parentUriArgs.concat(uriArgs)
    methodDef.args = methodDef.args.concat(util.getQueryparams(m.queryParameters, annotations.query, mapping))
    methodDef.args = methodDef.args.concat(util.parseForm(m.body, annotations, mapping))
    request = utilSchemas.parseBodyJson(m.body, "#{methodDef.uri} body")
    respond = utilSchemas.parseBodyJson(util.getBestValidResponse(m.responses).body, "#{methodDef.uri} response")
    type = null
    if request.title
      methodDef.args = methodDef.args ? []
      type = util.mapRequestResponse(request, schemas, mapping)
      methodDef.args.push {'kind': annotations.body, 'type': type, 'name': request.title.toLowerCase()}

    methodDef.request = request.title ? null
    responseType = util.mapRequestResponse(respond, schemas, mapping)
    methodDef.respondComment = respond.title
    if responseType
      methodDef.respond =  "<#{responseType}>"
    else
      methodDef.respond =  "<Response>"

    methodDef.annotation = m.method.toUpperCase()
    formData = _.find(methodDef.args, (arg)->
      arg.type is "InputStream" or arg.type is "TypedFile"
    )
    formEncoded = _.find(methodDef.args, (arg)->
      arg.kind.indexOf("@Field") > -1 or arg.kind.indexOf("@FormDataParam") > -1
    )
    if formData
      methodDef.consumes = "MediaType.MULTIPART_FORM_DATA"
      methodDef.additionalAnnotation = "Multipart"
    if formEncoded
      methodDef.additionalAnnotation = "FormUrlEncoded"

    mediaType = "application/json"
    if m.body and Object.keys(m.body)[0]
      mediaType = Object.keys(m.body)[0]
    if methodDef.annotation isnt "GET" and not type and not formData and not formEncoded
      methodDef.additionalAnnotation = "Headers({\"Content-type: #{mediaType}\"})"
    methodDef.name = m.method + resource.displayName
    methodDef.displayName = resource.displayName
    parsed.push methodDef
  if resource.resources
    for innerResource in resource.resources
      util.parseResource(innerResource, parsed, annotations, mapping, schemas, methodDef.uri, uriArgs)
  undefined

util.mapRequestResponse = (scheme, schemas, mapping)->
  type = ""
  switch scheme.type
    when "array"
      if scheme.items
        type = "List<Maps>"
        if scheme.items.$ref
          deref = Deref()
          normSchema = deref(scheme, schemas) #Expanded
          dataRef = deref.util.findByRef(normSchema.items.$ref, deref.refs)
          if dataRef and dataRef.title
            type = "List<#{utilText.capitalize(dataRef.title)}>"
          else
            type = "List"
        else if scheme.items.title
          type = "List<#{util.capitalize(scheme.title)}>"
        else if scheme.items.type
          primitiveType = mapping[scheme.items.type]
          if primitiveType
            type = "List<#{primitiveType}>"
      else
        type = "List"
    when "object"
      if scheme.properties
        type = utilText.capitalize(scheme.title)
      else
        type = "Map"
    else
      console.warn "-------WARNING the following scheme doesn't have type: -------"
      console.warn "#{JSON.stringify(scheme)} "

  type

util.getBestValidResponse = (responses) ->
  response = responses["304"] ?
    response = responses["204"] ?
    response = responses["201"] ?
    response = responses["200"] ?
    response

module.exports = util


