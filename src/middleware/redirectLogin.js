const path = require('path');
const viewsPath = path.join(__dirname, '../templates/views');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        // res.redirect(`${publicDirectoryPath}/login.html`);
        // let login = encodeURIComponent('\login');
        
        res.redirect('/login');
    } else {
        next();
    }
}

module.exports = redirectLogin;