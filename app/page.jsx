'use client';

import { useState, useEffect } from 'react';
import UploadForm from './components/uploadForm';
import Markdown from 'react-markdown';
import LoadingModal from './components/loadingModal';
import { sendFilesToOpenAI, sendMessageToAssistant, getHours, clearStorage } from './utils/chatgpt';

export default function HomePage() {
  const [text, setText] = useState('');
  const [fileUploaded, setFileUploaded] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle file input
  const handleFileChange = (e) => {
    setFileUploaded([...fileUploaded, ...Array.from(e.target.files)]);
  }
  // Upload files to backend
  const handleUpload = async () => {
    if (fileUploaded.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      fileUploaded.forEach(file => {
        formData.append("file", file);
      });

      console.log("Files uploaded to S3: ", fileUploaded.map(f => f.name));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Files uploaded to S3 successfully");
        const fileUrls = data.preSignedUrls.map((file) => file.signedUrl);
        const fileNames = data.preSignedUrls.map((file) => file.fileName);
        return { fileUrls, fileNames };
      } else {
        console.error("Failed to upload files to S3", {
          status: res.status,
          statusText: res.statusText,
          error: data.error || data
        });
      }
    } catch (error) {
      console.error("Error uploading files to S3:", error);
    }
  }

  const handleFileRemove = (file) => {
    setFileUploaded(fileUploaded.filter(f => f !== file));
  }

  useEffect(() => {
    console.log("text is", text);
  }, [text])

  const handleProcessFiles = async (fileUrls, fileNames) => {
    try {
      console.log("fileUrls are", fileUrls);
      console.log("fileNames are", fileNames);
      const fileIds = await sendFilesToOpenAI(fileUrls, fileNames);
      console.log("fileIds are", fileIds);
      const thread_id = await sendMessageToAssistant(fileIds);
      // const hours = await getHours(thread_id);
      const hours = await getHours(thread_id);
      setText(hours);
      setLoading(false);
    } catch (error) {
      console.error("Error processing files:", error);
    }
  }
  return (
    <div className="flex flex-col gap-5 p-10">
      <h1 className="flex justify-center text-4xl font-bold">Office Hours Scanner</h1>
      <UploadForm fileUploaded={fileUploaded} handleFileChange={handleFileChange} handleUpload={handleUpload}/>
      {
        fileUploaded.length > 0 && 
        <div className='flex flex-col'>
          <h2 className='text-2xl font-bold mb-5'>Files Selected:</h2>
          {fileUploaded.length > 0 && (
            <div>
              <ul>
                {
                  fileUploaded.map((f) => (
                  <div key={f.name} className='flex flex-row justify-between w-1/2 border-black border-b py-2 mb-2'>
                    <p className='font-semibold text-lg text-black'>{f.name}</p>
                    <button className='text-lg px-4 py-2 rounded-md' onClick={() =>handleFileRemove(f)}>X</button>
                  </div>
                  ))
                }
              </ul>
              
            </div>
           
          )

          }
        </div>
      }

      <button onClick={async () => {
        try {
          const { fileUrls, fileNames } = await handleUpload();
          handleProcessFiles(fileUrls, fileNames);
        } catch (error) {
          console.error("Error processing files:", error);
        }
      }} disabled={loading} 
        className='bg-blue-500 text-white px-4 py-2 rounded-md'
      >
        {loading ? "Scanning..." : "Scan Office Hours"}
      </button>

      {
        text.length > 0 && 
        <div className="p-2 mt-5 border rounded-xl w-2/3">
          <Markdown>{text}</Markdown>
        </div>
      }
      <LoadingModal isModalOpen={loading}/>
    </div>
  )
}