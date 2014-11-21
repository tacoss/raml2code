var commonHelpers, deref, dirname, fs, generator, path, sanitize, template, util;

fs = require('fs');

commonHelpers = require("../helpers/common.js").helpers();

util = require('./util.js');

path = require('path');

generator = {};

generator.helpers = commonHelpers;

dirname = path.dirname(__filename);

template = path.resolve(dirname, "tmpl/pojo.hbs");

generator.template = fs.readFileSync(template).toString();

deref = require('deref')();

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
  var data, expandedSchema, key, model, p, parsed, row, schema, schemaName, schemas, _i, _j, _len, _len1, _ref, _ref1;
  parsed = [];
  schemas = [];
  if (datos.extra) {
    datos.extra["package"] = "" + datos.extra["package"] + "." + datos.version;
  }
  _ref = datos.schemas;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    row = _ref[_i];
    for (schemaName in row) {
      data = JSON.parse(row[schemaName]);
      schemas.push(data);
    }
  }
  for (_j = 0, _len1 = schemas.length; _j < _len1; _j++) {
    schema = schemas[_j];
    expandedSchema = deref(schema, schemas, true);
    model = {};
    model.className = expandedSchema.title;
    model.classMembers = [];
    model.classDescription = (_ref1 = expandedSchema.description) != null ? _ref1 : "";
    for (key in expandedSchema.properties) {
      p = expandedSchema.properties[key];
      model.classMembers.push(util.mapProperty(p, key));
    }
    model.extra = datos.extra;
    parsed.push({
      name: datos.version + "/" + util.capitalize("" + model.className + ".groovy"),
      model: model
    });
  }
  return parsed;
};

module.exports = generator;
