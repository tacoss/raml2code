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
  for resource in data.resources
    util.parseResource(resource, methodParse)

  model = {}
  model.methods = methodParse
  model.extra = data.extra if data.extra

  model.className = data.title.split(" ").join("")
  parsed.push {name: model.className + ".java" , model}
  parsed

module.exports = generator
