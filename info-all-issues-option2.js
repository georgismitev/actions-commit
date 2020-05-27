/**
 * Module dependencies.
 */

var fs = require('fs');
var url = require('url');
var net = require('net');
var tls = require('tls');
var http = require('http');
var https = require('https');
var WebSocket = require('ws');
var assert = require('assert');
var events = require('events');
var inherits = require('util').inherits;
var Agent = require('../');

var PassthroughAgent = Agent(function(req, opts) {
  return opts.secureEndpoint ? https.globalAgent : http.globalAgent;
});

describe('artificial "streams"', function() {
it('should send a GET request', function(done) {
  var stream = new events.EventEmitter();

  // needed for the `http` module to call .write() on the stream
  stream.writable = true;

  stream.write = function(str) {
    assert(0 == str.indexOf('GET / HTTP/1.1'));
    done();
  };

  // needed for `http` module in Node.js 4
  stream.cork = function() {};

  var opts = {
    method: 'GET',
    host: '127.0.0.1',
    path: '/',
    port: 80,
    agent: new Agent(function(req, opts, fn) {
      fn(null, stream);
    })
  };
  var req = http.request(opts);
  req.end();
});
