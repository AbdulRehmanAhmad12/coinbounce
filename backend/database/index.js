const mongoose = require("mongoose");

const URI = "mongodb://localhost:27017/coin-bounce";

const dbConnect = async () => {
  try {
    mongoose.set("strictQuery", false);
    const db = await mongoose.connect(URI);
    console.log("Database Connected...!" + db.connection.host);
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = dbConnect;
