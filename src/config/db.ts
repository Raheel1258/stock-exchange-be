const mongoose = require("mongoose");
const { config } = require("./config");
mongoose.set("strictQuery", true);

mongoose
  .connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connection is done...");
  })
  .catch((err: any) => {
    console.log("Database Error: ", err);
  });