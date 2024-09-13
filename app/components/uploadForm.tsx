'use client';
import { useState, useEffect, useRef } from 'react';

export default function UploadForm({ paths, fileUploaded, setIsModalOpen, setFileUploaded, setPaths}: {paths:string[], fileUploaded:string[], setIsModalOpen:Dispatch<SetStateAction<boolean>>, setFileUploaded: React.Dispatch<SetStateAction<Array<string>[]>>, setPaths:React.Dispatch<SetStateAction<Array<string>[]>>}) {
    const fileInput = useRef<HTMLInputElement>(null);
    async function handleSelect(evt: React.ChangeEvent<HTMLInputElement>) {
        if (fileInput) {
            const files = fileInput?.current?.files;
            const pathsToBeUploaded = [];
            const fileToBeUploaded=[];
            if (files) {
                for (let file of files) {
                fileToBeUploaded.push(file.name);
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch("/api/file", {
                    method: "POST",
                    body: formData,
                })
                const result = await response.json();
                pathsToBeUploaded.push(result.path);
            }
            paths.length > 0 ? setPaths(pathsToBeUploaded.concat([...paths])) : setPaths(pathsToBeUploaded);
            fileUploaded.length > 0 ? setFileUploaded(fileToBeUploaded.concat([...fileUploaded])) : setFileUploaded(fileToBeUploaded);
            }

        }
        
    }

    return (
        <div className="flex flex-col gap-5">
            <h1 className='text-2xl font-bold'>Upload Course Syllabuses Here!</h1>
            <div className='flex flex-row gap-5'>
                <input className='pt-2' type='file' name='file' ref={fileInput} multiple onChange={(e) => handleSelect(e)}/>
            </div>    
        </div>
    );
    

    
}