var stream = require("obj-stream");
var extend = require("xtend/mutable");
var io     = require("socket.io-client");
var sift   = require("sift");

/**
 */

module.exports = function(options) {

  if (!options) options = {};

  var client  = io(options.host);
  var tails   = [];
  var channel = options.channel || "operation";
  var reject  = options.reject  || ["load"];

  client.on(channel, function(operation) {
    for (var i = tails.length; i--;) {
      if (tails[i].test(operation)) {
        tails[i].stream.write(operation);
      }
    }
  });

  var ret = function(operationName, options) {
    var writable = stream.writable();

    process.nextTick(function() {

      if (operationName === "tail") {
        return tails.unshift({
          test: sift(options || function() { return true; }),
          stream: writable
        });
      }

      if (!~reject.indexOf(operationName)) {
        client.emit(channel, extend({ name: operationName }, options));
      }

      writable.end();

    });
    return writable.reader;
  };

  ret.client = client;

  return ret;
};
