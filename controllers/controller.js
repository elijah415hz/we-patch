// *********************************************************************************
// controller.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

const axios = require('axios')

// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {

  // Get route
  app.get("/", function(req, res) {
    res.render("index")
  });

  app.get("/signup", function(req, res) {
    res.render("signup")
  });

  // Get route for all gardens
  app.get("/api/gardens", function(req, res) {
    db.Garden.findAll().then(result=>{
      res.json(result);
    })
  })

  // Get route for all composts
  app.get("/api/composts", function(req, res) {
    db.Compost.findAll().then(result=>{
      res.json(result);
    })
  })
  // POST route 
  app.post("/email", function(req, res) {

  });

  app.post("/api/gardens", function(req, res) {
    const APIKey = '0a157990-f940-11ea-ac04-cb65445966da'
    axios.get(`https://app.geocodeapi.io/api/v1/search?apikey=${APIKey}&text=${req.body.address}`)
  .then(response => {
    console.log(response);
    db.Garden.create({
      name: req.body.name,
      address: req.body.address,
      latitude: response.data.bbox[1],
      longitude: response.data.bbox[0],
      description: req.body.description,
      length: req.body.length,
      width: req.body.width
      // pictureLink: generated by cloudinary
    }).then(result=>{
      res.json(result)
    }
    ).catch(err=>{
      res.status(500).send("broken server")
    })
  })
  .catch(error => {
    console.log(error);
  });
  });

  // DELETE route 
  app.delete("/", function(req, res) {

  });

  // PUT route
  app.put("/api/posts", function(req, res) {

  });
};
