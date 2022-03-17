const express = require("express");
const mongoose = require("mongoose");
const { Category, validate } = require("../models/Category");
const { LibraryItem } = require("../models/LibraryItem");
const router = express.Router();

router.get("/", async (req, res) => {
  const category = await Category.find();
  return res.send(category);
});

router.get("/:id", async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(!req.params.id))
    return res.status(400).send("Invalid Id");

  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).send("Not Found");

  return res.send(category);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  const categoryAlreadyExists = await Category.findOne({ name: req.body.name });
  if (categoryAlreadyExists) {
    return res.status(400).send("Category name is not unique");
  }

  const category = new Category({ name: req.body.name });

  await category.save();

  return res.send(category);
});

router.put("/:id", async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(!req.params.id))
    return res.status(400).send("Invalid Id");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  const categoryAlreadyExists = await Category.findOne({ name: req.body.name });
  if (categoryAlreadyExists)
    return res.status(400).send("Category name is not unique");

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );
  if (!category) return res.status(404).send("Not Found");

  return res.send(category);
});

router.delete("/:id", async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(!req.params.id))
    return res.status(400).send("Invalid Id");

  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).send("Category Not Found");

  const categoryIsReferenced = await LibraryItem.findOne({
    category: category._id,
  });

  if (categoryIsReferenced)
    return res
      .status(400)
      .send("cannot deleted until the reference is removed first");

  await Category.findByIdAndDelete(req.params.id);

  return res.send(category);
});

module.exports = router;
