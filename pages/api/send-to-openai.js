import OpenAI from "openai";
import fs from "fs";
import axios from "axios";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { s3Urls, fileNames } = req.body; // Receive S3 URLs & file names

        if (!s3Urls || !fileNames || s3Urls.length !== fileNames.length) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        // **Step 1: Download files from S3**
        const downloadedFiles = await Promise.all(
            s3Urls.map(async (url, index) => {
                const response = await axios({
                    url,
                    method: "GET",
                    responseType: "arraybuffer",
                });

                const tempFilePath = `/tmp/${fileNames[index]}`;
                fs.writeFileSync(tempFilePath, response.data);
                return tempFilePath;
            })
        );

        // **Step 2: Upload files to OpenAI**
        const fileUploadPromises = downloadedFiles.map((filePath) =>
            openai.files.create({
                file: fs.createReadStream(filePath),
                purpose: "assistants",
            })
        );

        const uploadedFiles = await Promise.all(fileUploadPromises);
        const fileIds = uploadedFiles.map(file => file.id); // Extract OpenAI file IDs

        console.log("Uploaded Files to OpenAI:", fileIds);

        // **Step 3: Create an Assistant Thread & Send Files**
        const thread = await openai.beta.threads.create();

        await openai.beta.threads.messages.create({
            thread_id: thread.id,
            role: "user",
            content: "Here are my course syllabi.",
            file_ids: fileIds, // Attach all file IDs
        });

        const run = await openai.beta.threads.runs.create({
            thread_id: thread.id,
            assistant_id: process.env.OPENAI_ASSISTANT_ID,
        });

        return res.status(200).json({ message: "Files sent to OpenAI Assistant", runId: run.id });

    } catch (error) {
        console.error("Error sending files to OpenAI:", error);
        return res.status(500).json({ message: "Error processing files", error: error.message });
    }
}
