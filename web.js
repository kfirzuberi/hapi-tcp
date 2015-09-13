var routes = require('./routes/httpToTcp');
var server = require('./server');

// add the routes
server.route(routes);

// start the server.
server.start(function () {
    server.log(['info'],'Server running at:' + server.info.uri);
});