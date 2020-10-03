var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
app.use(express.json());
var knex = require('knex')({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      user : 'root',
      password : 'pandit',
      database : 'test'
    }
});
knex.schema.hasTable('users').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('users', function(t) {
        t.increments('id').primary();
        t.string('name', 100);
        t.string('email', 100);
        t.string('password',100);
      });
    }
  });
app.get("/hello",(req,res)=>{
    res.send("hello world");
    console.log("hello world");
});
app.post("/SingUp",(req,res)=>{
  if(req.body.email.includes("@gmail.com")){
    knex.select("email","password").from("users").then((data)=>{
      var emails = data.map(emil=>emil["email"]);
      var passwords = data.map(pass=>pass["password"]);
      if(emails.includes(req.body.email)&&(passwords.includes(req.body.password))){
          res.send("Email is already exists..!");
          console.log("Email is already exists..");
      }else{
          knex("users").insert(req.body).then((data)=>{
          res.send("SingUp successfull")
          console.log("SingUp successfull");
        })
      }
    })
    
  }else{
    res.send("invalid 'email-id'")
    console.log("invalid 'email-id'");
  }
})
app.post("/login",(req,res)=>{
  knex.select("email","password").from("users").then((data)=>{
    var emails = data.map(emil=>emil["email"])
    if(emails.includes(req.body.email)){
      knex.select("*").from("users").where({"email":req.body.email}).then((userdata)=>{
        if(userdata[0].password==req.body.password){
          delete userdata[0].password
          var token = jwt.sign({"data":userdata} , 'shhhhh');
          res.cookie(token)
          res.send('login successful');
          console.log("login successful");
        }else{
          res.send("invlid password");
          console.log("invlid password");
        }
      })
    }else{
      res.send("invlid email");
      console.log("invlid email");
    }
  })
})
app.get("/userinfo",(req,res)=>{
  let token = req.headers.cookie;
  if(!token){
    res.send("login_Please");
    console.log("login_please");
  }else{
    // let token = req.headers.cookie;
    var list = token.split(";").reverse();
    var tokens = list[0].slice(0,-10);
    jwt.verify(tokens.trim(),"shhhhh",(err,verified)=>{
      if(err){
        res.send(err.message);
        console.log(err.message);
      }else{
        res.send(verified);
        console.log(verified);
      }
    })

  }
})
app.post("/Update",(req,res)=>{
  var tokens = req.headers.cookie
  if(!tokens){
    res.send("Login_Please");
    console.log("Login_Please");
  }else{
    var list = tokens.split(";").reverse()
    var token = list[0].slice(0,-10);
    jwt.verify(token.trim(),"shhhhh",(err,verified)=>{
      // console.log("verified",verified["data"][0].email);
      if(err){
        res.send(err.message);
        console.log(err.message);
      }else{
        knex.select("password").from("users").where({"email":verified["data"][0].email}).then((userdata)=>{
          console.log(userdata[0].password);
          if(userdata[0].password===req.body.Cpassword){
            var npassword = req.body.npassword
            var conpassword = req.body.conpassword
            if(npassword==conpassword){
              knex("users").where({"email":verified["data"][0].email}).update({"password":conpassword}).then((data)=>{
                res.send("Your Password is Changed");
                console.log("Your Password is Changed");
              })
            }            
          }
        })
      }
    })
  }
})

app.listen(5000);
