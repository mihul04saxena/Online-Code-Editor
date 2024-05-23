const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const {generateFile} = require('./generateFile');
const {addJobToQueue} = require('./jobQueue');
const Job = require("./models/Job");

mongoose.connect('mongodb://localhost/compilerapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Successfully connected to MongoDB database');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
});



const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    return res.json({hello : "world"});
});

app.get("/status", async (req,res)=>{

    const jobId = req.query.id;
    console.log("Status requested", jobId);
    if(jobId == undefined){
        return res.status(400).json({success : false, error : "missing id query"});
    }
    try{
        const job = await Job.findById(jobId);
        if(job === undefined){
            return res.status(404).json({success: false, error: "Invalid job id"});
        }

        return res.status(200).json({success: true, job});

    }catch(err){
        return res.status(400).json({success: false, error: JSON.stringify(err)});
    }
});

app.post("/run", async (req,res)=>{
    const {language = "cpp" ,code}  = req.body;
    // console.log(language);
    if(code === undefined){
        return res.status(400).json({success:false,error : "Empty code body!"});
    }
    let job;
    try{
        // need to generate a c++ file with content from the request
        const filepath = await generateFile(language,code);
        // we need to run the file and send the response back.
        job = await new Job({language,filepath}).save();
        const jobId = job["_id"];
        addJobToQueue(jobId);
        

        res.status(201).json({success: true, jobId});
    }catch(err){
        return res.status(500).json({success: false, err: json.stringify(err)});
    }


        
});

app.listen(8080,()=>{
    console.log("Listening on port 8080");
});