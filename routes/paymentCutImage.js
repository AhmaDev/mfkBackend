var express = require("express");
const capitalize = require("../helpers/capitalize");
const connection = require("../helpers/db");
var router = express.Router();
var path = require("path");
const upload = require("../middleware/upload.middleware");

const tableName = path.basename(__filename).split(".")[0];

router.get(`/${tableName}s`, function (req, res, next) {
  connection.query(`SELECT * FROM ${tableName}`, (err, result) => {
    res.send(result);
  });
});

router.get(`/${tableName}/:id`, function (req, res, next) {
  connection.query(
    `SELECT * FROM ${tableName} WHERE locationId = ${req.params.id}`,
    (err, result) => {
      res.send(result);
    },
  );
});

router.post(
  `/add${capitalize(tableName)}`,
  upload.single("file"),
  function (req, res, next) {
    var path = `uploads/paymentCut/${req.file.filename}`;
    connection.query(
      `INSERT INTO ${tableName} SET ?`,
      {
        locationId: req.body.locationId,
        paymentCutId: req.body.paymentCutId,
        paymentId: req.body.paymentId,
        imagePath: path,
      },
      (err, result) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
      },
    );
  },
);

router.put(`/${tableName}/:id`, function (req, res, next) {
  connection.query(
    `UPDATE ${tableName} SET ? WHERE id${capitalize(tableName)} = ${
      req.params.id
    }`,
    req.body,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    },
  );
});

router.delete(`/${tableName}/:id`, function (req, res, next) {
  connection.query(
    `DELETE FROM ${tableName} WHERE id${capitalize(tableName)} = ${
      req.params.id
    }`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    },
  );
});

module.exports = router;
