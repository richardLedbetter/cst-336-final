const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const session = require('express-session')


router.get('/', async function(req, res) {
    // ADD AFTER LOGIN AND REGISTER FUNCTIONS ARE FINISHED
    if (req.session && req.session.username && req.session.username.length) {
        res.render('../routes/views/home');
    }
    else {
        delete req.session.username;
        res.redirect('../routes/views/index');
    }
    
    console.log("req.sesison.username", req.session.username);

});

router.get('/index', async function(req, res) {

    res.render('../routes/views/index');
    
});

router.get('/home', async function(req, res) {

    res.render('../routes/views/home');
    
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

router.get("/register", function(req, res){ // should this be async? 
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

router.get("/userInfo", function(req, res){
    res.render("../routes/views/userInfo");
});

router.post("/userInfo", async function(req, res){
    // updates the user info
    let rows = await updateUser(req.body);
    
    let userInfo = req.body;
    console.log("post->update->req.body",req.body);
    console.log(rows);
    let message = "Author WAS NOT updated!";
    if (rows.affectedRows > 0) {
        message = "Author successfully updated!";
    }
    res.render("../routes/views/userInfo", { "message": message, "user": userInfo });
});

function updateUser(body) {

    let conn = dbConnection();

    return new Promise(function(resolve, reject) {
        conn.connect(function(err) {
            if (err) throw err;
            // console.log("Connected!");

            let sql = `UPDATE l9_author
                      SET firstName = ?, 
                          lastName  = ?
                     WHERE authorId = ?`;

            let params = [body.firstName, body.lastName, body.authorId];

            // console.log(sql);
            // console.log(params);

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                //res.send(rows);
                conn.end();
                resolve(rows);
            });

        }); //connect
    }); //promise 
}

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
              resolve(rows); //Query returns only ONE record
           });
        });//connect
    });//promise 
}

module.exports = router;
