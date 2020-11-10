const path = require('path');
const viewsPath = path.join(__dirname, '../templates/views');

const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        // res.sendFile(`${viewsPathh}/login.html`);
        
        res.redirect('/home');
    } else {
        console.log(req.session);
        next();
    }
}

module.exports = redirectHome;