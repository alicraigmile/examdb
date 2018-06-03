#!/usr/bin/env node

const package = require('./package'),
      morgan = require('morgan'),
      port = process.env.PORT || 5000,
      app = require('./lib/app');

var logger,
    server;

logger = morgan('combined');
app.use(logger);
server = app.listen(port, () => console.log(package.name + ' listening on port ' + port +  '!'));
