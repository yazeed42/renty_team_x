const sqlite3=require('sqlite3');
const db= new sqlite3.Database('DB/renty.db3');
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
    let sql="SELECT email FROM users WHERE email= ?";
    db.get(sql,[email],(err,email)=> {
        if (err) {
            callback(err, null);
        } else {
            callback(null, email);
        }
    });
}

function authenticateUser(email,callback){
    let sql="SELECT password FROM users WHERE email=?"
    db.get(sql,[email],(err,password)=>{
        if (err) {
            console.error(err.message);
            callback(err, null);
        } else {
            callback(null, password);
        }
    });
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
                    pics: row.pics
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
    let sql="SELECT * FROM request WHERE requester_id = ? ";
    db.all(sql,[id],(err,reqs)=>{
        if (err) {
            console.error(err.message);
            callback(err, null);
        } else {
            callback(null, reqs);
        }
    })
}
