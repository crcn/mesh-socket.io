
[![Build Status](https://travis-ci.org/mojo-js/mesh-socket.io.svg)](https://travis-ci.org/mojo-js/mesh-socket.io) [![Coverage Status](https://coveralls.io/repos/mojo-js/mesh-socket.io/badge.svg?branch=master)](https://coveralls.io/r/mojo-js/mesh-socket.io?branch=master) [![Dependency Status](https://david-dm.org/mojo-js/mesh-socket.io.svg)](https://david-dm.org/mojo-js/mesh-socket.io)

Streams for [socket.io](http://socket.io/). Also works with [mesh](https://github.com/mojo-js/mesh.js).

#### Basic example

```javascript
var mesh = require("mesh");
var loki = require("mesh-loki");
var io   = require("mesh-socket.io");

var iodb = io({

  // socket.io server host
  host: "http://localhost"
});

var db = mesh.tailable(loki());

// listen for remote operations and sync with in-memory DB
iodb(mesh.op("tail")).pipe(mesh.open(loki));

// tail in-memory operations & broadcast them to the world
db(mesh.op("tail")).pipe(mesh.open(iodb));

// insert data into the DB. Should get broadcasted
// to socket.io
db(mesh.op("insert", {
  collection: "people"
  data: {
    name: "Shrek"
  }
}));
```

#### server configuration

Server configuration is pretty easy to setup. Just re-broadcast incomming operations.

```javascript
var io = require("socket.io");
var server = io(80);
server.on("connection", function(connection) {

  // note that "operation" is the channel that the client is
  // publishing / subscribing to
  connection.on("operation", function(operation) {

    // re-broadcast to other clients
    connection.broadcast.emit("operation", operation);
  });
});
```

#### db(options)

creates a new socket.io streamer.

- `options`
  - `host` - socket.io server host
  - `channel` - channel to subscribe to. Default is `operation`.
  - `reject` - operations to reject. Default is `[load]`.

```javascript
var iodb = io({
  host: "http://localhost",
  channel: "myOperationsChannel",
  reject: ["insert", "remove", "load"]
})
```

#### [stream.Readable](https://nodejs.org/api/stream.html#stream_class_stream_readable) db(operationName, options)

Broadcasts a new operation. This can be anything.

#### [stream.Readable](https://nodejs.org/api/stream.html#stream_class_stream_readable) db(tail, filter)

Tails a remote operation.

```javascript

// tail all operations
db(mesh.op("tail")).on("data", function() {

});

// tail only insert operations
db(mesh.op("tail", { name: "insert" })).on("data", function() {

});

// tail only operations on people collection
db(mesh.op("tail", { collection: "people" })).on("data", function() {

});
```
