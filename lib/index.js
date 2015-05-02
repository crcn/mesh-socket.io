var stream = require("obj-stream");
var extend = require("xtend/mutable");
var io     = require("socket.io-client");
var sift   = require("sift");
var mesh   = require("mesh");
var ros    = require("ros");

/**
 */

module.exports = function(options, bus) {

  if (!options) options = {};
  if (typeof options === "string") {
    options = { channel: options };
  }

  if (!options.host && process.browser) {
    options.host = location.protocol + "//" + location.host;
  }

  var client  = options.client  || options.connection || io(options.host);
  var channel = options.channel || "operation";

  return ros(client.on.bind(client, channel), client.emit.bind(client, channel), bus);
};
