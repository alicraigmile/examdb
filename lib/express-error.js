'use strict';

const ErrorCodes = {
    200:'Ok',
    400:'Unacceptable',
    404:'Not Found',
    410:'Gone',
    422:'Unprocessable Entity',
    500:'Software Error',
    501:'Not implmentented'
};

module.exports = function(options) {
    options = options || {};

    return function(req, res, next) {
        registerErrorHandlers(options, req, res, next);
    }
}

function errorHeadline(status) {
    let headlineIfStatusIsKnown = ErrorCodes[status],
        headlineIfStatusIsNotKnown = 'Error ' + status;

    return headlineIfStatusIsKnown || headlineIfStatusIsNotKnown;
}

function registerErrorHandlers(options, req, res, next) {

    res.error = {};

    res.error.json = function(status, message) {
        let headline = errorHeadline(status);

        message = errorHeadline(status) + ': ' + message;
            
        res.status(status).json({status:status, message:message});
    }

    res.error.html = function(status, message, template) {
        let headline = errorHeadline(status);

        template = template || 'error';

        res.status(status).render(template, {status:status, message:message, headline:headline});
    }

    res.error.text = function(status, message, template) {
        let headline = errorHeadline(status);
        
        message = headline + ': ' + message;

        res.status(status).send(message);
    }

    next();

}
