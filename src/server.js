/* eslint-disable no-console */
import path from 'path';
import http from 'http';
import morgan from 'morgan';
import fs from 'fs';
import app from './app';
import db from '../models';
import npmPackage from '../package';

const port = process.env.PORT || '5000';

function onError(error) {
    console.log(`${npmPackage.name} failed to start listening on port ${port}! - ${error}`);
}

function onListening() {
    console.log(`${npmPackage.name} listening on port ${port}!`);
}

app.set('port', port);

// log only 4xx and 5xx responses to console
app.use(
    morgan('dev', {
        skip: (req, res) => res.statusCode < 400
    })
);

// log all requests to access.log
app.use(
    morgan('common', {
        stream: fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' })
    })
);

http.createServer(app)
    .listen(port)
    .on('error', onError)
    .on('listening', onListening);
