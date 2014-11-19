var commonHelpers, dirname, fs, generator, path, template, util;

fs = require('fs');

commonHelpers = require("../helpers/common.js").helpers();

util = require('./util.js');

path = require('path');

generator = {};

generator.helpers = commonHelpers;

dirname = path.dirname(__filename);

template = path.resolve(dirname, "tmpl/retrofitClient.hbs");

generator.template = fs.readFileSync(template).toString();

generator.parser = function(data) {
  var annotations, methodParse, model, parsed, resource, _i, _len, _ref;
  parsed = [];
  methodParse = [];
  annotations = {
    path: "@Path",
    query: "@Query",
    body: "@Body"
  };
  _ref = data.resources;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    resource = _ref[_i];
    util.parseResource(resource, methodParse, annotations);
  }
  model = {};
  model.methods = methodParse;
  model.version = data.version;
  if (data.extra) {
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

module.exports = generator;
