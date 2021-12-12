const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const limiter = require("./middleware/api-limiter");
const helmet = require("helmet");

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user')

mongoose
  .connect(
    "mongodb+srv://@cluster0.sazzy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());

app.use(helmet())

app.use(mongoSanitize());

app.use('/images',express.static(path.join(__dirname,'images')));

app.use('/api/sauces', limiter, saucesRoutes)

app.use('/api/auth', limiter, userRoutes);


module.exports = app;
