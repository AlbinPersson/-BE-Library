const mongoose = require("mongoose");
const express = require("express");
const { LibraryItem, validate } = require("../models/LibraryItem");
const { Category } = require("../models/Category");
const router = express.Router();

router.get("/", async (req, res) => {
  const libraryItems = await LibraryItem.find().populate("category");
  return res.send(libraryItems);
});

router.get("/:id", async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(!req.params.id))
    return res.status(400).send("Invalid Id");

  const libraryItem = await LibraryItem.findById(req.params.id).populate(
    "category"
  );
  if (!libraryItem) return res.status(404).send("Not Found");

  return res.send(libraryItem);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error);

  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(404).send("Invalid categoryId");

  const libraryItem = new LibraryItem({
    category,
    isBorrowable: req.body.type !== "reference_book",
    title: req.body.title,
    author: req.body.author,
    pages: req.body.pages,
    runTimeMinutes: req.body.runTimeMinutes,
    type: req.body.type,
  });

  await libraryItem.save();

  return res.send(libraryItem);
});

router.put("/:id", async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(!req.params.id))
    return res.status(400).send("Invalid Id");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error);

  if (req.body.type === "reference_book" && req.body.borrower)
    return res.status(400).send("Reference book is not borrowable");

  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(404).send("Category Not Found");

  const libraryItem = await LibraryItem.findById(req.params.id);
  if (!libraryItem) return res.status(404).send("Not Found");

  //check out
  if (!req.body.borrower) {
    await LibraryItem.updateOne(
      { _id: req.params.id },
      { $unset: { borrower: 1, borrowDate: 1 } }
    );
  }

  libraryItem.category = category;
  libraryItem.title = req.body.title;
  libraryItem.type = req.body.type;
  libraryItem.isBorrowable = req.body.type !== "reference_book";

  if (["book", "reference_book"].includes(req.body.type)) {
    libraryItem.author = req.body.author;
    libraryItem.pages = req.body.pages;
  }
  if (["dvd", "audio_book"].includes(req.body.type))
    libraryItem.runTimeMinutes = req.body.runTimeMinutes;

  //check in
  if (req.body.borrower && !libraryItem.borrower) {
    libraryItem.borrower = req.body.borrower;
    libraryItem.borrowDate = new Date();
  }

  await libraryItem.save();

  return res.send(libraryItem);
});

router.delete("/:id", async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(!req.params.id))
    return res.status(400).send("Invalid Id");

  const libraryItem = await LibraryItem.findByIdAndDelete(req.params.id);
  if (!libraryItem) return res.status(404).send("Not Found");

  return res.send(libraryItem);
});

module.exports = router;
