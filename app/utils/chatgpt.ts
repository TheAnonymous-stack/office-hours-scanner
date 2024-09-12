'use server';
import OpenAI from 'openai';
import fs from 'fs';

// const gpt = new OpenAI({
//     apiKey: process.env.apiKey,
// });

// const query = async (urls: String) => {
//     const res = await gpt.chat.completions.create({
//       model: 'gpt-4o-mini',
//       messages: [{
//         role: 'user',
//         content: 'Create a PDF file listing the office hours from the URLs: ${urls}. Title the file "Office Hours". Bolden course names. Order by day of the week, followed by the hours, instructor\'s name, location.' 
//       }]
//     })
//     res.then((res) => console.log(res));
//   }

// export default {query};

const openai = new OpenAI({
  apiKey: process.env.apiKey
});
async function getHours(filePaths: Array<string>) {
  if (filePaths.length > 0) {
    const assistant = await openai.beta.assistants.create({
    name: 'File Scanner',
    instructions: "You summarize the office hours from the course syllabuses uploaded. Bolden course names. Order by day of the week, followed by the hours, instructor\'s name, location.",
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
          content: 'Summarize the office hours. Bolden course names. Order by day of the week, followed by the hours, instructor\'s name, location.',
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
      const citations: string[] = [];

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
      console.log('text.value is', text.value);
      return text.value;
  }
  }
  
};

function helloWorld() {
  return 'hello world';
}

export { getHours, helloWorld }






