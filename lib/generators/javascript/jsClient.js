var commonHelpers, fs, generator, helpers, languages, partials, template;

fs = require('fs');

commonHelpers = require("../helpers/common").helpers();

languages = require('raml-client-generator/languages');

generator = {};

partials = {
  auth: require('raml-client-generator/languages/javascript/partials/auth.js.hbs'),
  utils: require('raml-client-generator/languages/javascript/partials/utils.js.hbs'),
  client: require('raml-client-generator/languages/javascript/partials/client.js.hbs'),
  resources: require('raml-client-generator/languages/javascript/partials/resources.js.hbs')
};

helpers = {
  stringify: require('raml-client-generator/node_modules/javascript-stringify'),
  dependencies: require('raml-client-generator/languages/javascript/helpers/dependencies'),
  requestSnippet: require('raml-client-generator/languages/javascript/helpers/request-snippet'),
  parametersSnippet: require('raml-client-generator/languages/javascript/helpers/parameters-snippet')
};

template = require('raml-client-generator/languages/javascript//templates/index.js.hbs');

console.log(partials);

console.log(template);
