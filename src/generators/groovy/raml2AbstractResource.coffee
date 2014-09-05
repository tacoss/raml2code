fs = require('fs')
commonHelpers = require("../helpers/common.js").helpers()

module.exports.generator = ->
  capitalize = (str)->
    str.charAt(0).toUpperCase() + str.slice(1)

  generator = {}
  generator.helpers = commonHelpers
  generator.helpers.push { name: "parseSchema", fn: (context, options) ->
    schema = JSON.parse(this.schema)
    return options.fn(schema)
  }


  generator.template = fs.readFileSync(__dirname + "/AbstractResource.hbs").toString()
  generator.parser = (data)->
    parsed = []
    for r in data.resources
      parseResource(r, parsed)
    for p in parsed
      p.model.extra = data.extra if data.extra
    parsed

  parseMethods = (methods)->
    model = {}
    model.responses = []
    model.methods = []
    for m in methods
      console.log "====", m
      methodName = m.method
      for statusCode of m.responses
        console.log '->>>', statusCode
        rsc = m.responses[statusCode]
        if rsc and rsc.body
          schema = JSON.parse(rsc.body['application/json'].schema)
          console.log schema
          console.log schema.title
          model.responses.push {methodName, statusCode, type: schema.title}

      model.methods.push {methodName, argument : null, description: m.description}

    model



  parseResource = (data, parsed, parentUri = "")->
    model = {}
    model.className = "#{data.displayName}#{capitalize(data.type)}AbstractResource"
    model.classDescription = data.description
    model.uri = "#{parentUri}#{data.relativeUri}"
    model.relativeUriPathSegments = data.relativeUriPathSegments
    model.classMethods = parseMethods(data.methods)

    model.classDescription = data.description ? ""
    if data.resources
      for r in data.resources
        parseResource(r, parsed, model.uri)

    parsed.push {name :"#{model.className}.groovy", model}
  generator