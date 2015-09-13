var Code = require('code');   // assertion library
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var routes = require('../routes/httpToTcp');
var server = require('../index');

// add the routes
server.route(routes);

lab.experiment('routes validations', function () {
    lab.test("Bad request when sending no parameters", function(done) {
        var options = {
            method: "POST",
            url: "/httpToTcp"
        };
        server.inject(options, function(response) {
            var result = response.result;
            Code.expect(response.statusCode).to.equal(400);

            done();
        });
    });

    lab.test("Bad request when sending invalid parameters", function(done) {
        var options = {
            method: "POST",
            url: "/httpToTcp",
            payload : {
                port: 'ddd',
                hostName: 'dd',
                message: 'sss'
            }
        };
        server.inject(options, function(response) {
            var result = response.result;
            Code.expect(response.statusCode).to.equal(400);
            Code.expect(result.error).to.equal('Bad Request');

            done();
        });
    });

    lab.test("Bad request when sending invalid port parameter", function(done) {
        var options = {
            method: "POST",
            url: "/httpToTcp",
            payload : {
                port: 'ddd',
                hostName: '127.0.0.1',
                message: 'the message'
            }
        };
        server.inject(options, function(response) {
            var result = response.result;
            Code.expect(response.statusCode).to.equal(400);
            Code.expect(result.error).to.equal('Bad Request');
            Code.expect(result.message).to.equal('child "port" fails because ["port" must be a number]');

            done();
        });
    });

    lab.test("Bad request when sending invalid hostName parameter", function(done) {
        var options = {
            method: "POST",
            url: "/httpToTcp",
            payload : {
                port: '1234',
                hostName: 'some host name',
                message: 'themessage'
            }
        };
        server.inject(options, function(response) {
            var validationMessage = 'child "hostName" fails because ["hostName" must be a valid ip address of one of the following versions [ipv4] with a optional CIDR]';

            var result = response.result;
            Code.expect(response.statusCode).to.equal(400);
            Code.expect(result.error).to.equal('Bad Request');
            Code.expect(result.message).to.equal(validationMessage);

            done();
        });
    });

    lab.test("Bad request when sending invalid message parameter", function(done) {
        var options = {
            method: "POST",
            url: "/httpToTcp",
            payload : {
                port: '1234',
                hostName: '127.0.0.1',
                message: '..'
            }
        };
        server.inject(options, function(response) {
            var result = response.result;
            Code.expect(response.statusCode).to.equal(400);
            Code.expect(result.error).to.equal('Bad Request');
            Code.expect(result.message).to.equal('child "message" fails because ["message" length must be at least 5 characters long]');

            done();
        });
    });
});

lab.experiment('tcp client connection', function () {
    lab.test("connection to invalid client ip", function(done) {
        var options = {
            method: "POST",
            url: "/httpToTcp",
            payload : {
                port: '1234',
                hostName: '127.0.0.1',
                message: 'the message'
            }
        };
        server.inject(options, function(response) {
            var result = response.result;
            Code.expect(response.statusCode).to.equal(403);

            done();
        });
    });
});