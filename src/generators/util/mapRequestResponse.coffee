utilText = require('../util/text')
_ = require('lodash')
Deref = require('deref')
util = {}

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

module.exports = util.mapRequestResponse