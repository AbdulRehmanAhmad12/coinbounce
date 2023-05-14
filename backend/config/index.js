const dotenv = require('dotenv').config();

const PORT = process.env.PORT;
const MONGO_DB = process.env.MONGO_DB;

module.exports = { PORT, MONGO_DB };