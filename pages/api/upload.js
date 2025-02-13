import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs";

export const config = {
    api: {
        bodyParser: false,
    },
};

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        
    }
});

async function parseForm(req) {
    const form = formidable({multiples: true,});
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({fields, files});
        });
    });
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({message: "Method not allowed"});
    }
    try {
            const { files } = await parseForm(req);

            // Ensure files are in an array because formidable may return a single object
            const fileArray = Array.isArray(files.file) ? files.file : [files.file];
            if (fileArray.length == 0) {
                return res.status(400).json({message: "No files provided"});
            }

            // Upload each file to S3
            const uploadPromises = fileArray.map(async (file) => {
                const fileStream = fs.createReadStream(file.filepath);
                const params = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `uploads/${file.originalFilename}`,
                    Body: fileStream,
                    ContentType: file.mimetype,
                };

                return s3Client.send(new PutObjectCommand(params));
            });

            await Promise.all(uploadPromises);

            res.status(200).json({message: "Files uploaded succesfully"});
        } catch (error) {
            console.error("Error uploading files:", error);
            res.status(500).json({
                message: "Error uploading files",
                error: error.message
            });
        }
    
}