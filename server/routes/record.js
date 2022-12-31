const { application } = require("express");
const bodyParser = require("body-parser");
const express = require("express");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const recordRoutes = express.Router();

const dbo = require("../db/conn");
const agg_mongo_pipeline = [
  {
    $project: {
      _id: 1,
      viewableImpressionsCount: "$viewableImpressionsCount",
      inviewImpressionsCount: "$inviewImpressionsCount",
      differcent: {
        $subtract: ["$viewableImpressionsCount", "$inviewImpressionsCount"],
      },
    },
  },
  {
    $match: {
      differcent: {
        $gt: 0,
      },
    },
  },
  {
    $sort: {
      differcent: -1,
    },
  },
  // ,
  // {
  //   $count: "string",
  // },
];

recordRoutes.route("/").get(async function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// This section will help you get a list of all the documents.
recordRoutes.route("/listings").get(async function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection("geoHourlyAggregation")
    .find({})
    .limit(10)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error fetching listings!");
      } else {
        res.json(result);
      }
    });
});
recordRoutes.route("/listOne").get(function (req, res) {
  let db_connect = dbo.getDb();
  let myquery = { city: "Other" };
  // console.log(res.params.city)
  db_connect
    .collection("cityHourlyAggregation")
    .findOne(myquery, function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});
recordRoutes.route("/inview_validation").get(async function (req, res) {
  const dbConnect = dbo.getDb();

  const aggCursor = dbConnect
    .collection("geoHourlyAggregation")
    .aggregate(agg_mongo_pipeline)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error to execute pipeline!");
      } else {
        res.json(result);
      }
    });
});

// This section will help you get a single record by id
recordRoutes.route("/city_listings/:city").get(function (req, res) {
  let db_connect = dbo.getDb();
  let myquery = { city: req.params.city };
  console.log(myquery)
  db_connect
    .collection("cityHourlyAggregation")
    .findOne(myquery, function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

// This section will help you create a new document.
recordRoutes.route("/listings/addRecord").post(function (req, res) {
  const dbConnect = dbo.getDb();
  const matchDocument = {
    _id: req.body.id,
    time: new Date(),
    adgroupid: req.body.adgroupid,
    cid: req.body.cid,
    wid: req.body.wid,
  };

  dbConnect
    .collection("cityHourlyAggregation")
    .insertOne(matchDocument, function (err, result) {
      if (err) {
        res.status(400).send("Error inserting matches!");
      } else {
        console.log(`Added a new match with id ${result.insertedId}`);
        res.status(204).send();
      }
    });
});

// This section will help you update a document by id.
recordRoutes.route("/listings/updateRecord").post(function (req, res) {
  const dbConnect = dbo.getDb();
  const listingQuery = { _id: req.body.id };
  const updates = {
    $inc: {
      likes: 1,
    },
  };

  dbConnect
    .collection("cityHourlyAggregation")
    .updateOne(listingQuery, updates, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error updating likes on listing with id ${listingQuery.id}!`);
      } else {
        console.log("1 document updated");
      }
    });
});

// This section will help you delete a record.
recordRoutes.route("/listings/delete/:id").delete((req, res) => {
  const dbConnect = dbo.getDb();
  const listingQuery = { listing_id: req.body.id };

  dbConnect
    .collection("cityHourlyAggregation")
    .deleteOne(listingQuery, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting listing with id ${listingQuery.listing_id}!`);
      } else {
        console.log("1 document deleted");
      }
    });
});

module.exports = recordRoutes;
