var stream = require("obj-stream");
var extend = require("xtend/mutable");
var io     = require("socket.io-client");
var sift   = require("sift");
var mesh   = require("mesh");

function remoteHandler(bus) {
  return function(operation, emit) {
    bus(operation).on("data", function(data) {
      emit({ _id: operation._id, data: data });
    }).on("end", emit.bind(void 0, { _id: operation._id }))
  }
}

function remoteWriter() {

}


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

  var client  = io(options.host);
  var channel = options.channel || "operation";

  if (bus) {
    client.on(channel, bus);
    // client.on(channel, remoteReader(bus, cliemt.emit.bind(client, channel)));
  }

  var ret = mesh.stream(function(operation, writable) {
    var op = JSON.parse(JSON.stringify(operation));

    /*
     var writer = remoteWriter();

    */

    if (!op.remote) {
      op.remote = true;
      client.emit(channel, op);
    }

    writable.end();
  });

  ret.client = client;

  return ret;
};
