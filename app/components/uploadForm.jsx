'use client';
import { useState, useEffect, useRef } from 'react';

export default function UploadForm({ fileUploaded, handleFileChange, handleUpload}) {

    return (
        <div className="flex flex-col gap-5">
            <h1 className='text-2xl font-bold'>Upload Course Syllabuses Here!</h1>
            <div className='flex flex-row gap-5'>
                <input className='pt-2' type='file' name='file' multiple onChange={handleFileChange}/>
            </div>    
        </div>
    );
    

    
}