var express = require("express");
const capitalize = require("../helpers/capitalize");
const connection = require("../helpers/db");
var router = express.Router();
var path = require("path");

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
      if (result.length > 0) {
        res.send(result[0]);
      } else {
        res.sendStatus(404);
      }
    },
  );
});

router.get(`/paymentByCurrency/:currency/:id`, function (req, res, next) {
  connection.query(
    `SELECT *, (SELECT percentage FROM location WHERE idLocation = payment.locationId) As finalPercentage,(SELECT IFNULL(SUM(price),0) FROM paymentCut WHERE paymentCut.paymentId = payment.idPayment AND paymentCut.method = 'minus') As totalCut, (SELECT @totalAds := IFNULL(SUM(price),0) FROM paymentCut WHERE paymentCut.paymentId = payment.idPayment AND paymentCut.method = 'plus') As totalAdds, ((@totalAds * (SELECT percentage FROM location WHERE idLocation = payment.locationId) / 100)) As addsPercentage FROM ${tableName} WHERE locationId = ${req.params.id} AND paymentCurrency = '${req.params.currency}'`,
    (err, result) => {
      connection.query(
        `SELECT * FROM paymentCut WHERE locationId = ${req.params.id}`,
        (cutErr, cutRes) => {
          result.forEach((element) => {
            element.companyPercentage = 0;
            element.cuts = cutRes.filter(
              (e) => e.paymentId == element.idPayment,
            );
          });
          res.send(result);
        },
      );
    },
  );
});

router.post(`/add${capitalize(tableName)}`, function (req, res, next) {
  connection.query(
    `INSERT INTO ${tableName} SET ?`,
    req.body,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.send(result);
      }
    },
  );
});

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
    `DELETE FROM paymentCutImage WHERE paymentId = ${req.params.id}`,
  );
  connection.query(
    `DELETE FROM paymentCut WHERE paymentId = ${req.params.id}`,
    (err, result) => {
      connection.query(
        `DELETE FROM payment WHERE idPayment = ${req.params.id}`,
        (err2, result2) => {
          res.sendStatus(200);
        },
      );
    },
  );
});

module.exports = router;
