var util;

util = {};

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

module.exports = util;
