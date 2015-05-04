var io     = require("socket.io-client");
var remote = require("mesh-remote");
var mesh   = require("mesh");

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

  client.on("disconnect", function() {
    bus(mesh.op("disconnect"));
  })

  return remote({
    client: options.client  || options.connection || io(options.host),
    channel: options.channel
  }, bus);
};
