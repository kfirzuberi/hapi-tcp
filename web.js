var Hapi = require('hapi');
var net = require('net');

var port = process.env.PORT || 3000;
var server = new Hapi.Server();
server.connection({ port: port });

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
    }
});

// start the server.
server.start(function () {
    console.log('Server running at:', server.info.uri);
});