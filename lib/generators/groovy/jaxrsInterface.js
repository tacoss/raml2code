var commonHelpers, dirname, fs, generator, path, template, util, _;

fs = require('fs');

_ = require('lodash');

util = require('./util.js');

commonHelpers = require("../helpers/common.js").helpers();

path = require('path');

generator = {};

generator.helpers = commonHelpers;

dirname = path.dirname(__filename);

template = path.resolve(dirname, "tmpl/jaxrsResources.hbs");

generator.template = fs.readFileSync(template).toString();

generator.parser = function(data) {
  var annotations, first, k, mapping, methodParse, model, parsed, resource, resourceGroup, v, _i, _len, _ref;
  parsed = [];
  methodParse = [];
  annotations = {
    path: "@PathParam",
    query: "@QueryParam",
    body: "",
    multiPart: "@FormDataParam",
    form: "@FormDataParam"
  };
  mapping = {
    'string': "String",
    'boolean': "Boolean",
    'number': "BigDecimal",
    'integer': "Long",
    'array': "List",
    'object': "Map",
    'file': "InputStream"
  };
  _ref = data.resources;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    resource = _ref[_i];
    util.parseResource(resource, methodParse, annotations, mapping);
  }
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
