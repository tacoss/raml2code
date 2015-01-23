var commonHelpers, deref, generator, utilMapProperty, utilSchemas, utilText;

commonHelpers = require("../helpers/common").helpers();

utilText = require('../util/text');

utilSchemas = require('../util/schemas');

utilMapProperty = require('../util/mapProperty');

generator = {};

generator.helpers = commonHelpers;

generator.template = require("./tmpl/pojo.hbs");

generator.partials = {
  classMembers: require("./tmpl/classMembersPartial.hbs")
};

deref = require('deref')();

generator.parser = function(datos) {
  var mapping, model, normSchema, parsed, schema, schemas, someData, _base, _i, _len, _ref;
  mapping = {
    'string': "String",
    'boolean': "Boolean",
    'number': "BigDecimal",
    'integer': "Long",
    'array': "List",
    'object': "Map",
    'file': "InputStream"
  };
  parsed = [];
  schemas = utilSchemas.loadSchemas(datos);
  if (datos.extra) {
    datos.extra["package"] = "" + datos.extra["package"] + "." + datos.version;
    if ((_base = datos.extra).enableAnnotations == null) {
      _base.enableAnnotations = true;
    }
  }
  for (_i = 0, _len = schemas.length; _i < _len; _i++) {
    schema = schemas[_i];
    normSchema = deref(schema, schemas);
    model = {};
    model.className = utilText.capitalize(normSchema.title);
    model.classDescription = (_ref = normSchema.description) != null ? _ref : "";
    someData = utilMapProperty.mapProperties(normSchema, deref.refs, mapping);
    model.classMembers = someData.classMembers;
    model.innerClasses = someData.innerClasses;
    model.extra = datos.extra;
    if (someData.classMembers.length > 0) {
      parsed.push({
        name: datos.version + ("/" + model.className + ".groovy"),
        model: model
      });
    } else {
      console.log("----> " + model.className + ".groovy is too abstract to create a file using List or Map");
    }
  }
  return parsed;
};

module.exports = generator;
