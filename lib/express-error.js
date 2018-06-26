'use strict';

module.exports = function(options) {
    options = options || {};

    return function(req, res, next) {
//        if (res.error) return next();
        registerErrorHandlers(options, req, res, next);
    }
}

function registerErrorHandlers(options, req, res, next) {

    res.error = {};

    res.error.json = function(status, message) {
        res.status(status).json({status:status, message:message});
    }

    res.error.html = function(status, message, template) {
        if (! template) throw new Error('missing template');        
        res.status(status).render(template, {status:status, message:message});
    }

    res.error.text = function(status, message, template) {
        res.status(status).send(message);
    }

    next();

}