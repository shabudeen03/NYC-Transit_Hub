async function authMiddleware(req, res, next) {
    if(!req.session.userId) {
        return res.status(401).json({ user: null });
    }

    next();
}

module.exports = {
    authMiddleware
}