'use strict';

import app from './lib/app';
import models from './models';
import npmPackage from './package';
import http from 'http';
import morgan from 'morgan';
      
const port = process.env.PORT || '5000';
app.set('port', port);

const logger = morgan('combined');
app.use(logger);

const server = http.createServer(app);

// sync() will create all table if they doesn't exist in database
models.sequelize.sync().then(function () {
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);
});


function onError(error) {
	console.log(npmPackage.name + ' failed to start listening on port ' + port +  '! - ' + error);
}

function onListening() {
	console.log(npmPackage.name + ' listening on port ' + port +  '!');
}
