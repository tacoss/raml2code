var commonHelpers, customAdapter, dirname, fs, generator, parseResource, path, template, utilSchemas, _;

fs = require('fs');

commonHelpers = require("../helpers/common").helpers();

utilSchemas = require('../util/schemas');

parseResource = require('../util/parseResource');

console.log(parseResource);

path = require('path');

_ = require('lodash');

generator = {};

generator.helpers = commonHelpers;

dirname = path.dirname(__filename);

template = path.resolve(dirname, "tmpl/retrofitClient.hbs");

generator.template = fs.readFileSync(template).toString();

customAdapter = function(method, methodParsed) {
  var mediaType;
  if (methodParsed.formData) {
    methodParsed.additionalAnnotation = "Multipart";
  }
  if (methodParsed.formEncoded) {
    methodParsed.additionalAnnotation = "FormUrlEncoded";
  }
  mediaType = "application/json";
  if (method.body && Object.keys(method.body)[0]) {
    mediaType = Object.keys(method.body)[0];
  }
  if (methodParsed.annotation === "DELETE") {
    return methodParsed.additionalAnnotation = "Headers({\"Content-type: " + mediaType + "\"})";
  }
};

generator.parser = function(data) {
  var methodParse, model, options, parsed, resource, schemas, _i, _len, _ref;
  parsed = [];
  schemas = utilSchemas.loadSchemas(data);
  options = {
    annotations: {
      path: "@Path",
      query: "@Query",
      body: "@Body",
      multiPart: "@Part",
      form: "@Field"
    },
    mapping: {
      'string': "String",
      'boolean': "Boolean",
      'number': "BigDecimal",
      'integer': "Long",
      'array': "List",
      'object': "Map",
      'file': "TypedFile"
    }
  };
  methodParse = [];
  _ref = data.resources;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    resource = _ref[_i];
    methodParse.push(parseResource(resource, options, schemas, customAdapter));
  }
  methodParse = _.flatten(methodParse);
  model = {};
  model.methods = methodParse;
  model.version = data.version;
  if (data.extra) {
    data.extra["package"] = "" + data.extra["package"] + "." + data.version;
    data.extra.importPojos = "" + data.extra.importPojos + "." + data.version;
    model.extra = data.extra;
  }
  model.className = data.title.split(" ").join("");
  parsed.push({
    name: "" + data.version + "/" + model.className + ".java",
    model: model
  });
  return parsed;
};

module.exports = generator;
