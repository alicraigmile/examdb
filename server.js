#!/usr/bin/env node

const app = require('./lib/app'),
	  models = require("./models");
	  package = require('./package'),
      http = require('http'),
      morgan = require('morgan');
      
var port = process.env.PORT || '5000';
app.set('port', port);

var logger = morgan('combined');
app.use(logger);

var server = http.createServer(app);

// sync() will create all table if they doesn't exist in database
models.sequelize.sync().then(function () {
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);
});


function onError(error) {
	console.log(package.name + ' failed to start listening on port ' + port +  '! - ' + error);
}

function onListening() {
	console.log(package.name + ' listening on port ' + port +  '!');
}
