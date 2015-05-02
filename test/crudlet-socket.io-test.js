var io           = require("../");
var expect       = require("expect.js");
var ioServer     = require("socket.io");
var mesh         = require("mesh");
var server       = global.server;
var sinon        = require("sinon");
var EventEmitter = require("events").EventEmitter;

describe(__filename + "#", function() {

  var port = 8899;
  var operations = [];
  var operation = {};
  var em = new EventEmitter();

  beforeEach(function() {
    if (server) server.close();
    global.server = server = ioServer(++port);


    server.on("connection", function(connection) {

      var cbus = mesh.tailable(mesh.wrap(function(op, next) {
        operation = op;
        next(void 0, op);
      }));

      io({
        client: connection
      }, cbus);

      cbus(mesh.op("tail")).on("data", function(op) {
        connection.broadcast.emit("operation", op);
      });
    });
  });

  it("properly broadcasts a ", function(next) {

    var iodb = mesh.clean(io({
      host: "http://127.0.0.1:" + port
    }));

    iodb(mesh.op("something", { data: { name: "abba" }})).on("data", function(operation) {
        expect(operation.name).to.be("something");
        expect(operation.data.name).to.be("abba");
        next();
    });

  });

  it("can pass remote ops", function(next) {

    var iodb2 = io({
      host: "http://0.0.0.0:" + port
    });

    var iodb = io({
      host: "http://127.0.0.1:" + port
    }, mesh.wrap(function(operation) {
      expect(operation.name).to.be("insert");
      expect(operation.data.name).to.be("abba");
      next();
    }));

    iodb2(mesh.op("insert", { data: { name: "abba" }}));
  });

  xit("doesn't publish remote operations", function(next) {
    var iodb = io({
      host: "http://127.0.0.1:" + port
    });
    // var stub = sinon.stub(iodb.client, "emit");
    iodb({ name: "insert", remote: true }).on("end", function() {
      console.log(operation);

      // expect(stub.callCount).to.be(0);
      next();
    })
  });
});
