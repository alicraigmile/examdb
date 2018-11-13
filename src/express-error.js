const ErrorCodes = {
    200: 'Ok',
    400: 'Unacceptable',
    404: 'Not Found',
    410: 'Gone',
    422: 'Unprocessable Entity',
    500: 'Software Error',
    501: 'Not implmentented'
};

function errorHeadline(status) {
    const headlineIfStatusIsKnown = ErrorCodes[status];
    const headlineIfStatusIsNotKnown = `Error ${status}`;

    return headlineIfStatusIsKnown || headlineIfStatusIsNotKnown;
}

function registerErrorHandlers(options, req, res, next) {
    res.error = {};

    res.error.json = function jsonErrorMessage(status, message, debug) {
        const headline = errorHeadline(status);
        const jsonMessage = `${headline}: ${message}`;
        console.error(debug);
        res.status(status).json({ status, message: jsonMessage });
    };

    res.error.html = function htmlErrorMessage(status, message, template) {
        const headline = errorHeadline(status);
        const errorTemplate = template || 'error';

        res.status(status).render(errorTemplate, { status, message, headline });
    };

    res.error.text = function textErrorMessage(status, message) {
        const headline = errorHeadline(status);
        const textMessage = `${headline}: ${message}`;

        res.status(status).send(textMessage);
    };

    next();
}

export default function(options) {
    const parameters = options || {};

    return function expressErrorMiddleware(req, res, next) {
        registerErrorHandlers(parameters, req, res, next);
    };
}
