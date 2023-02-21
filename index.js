"use-strict";

import { validateEnv } from "./validateEnv";

validateEnv();

import * as Server from "./server";

Server.start({
	port: process.env.PORT || 10003,
});