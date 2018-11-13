'use strict';

import app from './src/app';
import db from './models';
import npmPackage from './package';
import http from 'http';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
      
const port = process.env.PORT || '5000';
app.set('port', port);

// log only 4xx and 5xx responses to console
app.use(morgan('dev', {
  skip: function (req, res) { return res.statusCode < 400 }
}))

// log all requests to access.log
app.use(morgan('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))

const server = http.createServer(app);

// sync() will create all table if they doesn't exist in database
db.sequelize.sync().then(function () {
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

