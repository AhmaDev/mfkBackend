var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var fs = require("fs");
var cors = require("cors");

var indexRouter = require("./routes/index");
const connection = require("./helpers/db");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const baseApi = "/api";

app.use(`/`, indexRouter);
app.use(baseApi, indexRouter);

var routes = fs.readdirSync("./routes/");
routes.forEach((route) => {
  app.use(baseApi, require("./routes/" + route));
});

app.get(baseApi + "/report/income/:currency", (req, res) => {
  let query = "";
  if (req.query.dateFrom && req.query.dateTo) {
    query =
      query +
      `AND CAST(payment.createdAt AS DATE) BETWEEN '${req.query.dateFrom}' AND '${req.query.dateTo}'`;
  }
  connection.query(
    `SELECT payment.*, location.locationTitle, location.percentage, location.position FROM payment LEFT JOIN location ON location.idLocation = payment.locationId WHERE paymentCurrency = '${req.params.currency}' ${query}`,
    (err, result) => {
      console.log(err);
      res.send(result);
    },
  );
});

app.get("/api/uploads/:path/:file", function (request, response) {
  let file = request.params.file;
  var extension = file.split(".").pop();
  var tempFile = path.join(
    __dirname,
    "uploads/" + request.params.path + "/" + file,
  );
  fs.readFile(tempFile, function (err, data) {
    switch (extension) {
      case "jpg":
        contentType = "image/jpg";
        isImage = 1;
        break;
      case "png":
        contentType = "image/png";
        isImage = 1;
        break;
      case "pdf":
        contentType = "application/pdf";
        isImage = 2;
        break;
      case "jpeg":
        contentType = "image/jpeg";
        isImage = 1;
        break;
    }
    if (
      ["jpg", "jpeg", "png", "gif", "pdf", "mp4", "mp3"].includes(extension)
    ) {
      response.contentType(contentType);
      response.send(data);
    } else {
      response.download(tempFile);
    }
  });
});
module.exports = app;
