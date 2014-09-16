var capitalize, commonHelpers, dirname, fs, generator, path, template;

fs = require('fs');

commonHelpers = require("../helpers/common.js").helpers();

path = require('path');

generator = {};

generator.helpers = commonHelpers;

dirname = path.dirname(__filename);

template = path.resolve(dirname, "pojo.hbs");

generator.template = fs.readFileSync(template).toString();

capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

generator.parser = function(datos) {
  var data, key, model, p, parsed, property, ref, row, schemaName, _i, _len, _ref, _ref1;
  parsed = [];
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
        ref = capitalize(ref);
        model.classMembers.push({
          name: "items",
          type: "List<" + ref + ">"
        });
      }
      for (key in data.properties) {
        p = data.properties[key];
        property = {};
        property.name = key;
        property.comment = p.description;
        switch (p.type) {
          case 'array':
            property.type = "List";
            property.name = "items";
            break;
          case 'string':
            property.type = "String";
            break;
          case 'boolean':
            property.type = "Boolean";
            break;
          case 'number':
            property.type = "Double";
            break;
          case 'integer':
            property.type = "Integer";
        }
        model.classMembers.push(property);
      }
      if (datos.extra) {
        model.extra = datos.extra;
      }
      parsed.push({
        name: capitalize("" + schemaName + ".groovy"),
        model: model
      });
    }
  }
  return parsed;
};

module.exports = generator;
