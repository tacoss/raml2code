var deref, util, _;

_ = require('lodash');

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
    if (expandedSchema.required && _.contains(expandedSchema.required, key)) {
      property.required = true;
    }
    propParsed = util.mapProperty(property, key, '', refMap);
    data.classMembers.push(propParsed.property);
    if (propParsed.innerClass) {
      data.innerClasses.push(propParsed.innerClass);
    }
  }
  return data;
};

util.mapProperty = function(property, name, annotation, refMap) {
  var aux, auxType, data, innnerSchema, keyRef;
  data = {};
  data.property = {};
  data.property.name = name;
  if (property.required) {
    data.property.notNull = true;
  }
  data.property.size = [];
  if (property.minLength) {
    data.property.size.push({
      "name": "min",
      "value": property.minLength
    });
  }
  if (property.maxLength) {
    data.property.size.push({
      "name": "max",
      "value": property.maxLength
    });
  }
  data.property.comment = property.description;
  if (property.items && property.items["$ref"]) {
    keyRef = property.items["$ref"].split("#")[0];
  } else if (property["$ref"]) {
    keyRef = property["$ref"].split("#")[0];
  }
  switch (property.type) {
    case 'array':
      auxType = "List";
      innnerSchema = refMap[keyRef];
      if (innnerSchema && innnerSchema.title) {
        auxType += "<" + (util.capitalize(innnerSchema.title)) + ">";
      } else {
        console.error("$ref not found: " + keyRef);
      }
      data.property.type = auxType;
      break;
    case 'object':
      if (property.properties) {
        if (!property.title) {
          console.error("Please provide a title for property:", name);
        }
        data.property.type = util.capitalize(property.title);
        data.innerClass = {};
        data.innerClass.className = data.property.type;
        data.innerClass.classDescription = property.description;
        aux = util.mapProperties(property, refMap);
        data.innerClass.classMembers = aux.classMembers;
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
      data.property.type = "BigDecimal";
      break;
    case 'integer':
      data.property.type = "Integer";
  }
  if (property["$ref"]) {
    innnerSchema = refMap[keyRef];
    if (innnerSchema && innnerSchema.title) {
      data.property.type = util.capitalize(innnerSchema.title);
    } else {
      console.error("$ref not found: " + keyRef);
    }
  }
  if (data.property.type === "BigDecimal") {
    data.property.decimalMax = property.maximum;
    data.property.decimalMin = property.minimum;
  } else if (data.property.type === "Integer") {
    data.property.max = property.maximum;
    data.property.min = property.minimum;
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
        'type': util.capitalize(request.title),
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
