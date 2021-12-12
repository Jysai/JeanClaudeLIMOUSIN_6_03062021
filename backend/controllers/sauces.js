const Sauce = require("../models/Sauce");  //importation du modèle sauce
const fs = require("fs");

// Enregristrement de la sauce dans la base de données à partir du modèle suace
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${ 
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
  });
  sauce
    .save()  //la méthode save enregistre l'objet dans la base
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};
 
// Récupèration de toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find() //La méthode find permet de récupérer tous les objets
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};


// Récupèration d'une seule sauce
exports.getOneSauce = (req, res, next) => {
  const saucedId = req.params.id;
  Sauce.findOne({ _id: saucedId }) //La méthode find permet de récupérer un seul objet
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};



// Modification de la sauce
exports.modifySauce = (req, res, next) => {
  const saucedId = req.params.id;
  if (req.file) {
    Sauce.findOne({ _id: saucedId }).then((sauce) => { 
      const fileName = sauce.imageUrl.split("/images/")[1]; 
      fs.unlink(`images/${fileName}`, (err) => { 
        if (err) console.log(err);
        else {
          console.log("Image supprimée: " + fileName);
        }
      });
    });
  }
  const sauceObject = req.file 
    ? {
        ...JSON.parse(req.body.sauce), 
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne({ _id: saucedId }, { ...sauceObject, _id: saucedId }) // la méthode updateOne permet de mettre à jour l'objet dans la base de données
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch((error) => res.status(404).json({ error }));
};

//
exports.deleteSauce = (req, res, next) => {
  const saucedId = req.params.id;  

  Sauce.findOne({ _id: saucedId }) //On récupère la sauce
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1]; 
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: saucedId }) // la méthode deleteOne permet de supprimer l'objet dans la base
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};


//
exports.rateSauce = (req, res, next) => {
  const like = req.body.like;
  const userId = req.body.userId; 
  const saucedId = req.params.id; 
  if (like === 1) { //Option qui permet de "liker"
    Sauce.updateOne(
      { _id: saucedId }, //Identification de la sauce
      {
        $inc: { likes: 1 }, // on incrémente de 1 quand l'utilisateur aime la sauce
        $push: { usersLiked: userId }, //Ajout de l'utilisateur qui a aimé la sauce dans un tableau avec l'opérateur $push 
      }
    )
      .then(() => res.status(200).json({ message: "Vous aimez cette sauce" }))
      .catch((error) => res.status(400).json({ error }));
  } else if (like === -1) { //Option qui permet de "disliker"
    Sauce.updateOne(
      { _id: saucedId }, //Identification de la sauce
      {
        $inc: { dislikes: 1 }, // on incrémente de 1 quand l'utilisateur n'a aimé
        $push: { usersDisliked: userId }, // Ajout de l'utilisateur qui n'a pas aimé la sauce dans un tableau avec l'opérateur $push
      }
    )
      .then(() =>
        res.status(200).json({ message: "Vouns n'aimez pas cette sauce" })
      )
      .catch((error) => res.status(400).json({ error }));
  } else { //Option qui permet à l'utilisateur d'enlever son like ou dislike
    Sauce.findOne({ _id: saucedId }) 
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) { //Identification de l'utilisateur qui a aimé la sauce
          Sauce.updateOne( //on met à jour la sauce avec l'opérateur $inc qui permet de retirer le like en ajoutant une valeur négative et on retire l'utilisateur avec l'opérateur $pull
            { _id: saucedId }, //Identification de la sauce
            { $inc: { likes: -1 }, $pull: { usersLiked: userId } }
          )
            .then(() =>
              res.status(200).json({ message: "Vous n'aimez plus cette sauce" })
            )
            .catch((error) => res.status(500).json({ error }));
        } else if (sauce.usersDisliked.includes(userId)) { //Identification de l'utilisateur qui n'a pas aimé la sauce
          Sauce.updateOne( //on met à jour la sauce avec l'opérateur $inc qui permet de retirer le dislike en ajoutant une valeur négative et on retire l'utilisateur avec l'opérateur $pull
            { _id: saucedId }, 
            { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } } 
          )
            .then(() =>
              res
                .status(200)
                .json({
                  message: "Avez-vous changé d'avis concernant cette sauce?",
                })
            )
            .catch((error) => res.status(500).json({ error }));
        }
      })
      .catch((error) => res.status(404).json({ error }));
  }
};


