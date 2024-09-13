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
  const [paths, setPaths] = useState([]);

  async function handleDeleteSingle(fileName: string, filePath: string) {
    const formData = new FormData();
    formData.append('path', filePath);
    const response = await fetch("/api/file", {
        method: "DELETE",
        body: formData,
    });
    setFileUploaded(fileUploaded.filter(f => f !== fileName));
    setPaths(paths.filter(p => p !== filePath));
  }

  async function handleDeleteAll(filePaths: string[]) {
    for (let path of filePaths) {
      const formData = new FormData();
      formData.append('path', path);
      const response = await fetch("/api/file", {
          method: "DELETE",
          body: formData,
      });
    }
  }

  useEffect(() => {
    if (text.length > 0) {
      setIsModalOpen(false);
      handleDeleteAll(paths);
      clearStorage();
    }
  }, [text]);
  
  return (
    <div className="flex flex-col gap-5 p-10">
      <h1 className="flex justify-center text-4xl font-bold">Office Hours Scanner</h1>
      <UploadForm paths={paths} fileUploaded={fileUploaded}  setIsModalOpen={setIsModalOpen} setFileUploaded={setFileUploaded} setPaths={setPaths}/>
      {
        fileUploaded.length > 0 && 
        <div className='flex flex-col'>
          <h2 className='text-2xl font-bold mb-5'>Files Uploaded:</h2>
          {
            fileUploaded.map((f) => 
            <div key={f} className='flex flex-row justify-between w-1/2 border-black border-b py-2 mb-2'>
              <p className='font-semibold'>{f}</p>
              <button 
                className="hover:text-red-500 hover:font-bold" 
                onClick={() => {
                  handleDeleteSingle(f, paths.find(p => p.includes(f)))
                }
                 }>Remove</button>
            </div>
            )
          }
        </div>
      }
      {
        paths.length > 0 && 
            <button 
                className='flex justify-center align-center mt-1 py-4 px-10 rounded-md bg-blue-600 text-white font-semibold'
                onClick={() => {
                const hours = getHours(paths);
                setIsModalOpen(true);
                hours.then((res) => {
                    setText(res)
                })
                
                }}>Scan Office Hours
            </button>
      }
      {
        text.length > 0 && 
        <div className="p-2 mt-5 border rounded-xl w-2/3">
          <Markdown>{text}</Markdown>
        </div>
      }
      <LoadingModal isModalOpen={isModalOpen}/>
      <button onClick={() => {
        clearStorage();
      }}>Clear Storage</button>
    </div>
  )
}