const folderCreator = require("../middleware/folderCreator");
const exists = require("fs").exists;

module.exports = async function(){
    exists("./static", async function(yes){
        if(yes) return;

        const err = await folderCreator(null, "./static");
        if(err) throw new Error("FATAL ERROR: CANNOT CREATE STATIC DIRECTORY.");
    });
}