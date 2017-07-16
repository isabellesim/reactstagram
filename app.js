var mongojs = require("mongojs");
var express = require("express");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var base64Img = require('base64-img');


var fs = require('fs');
// This allows us to read a file called input.txt, into a variable




var Authentication = require('./libs/auth.js');
var Random = require('./libs/random.js');


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cookieParser());
app.use(bodyParser());
app.use("/public", express.static('public'));


var db = mongojs("localhost:27017/reactstagram", ['image', 'comment', 'user']); 

app.post('/user/signup', function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    
    db.user.find({username: username}, function(err,docs){
        if (err){
            res.send({status: 403});
            
            // else means no database error, but have to check whether username already exists. 
            // if username already exists, you should tell the user he is not allowed to sign up
            
        } else if (docs.length == 0){ // this means username is unique, and now we need to store it
            db.user.save({username: username, password: password}, function(err2, docs2){
                if (err2){
                    res.send({status: 403});
                } else {
                    res.send({status: 200, data: {username: username}});   // don't send password back to user: might be intercept
                }
            });
        } else {
            res.send({status: 403, data: {message: "This username already exists"}});
        }
    });
    
});


app.post('/user/login', function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    
    db.user.find({username: username}, function(err,docs){
        console.log(docs);
        console.log(username);
        if (docs.length == 0){
            res.send({status: 403, data: {message: "this username does not exist"}});
        } else {
            var user = docs[0];
            if (user.password == password){
                // TODO if user is signed in with this session, we need to check to see if the session exists in the database
                var session = Authentication.generateGUID();
                db.user.update({username: username}, {$set: {session: session}}, function(err2,docs2){
                    if (!err2){ // session successfully saved: give the user the cookie
                        res.cookie('session', session, {httpOnly: true});
                        res.send({status: 200, data: {session: session, userID: user._id}}); 
                    } else {
                        res.send({status: 403});
                    }
                });
            } else {
                res.send({status: 403});
            }
        }
    });
});

app.get('/playing-with-cookies', function(req,res){
    var session = req.cookies.session;
    var number = req.cookies.number; 
    
    if (number == null){
        number = 0;
    } else {
        number = parseInt(number) + 1;
    }
    if (session == null){
        res.cookie('session', 'tasty cookie', {httpOnly:true});
        res.send("No cookies detected");
    } else {
        // res.send("Cookie was detected " + session);
        res.cookie('number', number, {httpOnly: true});
        res.send("Number of times page was viewed: " + number);
    }
});

app.get('/test_signed_in', Authentication.ensureSignedIn, function(req,res){
    res.send("You are signed in!");
});

app.get('/hello_world', function(req,res){
    var result = Random.rollDice();
    var age = Random.guessMyAge();
    var text = Random.randomTenLetterString();
    res.send("It is this: " + result + " You are old: " + age + " It here: " + text);
});


app.post('/image', function(req,res){
    // store userID, text and image
    var userID = req.body.userID;
    var text = req.body.text;
    var image = req.body.image;
    
    if (image == null){
        return res.send("Image was not provided"); // use return so that code stops and won't continue
    } else {
        
        db.image.save({userID, text: text}, function(err, doc){
            console.log(doc);
            
             
            base64Img.img(image, __dirname + "/public", doc._id, function(err, filepath){ // doc._id is the file name that the image is stored in
                if (err){
                    res.send({status: 403, data: {message: "Error! File cannot be saved"}});
                } else {
                    res.send({status: 200, data: {message: "File saved successfully"}});
                }
            }); 
            
        // __dirname folder is the folder that your application is in. __dirname + /public means put into public folder
        }); // only stores the image meta data
        // db.image.save({userID, text: text, image: image}); this will slow down the database 
    }
});

app.get('/images', function(req,res){
    db.image.find({}, function(err,docs){
        res.send(docs);
    });
})

app.post('/create_file', function(req,res){
    // Retrieve filename from POST data
    var fileName = req.body.fileName;
    fs.writeFile(fileName, '', function(err){
        if(!err){
            res.send("success");
        }
    });

});

app.post('/read_file', function(req,res){
    var fileName = req.body.fileName;
    fs.stat(fileName, function(err, stats){
        if (err) {
            res.send(err);
        } else {
            fs.readFile(fileName, function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(data);
                }
            });
        }
    });
});

app.post('/delete_file', function(req,res){
    var fileName = req.body.fileName;
    fs.unlink(fileName, function(err){
        if (!err){
            res.send("deleted")
        }
    })
})

app.post('/update_file', function(req,res){
    
    var fileName = req.body.fileName;
    // 1. Read the current contents of the file
    // and save into a variable
    var data = fs.readFileSync(fileName);
    
    // 2. Delete the file
    fs.unlink(fileName, function(err){
        if (err){
            res.send("could not delete file");
        } else {
            // Do step 3 and step 4
            
            // 3. Update the data with the new contents in append
            var newData = data + req.body.newData;
            
            // 4. Write the new data
            fs.writeFile(fileName, newData, function(err){
                if (err){
                    res.send(err);
                } else {
                    res.send(newData);
                }
            });
        }
    });
    
});

app.post('/create_file_and_folder', function(req,res){ // err no 17
    fs.mkdir('file', function(err){
        if (err){
            res.send(err);
        } else {
            res.send("directory created");
        }
    })
    
    fs.writeFile('/file/input.txt', 'hello filesystem!', function(req,res){
        var data = fs.readfileSync(input.txt)
        if (err){
            res.send(err)
        } else {
            res.send("hello filesystem!")
        }
    })
})

app.post('/delete_file_and_folder', function(req,res){ // use rmdir ??
    fs.unlink('file', function(err){
        if (!err){
            res.send("deleted")
        }
    })
})

// if delete folder only, will text files inside be deleted as well ?


function ensureSignedIn(req, res, next){
    var session = req.cookies.session;
    if (session == null){
        return res.send("Not signed in");
    } else {
       next(); // only when they are signed in then we will allow user to do something  
    }
}

app.listen(8080);