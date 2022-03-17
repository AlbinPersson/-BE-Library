module.exports = function (req, res, next) {
  return res.status(500).send("Internal server error");
};
