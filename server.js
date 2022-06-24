/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const swaggerUI = require("swagger-ui-express");

const Logger = require('./Logger');
const logger = Logger.createWithDefaultConfig('routers:controllers:server');

const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const routers = require('./routers');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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

const docs = require('./docs');
app.use('/docs', swaggerUI.serve, swaggerUI.setup(docs));

async function start(params) {
  routers(app);

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(200).json({
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