const sqlite3=require('sqlite3');
const util = require('util');
const db= new sqlite3.Database('DB/renty.db3');
const dbGetAsync = util.promisify(db.get.bind(db));
function getAllItems(callback){
    db.all('SELECT * FROM items',(err,items)=> {
        if (err) {
            console.error("Error retrieving all items", err);
            callback(err, null);
        } else {
            callback(null, items);
        }
    });
}

function validateEmail(email,callback){
    email=email.toString()
    let sql="SELECT * FROM user WHERE email= ?";
    db.get(sql,[email],(err,user)=> {
        if (err) {
            console.error(err.message);
            callback(err, null);
        } else {
            callback(null, user.email);
        }
    });
}

function authenticateUser(email,callback){
    let sql="SELECT * FROM user WHERE email=?"
    db.get(sql,[email],(err,row)=>{
        if (err) {
            console.error(err.message);
            callback(err, null);
        } else {
            if(row){
                const user= {
                    user_ID:row.user_ID,
                    user_name:row.user_name,
                    first_name:row.first_name,
                    last_name:row.last_name,
                    email:row.email,
                    password:row.password,
                    Address:row.Address,
                    phoneNUM:row.phoneNUM
                };
                callback(null, user);
            }

        }
    });
}
function getUserByEmail(email,callback){
    let sql="SELECT * FROM user WHERE email=?"
    db.get(sql,[email],(err,user) =>{
        if (err) {
            console.error(err.message);
            callback(err, null);
        } else {
            callback(null,user);
        }

    })

}
 async function  getUserByEmail2(email){
    try{
        const sql="SELECT first_name FROM user WHERE email=?";
        const value= dbGetAsync(sql,email);
        if(!value){
            throw new Error("value not found");
        }
        return value;
    } catch (error) {
        console.error('Error retrieving value:', error);
        throw error;
    }
}
async function  getUserByEmail3(email){
    try{
        const sql="SELECT user_ID FROM user WHERE email=?";
        const value= dbGetAsync(sql,email);
        if(!value){
            throw new Error("value not found");
        }
        return value;
    } catch (error) {
        console.error('Error retrieving value:', error);
        throw error;
    }
}
async function  getItemByID(id){
    try{
        const sql="SELECT owner_id, title FROM items WHERE item_ID=?";
        const value= await dbGetAsync(sql,id);
        if(!value){
        }
        return value;
    } catch (error) {
        console.error('Error retrieving value:', error);
        throw error;
    }
}
function getItemDetails(itemID,callback){
    let sql="SELECT * FROM items WHERE item_ID=?";
    db.get(sql,[itemID],(err,row)=>{
        if (err) {
            console.error(err.message);
            callback(err, null);
        } else {
            if (row) {
                const item = {
                    item_ID: row.item_ID,
                    owner_ID: row.owner_ID,
                    title: row.title,
                    description: row.description,
                    price: row.price,
                    pics: row.pics,
                    start_date: row.start_date,
                    end_date: row.end_date
                };
                callback(null, item);
            } else {
                const error = new Error("item not found");
                callback(error, null);
            }
        }
    });
}
function getUserRequests(id,callback){
    let sql="SELECT * FROM request WHERE requester_id = ? UNION SELECT * FROM request WHERE receiver_ID = ? ";
    db.all(sql,[id,id],(err,reqs)=>{
        if (err) {
            console.error(err.message);
            callback(err, null);
        } else {
            callback(null, reqs);
        }
    })
}
function rentItem(requestValues,callback){
        let sql='INSERT INTO request(requester_ID, receiver_ID,status,item_title,Qnt,days) VALUES(?,?,?,?,?,?)';
        let values =[
            requestValues.requester_ID,
            requestValues.receiver_ID,
            requestValues.reqStatus,
            requestValues.item_title,
            requestValues.Qnt,
            requestValues.days
        ];
        console.log(values)
        db.run(sql,values,(err,requests)=>{
            if (err) {
                console.log("ddddddddddddddd")
                return console.error(err.message);
                callback(err,null)
            }else {
                console.log(`Rows inserted ${this.changes}`);
                callback(null,requests)
            }

        })


}

function registerUser(userInfo,callback) {
    let sql='INSERT INTO user (user_ID, user_name, first_name, last_name, email, password,Address,phoneNUM) VALUES (?, ?, ?, ?, ?, ?,?,?) ';
    const values =[
        userInfo.user_ID,
        userInfo.user_name,
        userInfo.first_name,
        userInfo.last_name,
        userInfo.email,
        userInfo.password,
        userInfo.Address,
        userInfo.phoneNUM
    ];

    db.run(sql, values, (err,user)=> {
        if (err) {
            return console.error(err.message);
            callback(err,null)
        }else {
            console.log(`Rows inserted ${this.changes}`);
            callback(null,null)
        }
    });

}


module.exports={
    getAllItems,
    getItemDetails,
    getUserRequests,
    authenticateUser,
    validateEmail,
    getUserByEmail,
    registerUser,
    rentItem,
    getUserByEmail2,
    getItemByID,
    getUserByEmail3
}