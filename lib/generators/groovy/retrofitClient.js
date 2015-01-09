var arrayFromMask, commonHelpers, customAdapter, dirname, fs, generator, parseResource, path, resolveArrayByMask, template, utilSchemas, _;

fs = require('fs');

commonHelpers = require("../helpers/common").helpers();

utilSchemas = require('../util/schemas');

parseResource = require('../util/parseResource');

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
  var d, method, methodParse, methodParsePermuted, model, newArgs, notReqArgs, options, parsed, permutations, permuted, reqArgs, resource, schemas, shallowMethod, _i, _j, _len, _len1, _ref;
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
  methodParsePermuted = [];
  for (_j = 0, _len1 = methodParse.length; _j < _len1; _j++) {
    method = methodParse[_j];
    notReqArgs = _.filter(method.args, function(it) {
      return it.required === false;
    });
    if (notReqArgs && notReqArgs.length > 0) {
      reqArgs = _.difference(method.args, notReqArgs);
      permutations = (2 * notReqArgs.length) - 1;
      while (permutations >= 0) {
        shallowMethod = _.cloneDeep(method);
        d = arrayFromMask(permutations);
        permuted = resolveArrayByMask(d, notReqArgs);
        newArgs = reqArgs.concat(permuted);
        shallowMethod.args = newArgs;
        methodParsePermuted.push(shallowMethod);
        permutations--;
      }
    } else {
      methodParsePermuted.push(method);
    }
  }
  model = {};
  model.methods = methodParsePermuted;
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

arrayFromMask = function(nMask) {
  var aFromMask, nShifted;
  if (nMask > 0x7fffffff || nMask < -0x80000000) {
    throw new TypeError("arrayFromMask - out of range");
  }
  nShifted = nMask;
  aFromMask = [];
  while (nShifted) {
    aFromMask.push(Boolean(nShifted & 1));
    nShifted >>>= 1;
  }
  return aFromMask;
};

resolveArrayByMask = function(mask, array) {
  var i, j, res;
  res = [];
  i = array.length - 1;
  j = 0;
  while (i >= 0) {
    if (mask[j]) {
      res.push(array[i]);
    }
    i--;
    j++;
  }
  return res;
};

module.exports = generator;
