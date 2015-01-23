var commonHelpers, customAdapter, generator, parseResource, utilSchemas, _;

_ = require('lodash');

utilSchemas = require('../util/schemas');

parseResource = require('../util/parseResource');

commonHelpers = require("../helpers/common").helpers();

generator = {};

generator.helpers = commonHelpers;

generator.template = require("./tmpl/jaxrsResources.hbs");

customAdapter = function(method, methodParsed) {
  if (methodParsed.formData) {
    return methodParsed.consumes = "MediaType.MULTIPART_FORM_DATA";
  }
};

generator.parser = function(data) {
  var first, k, methodParse, model, options, parsed, resource, resourceGroup, schemas, v, _i, _len, _ref;
  parsed = [];
  schemas = utilSchemas.loadSchemas(data);
  options = {
    annotations: {
      path: "@PathParam",
      query: "@QueryParam",
      body: "",
      multiPart: "@FormDataParam",
      form: "@FormDataParam"
    },
    mapping: {
      'string': "String",
      'boolean': "Boolean",
      'number': "BigDecimal",
      'integer': "Long",
      'array': "List",
      'object': "Map",
      'file': "InputStream"
    }
  };
  methodParse = [];
  _ref = data.resources;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    resource = _ref[_i];
    methodParse.push(parseResource(resource, options, schemas, customAdapter));
  }
  methodParse = _.flatten(methodParse);
  resourceGroup = _.groupBy(methodParse, function(method) {
    return method.displayName;
  });
  if (data.extra) {
    data.extra["package"] = "" + data.extra["package"] + "." + data.version;
    data.extra.importPojos = "" + data.extra.importPojos + "." + data.version;
  }
  for (k in resourceGroup) {
    v = resourceGroup[k];
    model = {};
    model.extra = data.extra;
    first = _.first(v);
    model.uri = first.uri;
    model.className = "" + first.displayName + "Resource";
    model.methods = v;
    parsed.push({
      name: "" + data.version + "/" + model.className + ".groovy",
      model: model
    });
  }
  return parsed;
};

module.exports = generator;
