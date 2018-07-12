'use strict';

import { npmPackage } from './package',
import morgan from 'morgan',
const port = process.env.PORT || 5000,
const app = require('./lib/app');

var logger,
    server;

logger = morgan('combined');
app.use(logger);
server = app.listen(port, () => console.log(npmPackage.name + ' listening on port ' + port +  '!'));
