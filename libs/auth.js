var Guid = require("guid");

function ensureSignedIn(req, res, next){
    var session = req.cookies.session;
    if (session == null){
        return res.send("Not signed in");
    } else {
        // TODO if user is signed in with this session, we need to check to see if the session exists in the database
       next(); // only when they are signed in then we will allow user to do something  
    }
}

function generateGUID(){
    var authToken = Guid.raw(); 
    return authToken;
}

var exports = { // object with function ensureSignedIn in it
    ensureSignedIn: ensureSignedIn,
    generateGUID: generateGUID
};

module.exports = exports;

// ReactJS equivalent
// export default exports; 
