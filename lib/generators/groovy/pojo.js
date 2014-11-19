var commonHelpers, dirname, fs, generator, path, sanitize, template, util;

fs = require('fs');

commonHelpers = require("../helpers/common.js").helpers();

util = require('./util.js');

path = require('path');

generator = {};

generator.helpers = commonHelpers;

dirname = path.dirname(__filename);

template = path.resolve(dirname, "tmpl/pojo.hbs");

generator.template = fs.readFileSync(template).toString();

sanitize = function(str) {
  var aux, res;
  aux = str.split(".");
  res = '';
  aux.forEach(function(it) {
    return res += util.capitalize(it);
  });
  return res;
};

generator.parser = function(datos) {
  var data, key, model, p, parsed, ref, row, schemaName, _i, _len, _ref, _ref1;
  parsed = [];
  datos.extra["package"] = "" + datos.extra["package"] + "." + datos.version;
  _ref = datos.schemas;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    row = _ref[_i];
    for (schemaName in row) {
      data = JSON.parse(row[schemaName]);
      model = {};
      model.className = data.title;
      model.classMembers = [];
      model.classDescription = (_ref1 = data.description) != null ? _ref1 : "";
      if (data.type === "array") {
        ref = data.items['$ref'].replace("#/", "").split(".")[0];
        ref = util.capitalize(ref);
        model.classMembers.push({
          name: "items",
          type: "List<" + ref + ">"
        });
      }
      for (key in data.properties) {
        p = data.properties[key];
        model.classMembers.push(util.mapProperty(p, key));
      }
      if (datos.extra) {
        model.extra = datos.extra;
      }
      parsed.push({
        name: datos.version + "/" + util.capitalize("" + (sanitize(schemaName)) + ".groovy"),
        model: model
      });
    }
  }
  return parsed;
};

module.exports = generator;
