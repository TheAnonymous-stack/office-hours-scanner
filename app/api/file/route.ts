import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'node:fs/promises';
import path from 'path';

async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    await fs.writeFile(path.join(process.cwd(),`/public/upload/${file.name}`), buffer);
    
    revalidatePath('/');
    console.log('File saved to local directory successfully!')
    const filePath = path.join(process.cwd(),`/public/upload/${file.name}`);
    return NextResponse.json({ status: 'success', path: filePath});
  } catch(e) {
    console.error(e);
    return NextResponse.json({ status: 'fail', error: e});
  }
}

export { POST }