fs = require('fs')
commonHelpers = require("../helpers/common.js").helpers()
util = require('./util.js')
path = require('path')

generator = {}
generator.helpers = commonHelpers
dirname = path.dirname(__filename)
template = path.resolve(dirname, "tmpl/retrofitClient.hbs")
generator.template = fs.readFileSync(template).toString()

generator.parser = (data) ->
  parsed = []
  methodParse = []
  annotations =
    path: "@Path"
    query: "@Query"
    body: "@Body"
  for resource in data.resources
    util.parseResource(resource, methodParse, annotations)

  model = {}
  model.methods = methodParse
  model.extra = data.extra if data.extra

  model.className = data.title.split(" ").join("")
  parsed.push {name: model.className + ".java" , model}
  parsed

module.exports = generator
