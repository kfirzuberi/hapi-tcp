var Hapi = require('hapi');
var net = require('net');
var Joi = require('joi');
var Inert = require("inert");
var Vision = require("vision");

var port = process.env.PORT || 3000;
var server = new Hapi.Server();
server.connection({ port: port });
server.register([Inert,Vision, require('lout') ], function(err) {

});

server.route({
    method: 'POST',
    path: '/httpToTcp',
    handler: function (request, reply) {
        // get body parameters - server name, port and message to send.
        var port = request.payload.port;
        var hostName = request.payload.hostName;
        var message = request.payload.message;

        // create new socket to the given client parameters.
        var client = new net.Socket();
        client.connect(port, hostName, function() {
            console.log('Connected');

            // send the message.
            client.write(message);
        });

        // handle on data receive from the server.
        client.on('data', function(data) {
            console.log('Received: ' + data);
            client.destroy(); // kill client after server's response
        });

        // handle on connection close.
        client.on('close', function() {
            console.log('Connection closed');
            reply('request finished successfully'); // reply to the client and finish the request.
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
    console.log('Server running at:', server.info.uri);
});