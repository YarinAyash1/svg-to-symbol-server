// Custom middleware that handles 404 errors
function notFound(req, res, next) {
    res.status(404);
    const error = new Error(`404 Route not found - ${req.originalUrl}`);
    // Pass the error to the next middleware
    next(error);
}

/* eslint-disable no-unused-vars */
// Custom middleware that handles errors
function errorHandler(err, req, res, next) {
    /* eslint-enable no-unused-vars */
    // Set the status code to the status code of the error, or 500 if no status code is set
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        // In production, don't show the stack trace
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
}

module.exports = {
    notFound,
    errorHandler,
};