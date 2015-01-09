var Deref, resolveInnerClass, resolveType, resolveTypeByRef, util, utilText, _;

Deref = require('deref');

_ = require('lodash');

utilText = require('../util/text');

util = {};

util.mapProperties = function(expandedSchema, refMap, mapping) {
  var data, key, keyRef, propParsed, property;
  data = {};
  data.classMembers = [];
  data.innerClasses = [];
  if (expandedSchema.properties && expandedSchema.properties.$ref) {
    keyRef = expandedSchema.properties.$ref;
    expandedSchema.properties = Deref.util.findByRef(keyRef, refMap);
  }
  for (key in expandedSchema.properties) {
    property = expandedSchema.properties[key];
    if (typeof property !== 'string') {
      if (expandedSchema.required && _.contains(expandedSchema.required, key)) {
        property.required = true;
      }
      propParsed = util.mapProperty(property, key, '', mapping, refMap);
      data.classMembers.push(propParsed.property);
      if (propParsed.innerClass) {
        data.innerClasses.push(propParsed.innerClass);
      }
    }
  }
  return data;
};

util.mapProperty = function(property, name, annotation, mapping, refMap) {
  var auxType, data, innerClass, keyRef, keyRefData, primitiveType, _ref;
  data = {};
  data.property = {};
  data.property.name = name;
  data.property.required = property.required !== void 0 ? property.required : false;
  data.property.size = [];
  if (property.minLength) {
    data.property.size.push({
      "name": "min",
      "value": property.minLength
    });
  }
  if (property.maxLength) {
    data.property.size.push({
      "name": "max",
      "value": property.maxLength
    });
  }
  data.property.comment = property.description;
  if (property.items && property.items["$ref"]) {
    keyRef = property.items["$ref"];
    keyRefData = resolveTypeByRef(keyRef, refMap, name, true);
  } else if (property["$ref"]) {
    keyRef = property["$ref"];
    keyRefData = resolveTypeByRef(keyRef, refMap, name);
    data.property.type = keyRefData.type;
    if (keyRefData.innnerSchema.type) {
      property.type = keyRefData.innnerSchema.type;
    } else {
      property.properties = keyRefData.innnerSchema;
      data.innerClass = resolveInnerClass(keyRefData.type, property, refMap, mapping);
      property.type = resolveType(data.innerClass, name);
    }
  }
  data.property.comment = property.description;
  switch (property.type) {
    case 'array':
      auxType = "List";
      if (keyRefData && keyRefData.innnerSchema.items !== void 0) {
        primitiveType = mapping[keyRefData.innnerSchema.items.type];
        if (keyRefData.innnerSchema.items.title) {
          auxType += "<" + keyRefData.type + ">";
        } else if (primitiveType) {
          auxType += "<" + primitiveType + ">";
        }
      }
      data.property.type = auxType;
      break;
    case 'object':
      if (property.properties) {
        if (keyRefData && keyRefData.type) {
          data.property.type = keyRefData.type;
        } else {
          data.property.type = resolveType(property, name);
          innerClass = resolveInnerClass(data.property.type, property, refMap, mapping);
          data.innerClass = innerClass;
        }
      } else if (keyRefData && keyRefData.innnerSchema && keyRefData.innnerSchema.properties) {
        data.property.type = keyRefData.type;
        property.properties = keyRefData.innnerSchema;
        data.innerClass = resolveInnerClass(keyRefData.type, property, refMap, mapping);
      } else {
        data.property.type = 'Map';
      }
      break;
    default:
      data.property.type = (_ref = mapping[property.type]) != null ? _ref : property.type;
  }
  if (data.property.type === "BigDecimal") {
    data.property.decimalMax = property.maximum;
    data.property.decimalMin = property.minimum;
  } else if (data.property.type === "Long") {
    data.property.max = property.maximum;
    data.property.min = property.minimum;
  }
  data.property.kind = annotation + ("(\"" + data.property.name + "\")");
  return data;
};

resolveTypeByRef = function(keyRef, refMap, propertyName, isArray) {
  var data, innerSchema;
  if (isArray == null) {
    isArray = false;
  }
  data = {};
  data.type = "";
  innerSchema = Deref.util.findByRef(keyRef, refMap);
  if (innerSchema) {
    if (isArray) {
      data.innnerSchema = {};
      data.innnerSchema.items = innerSchema;
    } else {
      data.innnerSchema = innerSchema;
    }
    data.type = resolveType(innerSchema, propertyName);
  } else if (keyRef) {
    console.error("$ref not found: " + keyRef + " RefMap.keys -> [" + (Object.keys(refMap)) + "]");
    console.error(JSON.stringify(refMap));
  }
  return data;
};

resolveType = function(schema, propertyName) {
  var type;
  type = "";
  if (schema) {
    if (schema.title) {
      type = utilText.capitalize(schema.title);
    } else {
      type = utilText.capitalize(propertyName);
    }
  }
  return type;
};

resolveInnerClass = function(name, property, refMap, mapping) {
  var aux, data;
  data = null;
  if (property && !property.properties.title) {
    data = {};
    data.className = name;
    data.classDescription = property.description;
    aux = util.mapProperties(property, refMap, mapping);
    data.classMembers = aux.classMembers;
  }
  return data;
};

module.exports = util;
