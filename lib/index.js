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

  var ret = function(operation) {
    var writable = stream.writable();

    process.nextTick(function() {

      var op = JSON.parse(JSON.stringify(operation));

      if (operation.name === "tail") {
        delete op.name;
        return tails.unshift({
          test: sift(op || function() { return true; }),
          stream: writable
        });
      }

      if (!options.remote && !~reject.indexOf(operation.name)) {
        op.remote = true;
        client.emit(channel, op);
      }

      writable.end();

    });
    return writable.reader;
  };

  ret.client = client;

  return ret;
};
