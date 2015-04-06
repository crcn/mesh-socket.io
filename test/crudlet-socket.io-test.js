var io           = require("../");
var expect       = require("expect.js");
var ioServer     = require("socket.io");
var crud         = require("crudlet");
var server       = global.server;
var sinon        = require("sinon");
var EventEmitter = require("events").EventEmitter;

describe(__filename + "#", function() {

  var port = 8899;
  var operations = [];
  var em = new EventEmitter();

  beforeEach(function() {
    if (server) server.close();
    global.server = server = ioServer(port);

    server.on("connection", function(connection) {
      connection.on("operation", function(operation) {
        em.emit("operation", operation);
        connection.broadcast.emit("operation", operation);
      });
    });
  });

  it("properly broadcasts a ", function(next) {

    var iodb = crud.clean(io({
      host: "http://0.0.0.0:" + port
    }));

    em.once("operation", function(operation) {
      expect(operation.name).to.be("insert");
      expect(operation.data.name).to.be("abba");
      next();
    });

    iodb("insert", { data: { name: "abba" }});
  });

  it("ignores 'load' as a default", function(next) {

    var iodb = io({
      host: "http://0.0.0.0:" + port
    });

    var stub = sinon.stub(iodb.client, "emit");


    crud.clean(iodb)("load", { data: { name: "abba" }}).on("end", function() {
      expect(stub.callCount).to.be(0);
      stub.restore();
      next();
    });
  });

  it("can customize the operations to reject", function(next) {

    var iodb = io({
      host: "http://0.0.0.0:" + port,
      reject: ["a", "b"]
    });

    var stub = sinon.stub(iodb.client, "emit");
    iodb = crud.clean(iodb);
    iodb("a", { data: { name: "abba" }}).on("end", function() {
      expect(stub.callCount).to.be(0);
      iodb("b", { data: { name: "abba" }}).on("end", function() {
        expect(stub.callCount).to.be(0);
        iodb("c", { data: { name: "abba" }}).on("end", function() {
          expect(stub.callCount).to.be(1);
          stub.restore();
          next();
        });
      });
    });
  });

  it("can tail an operation", function(next) {

    var iodb = crud.clean(io({
      host: "http://0.0.0.0:" + port
    }));

    var iodb2 = crud.clean(io({
      host: "http://127.0.0.1:" + port
    }));

    iodb2("tail").on("data", function(operation) {
      expect(operation.name).to.be("insert");
      expect(operation.data.name).to.be("abba");
      next();
    });

    iodb("insert", { data: { name: "abba" }});
  });

  it("doesn't publish remote operations", function(next) {
    var iodb = io({
      host: "http://127.0.0.1:" + port
    });
    var stub = sinon.stub(iodb.client, "emit");
    iodb({ name: "insert", remote: true }).on("end", function() {
      expect(stub.callCount).to.be(0);
      next();
    })
  });
});
