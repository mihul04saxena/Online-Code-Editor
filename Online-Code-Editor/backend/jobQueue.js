const Queue = require("bull");
const Job = require('./models/Job');
const {executeCpp} = require("./executeCpp");
const { executePy } = require("./executePy");

const jobQueue = new Queue("job-runner-queue");
const NUM_WORKERS = 5;

jobQueue.process(NUM_WORKERS, async ({data}) =>{
    console.log(data);
    const {id: jobId} = data;
    const job = await Job.findById(jobId);
    if(job === undefined){
        throw Error(`cannot find Job with od ${jobId}`);
    }
    console.log("Fetched Job", job);

    try{
        let output;
        job["startedAt"] = new Date();

        if(job.language === "cpp"){
            output = await executeCpp(job.filepath);
        }else{
            output = await executePy(job.filepath);
        }

        job["completedAt"] = new Date();
        job["output"] = output;
        job["status"] = "success";

        await job.save();
        return true;
    }catch(err){
        job["completedAt"] = new Date();
        job["status"] = "error";
        job["output"] = JSON.stringify(err);
        await job.save();
        throw Error(JSON.stringify(err));
    }
});

jobQueue.on("failed",(error)=>{
    console.log(error.data.id, error.failedReason);
});

const addJobToQueue = async (jobId) =>{
    await jobQueue.add({
        id: jobId,
    });
};

module.exports = {
    addJobToQueue,
}