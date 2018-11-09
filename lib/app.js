import express from 'express';
import fileUpload from 'express-fileupload';
import parse from 'csv-parse';
import uuidv1 from 'uuid/v1';
import path from 'path';
import 'csv-express';
import _ from 'underscore';
import ExamDbDate from './date';
import expressError from './express-error';
import Store from './memorystore'; // memorystore, postgresstore
import db from '../models';
import routes from '../routes'; 

const app = express();
const store = new Store(); // instance

const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/;
const yyyymmdd = /^\d{4}\/\d{2}\/\d{2}$/;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(fileUpload());
app.use(expressError());

// make base, store and db available to all routes
app.use((req, res, next) => {
    req.base = `${req.protocol}://${req.get('host')}`
    req.store = store;
    req.db = db
    return next()
})

//one router which pulls in all routes from separate files - nice!
app.use('/', routes);

// Log errors to console + display a nice message to the audience
app.use((err, req, res, next) => {
    console.error(err);
    res.send('internal server error');
    next();
});

// See: .ebextensions for NGINX rules which mean AWS ELB ignores this
app.use('/', express.static(path.join(__dirname, '..', 'public')));
app.use('/library/jquery', express.static(path.join(__dirname, '..', '/node_modules/jquery/dist')));
app.use('/library/jquery-tablesort', express.static(path.join(__dirname, '..', '/node_modules/jquery-tablesort')));

export default app;
