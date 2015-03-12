'use strict';
var through = require('through2'),
 gutil = require('gulp-util');
var PluginError = gutil.PluginError;

// consts
var PLUGIN_NAME = 'raml2code';

function processData(fileName, self, callback, options) {
  var raml = require('raml-parser');
  var data2code = require('data2code');
  raml.loadFile(fileName.path).then(function (data) {
    if (options && options.generator) {
      data.extra = options.extra;
      try {
        var results = data2code.process(data, options.generator);
        results.forEach(function (element) {
          var key = Object.keys(element)[0];
          if (key && element[key]) {
            var fileG = new gutil.File({
              path: key,
              contents: new Buffer(element[key])
            });
            self.push(fileG);
            gutil.log(gutil.colors.cyan('Generating file'), key);
          } else {
            self.emit('error', new PluginError(PLUGIN_NAME, 'Data array element must contain name and content properties'));
          }
        });
      } catch (e) {
        self.emit('error', new PluginError(PLUGIN_NAME, e));
      }

    } else {
      self.emit('error', new PluginError(PLUGIN_NAME, 'Generator not supplied'));
    }
    callback();
  }, function (error) {
    self.emit('error', new PluginError(PLUGIN_NAME, error));
    callback();
  });
}


module.exports = function (options) {

  var stream = through.obj(function (file, enc, cb) {
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return cb();
    }
    if (file.isBuffer()) {
      return processData(file, this, cb, options);
    }
  });
  return stream;
};
