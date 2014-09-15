var commonHelpers, dirname, fs, generator, getBestValidResponse, getUriParameter, parseResource, parseSchema, path, template;

fs = require('fs');

commonHelpers = require("../helpers/common.js").helpers();

path = require('path');

generator = {};

generator.helpers = commonHelpers;

dirname = path.dirname(__filename);

template = path.resolve(dirname, "retrofitClient.hbs");

generator.template = fs.readFileSync(template).toString();

generator.parser = function(data) {
  var methodParse, model, parsed, resource, _i, _len, _ref;
  parsed = [];
  methodParse = [];
  _ref = data.resources;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    resource = _ref[_i];
    parseResource(resource, methodParse);
  }
  model = {};
  model.methods = methodParse;
  model.className = data.title.split(" ").join("");
  parsed.push({
    name: model.className,
    model: model
  });
  return parsed;
};

parseResource = function(resource, parsed, parentUri) {
  var innerResource, m, methodDef, request, respond, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _results;
  if (parentUri == null) {
    parentUri = "";
  }
  _ref = resource.methods;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    m = _ref[_i];
    methodDef = {};
    methodDef.args = getUriParameter(resource);
    respond = parseSchema(getBestValidResponse(m.responses).body);
    request = parseSchema(m.body);
    if (request.title) {
      methodDef.args = (_ref1 = methodDef.args) != null ? _ref1 : [];
      methodDef.args.push({
        'kind': '@Body',
        'type': request.title,
        'name': request.title.toLowerCase()
      });
    }
    methodDef.request = (_ref2 = request.title) != null ? _ref2 : null;
    methodDef.respond = respond.type === "array" ? "List<" + respond.title + ">" : respond.title;
    methodDef.annotation = m.method;
    methodDef.name = m.method + resource.displayName;
    methodDef.uri = parentUri + resource.relativeUri;
    parsed.push(methodDef);
  }
  if (resource.resources) {
    _ref3 = resource.resources;
    _results = [];
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      innerResource = _ref3[_j];
      _results.push(parseResource(innerResource, parsed, resource.relativeUri));
    }
    return _results;
  }
};

getUriParameter = function(resource) {
  var key, p, property, uriParameters;
  uriParameters = [];
  if (resource.uriParameters) {
    for (key in resource.uriParameters) {
      p = resource.uriParameters[key];
      property = {};
      property.name = key;
      switch (p.type) {
        case 'array':
          property.type = "List";
          property.name = "items";
          break;
        case 'string':
          property.type = "String";
          break;
        case 'boolean':
          property.type = "Boolean";
          break;
        case 'number':
          property.type = "Double";
          break;
        case 'integer':
          property.type = "Integer";
      }
      property.kind = "@Path";
      uriParameters.push(property);
    }
    return uriParameters;
  } else {
    return null;
  }
};

getBestValidResponse = function(responses) {
  var response, _ref, _ref1, _ref2;
  return response = (_ref = responses["304"]) != null ? _ref : response = (_ref1 = responses["201"]) != null ? _ref1 : response = (_ref2 = responses["200"]) != null ? _ref2 : response;
};

parseSchema = function(body) {
  var schema;
  schema = {};
  if (body && body['application/json']) {
    schema = JSON.parse(body['application/json'].schema);
  }
  return schema;
};

module.exports = generator;
