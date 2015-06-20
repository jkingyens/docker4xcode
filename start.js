var server = require('./server');
var instance = server.createServer(3000, function () { 

	console.log('ready');

});