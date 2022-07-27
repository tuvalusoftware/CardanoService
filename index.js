'use-strict';

import * as Server from './server';

Server.start({
  port: process.env.PORT,
});
