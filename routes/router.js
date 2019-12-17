const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const session = require('express-session');
let conn = dbConnection();
const request = require('request');

var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');


router.use(express.json());

router.get('/', async function(req, res) {
    console.log("username: ", req.session.username);
    if (req.session && req.session.username && req.session.username.length) {
        let username = req.session.username;
        console.log("root - username", username);
        res.redirect('/home'); // redirect instead of render because otherwise it wasnt entering the get and post, therefore I couldnt pass user info into the next pages
    }
    else {
        delete req.session.username;
        res.redirect('/cst_336');
    }
    

});

router.get('/cst_336', async function(req, res) {
    if (req.session && req.session.username && req.session.username.length) {
        let data = await getSingleUserInfo(req.session.username);
        res.render('../routes/views/cst_336', {"data":data});
        console.log("data: ", data);
    }
    else {
    res.render('../routes/views/cst_336');
    }
    
});
router.post('/cst_336', async function(req, res) {

    res.render('../routes/views/cst_336');
    
});


router.post('/remove_page',async function(req, res) {

    console.log("clicked");
    let beer = await deleteBeer(req.body);
    //res.send(beer);
    
});

function deleteBeer(id){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
            
           let sql = `DELETE FROM available
                      WHERE user = ? AND start_date = ? AND start_time = ?`;
            arg = [id.name,id.start_date,id.start_time];
            console.log(arg);
           conn.query(sql,arg , function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

router.post('/add_page',async function(req,res){
    console.log("clicked");
    let beer = await add_page_cal(req.body);
    res.send(beer);
});

function add_page_cal(name){
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log(name);
        //available
        /*
        SELECT *  FROM users
                LEFT JOIN available
                ON users.user = available.user
                WHERE users.user like ? AND available.start_time > CURRENT_DATE()
                ORDER BY cast(start_date as datetime) asc
                
                user	text	
                start_date	datetime	
                start_time	time	
                Duration	int(11)	
                booked_by
        */
        //users
           let sql = `INSERT INTO available
                        (user, start_date,start_time,Duration,booked_by)
                         VALUES (?,?,?,?,?)`;
                    
            let params =[name.name ,name.start_date,name.start_time,name.duration,"unbooked"];
            
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
}















router.post('/load_page',async function(req,res){
    console.log("clicked");
    let beer = await load_page_cal(req.body.name);
    res.send(beer);
});

function load_page_cal(name){
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log(name);
        //available
        //users
           let sql = `SELECT *  FROM users
                LEFT JOIN available
                ON users.user = available.user
                WHERE users.user like ? AND available.start_time > CURRENT_DATE()
                ORDER BY cast(start_date as datetime) asc
             `;
                    
            let params =[name];
            
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
       
            host: 'e764qqay0xlsc4cz.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
            user: 'n3mnijtsrrx2d02x',
            password: 'szkpglvhpmg95zcu',
            database: 'a8zotkyp5y3cmeb3'
       });

return conn;

}




////////////////////////////
// CHECKS FOR VALID REGISTRATION
////////////////////////////
//------------------------------------


//------------------------------------
////////////////////////////
// CHECKS FOR VALID REGISTRATION
////////////////////////////





module.exports = router;
