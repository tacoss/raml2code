var through = require('through2');
var gutil = require('gulp-util');
var data2code = new require('data2code');
var util = require('util');
var path = require('path');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'raml2code';

function processData(fileName, self, callback, options){
  var raml = require('raml-parser');
  var cwd = process.cwd();
  var nwd = path.resolve(path.dirname(fileName.path));
  process.chdir(nwd);
  raml.loadFile(fileName.path).then(function (data) {
    if(options && options.generator){
      data.extra = options.extra;
      options.generator.handleRender = function(results){
        results.forEach(function(element, index, array){
          if(element.name && element.content){
            var fileG = new gutil.File({
              base: "",
              cwd: "",
              path: element.name,
              contents: new Buffer(element.content)
            });
            self.push(fileG);
          }else{
            self.emit('error', new PluginError(PLUGIN_NAME, 'Data array element must contain name and content properties'));
          }
        });

      }
      data2code.process(data, options.generator);
    }else{
      self.emit('error', new PluginError(PLUGIN_NAME, 'Generator not supplied'));
    }
    process.chdir(cwd);
    callback();
  }, function (error) {
    var message = util.format('Parse error%s: %s', error);
    self.emit('error', new PluginError(PLUGIN_NAME, error));
    process.chdir(cwd);
    callback();
  });
}


module.exports = function(options){

  var stream = through.obj(function(file, enc, cb) {
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
