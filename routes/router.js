const express = require('express');
const router = express.Router();


router.get('/', function(req, res) {

    if (req.session && req.session.username && req.session.username.length) {
        res.render('../routes/views/index');
    }
    
    else {
        delete req.session.username;
        res.redirect('/login');
    }


});

router.get('/login', function(req, res) {

    res.render('../routes/views/login');
});

router.post('/login', function(req, res, next) {

    // console.log('inside login post');

    let successful = false;
    let message = '';

    // TODO: replace with MySQL SELECT and hashing/salting...
    if (req.body.username === 'admin' && req.body.password === 'admin') {
        successful = true;
        req.session.username = req.body.username;
    }
    else {
        // delete the user as punishment!
        delete req.session.username;
        message = 'Wrong username or password!'
    }

    console.log('session username', req.session.username);

    // console.log('res.body', req.body);

    // Return success or failure
    res.json({
        successful: successful,
        message: message
    });

});


module.exports = router;
