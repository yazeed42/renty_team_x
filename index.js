const express = require('express');
const sqlite3 = require('sqlite3');
const session = require('express-session');
const nunjucks = require("nunjucks");
const path = require('path');
const db = require('./modules/renty_modules.js');
const {validateEmail, authenticateUser, registerUser, getUserByEmail, getUserByEmail2, rentItem} = require("./modules/renty_modules");
const e = require("express");
const app= express();
const port = 8000;
app.use(express.static(path.join(__dirname, "public")));
const env= nunjucks.configure( 'views', { express: app} );
app.set('view engine', 'html');
// app.use(bodyParser.json());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({secret: 'secret', resave: true, saveUninitialized: true}));
app.get('/', (req, res) => {
    db.getAllItems((error, items) => {
        if (error) {
            // Handle the error
            res.status(500).send('Error retrieving items');
        } else {
            // Process the articles
            res.render('homepage.html', { items: items });
        }
    });
});

app.route('/items/:id').get(  (req, res) => {
    db.getItemDetails(req.params.id, (error, item) => {
        if (error) {
            // Handle the error
            res.status(500).send('Error retrieving articles');
        } else {

            // Process the articles
            res.render('ItemPage.html', { item: item});        }
    });
});
function goToProfile(email){
    let profile='/profile/'+email;
    app.route(profile).get((req,res)=>{
        db.getUserByEmail(email,(error, user) => {
            if(error){
                res.status(500).send('Error: email not found');
            }else {
                res.render('profile.html', { user: user})
            }
        })

    })
}
app.route("/loginPage").get((req, res)=>{
    if(req.session.loggedin){
        authenticateUser(req.session.userEmail, (error,user) => {
            if(error){
                res.status(500).send("error authenticating user");
            }else {
                    res.render('profile.html', { user: user})
            }
        })


    }else{
    res.render('login.html');}
})
app.route('/login/').post( (req, res) => {
    const {email, password} = req.body;
    validateEmail(email,(error,email) => {
        if(error){
            res.status(500).send('Error: email not found');
        } else {
            authenticateUser(email, (error,user) => {
                if(error){
                    res.status(500).send("error authenticating user");
                }else {
                    if(user.password===password){
                        req.session.loggedin = true;
                        req.session.userEmail = user.email;
                        res.render('profile.html', { user: user})
                    }
                }
            })
        }
    })
})
app.route("/signUpPage").get((req, res)=>{
    if(req.session.loggedin){
        authenticateUser(req.session.userEmail, (error,user) => {
            if(error){
                res.status(500).send("error authenticating user");
            }else {
                res.render('profile.html', { user: user})
            }
        })

    }else{
        res.render('signUp.html');}
})
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
app.route("/signUp").post((req,res)=>{
    const {email,firstName,lastName,password,Address,phoneNUM} =req.body;
    const user_ID=getRandomInt(1,999)
    const user_name=getRandomInt(1,999999999).toString()
    const values={user_ID: user_ID,user_name: user_name,first_name: firstName,
        last_name: lastName,email: email,password:password,Address: Address,phoneNUM: phoneNUM};
    registerUser(values,(error,user) => {
        if(error){
            res.status(500).send("error registering user");
        }
        else{
            res.render('login.html');
        }
    })
    })

app.route("/rent/:item").get( async (req,res) => {
    try{
        console.log(req.session.userEmail);

        let namee = await getUserByEmail2(req.session.userEmail)
        let name1 = namee.first_name;
        let Qnt = getRandomInt(1, 3);
        let days = getRandomInt(1, 10);
        let item = await db.getItemByID(req.params.item)
        let recID = await item.owner_id;
        let TiTlE = await item.title;
        let values = {
            requester_ID: name1,
            receiver_ID: recID,
            reqStatus: "pending",
            item_title: TiTlE,
            Qnt: Qnt,
            days: days
        }

        console.log(values)
        rentItem(values, (error, item) => {
            if (error) {
                res.status(500).send("error renting item");
            } else {
                authenticateUser(req.session.userEmail, (error, user) => {
                    if (error) {
                        res.status(500).send("error authenticating user");
                    } else {
                        res.render('profile.html', {user: user})
                    }
                })

            }
        })
    }catch (error){
        console.log(error)
        authenticateUser(req.session.userEmail, (error, user) => {
            if (error) {
                res.status(500).send("error authenticating user");
            } else {
                res.render('profile.html', {user: user})
            }
        })
    }


});
app.route("/reqs").get(async (req,res)=>{
    let user=await db.getUserByEmail3(req.session.userEmail);
    let userID=user.user_ID;
    db.getUserRequests(userID,(err,reqs)=>{
        if(err){
            res.status(500).send("error no reqs")
        }else {
            res.render("Request Page.html",{reqs:reqs})
        }
    })
})
app.listen(port, function() {
    console.log(`Server listening on port http://127.0.0.1:${port}!`) });