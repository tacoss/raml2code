'use strict';

var Mocha = require('mocha');
var chai = require('chai');

var mocha = new Mocha();
mocha.addFile(__dirname + '/data2Code-spec');

chai.should();
mocha.run();
