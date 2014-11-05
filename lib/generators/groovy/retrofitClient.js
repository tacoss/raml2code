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
  var methodParse, model, parsed, resource, _i, _len, _ref;
  parsed = [];
  methodParse = [];
  _ref = data.resources;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    resource = _ref[_i];
    util.parseResource(resource, methodParse);
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

module.exports = generator;
