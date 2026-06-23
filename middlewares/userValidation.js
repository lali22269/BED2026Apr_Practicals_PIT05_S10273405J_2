// middlewares/userValidation.js
const Joi = require("joi");

const userSchema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().max(50).allow(null, ''),
    lastName: Joi.string().max(50).allow(null, ''),
    role: Joi.string().valid('user', 'admin', 'moderator').default('user')
});

function validateUser(req, res, next) {
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(", ");
        return res.status(400).json({ error: errorMessage });
    }
    next();
}

function validateUserId(req, res, next) {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ 
            error: "Invalid user ID. ID must be a positive number" 
        });
    }
    next();
}

module.exports = { validateUser, validateUserId };