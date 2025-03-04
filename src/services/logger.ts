import * as winston from 'winston';

// Create a Winston logger instance
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        //
        // - Write all logs with importance level of `error` or higher to `error.log`
        //   (i.e., error, fatal, but not other levels)
        //
        new winston.transports.File({ filename: 'error.log', level: 'error', format: winston.format.json() }),
        //
        // - Write all logs with importance level of `info` or higher to `combined.log`
        //   (i.e., fatal, error, warn, and info, but not trace)
        //
        new winston.transports.File({ filename: 'combined.log', format: winston.format.json() }),
    ],
    exceptionHandlers: [
        // Uncaught exceptions will be logged here
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'exceptions.log', format: winston.format.json() })
    ],
    exitOnError: false  // Prevents Winston from exiting after handling an exception
});

// Optionally, catch unhandled promise rejections and rethrow them as exceptions
process.on('unhandledRejection', (ex) => {
    throw ex;
});

// Example: Force an uncaught exception for demonstration purposes
// setTimeout(() => {
//   throw new Error('This is an uncaught exception');
// }, 1000);

export default logger;