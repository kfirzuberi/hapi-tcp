var Hapi = require('hapi');
var net = require('net');
var Joi = require('joi');
var Inert = require("inert");
var Vision = require("vision");
var Boom = require('boom');

var goodOptions = {
    opsInterval: 1000,
    reporters: [{
        reporter: require('good-console'),
        events: {log: '*', response: '*', error: '*' }
    }, {
        reporter: require('good-file'),
        events: {log: '*', response: '*', error: '*'},
        config: {
            path: './logs/',
            format: 'DD-MM-YYYY',
            prefix: 'http-to-tcp-log',
            rotate: 'daily'
        }
    }]
};

var port = process.env.PORT || 3000;
var server = new Hapi.Server();
server.connection({ port: port });
server.register([Inert,Vision, require('lout')], function(err) {

});

server.register({
    register: require('good'),
    options: goodOptions
}, function (err) {

});

server.route({
    method: 'POST',
    path: '/httpToTcp',
    handler: function (request, reply) {
        // get body parameters - server name, port and message to send.
        var clientPort = request.payload.port;
        var clientHostName = request.payload.hostName;
        var message = request.payload.message;

        // create new socket to the given client parameters.
        var client = new net.Socket();
        client.connect(clientPort, clientHostName, function() {
            server.log(['info'],'Connected to ' + clientHostName + ':' + clientPort);

            // send the message to the client.
            client.write(message);
            reply('request finished successfully. Send - "' + message + '"'); // reply to the client and finish the request.
        });

        // handle on data receive from the server.
        client.on('data', function(data) {
            server.log(['info'],'Received: ' + data);
            client.destroy(); // kill client after server's response
        });

        // handle on connection close.
        client.on('close', function() {
            server.log(['info'],'Connection closed');
        });

        client.on('error', function(err){
            server.log(['error'], 'Error: ' + err.message);
            reply(Boom.forbidden('Couldn\'t connect to ' + clientHostName + ':' + clientPort));
        });
    },
    config: {
        validate: {
            payload: {
                port: Joi.number().integer().min(999).max(9999).positive().description('server port').example('1337').default('1337'),
                message: Joi.string().min(5).max(20).description('message to send').example('X=32&Y=31').default('X=32&Y=31'),
                hostName: Joi.string().ip({version :'ipv4'}).description('server host name').example('127.0.0.1').default('127.0.0.1')
            }
        },
        description: 'Send TCP message',
        notes: 'Send the given message to the given host name via TCP',
        tags: ['api']
    }
});

// start the server.
server.start(function () {
    server.log(['info'],'Server running at:' + server.info.uri);
});