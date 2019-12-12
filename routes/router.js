const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const session = require('express-session');

const url = require('url');

router.use(express.json());

router.get('/', async function(req, res) {
    console.log("username: ", req.session.username);
    if (req.session && req.session.username && req.session.username.length) {
        let username = req.session.username;
<<<<<<< HEAD
        let user = await getSingleUserInfo(username);
        
        res.redirect('/home');
        
        // res.redirect(url.format({
        //     pathname: '/home',
        //     query: {
        //         "user": user.username
        //     }
        // })); // redirect instead of render because otherwise it wasnt entering the get and post, therefore I couldnt pass user info into the next pages
=======
        res.redirect('/home'); // redirect instead of render because otherwise it wasnt entering the get and post, therefore I couldnt pass user info into the next pages

>>>>>>> 093d8bde70abaac23cb29923f0c4f21f7d3f7e85
    }
    else {
        delete req.session.username;
        res.redirect('/cst_336');
    }
    

});

router.get('/cst_336', async function(req, res) {

    res.render('../routes/views/cst_336');
    
});


router.get('/index', async function(req, res) {

    res.render('../routes/views/index');
    
});

router.get('/home', async function(req, res) {
    let data = await getSingleUserInfo(req.session.username);
    res.render('../routes/views/home', {"user": req.session.username,"user_data":data});
    // if(req.session && req.session.username && req.session.username.length) {
        
    // }
    
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

router.get('/logout', function(req, res, next) {

    if (req.session && req.session.username && req.session.username.length) {
        delete req.session.username;
        res.redirect("/login");
    }

    res.json({
        successful: true,
        message: 'Logged out'
    });

});

router.get("/register", function(req, res){ // should this be async? 
    res.render("../routes/views/newUser");
});

router.post("/register", async function(req, res){
    let message = "User WAS NOT added to the database!";
    let successful = false;
    let emailCheck = emailIsValid(req.body.email);
    
    // Check if inputs are valid before checking with sql table
    
    if (req.body.username == '' ||
           req.body.password == '' ||
           req.body.email == '' ||
           req.body.name == '' ||
           req.body.age == '') {
      message = "Some fields are empty";
  }
  else if (!emailCheck) {
      message = "Invalid email format";
  }
    else if (isNaN(req.body.age) || parseInt(req.body.age) < 21 || parseInt(req.body.age) > 99) {
      message = "Invalid age";
  }
  
  
  // Call sql checks
  else {
      let checkEmail = await registrationCheckEmail(req.body);
      let checkUsername = await registrationCheckUsername(req.body);
    
      if (checkEmail[0].cnt > 0) {
          message = "Email already exists";
      }
      else if (checkUsername[0].cnt > 0) {
          message = "Username already exists";
      }
      
      
      else {
          console.log("req.body: ", req.body);
          let rows = await insertUser(req.body);
          let rows2 = await addUserInfo(req.body); // to add their info into the system
          if (rows.affectedRows > 0 && rows2.affectedRows > 0) {
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
      }
     
    }
    
    res.json({
        successful: successful,
        message: message
    });

});

router.get("/userInfo", async function(req, res){
    if (req.session && req.session.username && req.session.username.length) {
        let userInfo = await getSingleUserInfo(req.query.user);
        console.log(userInfo);
        console.log("userInfo: ", userInfo);
        res.render("../routes/views/userInfo", {"userInfo":userInfo});
    }
    else {
        delete req.session.username;
        res.redirect('/login');
    }
});

router.get("/editUserInfo", async function(req, res){
    if (req.session && req.session.username && req.session.username.length) {
        let editUser = await getSingleUserInfo(req.query.user);
        res.render("../routes/views/editUserInfo", { "userInfo": editUser });
    }
    
    else {
        delete req.session.username;
        res.redirect('/login');
    }
});

router.post("/editUserInfo", async function(req, res){
    // updates the user info
    if (req.session && req.session.username && req.session.username.length) {
    console.log(req.body);
    let rows = await updateUser(req.body);
    
    let userInfo = req.body;
    // console.log("post->update->req.body",req.body);
    // console.log(rows);
    let message = "User WAS NOT updated!";
    if (rows.affectedRows > 0) {
        message = "Changes saved!";
    }
    res.render("../routes/views/editUserInfo", { "message": message, "userInfo": userInfo });
    console.log("POST editUser: message - ", message);
    console.log("POST editUser: user - ", userInfo);

    }
});


router.get("/getBeer", async function(req,res) {
    
    let rows = await getBeerList();
    console.log("clicked");
    res.send(rows);
    
});


router.get("/getWine", async function(req,res) {
   
   let rows = await getWineList();
   res.send(rows);
   
});

router.get("/getMixed", async function(req,res){
	let rows = await getMixedList();
	res.send(rows);
	
});
router.get("/getMisc", async function(req,res){
	let rows = await getMiscList();
	res.send(rows);
	
});

router.get("/getShots", async function(req,res){
   let rows = await getShotsList();
   res.send(rows);
});

function getMiscList() {
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                      FROM misc_drinks`;
            console.log(sql);        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
}

function getShotsList() {
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                      FROM shots`;
            console.log(sql);        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
}

function getMixedList() {
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                      FROM mixed_drinks`;
            console.log(sql);        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
}
function getWineList() {
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                      FROM wine`;
            console.log(sql);        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
}

function getBeerList() {
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT * 
                      FROM beers`;
            console.log(sql);        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
}

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
                     WHERE username = ?`;

            let params = [body.name, body.age, body.gender, body.height, body.weight, body.username];

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
                      (username, age, email, name)
                      VALUES (?,?,?, ?)    
                      `;
        
           let params = [body.username, body.age, body.email, body.name];
        
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
              resolve(rows[0]); //Query returns only ONE record
            });
            
        });//connect
    });//promise
    
}


function getUserInfo(userId){
   
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

////////////////////////////
// CHECKS FOR VALID REGISTRATION
////////////////////////////
//------------------------------------
function emailIsValid (email) {
    
  return /\S+@\S+\.\S+/.test(email);
}

function registrationCheckEmail(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
        //   console.log("Connected!");
        
           let sql = `SELECT COUNT(email) AS cnt
                      FROM auth
                      WHERE email = ?`;
        
           conn.query(sql, [body.email], function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });
    });
}

function registrationCheckUsername(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
          console.log("RegistrationCheckUsername Connected!");
        
           let sql = `SELECT COUNT(username) AS cnt
                      FROM auth
                      WHERE username = ? 
                      `;
        
           conn.query(sql, [body.username], function (err, rows, fields) {
              if (err) throw err;
              conn.end();
              resolve(rows);
           });
        
        });
    });
}

//------------------------------------
////////////////////////////
// CHECKS FOR VALID REGISTRATION
////////////////////////////

module.exports = router;
