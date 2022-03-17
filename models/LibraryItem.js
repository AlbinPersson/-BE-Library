const mongoose = require("mongoose");
const Joi = require("joi");

const LibraryItem = mongoose.model(
  "LibraryItem",
  new mongoose.Schema({
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    title: { type: String, required: true },
    author: {
      type: String,
      required: function () {
        return ["book", "reference_book"].includes(this.type);
      },
    },
    pages: {
      type: Number,
      min: 1,
      required: function () {
        return ["book", "reference_book"].includes(this.type);
      },
    },
    runTimeMinutes: {
      type: Number,
      min: 1,
      required: function () {
        return ["dvd", "audio_book"].includes(this.type);
      },
    },
    isBorrowable: { type: Boolean, required: true },
    borrower: String,
    borrowDate: Date,
    type: {
      type: String,
      enum: ["book", "dvd", "audio_book", "reference_book"],
      required: true,
    },
  })
);

function validate(body) {
  switch (body.type) {
    case "book":
    case "reference_book":
      return validateBook(body);

    case "dvd":
    case "audio_book":
      return validateMedia(body);

    default:
      return { error: "Invalid Type or Missing Type" };
  }
}

function validateBook(book) {
  const schema = Joi.object({
    categoryId: Joi.objectId().required(),
    title: Joi.string().required(),
    author: Joi.string().required(),
    pages: Joi.number().min(1).required(),
    type: Joi.string().required(),
    borrower: Joi.string().min(1),
  });

  return schema.validate(book);
}

function validateMedia(media) {
  const schema = Joi.object({
    categoryId: Joi.objectId().required(),
    title: Joi.string().required(),
    runTimeMinutes: Joi.number().min(1).required(),
    type: Joi.string().required(),
    borrower: Joi.string(),
  });

  return schema.validate(media);
}

exports.LibraryItem = LibraryItem;
exports.validate = validate;
