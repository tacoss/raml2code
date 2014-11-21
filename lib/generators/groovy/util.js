var deref, util;

deref = require('deref')();

util = {};

util.getUriParameter = function(resource, annotation) {
  var key, p, uriParameters;
  uriParameters = [];
  for (key in resource.uriParameters) {
    p = resource.uriParameters[key];
    uriParameters.push(util.mapProperty(p, key, annotation).property);
  }
  return uriParameters;
};

util.getQueryparams = function(queryParams, annotation) {
  var key, p, params;
  params = [];
  for (key in queryParams) {
    p = queryParams[key];
    params.push(util.mapProperty(p, key, annotation).property);
  }
  return params;
};

util.mapProperties = function(expandedSchema, refMap) {
  var data, key, propParsed, property;
  data = {};
  data.classMembers = [];
  data.innerClasses = [];
  for (key in expandedSchema.properties) {
    property = expandedSchema.properties[key];
    propParsed = util.mapProperty(property, key, '', refMap);
    data.classMembers.push(propParsed.property);
    if (propParsed.innerClass) {
      data.innerClasses.push(propParsed.innerClass);
    }
  }
  return data;
};

util.mapProperty = function(property, name, annotation, refMap) {
  var aux, auxType, data, innnerSchema;
  data = {};
  data.property = {};
  data.property.name = name;
  data.property.comment = property.description;
  switch (property.type) {
    case 'array':
      auxType = "List";
      if (property.items["$ref"]) {
        innnerSchema = refMap[property.items["$ref"].split("#")[0]];
        if (innnerSchema.title) {
          auxType += "<" + (util.capitalize(innnerSchema.title)) + ">";
        }
      }
      data.property.type = auxType;
      break;
    case 'object':
      if (property.properties) {
        data.property.type = util.capitalize(name);
        data.innerClass = {};
        data.innerClass.className = util.capitalize(name);
        data.innerClass.classDescription = property.description;
        aux = util.mapProperties(property);
        data.innerClass.classMembers = aux.classMembers;
      } else if (property["$ref"]) {
        innnerSchema = refMap[property["$ref"].split("#")[0]];
        data.property.type = util.capitalize(innnerSchema.title);
      } else {
        data.property.type = 'Map';
      }
      break;
    case 'string':
      data.property.type = "String";
      break;
    case 'boolean':
      data.property.type = "Boolean";
      break;
    case 'number':
      data.property.type = "Double";
      break;
    case 'integer':
      data.property.type = "Integer";
      break;
    case 'object':
      data.property.type = "Map";
  }
  data.property.kind = annotation + ("(\"" + data.property.name + "\")");
  return data;
};

util.parseResource = function(resource, parsed, annotations, parentUri, parentUriArgs) {
  var innerResource, m, methodDef, request, respond, uriArgs, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
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
    uriArgs = util.getUriParameter(resource, annotations.path);
    methodDef.args = parentUriArgs.concat(uriArgs);
    methodDef.args = methodDef.args.concat(util.getQueryparams(m.queryParameters, annotations.query));
    request = util.parseSchema(m.body, "" + methodDef.uri + " body");
    respond = util.parseSchema(util.getBestValidResponse(m.responses).body, "" + methodDef.uri + " response");
    if (request.title) {
      methodDef.args = (_ref1 = methodDef.args) != null ? _ref1 : [];
      methodDef.args.push({
        'kind': annotations.body,
        'type': request.title,
        'name': request.title.toLowerCase()
      });
    }
    methodDef.request = (_ref2 = request.title) != null ? _ref2 : null;
    methodDef.respond = respond.title;
    methodDef.annotation = m.method.toUpperCase();
    methodDef.name = m.method + resource.displayName;
    methodDef.displayName = resource.displayName;
    parsed.push(methodDef);
  }
  if (resource.resources) {
    _ref3 = resource.resources;
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      innerResource = _ref3[_j];
      util.parseResource(innerResource, parsed, annotations, methodDef.uri, uriArgs);
    }
  }
  return void 0;
};

util.parseSchema = function(body, meta) {
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

util.getBestValidResponse = function(responses) {
  var response, _ref, _ref1, _ref2, _ref3;
  return response = (_ref = responses["304"]) != null ? _ref : response = (_ref1 = responses["204"]) != null ? _ref1 : response = (_ref2 = responses["201"]) != null ? _ref2 : response = (_ref3 = responses["200"]) != null ? _ref3 : response;
};

util.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

util.sanitize = function(str) {
  var aux, res;
  aux = str.split(".");
  res = '';
  aux.forEach(function(it) {
    return res += util.capitalize(it);
  });
  return res;
};

module.exports = util;
