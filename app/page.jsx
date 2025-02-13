'use client';

import { useState, useEffect } from 'react';
import UploadForm from './components/uploadForm';
import Markdown from 'react-markdown';
import LoadingModal from './components/loadingModal';
import { getHours, clearStorage } from './utils/chatgpt';

export default function HomePage() {
  const [text, setText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileUploaded, setFileUploaded] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle file input
  const handleFileChange = (e) => {
    setFileUploaded(Array.from(e.target.files));
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

      console.log("Files uploaded: ", fileUploaded.map(f => f.name));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Files uploaded successfully");
      } else {
        console.error("Failed to upload files", {
          status: res.status,
          statusText: res.statusText,
          error: data.error || data
        });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleFileRemove = (file) => {
    setFileUploaded(fileUploaded.filter(f => f !== file));
  }
  
  return (
    <div className="flex flex-col gap-5 p-10">
      <h1 className="flex justify-center text-4xl font-bold">Office Hours Scanner</h1>
      <UploadForm fileUploaded={fileUploaded} handleFileChange={handleFileChange} handleUpload={handleUpload}/>
      {
        fileUploaded.length > 0 && 
        <div className='flex flex-col'>
          <h2 className='text-2xl font-bold mb-5'>Files Uploaded:</h2>
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

      <button onClick={handleUpload} disabled={loading} 
        className='bg-blue-500 text-white px-4 py-2 rounded-md'
      >
        {loading ? "Uploading..." : "Scan Office Hours"}
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