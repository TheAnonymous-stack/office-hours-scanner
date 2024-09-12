'use client';

import { useState, useEffect } from 'react';
import UploadForm from './components/uploadForm';
import Markdown from 'react-markdown';
import LoadingModal from './components/loadingModal';
import { getHours } from './utils/chatgpt';

export default function HomePage() {
  const [text, setText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileStandby, setFileStandby] = useState([]);
  const [fileUploaded, setFileUploaded] = useState([]);
  const [paths, setPaths] = useState([]);
  useEffect(() => {
    if (text.length > 0) {
      setIsModalOpen(false);
    }
  }, [text]);
  
  return (
    <div className="flex flex-col gap-5 p-10">
      <h1 class="flex justify-center text-4xl font-bold">Office Hours Scanner</h1>
      <UploadForm paths={paths} fileUploaded={fileUploaded}  setIsModalOpen={setIsModalOpen} setFileUploaded={setFileUploaded} setPaths={setPaths}/>
      {
        fileUploaded.length > 0 && 
        <div class='flex flex-col'>
          <h2 class='text-2xl font-bold mb-5'>Files Uploaded:</h2>
          {
            fileUploaded.map((f) => 
            <div class='flex flex-row justify-between w-1/2 border-black border-b py-2 mb-2'>
              <p key={f} class='font-semibold'>{f}</p>
              <button class="hover:text-red-500 hover:font-bold">Remove</button>
            </div>
            )
          }
        </div>
      }
      {
        paths.length > 0 && 
            <button 
                class='flex justify-center align-center mt-1 py-4 px-10 rounded-md bg-blue-600 text-white font-semibold'
                onClick={() => {
                // const hours = getHours(paths);
                // setIsModalOpen(true);
                // hours.then((res) => {
                //     setText(res)
                // })
                
                }}>Scan Office Hours
            </button>
      }
      {
        text.length > 0 && 
        <div class="p-2 mt-5 border rounded-xl w-2/3">
          <Markdown>{text}</Markdown>
        </div>
      }
      <LoadingModal isModalOpen={isModalOpen}/>
    </div>
  )
}