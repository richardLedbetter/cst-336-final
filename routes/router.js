const express = require('express');
const router = express.Router();
const mysql = require("mysql");
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true })); //use to parse data sent using the POST method


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

router.get("/register", function(req, res){
        res.render("../routes/views/newUser");

});

router.post("/register", async function(req, res){
  //res.render("newAuthor");
  let rows = await insertUser(req.body);
  console.log(rows);
  //res.send("First name: " + req.body.firstName); //When using the POST method, the form info is stored in req.body
  let message = "User WAS NOT added to the database!";
  if (rows.affectedRows > 0) {
      message= "User successfully added!";
  }
  res.render("../routes/views/newUser", {"message":message});
    
});

function insertUser(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO auth (username, password, email)
                    VALUES (?,?,?)    
                         `;
        
           let params = [body.username, body.password, body.email];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function dbConnection(){

   let conn = mysql.createConnection({
            host: 'gmgcjwawatv599gq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            user: 'vfm9xud3bujugz4m',
            password: 'lejefickxq2gb25k',
            database: 'wn3abfps8rizmpki'
       }); //createConnection

return conn;

}

function getUserInfo(userId){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT *
                      FROM auth
                      WHERE userId = ?`;
        
           conn.query(sql, [userId], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows[0]); //Query returns only ONE record
           });
        
        });//connect
    });//promise 
}


module.exports = router;
