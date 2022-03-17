require("express-async-errors");
const mongoose = require("mongoose");
const express = require("express");
const Joi = require("joi");
const cors = require("cors");
const libraryItems = require("./routes/libraryItems");
const category = require("./routes/categories");
const error = require("./middleware/error");
Joi.objectId = require("joi-objectid")(Joi);
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/LibraryItems", libraryItems);
app.use("/api/categories", category);
app.use(error);

app.listen(5000, () => {
  console.log("listening on port 5000...");
});

mongoose
  .connect("mongodb://localhost/library-DB")
  .then(() => console.log("connected to MongoDB..."))
  .catch((error) => console.log("Could not connect...", error));
