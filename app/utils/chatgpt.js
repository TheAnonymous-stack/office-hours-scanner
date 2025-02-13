'use server';
import OpenAI from 'openai';
import fs from 'fs';
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.apiKey
});


async function sendFilesToOpenAI(s3Urls, fileNames) {
  console.log("s3Urls are", s3Urls);
  console.log("fileNames are", fileNames);
  try {
    // Step 1: Download all files from S3
      const uploadPromises = s3Urls.map(async (url, index) => {
            const response = await axios({
                url,
                method: "GET",
                responseType: "arraybuffer",
            });
           //const buffer = Buffer.from(response.data);
           const blob = new Blob([response.data], { type: 'application/pdf' });
           const formData = new FormData();
           formData.append('file', blob, fileNames[index]);
           
           const uploadedFile = await openai.files.create({
            file: formData.get('file'),
            purpose: "assistants",
           });
           console.log("File created in OpenAI");
           return uploadedFile.id;
        });

        const fileIds = await Promise.all(uploadPromises);
        console.log("Files uploaded to OpenAI:", fileIds);
        return fileIds;
  } catch (error) {
      console.error("Error sending files to OpenAI:", error);
      throw new Error("Failed to send files to OpenAI");
  }
}

async function sendMessageToAssistant(fileIds) {
  
  try {
    const thread = await openai.beta.threads.create();
    const message = await openai.beta.threads.messages.create(
      thread.id,
      {
        role: "user",
        content: "Here are the course syllabi",
        attachments: fileIds.map(id => ({
          file_id: id,
          tools: [{ type: 'file_search' }]
        })),
      }
    );
    const run = await openai.beta.threads.runs.createAndPoll(
      thread.id,
      {
        assistant_id: process.env.OPENAI_ASSISTANT_ID,
      }
    );
    return run.thread_id;
  } catch (error) {
    console.error("Error sending message to assistant:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error("Failed to send message to assistant");
  }
}

async function getHours(thread_id) {
  try {
  const messages = await openai.beta.threads.messages.list(thread_id);
  if (!messages.data || messages.data.length === 0) {
    throw new Error("No messages found in thread");
  }

  const message = messages.data[0];
  if (!message.content || message.content.length === 0) {
    throw new Error("Message content is empty");
  }
  return message.content[0].text.value;
 } catch (error) {
    console.error("Error getting hours:", error);
    throw new Error("Failed to get hours");
  }

}

async function clearStorage() {
  const fileList = await openai.files.list();
  for await (const file of fileList) {
      const file_id = file.id;
      openai.files.del(file_id);
  }
  
  const vectorStoreList = await openai.beta.vectorStores.list();
  for await (const store of vectorStoreList) {
      const store_id = store.id;
      openai.beta.vectorStores.del(store_id);
  }
  
  const assistantList = await openai.beta.assistants.list();
    for await (const assistant of assistantList) {
      const assistant_id = assistant.id;
      openai.beta.assistants.del(assistant_id);
  }
}

export { sendFilesToOpenAI, sendMessageToAssistant, getHours, clearStorage }






