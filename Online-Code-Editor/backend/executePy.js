const {exec} = require("child_process");
// const path = require("path");
// const fs = require('fs');
// const outputPath = path.join(__dirname,"outputs");

// if(!fs.existsSync(outputPath)){
//     fs.mkdirSync(outputPath, {recursive:true});
// }

//Commented because Python is an interpreted language 
//hence we do not reuire to create an output file for storing the output

const executePy = (filepath) => {
    return new Promise((resolve,reject)=>{
        exec(`python3 ${filepath} `,(error,stdout,stderr)=>{
            error && reject({error,stderr});
            stderr && reject({stderr});
            resolve(stdout);
        });
    });
};


module.exports = {
    executePy,
};