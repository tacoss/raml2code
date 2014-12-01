var deref, util, _;

_ = require('lodash');

deref = require('deref')();

util = {};

util.getUriParameter = function(resource, annotation, mapping) {
  var key, p, uriParameters;
  uriParameters = [];
  for (key in resource.uriParameters) {
    p = resource.uriParameters[key];
    uriParameters.push(util.mapProperty(p, key, annotation, mapping).property);
  }
  return uriParameters;
};

util.getQueryparams = function(queryParams, annotation, mapping) {
  var key, p, params;
  params = [];
  for (key in queryParams) {
    p = queryParams[key];
    params.push(util.mapProperty(p, key, annotation, mapping).property);
  }
  return params;
};

util.parseForm = function(body, annotations, mapping) {
  var annotation, args, data, form, key, p, parsedProperty;
  args = [];
  if (body && (body['multipart/form-data'] || body["application/x-www-form-urlencoded"])) {
    form = body["multipart/form-data"] || body["application/x-www-form-urlencoded"];
    if (body["multipart/form-data"] !== void 0) {
      annotation = annotations.multiPart;
    } else {
      annotation = annotations.form;
    }
    data = form.formParameters || form.formParameters;
    for (key in data) {
      p = data[key];
      parsedProperty = util.mapProperty(p, key, annotation, mapping).property;
      args.push(parsedProperty);
      if (parsedProperty.type === "InputStream") {
        args.push({
          name: parsedProperty.name + "Data",
          type: "FormDataContentDisposition",
          kind: annotation + ("(\"" + parsedProperty.name + "\")")
        });
      }
    }
  }
  return args;
};

util.mapProperties = function(expandedSchema, refMap, mapping) {
  var data, key, propParsed, property;
  data = {};
  data.classMembers = [];
  data.innerClasses = [];
  for (key in expandedSchema.properties) {
    property = expandedSchema.properties[key];
    if (expandedSchema.required && _.contains(expandedSchema.required, key)) {
      property.required = true;
    }
    propParsed = util.mapProperty(property, key, '', mapping, refMap);
    data.classMembers.push(propParsed.property);
    if (propParsed.innerClass) {
      data.innerClasses.push(propParsed.innerClass);
    }
  }
  return data;
};

util.resolveTypeByRef = function(keyRef, refMap) {
  var innnerSchema, type;
  innnerSchema = deref.util.findByRef(keyRef, refMap);
  type = "";
  if (innnerSchema && innnerSchema.title) {
    type = util.capitalize(innnerSchema.title);
  } else if (keyRef) {
    console.error("$ref not found: " + keyRef + " }");
  }
  return type;
};

util.mapProperty = function(property, name, annotation, mapping, refMap) {
  var aux, auxType, data, keyRef;
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
    keyRef = property.items["$ref"];
  } else if (property["$ref"]) {
    keyRef = property["$ref"];
  }
  switch (property.type) {
    case 'array':
      auxType = "List";
      if (keyRef) {
        auxType += "<" + (util.resolveTypeByRef(keyRef, refMap)) + ">";
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
        aux = util.mapProperties(property, refMap, mapping);
        data.innerClass.classMembers = aux.classMembers;
      } else if (keyRef) {
        data.property.type = util.resolveTypeByRef(keyRef, refMap);
      } else {
        data.property.type = 'Map';
      }
      break;
    case 'string':
      data.property.type = mapping[property.type];
      break;
    case 'boolean':
      data.property.type = mapping[property.type];
      break;
    case 'number':
      data.property.type = mapping[property.type];
      break;
    case 'integer':
      data.property.type = mapping[property.type];
      break;
    case 'file':
      data.property.type = mapping[property.type];
  }
  if (data.property.type === "BigDecimal") {
    data.property.decimalMax = property.maximum;
    data.property.decimalMin = property.minimum;
  } else if (data.property.type === "Long") {
    data.property.max = property.maximum;
    data.property.min = property.minimum;
  }
  data.property.kind = annotation + ("(\"" + data.property.name + "\")");
  return data;
};

util.parseResource = function(resource, parsed, annotations, mapping, parentUri, parentUriArgs) {
  var formData, innerResource, m, methodDef, request, respond, uriArgs, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
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
    uriArgs = util.getUriParameter(resource, annotations.path, mapping);
    methodDef.args = parentUriArgs.concat(uriArgs);
    methodDef.args = methodDef.args.concat(util.getQueryparams(m.queryParameters, annotations.query, mapping));
    methodDef.args = methodDef.args.concat(util.parseForm(m.body, annotations, mapping));
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
    formData = _.find(methodDef.args, function(arg) {
      return arg.type === "InputStream";
    });
    if (formData) {
      methodDef.consumes = "MediaType.MULTIPART_FORM_DATA";
    }
    methodDef.name = m.method + resource.displayName;
    methodDef.displayName = resource.displayName;
    parsed.push(methodDef);
  }
  if (resource.resources) {
    _ref3 = resource.resources;
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      innerResource = _ref3[_j];
      util.parseResource(innerResource, parsed, annotations, mapping, methodDef.uri, uriArgs);
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
