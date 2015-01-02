var getBestValidResponse, getQueryParams, getUriParameter, mapRequestResponse, parseForm, util, utilMapProperty, utilSchemas, utilText, _;

utilMapProperty = require('../util/mapProperty');

utilSchemas = require('../util/schemas');

mapRequestResponse = require('../util/mapRequestResponse');

utilText = require('../util/text');

_ = require('lodash');

util = {};

util.parseResource = function(resource, options, schemas, customAdapter, parentUri, parentUriArgs) {
  var innerResource, m, methodDef, parsed, request, respond, responseType, type, uriArgs, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
  if (customAdapter == null) {
    customAdapter = null;
  }
  if (parentUri == null) {
    parentUri = "";
  }
  if (parentUriArgs == null) {
    parentUriArgs = [];
  }
  parsed = [];
  _ref = resource.methods;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    m = _ref[_i];
    methodDef = {};
    methodDef.uri = parentUri + resource.relativeUri;
    methodDef.annotation = m.method.toUpperCase();
    methodDef.name = m.method + resource.displayName;
    methodDef.displayName = resource.displayName;
    uriArgs = getUriParameter(resource, options.annotations.path, options.mapping);
    methodDef.args = parentUriArgs.concat(uriArgs);
    methodDef.args = methodDef.args.concat(getQueryParams(m.queryParameters, options.annotations.query, options.mapping));
    methodDef.args = methodDef.args.concat(parseForm(m.body, options.annotations, options.mapping));
    request = utilSchemas.parseBodyJson(m.body, "" + methodDef.uri + " body");
    respond = utilSchemas.parseBodyJson(getBestValidResponse(m.responses).body, "" + methodDef.uri + " response");
    if (request.title) {
      methodDef.args = (_ref1 = methodDef.args) != null ? _ref1 : [];
      type = mapRequestResponse(request, schemas, options.mapping);
      methodDef.args.push({
        'kind': options.annotations.body,
        'type': type,
        'name': request.title.toLowerCase()
      });
    }
    methodDef.request = (_ref2 = request.title) != null ? _ref2 : null;
    responseType = mapRequestResponse(respond, schemas, options.mapping);
    methodDef.respondComment = respond.title;
    if (responseType) {
      methodDef.respond = responseType;
    } else {
      methodDef.respond = "Response";
    }
    methodDef.formData = _.find(methodDef.args, function(arg) {
      return arg.type === "InputStream" || arg.type === "TypedFile";
    });
    methodDef.formEncoded = _.find(methodDef.args, function(arg) {
      return arg.kind.indexOf("@Field") > -1 || arg.kind.indexOf("@FormDataParam") > -1;
    });
    if (customAdapter && typeof customAdapter === 'function') {
      customAdapter(m, methodDef);
    }
    parsed.push(methodDef);
  }
  if (resource.resources) {
    _ref3 = resource.resources;
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      innerResource = _ref3[_j];
      parsed = parsed.concat(util.parseResource(innerResource, options, schemas, customAdapter, methodDef.uri, uriArgs));
    }
  }
  return parsed;
};

getUriParameter = function(resource, annotation, mapping) {
  var key, p, uriParameters;
  uriParameters = [];
  for (key in resource.uriParameters) {
    p = resource.uriParameters[key];
    uriParameters.push(utilMapProperty.mapProperty(p, key, annotation, mapping).property);
  }
  return uriParameters;
};

getQueryParams = function(queryParams, annotation, mapping) {
  var key, p, params;
  params = [];
  for (key in queryParams) {
    p = queryParams[key];
    params.push(utilMapProperty.mapProperty(p, key, annotation, mapping).property);
  }
  return params;
};

parseForm = function(body, annotations, mapping) {
  var annotation, args, data, form, key, p, parsedProperty;
  args = [];
  form = body ? body["multipart/form-data"] || body["application/x-www-form-urlencoded"] : void 0;
  if (form) {
    if (body["multipart/form-data"] !== void 0) {
      annotation = annotations.multiPart;
    } else {
      annotation = annotations.form;
    }
    data = form.formParameters || form.formParameters;
    for (key in data) {
      p = data[key];
      parsedProperty = utilMapProperty.mapProperty(p, key, annotation, mapping).property;
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

getBestValidResponse = function(responses) {
  var response, _ref, _ref1, _ref2, _ref3;
  return response = (_ref = responses["304"]) != null ? _ref : response = (_ref1 = responses["204"]) != null ? _ref1 : response = (_ref2 = responses["201"]) != null ? _ref2 : response = (_ref3 = responses["200"]) != null ? _ref3 : response;
};

module.exports = util.parseResource;
