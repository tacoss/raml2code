'use strict';

var Mocha = require('mocha');
var chai = require('chai');

var mocha = new Mocha();
mocha.addFile(__dirname + '/raml2Code-spec');

chai.should();
mocha.run();
