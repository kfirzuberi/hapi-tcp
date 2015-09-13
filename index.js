var Hapi = require('hapi');
var config = require('./config/config');

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

var server = new Hapi.Server();

server.connection({ port: config.port });

server.register([
    require("inert"),
    require("vision"),
    require('lout'), {
        register: require('good'),
        options: goodOptions
    }], function(err) {

    if(err){

    }else{

    }
});

module.exports = server;