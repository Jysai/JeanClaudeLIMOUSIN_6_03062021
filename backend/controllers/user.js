const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const User = require("../models/User");

exports.signup = (req, res, next) => {
 bcrypt   //Hashage du mot de passe
    .hash(req.body.password, 10)
    .then((hash) => { 
      const user = new User({ // création de l'utilisateur à partir du model User
        email: req.body.email,
        password: hash,
      });
      user
        .save() // la méthode save permet d'enregristrer l'utilisateur dans la base de données
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
  
};

exports.login = (req, res, next) => { 
  User.findOne({ email: req.body.email }) // La méthode findOne permet de trouver un seul utilisateur dans la base de données
    .then((user) => {
      if (!user) {  
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt 
        .compare(req.body.password, user.password) // comparaison du mot de passe
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" }); 
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", { 
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
