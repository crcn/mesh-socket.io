var io     = require("socket.io-client");
var remote = require("mesh-remote");

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

  return remote({
    client: options.client  || options.connection || io(options.host),
    channel: options.channel
  }, bus);
};
