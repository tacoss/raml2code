/*eslint no-unused-expressions:0*/
/*eslint-env mocha*/
'use strict';
var raml2code = require('..'),
 gutil = require('gulp-util'),
 stream = require('stream'),
 fs = require('fs'),
 wrapAssertion = require('raml2code-fixtures').wrapAssertion,
 ramlFolder = require('raml2code-fixtures').ramlPath,
 chai = require('chai');
chai.should();
chai.expect;

describe('raml2code basic test', function () {

  describe('in streaming mode', function () {
    it('fails with an error (streams are not supported)', function (done) {
      var raml2codeInstance = raml2code();
      raml2codeInstance.once('error', function (error) {
        error.message.should.match(/streams are not supported/i);
        done();
      });
      raml2codeInstance.write(new gutil.File({
        contents: new stream.Readable()
      }));
    });
  });


  describe('in buffer mode', function () {
    it('emits syntax erros in bad RAML file', function (done) {
      var raml2codeInstance = raml2code();
      var ramlPath = ramlFolder + 'cats.bad.raml';
      var ramlContents = fs.readFileSync(ramlPath);

      raml2codeInstance.once('error', function (error) {
        error.message.should.equal('unknown property resourceTypess');
        done();
      });
      raml2codeInstance.write(new gutil.File({
        path: ramlPath,
        contents: ramlContents
      }));

    });
    it('emits syntax erros if generator is not provided', function (done) {
      var raml2codeInstance = raml2code();
      var ramlPath = ramlFolder + 'index.raml';
      var ramlContents = fs.readFileSync(ramlPath);

      raml2codeInstance.on('error', function (error) {
        error.message.should.equal('Generator not supplied');
        done();
      });
      raml2codeInstance.write(new gutil.File({
        path: ramlPath,
        contents: ramlContents
      }));

    });

    it('can convert an example RAML file', function (done) {
      var simpleGen = {};
      simpleGen.template = {'test.test': '{{title}}'};
      simpleGen.parser = function (data) {
        return [{title: data.title + ' finos'}];
      };
      var raml2codeInstance = raml2code({generator: simpleGen});
      var ramlPath = ramlFolder + 'index.raml';
      var ramlContents = fs.readFileSync(ramlPath);
      raml2codeInstance.write(new gutil.File({
        path: ramlPath,
        contents: ramlContents
      }));

      raml2codeInstance.on('data', function (file) {
        wrapAssertion(function () {
          file.path.should.equal('test.test');
          file.contents.toString('utf8').should.equal('Fixture API finos');
          done();
        }, done);
      });

    });

  });

});
