var Deref, util, _;

_ = require('lodash');

Deref = require('deref');

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
  var data, key, keyRef, propParsed, property;
  data = {};
  data.classMembers = [];
  data.innerClasses = [];
  if (expandedSchema.properties && expandedSchema.properties.$ref) {
    keyRef = expandedSchema.properties.$ref;
    expandedSchema.properties = Deref.util.findByRef(keyRef, refMap);
  }
  for (key in expandedSchema.properties) {
    property = expandedSchema.properties[key];
    if (typeof property !== 'string') {
      if (expandedSchema.required && _.contains(expandedSchema.required, key)) {
        property.required = true;
      }
      propParsed = util.mapProperty(property, key, '', mapping, refMap);
      data.classMembers.push(propParsed.property);
      if (propParsed.innerClass) {
        data.innerClasses.push(propParsed.innerClass);
      }
    }
  }
  return data;
};

util.resolveTypeByRef = function(keyRef, refMap, propertyName, isArray) {
  var data, innerSchema;
  if (isArray == null) {
    isArray = false;
  }
  data = {};
  data.type = "";
  innerSchema = Deref.util.findByRef(keyRef, refMap);
  if (innerSchema) {
    if (isArray) {
      data.innnerSchema = {};
      data.innnerSchema.items = innerSchema;
    } else {
      data.innnerSchema = innerSchema;
    }
    data.type = util.resolveType(innerSchema, propertyName);
  } else if (keyRef) {
    console.error("$ref not found: " + keyRef + " RefMap.keys -> [" + (Object.keys(refMap)) + "]");
    console.error(JSON.stringify(refMap));
  }
  return data;
};

util.resolveType = function(schema, propertyName) {
  var type;
  type = "";
  if (schema) {
    if (schema.title) {
      type = util.capitalize(schema.title);
    } else {
      type = util.capitalize(propertyName);
    }
  }
  return type;
};

util.mapProperty = function(property, name, annotation, mapping, refMap) {
  var auxType, data, innerClass, keyRef, keyRefData, primitiveType, _ref;
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
    keyRefData = keyRefData = util.resolveTypeByRef(keyRef, refMap, name, true);
  } else if (property["$ref"]) {
    keyRef = property["$ref"];
    keyRefData = util.resolveTypeByRef(keyRef, refMap, name);
    data.property.type = keyRefData.type;
    if (keyRefData.innnerSchema.type) {
      property.type = keyRefData.innnerSchema.type;
    } else {
      property.properties = keyRefData.innnerSchema;
      data.innerClass = util.resolveInnerClass(keyRefData.type, property, refMap, mapping);
      property.type = util.resolveType(data.innerClass, name);
    }
  }
  data.property.comment = property.description;
  switch (property.type) {
    case 'array':
      auxType = "List";
      if (keyRefData && keyRefData.innnerSchema.items !== void 0) {
        primitiveType = mapping[keyRefData.innnerSchema.items.type];
        if (keyRefData.innnerSchema.items.title) {
          auxType += "<" + keyRefData.type + ">";
        } else if (primitiveType) {
          auxType += "<" + primitiveType + ">";
        }
      }
      data.property.type = auxType;
      break;
    case 'object':
      if (property.properties) {
        if (keyRefData && keyRefData.type) {
          data.property.type = keyRefData.type;
        } else {
          data.property.type = util.resolveType(property, name);
          innerClass = util.resolveInnerClass(data.property.type, property, refMap, mapping);
          data.innerClass = innerClass;
        }
      } else if (keyRefData && keyRefData.innnerSchema && keyRefData.innnerSchema.properties) {
        data.property.type = keyRefData.type;
        property.properties = keyRefData.innnerSchema;
        data.innerClass = util.resolveInnerClass(keyRefData.type, property, refMap, mapping);
      } else {
        data.property.type = 'Map';
      }
      break;
    default:
      data.property.type = (_ref = mapping[property.type]) != null ? _ref : property.type;
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

util.resolveInnerClass = function(name, property, refMap, mapping) {
  var aux, data;
  data = null;
  if (property && !property.properties.title) {
    data = {};
    data.className = name;
    data.classDescription = property.description;
    aux = util.mapProperties(property, refMap, mapping);
    data.classMembers = aux.classMembers;
  }
  return data;
};

util.loadSchemas = function(data) {
  var row, schema, schemaName, schemas, _i, _len, _ref;
  schemas = [];
  _ref = data.schemas;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    row = _ref[_i];
    for (schemaName in row) {
      schema = util.parseSchema(row[schemaName], "Trouble parsing schema: " + schemaName);
      schemas.push(schema);
    }
  }
  return schemas;
};

util.parseResource = function(resource, parsed, annotations, mapping, schemas, parentUri, parentUriArgs) {
  var formData, innerResource, m, methodDef, request, respond, responseType, type, uriArgs, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
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
    request = util.parseBodyJson(m.body, "" + methodDef.uri + " body");
    respond = util.parseBodyJson(util.getBestValidResponse(m.responses).body, "" + methodDef.uri + " response");
    if (request.title) {
      methodDef.args = (_ref1 = methodDef.args) != null ? _ref1 : [];
      type = util.mapRequestResponse(request, schemas, mapping);
      methodDef.args.push({
        'kind': annotations.body,
        'type': type,
        'name': request.title.toLowerCase()
      });
    }
    methodDef.request = (_ref2 = request.title) != null ? _ref2 : null;
    responseType = util.mapRequestResponse(respond, schemas, mapping);
    methodDef.respondComment = respond.title;
    if (responseType) {
      methodDef.respond = "<" + responseType + ">";
    } else {
      methodDef.respond = "<Response>";
    }
    methodDef.annotation = m.method.toUpperCase();
    formData = _.find(methodDef.args, function(arg) {
      return arg.type === "InputStream" || arg.type === "TypedFile";
    });
    if (formData) {
      methodDef.consumes = "MediaType.MULTIPART_FORM_DATA";
      methodDef.additionalAnnotation = "Multipart";
    }
    methodDef.name = m.method + resource.displayName;
    methodDef.displayName = resource.displayName;
    parsed.push(methodDef);
  }
  if (resource.resources) {
    _ref3 = resource.resources;
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      innerResource = _ref3[_j];
      util.parseResource(innerResource, parsed, annotations, mapping, schemas, methodDef.uri, uriArgs);
    }
  }
  return void 0;
};

util.mapRequestResponse = function(scheme, schemas, mapping) {
  var dataRef, deref, normSchema, primitiveType, type;
  type = "";
  switch (scheme.type) {
    case "array":
      if (scheme.items) {
        type = "List<Maps>";
        if (scheme.items.$ref) {
          deref = Deref();
          normSchema = deref(scheme, schemas);
          dataRef = deref.util.findByRef(normSchema.items.$ref, deref.refs);
          if (dataRef && dataRef.title) {
            type = "List<" + (util.capitalize(dataRef.title)) + ">";
          } else {
            type = "List";
          }
        } else if (scheme.items.title) {
          type = "List<" + (util.capitalize(scheme.title)) + ">";
        } else if (scheme.items.type) {
          primitiveType = mapping[scheme.items.type];
          if (primitiveType) {
            type = "List<" + primitiveType + ">";
          }
        }
      } else {
        type = "List";
      }
      break;
    case "object":
      if (scheme.properties) {
        type = util.capitalize(scheme.title);
      } else {
        type = "Map";
      }
      break;
    default:
      console.warn("-------WARNING the following scheme doesn't have type: -------");
      console.warn("" + (JSON.stringify(scheme)) + " ");
  }
  return type;
};

util.parseBodyJson = function(body, meta) {
  var schema;
  if (meta == null) {
    meta = '';
  }
  schema = {};
  if (body && body['application/json']) {
    schema = util.parseSchema(body['application/json'].schema, meta);
  }
  return schema;
};

util.parseSchema = function(raw, meta) {
  var e, schema;
  if (meta == null) {
    meta = '';
  }
  schema = {};
  if (raw) {
    try {
      schema = JSON.parse(raw);
    } catch (_error) {
      e = _error;
      console.log("-----JSON ERROR on " + meta + "---------");
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
