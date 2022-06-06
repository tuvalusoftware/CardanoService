require('dotenv').config();

const assert = require('assert');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);