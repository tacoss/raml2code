fs = require('fs')
_ = require('lodash')
util = require('./util.js')
commonHelpers = require("../helpers/common.js").helpers()
path = require('path')

generator = {}
generator.helpers = commonHelpers
dirname = path.dirname(__filename)
template = path.resolve(dirname, "tmpl/jaxrsResources.hbs")
generator.template = fs.readFileSync(template).toString()

generator.parser = (data) ->
  parsed = []
  methodParse = []
  for resource in data.resources
    util.parseResource(resource, methodParse)

  resourceGroup = _.groupBy(methodParse, (method) ->
    method.displayName
  )

  for k,v of resourceGroup
    model = {}
    model.extra = data.extra if data.extra
    first = _.first(v)
    model.uri = first.uri
    model.className = "#{first.displayName}Resource"
    model.methods = v
    parsed.push {name: model.className + ".groovy" , model}
  parsed


module.exports = generator
