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
  if (data.extra) {
    model.extra = data.extra;
  }
  model.className = data.title.split(" ").join("");
  parsed.push({
    name: model.className + ".java",
    model: model
  });
  return parsed;
};

parseResource = function(resource, parsed, parentUri, parentUriArgs) {
  var innerResource, m, methodDef, request, respond, uriArgs, _i, _j, _len, _len1, _ref, _ref1, _ref2;
  if (parentUri == null) {
    parentUri = "";
  }
  if (parentUriArgs == null) {
    parentUriArgs = [];
  }
  _ref = resource.methods;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    m = _ref[_i];
    methodDef = {};
    methodDef.uri = parentUri + resource.relativeUri;
    uriArgs = getUriParameter(resource);
    methodDef.args = parentUriArgs.concat(uriArgs);
    request = parseSchema(m.body, "" + methodDef.uri + " body");
    respond = parseSchema(getBestValidResponse(m.responses).body, "" + methodDef.uri + " response");
    if (request.title) {
      methodDef.args.push({
        'kind': '@Body',
        'type': request.title,
        'name': request.title.toLowerCase()
      });
    }
    methodDef.request = (_ref1 = request.title) != null ? _ref1 : null;
    methodDef.respond = respond.type === "array" ? "List<" + respond.title + ">" : respond.title;
    methodDef.annotation = m.method.toUpperCase();
    methodDef.name = m.method + resource.displayName;
    parsed.push(methodDef);
  }
  if (resource.resources) {
    _ref2 = resource.resources;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      innerResource = _ref2[_j];
      parseResource(innerResource, parsed, resource.relativeUri, uriArgs);
    }
  }
  return void 0;
};

getUriParameter = function(resource) {
  var key, p, property, uriParameters;
  uriParameters = [];
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
    property.kind = "@Path(\"" + property.name + "\")";
    uriParameters.push(property);
  }
  return uriParameters;
};

getBestValidResponse = function(responses) {
  var response, _ref, _ref1, _ref2, _ref3;
  return response = (_ref = responses["304"]) != null ? _ref : response = (_ref1 = responses["204"]) != null ? _ref1 : response = (_ref2 = responses["201"]) != null ? _ref2 : response = (_ref3 = responses["200"]) != null ? _ref3 : response;
};

parseSchema = function(body, meta) {
  var e, schema;
  if (meta == null) {
    meta = '';
  }
  schema = {};
  if (body && body['application/json']) {
    try {
      schema = JSON.parse(body['application/json'].schema);
    } catch (_error) {
      e = _error;
      console.log("-----JSON ERROR on " + meta + "---------");
      console.log(body['application/json'].schema);
      throw e;
    }
  }
  return schema;
};

module.exports = generator;
