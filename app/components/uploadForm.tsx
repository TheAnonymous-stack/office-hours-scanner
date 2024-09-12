'use client';
import { useState, useEffect, useRef } from 'react';
import { helloWorld } from '../utils/chatgpt';

export default function UploadForm({ paths, fileUploaded, setIsModalOpen, setFileUploaded, setPaths}) {
    const fileInput = useRef<HTMLInputElement>(null);
    async function handleSelect(evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        if (fileInput) {
            const files = fileInput?.current?.files;
            const pathsToBeUploaded = [];
            const fileToBeUploaded=[];
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

    return (
        <div class="flex flex-col gap-5">
            <h1 class='text-2xl font-bold'>Upload Course Syllabuses Here!</h1>
            <div class='flex flex-row gap-5'>
                <input class='pt-2' type='file' name='file' ref={fileInput} multiple onChange={handleSelect}/>
            </div>    
        </div>
    );
    

    
}