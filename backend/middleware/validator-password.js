const passwordSchema = require('../models/Password');

module.exports = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
        res.status(400).json({ message: 'Le mot de passe doit comporter au minimum 8 caractères, une majuscule, une minuscule et 2 chiffres.' });
    } else {
        next();
    }
};