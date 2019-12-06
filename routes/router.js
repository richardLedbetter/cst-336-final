const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const session = require('express-session')


router.get('/', async function(req, res) {
    // ADD AFTER LOGIN AND REGISTER FUNCTIONS ARE FINISHED
    if (req.session && req.session.username && req.session.username.length) {
        res.render('../routes/views/index');
    }
    
    else {
        delete req.session.username;
        res.redirect('/login');
    }
    
    console.log("req.sesison.username", req.session.username);

});

router.get('/login', async function(req, res) {

    res.render('../routes/views/login');
    
});

router.post('/login', async function(req, res, next) {
    
    let successful = false;
    let rows = await userLogin(req.body);
    if (rows.length > 0) {
        if (rows[0].password == req.body.password &&
        rows[0].username == req.body.username) {
            successful = true;
            req.session.username = rows[0].username;
        }
    }

    res.json({
        successful: successful
    });

});

router.get("/register", function(req, res){
        res.render("../routes/views/newUser");

});

router.post("/register", async function(req, res){
  let rows = await insertUser(req.body);
  let successful = false;

  let message = "User WAS NOT added to the database!";
  if (rows.affectedRows > 0) {
      message= "User successfully added!";
      successful = true;
      let rows = await userLogin(req.body);
      if (rows.length > 0) {
        if (rows[0].password == req.body.password &&
            rows[0].username == req.body.username) {
                req.session.username = rows[0].username;
        }
    }
  }
  res.json({
        successful: successful,
    });

});

function userLogin(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                    FROM auth
                    WHERE username = ? 
                    AND password = ?  
                         `;
        
           let params = [body.username, body.password];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });
    });
}

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
              conn.end();
              resolve(rows);
           });
        
        });
    });
}

function dbConnection(){

   let conn = mysql.createConnection({
            host: 'gmgcjwawatv599gq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            user: 'vfm9xud3bujugz4m',
            password: 'lejefickxq2gb25k',
            database: 'wn3abfps8rizmpki'
       });

return conn;

}

function getUserInfo(body){
   
   let u = body.username;
   console.log(u);
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * FROM auth`;
                      
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
<<<<<<< HEAD
              resolve(rows);
=======
              resolve(rows); //Query returns only ONE record
>>>>>>> 099aa47035885accb653358d83a7932b29d42e9b
           });
        });//connect
    });//promise 
}

module.exports = router;
