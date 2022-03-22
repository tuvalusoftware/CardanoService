/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const responseTime = require('response-time');

const routers = require('./routers');

// -- Swagger --
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Cardano Service API',
        version: '1.0.0',
        description: 'Simple API for Cardano',
    },
    servers: [
        {
            url: '',
            description: 'Development server',
        },
    ],
};

const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./routers/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
// -- Swagger --

const app = express();
const server = http.createServer(app);
const Logger = require('./Logger');

const logger = Logger.createWithDefaultConfig('server');

app.use(
    responseTime((req, _, time) => {
        logger.info(`${req.ip} - ${req.method} ${req.originalUrl} ${req.protocol} - ${time}`);
    })
);

app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    res.json({
        error_message: 'Body should be a JSON',
    });
});
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(methodOverride());

async function start(params) {
    routers(app);

    // -- Swagger --
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
        res.json({
            error_code: err.error_code || err.message,
            error_message: err.message,
            error_data: err.error_data,
        });
    });
    server.listen(params.port || 80, () => {
        logger.info(`Listening on http://localhost${params.port ? `:${params.port}` : ''}`);
        if (params && params.done) params.done();
    });
}

module.exports = {
    start,
    stop: (done) => {
        server.close(done);
    },
};
