'use server';
import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: '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';
});
async function getHours(filePaths) {
  console.log(filePaths);
  if (filePaths.length > 0) {
    const assistant = await openai.beta.assistants.create({
    name: 'File Scanner',
    instructions: "You summarize the office hours from the course syllabuses uploaded. Order by day of the week, followed by course name in bold, the hours, instructor\'s name, location.",
    model: "gpt-4o-mini",
    tools: [{ type: 'file_search'}],
    });

    const attachment_files = [];
    for (let filePath of filePaths) {
      const f = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: 'assistants', 
      });
      attachment_files.push({
        file_id: f.id,
        tools: [{ type: 'file_search'}]
      });
    }

    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: 'Summarize the office hours. Order by day of the week, followed by course name in bold, the hours, instructor\'s name, location. For any course whose Office Hours are not found or listed as TBA, respond as follows \' No Office Hours found.\' Add 2 new lines for each new day of the week. Add a new line for citation at the bottom',
          attachments: attachment_files,
        }
      ]
    });
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    const messages = await openai.beta.threads.messages.list(thread.id, {
      run_id: run.id,
    });
    const message = messages.data.pop();
    if (message && message.content[0].type === 'text') {
      const { text } = message.content[0];
      const { annotations } = text;
      const citations = [];

      let index = 0;
      for (let annotation of annotations) {
        text.value = text.value.replace(annotation.text, "[" + index + "]");
        const { file_citation } = annotation;
        if (file_citation) {
          const citedFile = await openai.files.retrieve(file_citation.file_id);
          citations.push("[" + index + "]" + citedFile.filename);
        }
        index++;
      }
      return text.value;
  }
  }
  
};

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

export { getHours, clearStorage }






