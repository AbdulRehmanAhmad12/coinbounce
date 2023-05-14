const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const Database = require("./database/index");
const errorHandler = require("./middleware/errorHandling");
const { PORT } = require("./config/index");
const router = require("./routes/index");

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

app.use(router);

Database();

app.use("/storage", express.static("storage"));
app.use(errorHandler);
app.listen(3000, function () {
  console.log("Backend is running on port " + PORT);
});
