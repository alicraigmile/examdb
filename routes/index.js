'use strict';

const glob = require('glob');
const Router = require('express').Router;
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

var rootRouter = new Router({ mergeParams: true });
fs.readdirSync(__dirname)
    .filter(file => {
        return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
    })
    .forEach(file => {
        const router = require(`./${file}`);
        rootRouter.use(router);
    });

module.exports = rootRouter;
