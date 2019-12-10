const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const session = require('express-session')

const url = require('url');

router.use(express.json());

router.get('/', async function(req, res) {
    console.log("username: ", req.session.username);
    if (req.session && req.session.username && req.session.username.length) {
        let username = req.session.username;
        let user = await getSingleUserInfo(username);
        console.log("root - user:", user);
        res.redirect("/home");
    }
    else {
        delete req.session.username;
        res.redirect('/login');
    }
    

});

router.get('/index', async function(req, res) {

    res.render('../routes/views/index');
    
});

router.get('/home', async function(req, res) {
    console.log("here",req.session.username);
    let user = await getSingleUserInfo(req.session.username);
    console.log("User-home: ", user);
    res.render('../routes/views/home', {"user":user});
    
});

router.get('/login', async function(req, res) {

    res.render('../routes/views/login');
    
});

router.post('/login', async function(req, res, next) {
    
    let successful = false;
    let rows = await userLogin(req.body);
    console.log("Login: ", req.body);
    console.log("rows: ", rows);
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

router.get('/logout', function(req, res, next) {

    if (req.session && req.session.username && req.session.username.length) {
        delete req.session.username;
        res.redirect("/index");
    }

    res.json({
        successful: true,
        message: ''
    });

});

router.get("/register", function(req, res){ // should this be async? 
    res.render("../routes/views/newUser");
});

router.post("/register", async function(req, res){
  let rows = await insertUser(req.body);
  let rows2 = await addUserInfo(req.body); // to add their info into the system
  let successful = false;

  let message = "User WAS NOT added to the database!";
  if (rows.affectedRows > 0 && rows2.affectedRows > 0) {
      message= "User successfully added!";
      successful = true;
      let rows = await userLogin(req.body);
      if (rows.length > 0) {
        if (rows[0].password == req.body.password &&
            rows[0].username == req.body.username) {
                req.session.username = rows[0].username;
                req.session.email = rows[0].email;
        }
    }
  }
  res.json({
        successful: successful,
    });

});

router.get("/userInfo", function(req, res){
    console.log(req.query);
    res.render("../routes/views/userInfo");
});

router.get("/editUserInfo", async function(req, res){
    let userInfo = await getSingleUserInfo(req.query);
    console.log("query", req.query);
    res.render("../routes/views/editUserInfo", { "user": userInfo });
});

router.post("/editUserInfo", async function(req, res){
    // updates the user info
    console.log(req.body)
    let rows = await updateUser(req.body);
    
    let userInfo = req.body;
    // console.log("post->update->req.body",req.body);
    // console.log(rows);
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

            let sql = `UPDATE user_info
                      SET name = ?, 
                          age  = ?,
                          gender  = ?,
                          height = ?,
                          weight = ?
                     WHERE email = ?`;

            let params = [body.name, body.age, body.gender, body.height, body.weight, body.email];

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
        //   console.log("Connected!");
        
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
        //   console.log("Connected!");
        
           let sql = `INSERT INTO auth
                      (username, password, email)
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

function addUserInfo(body){
   
   let conn = dbConnection();
//   console.log(body.name);
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
        //   console.log("Connected!");
        
           let sql = `INSERT INTO user_info
                      (name, age, email)
                      VALUES (?,?,?)    
                      `;
        
           let params = [body.name, body.age, body.email];
        
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

function getSingleUserInfo(username){
    let conn = dbConnection();
    
    console.log("get single user - username: ", username);
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
          if (err) throw err;
        //   console.log("Connected!");
        
            let sql = `
                    SELECT *
                    FROM user_info
                    WHERE username = ?`;
            // console.log(sql); 
            conn.query(sql, [username], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              //console.log(rows);
              resolve(rows); //Query returns only ONE record
            });
            
        });//connect
    });//promise
    
}

// function getSingleUserInfo(email){
//     let conn = dbConnection();
    
//     console.log(email);
    
//     return new Promise(function(resolve, reject){
//         conn.connect(function(err) {
//           if (err) throw err;
//         //   console.log("Connected!");
        
//             let sql = `
//                     SELECT a.email, a.username, u.name, u.age, u.gender, u.height, u.weight
//                     FROM auth a
//                     LEFT JOIN user_info u USING(email)`;
//             // console.log(sql); 
//             conn.query(sql, [email], function (err, rows, fields) {
//               if (err) throw err;
//               //res.send(rows);
//               conn.end();
//               console.log(rows);
//               resolve(rows[0]); //Query returns only ONE record
//             });
            
//         });//connect
//     });//promise
    
// }

function getUserInfo(body){
   
   let u = body.username;
//   console.log(u);
   
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
