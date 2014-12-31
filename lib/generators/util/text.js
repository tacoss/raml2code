var text;

text = {};

text.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

text.sanitize = function(str) {
  var aux, res;
  aux = str.split(".");
  res = '';
  aux.forEach(function(it) {
    return res += text.capitalize(it);
  });
  return res;
};

module.exports = text;
