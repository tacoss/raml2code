var commonHelpers, fs;

fs = require('fs');

commonHelpers = require("../helpers/common.js").helpers();

module.exports.generator = function() {
  var capitalize, generator, parseMethods, parseResource;
  capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  generator = {};
  generator.helpers = commonHelpers;
  generator.helpers.push({
    name: "parseSchema",
    fn: function(context, options) {
      var schema;
      schema = JSON.parse(this.schema);
      return options.fn(schema);
    }
  });
  generator.template = fs.readFileSync(__dirname + "/AbstractResource.hbs").toString();
  generator.parser = function(data) {
    var p, parsed, r, _i, _j, _len, _len1, _ref;
    parsed = [];
    _ref = data.resources;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      r = _ref[_i];
      parseResource(r, parsed);
    }
    for (_j = 0, _len1 = parsed.length; _j < _len1; _j++) {
      p = parsed[_j];
      if (data.extra) {
        p.model.extra = data.extra;
      }
    }
    return parsed;
  };
  parseMethods = function(methods) {
    var m, methodName, model, rsc, schema, statusCode, _i, _len;
    model = {};
    model.responses = [];
    model.methods = [];
    for (_i = 0, _len = methods.length; _i < _len; _i++) {
      m = methods[_i];
      console.log("====", m);
      methodName = m.method;
      for (statusCode in m.responses) {
        console.log('->>>', statusCode);
        rsc = m.responses[statusCode];
        if (rsc && rsc.body) {
          schema = JSON.parse(rsc.body['application/json'].schema);
          console.log(schema);
          console.log(schema.title);
          model.responses.push({
            methodName: methodName,
            statusCode: statusCode,
            type: schema.title
          });
        }
      }
      model.methods.push({
        methodName: methodName,
        argument: null,
        description: m.description
      });
    }
    return model;
  };
  parseResource = function(data, parsed, parentUri) {
    var model, r, _i, _len, _ref, _ref1;
    if (parentUri == null) {
      parentUri = "";
    }
    model = {};
    model.className = "" + data.displayName + (capitalize(data.type)) + "AbstractResource";
    model.classDescription = data.description;
    model.uri = "" + parentUri + data.relativeUri;
    model.relativeUriPathSegments = data.relativeUriPathSegments;
    model.classMethods = parseMethods(data.methods);
    model.classDescription = (_ref = data.description) != null ? _ref : "";
    if (data.resources) {
      _ref1 = data.resources;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        r = _ref1[_i];
        parseResource(r, parsed, model.uri);
      }
    }
    return parsed.push({
      name: "" + model.className + ".groovy",
      model: model
    });
  };
  return generator;
};
