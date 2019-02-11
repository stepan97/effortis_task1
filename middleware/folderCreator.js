const fs = require("fs");
console.log("Folder creator configured.");
// create folder for newly registered user's images
// module.exports = function (userId) {
//     return new Promise((resolve, reject) => {
//         fs.mkdir(`./static/Client_${userId}/`, err => {
//             if(err) {
//                 console.log(err);
//                 resolve("Unable to create user folder.");
//             }
//             else resolve(undefined);
//         });
//     });
// };

// folder creator middleware
// called once when applications runs for first time (to create static folder)
// called every time a new user is registered, for creating a new forder for each user's gallery
module.exports = function (userId, staticFolderPath) {
    let path = "";

    if(userId) path = `./static/Client_${userId}/`;
    else if(staticFolderPath) path = staticFolderPath;
    else return new Promise((resolve, reject) => resolve(new Error("No path or userId specified.")));

    return new Promise((resolve, reject) => {
        fs.mkdir(path, err => {
            if(err) {
                console.log(err);
                resolve(new Error("Unable to create user folder."));
            }
            else resolve(undefined);
        });
    });
}