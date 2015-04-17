var stream = require("obj-stream");
var extend = require("xtend/mutable");
var io     = require("socket.io-client");
var sift   = require("sift");
var mesh   = require("mesh");

/**
 */

module.exports = function(options, bus) {

  if (!options) options = {};

  var client  = io(options.host);
  var channel = options.channel || "operation";

  if (bus) {
    client.on(channel, bus);
  }

  var ret = mesh.stream(function(operation, writable) {
    var op = JSON.parse(JSON.stringify(operation));

    if (!op.remote) {
      op.remote = true;
      client.emit(channel, op);
    }

    writable.end();
  });

  ret.client = client;

  return ret;
};
