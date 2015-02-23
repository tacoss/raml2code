'use strict';
var raml = require('raml-parser'), expect = require('chai').expect;
var raml2code =require('..');
var gutil = require('gulp-util');
var stream = require('stream');
var path = require('path');
var fs = require('fs');
var wrapAssertion = require("./helpers").wrapAssertion;
var chai = require('chai');
chai.should();

describe('raml2code basic test', function () {

  describe('in streaming mode', function() {
    it('fails with an error (streams are not supported)', function(done) {
      var raml2codeInstance = raml2code();
      raml2codeInstance.once('error', function(error) {
        error.message.should.match(/streams are not supported/i);
        done();
      });
      raml2codeInstance.write(new gutil.File({
        contents: new stream.Readable()
      }));
    });
  });


  describe('in buffer mode', function() {
    it('emits syntax erros in bad RAML file', function(done) {
      var raml2codeInstance =  raml2code();
      var ramlPath = path.join(__dirname, 'raml/cats.bad.raml');
      var ramlContents = fs.readFileSync(ramlPath);

      raml2codeInstance.once('error', function(error) {
        error.message.should.equal('unknown property resourceTypess');
        done();
      });
      raml2codeInstance.write(new gutil.File({
        path: ramlPath,
        contents: ramlContents
      }));

    });
    it('emits syntax erros if generator is not provided', function(done) {
      var raml2codeInstance = raml2code();
      var ramlPath = path.join(__dirname, 'raml/cats.raml');
      var ramlContents = fs.readFileSync(ramlPath);

      raml2codeInstance.on('error', function(error) {
        error.message.should.equal('Generator not supplied');
        done();
      });
      raml2codeInstance.write(new gutil.File({
        path: ramlPath,
        contents: ramlContents
      }));

    });

    it('can convert an example RAML file', function(done) {
      var simpleGen = {};
      simpleGen.template = '{{title}}';
      simpleGen.parser = function (data) {
        return [{  "test.test" : {title:data.title + " finos"}}]
      };
      var raml2codeInstance = raml2code({generator:simpleGen});
      var ramlPath = path.join(__dirname, 'raml/cats.raml');
      var ramlContents = fs.readFileSync(ramlPath);
      raml2codeInstance.write(new gutil.File({
        path: ramlPath,
        contents: ramlContents
      }));

      raml2codeInstance.on('data', function(file){
        wrapAssertion(function () {
          file.path.should.equal('test.test');
          file.contents.toString('utf8').should.equal("Gatitos API finos");
        }, done);
      });

    });

  });

});
