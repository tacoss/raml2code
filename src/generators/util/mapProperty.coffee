Deref = require('deref')
_ = require('lodash')
utilText = require('../util/text')
util = {}

util.mapProperties = (expandedSchema, refMap, mapping)->
  data = {}
  data.classMembers = []
  data.innerClasses = []

  if expandedSchema.properties and expandedSchema.properties.$ref
    keyRef = expandedSchema.properties.$ref
    expandedSchema.properties = Deref.util.findByRef(keyRef, refMap)

  for key of expandedSchema.properties
    property = expandedSchema.properties[key]
    #Canonical de-referencing and inline de-referencing
    #http://json-schema.org/latest/json-schema-core.html#anchor30
    if typeof property isnt 'string'
      property.required = true if expandedSchema.required and _.contains(expandedSchema.required, key)
      propParsed = util.mapProperty(property, key, '', mapping, refMap)
      data.classMembers.push propParsed.property
      data.innerClasses.push propParsed.innerClass if propParsed.innerClass

  data

util.mapProperty = (property, name, annotation, mapping, refMap)->
  data = {}
  data.property = {}
  data.property.name = name
  data.property.notNull = true if property.required
  data.property.size = []
  data.property.size.push {"name": "min", "value": property.minLength} if property.minLength
  data.property.size.push {"name": "max", "value": property.maxLength} if property.maxLength

  data.property.comment = property.description
  #if property has $ref resolve
  if property.items and property.items["$ref"]
    keyRef = property.items["$ref"]
    keyRefData = resolveTypeByRef(keyRef, refMap, name, true)
  else if property["$ref"]
    keyRef = property["$ref"]
    keyRefData = resolveTypeByRef(keyRef, refMap, name)
    data.property.type = keyRefData.type
    if keyRefData.innnerSchema.type
      property.type = keyRefData.innnerSchema.type
    else
      property.properties = keyRefData.innnerSchema
      data.innerClass = resolveInnerClass(keyRefData.type, property, refMap, mapping)
      property.type = resolveType(data.innerClass, name)

  data.property.comment = property.description

  switch property.type
    when 'array'
      auxType = "List"
      if keyRefData and keyRefData.innnerSchema.items isnt undefined
        primitiveType = mapping[keyRefData.innnerSchema.items.type]

        #if property doesn't has title we use primitive types
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
          data.property.type = resolveType(property, name)
          innerClass = resolveInnerClass(data.property.type, property, refMap, mapping)
          data.innerClass = innerClass

      else if keyRefData and keyRefData.innnerSchema and keyRefData.innnerSchema.properties
        data.property.type = keyRefData.type
        property.properties = keyRefData.innnerSchema
        data.innerClass = resolveInnerClass(keyRefData.type, property, refMap, mapping)
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

resolveTypeByRef = (keyRef, refMap, propertyName, isArray = false)->
  data = {}
  data.type = ""
  innerSchema = Deref.util.findByRef(keyRef, refMap)
  if innerSchema
    if isArray
      data.innnerSchema = {}
      data.innnerSchema.items = innerSchema
    else
      data.innnerSchema = innerSchema

    data.type = resolveType(innerSchema, propertyName)

  else if keyRef
    console.error "$ref not found: #{keyRef} RefMap.keys -> [#{Object.keys(refMap)}]"
    console.error JSON.stringify(refMap)

  data

resolveType = (schema, propertyName)->
  type = ""
  if schema
    if schema.title
      type = utilText.capitalize(schema.title)
    else
      type = utilText.capitalize(propertyName)

  type


resolveInnerClass = (name, property, refMap, mapping)->
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

module.exports = util