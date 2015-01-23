var through = require('through2');
var gutil = require('gulp-util');
var data2code = new require('data2code');
var util = require('util');
var path = require('path');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'raml2code';

function processData(fileName, self, callback, options) {
  var raml = require('raml-parser');

  raml.loadFile(fileName.path).then(function (data) {
    if (options && options.generator) {
      data.extra = options.extra;
      options.generator.handleRender = function (results) {
        results.forEach(function (element, index, array) {
          if (element.name && element.content) {
            var fileG = new gutil.File({
              path: element.name,
              contents: new Buffer(element.content)
            });
            self.push(fileG);
            gutil.log(gutil.colors.cyan('Generating file'), element.name);
          } else {
            self.emit('error', new PluginError(PLUGIN_NAME, 'Data array element must contain name and content properties'));
          }
        });

      }
      try{
        data2code.process(data, options.generator);
      }catch(e){
        self.emit('error', new PluginError(PLUGIN_NAME,e));
      }

    } else {
      self.emit('error', new PluginError(PLUGIN_NAME, 'Generator not supplied'));
    }
    callback();
  }, function (error) {
    var message = util.format('Parse error%s: %s', error);
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
}
