const fs = require("fs");
const cors = require("cors");
const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const app = express();
const download = require("download");

const Base64Encode = require('base64-stream').Base64Encode;
const request = require('request');


app.use(express.json())
app.use(cors());
app.post("/", upload.single("file"), (req, res) => {
    try{
        console.log(req.file.originalname);
        const name = req.file.originalname;
        const type = req.file.mimetype;
        const fileBase64 = fs.readFileSync(`uploads/${req.file.filename}`,"base64");
        fs.unlinkSync(`uploads/${req.file.filename}`, ()=>{
            console.log("done")
        });
        res.status(200);
        res.json({
            name: name,
            type: type,
            file: fileBase64
        });

    }catch(e){
        res.status(400).json({
            "error": e
        })
    }
})
app.post("/url", async(req, res) => {
    try{
        const fileUrl = req.body.url;
        let base64Data = "";
        await request({
            uri: fileUrl
        }).pipe(new Base64Encode()).on('data', data => {
            base64Data += data;
        }).on('finish', () => {
            const [temp, fileName] = fileUrl.split("$$");
            const [temp1, type] = fileName.split(".");
            let fileType = "";
            if(type=="png"||type=="jpg"||type=="jpeg"){
                fileType = `image/${type}`
            }
            res.status(200).json({
                status: "Received",
                name: fileName,
                type: fileType,
                file: base64Data
            })
        }).on('error', err => {
            console.log(err);
        });

    }catch(e){
        res.status(400).json({
            "error": e
        })
    }
})
app.listen(3000, ()=>{
    console.log("Server started at port 3000");
})