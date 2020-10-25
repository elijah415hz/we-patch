const express = require("express");
const router = express.Router();
const { QueryTypes } = require("sequelize");
const { sequelize } = require("../models");
const db = require("../models");
var cloudinary = require('cloudinary').v2;
const path = require("path")

// Get all gardens
router.get("/api/gardens", function (req, res) {
  db.Garden.findAll()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Get garden by id
router.get("/api/gardens/:id", function (req, res) {
  db.Garden.findOne({ where: { id: req.params.id } })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// return info_display.handlebars to display all gardens available
router.get("/gardens", function (req, res) {
  db.Garden.findAll((data) => {
    let gardenObject = {
      Garden: data,
    };
    console.log(gardenObject);
  }).catch((err) => {
    res.status(500).send(err);
  });
});

// Post route to add a garden
router.post("/api/gardens", function (req, res) {
  if (req.session.user && req.session.user.userType === "owner") {
    const image = req.files.image;
    console.log(image)
    image.mv(path.join(__dirname, '../public/images/userGarden'), function (err) {
      if (err) {
        console.error(err)
        return res.status(500).send(err);
      }

      cloudinary.uploader.upload(path.join(__dirname, '../public/images/userGarden'), function (error, result) {
        console.log(result, error)

        db.Owner.findOne({ where: { id: req.session.user.id } }).then(owner => {
          db.Garden.create({
            name: req.body.name,
            address: owner.address,
            latitude: owner.latitude,
            longitude: owner.longitude,
            description: req.body.description,
            length: req.body.length,
            width: req.body.width,
            OwnerId: owner.id,
            pictureLink: result.url
          }).then(result => {
            let garden = result.toJSON();
            garden.justPosted = true;
            garden.loggedIn = true;
            res.render("garden_display", garden)
          }
          ).catch(err => {
            res.status(500).send(err)
          }).catch((err) => {
            res.status(500).send(err);
          });
        });
      });
    });
  } else {
    res.redirect("/owners/login")
  }
});

//DELETE route to delete garden by ID
router.delete("/api/gardens/:id", function (req, res) {
  db.Garden.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((data) => {
      if (data === 0) {
        res.status(404).json(data);
      } else {
        res.json(data);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// PUT route
router.put("/api/gardens/:id", function (req, res) {
  db.Garden.update(
    req.body,
    {
      where: {
        id: req.params.id,
      },
    }
  ).then((result) => {
    db.Garden.findOne({
      where: { id: req.params.id },
    }).then((garden) => {
      res.render("garden_display", garden.toJSON());
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.put("/api/gardens/unassign/:id", function (req, res) {
  sequelize.query(`UPDATE Gardens SET GardenerId = NULL WHERE id = ${req.params.id}`, { type: QueryTypes.UPDATE }).then(update => {
    res.json(update)
  })
});

module.exports = router;
