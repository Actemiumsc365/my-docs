// app/api/docfx/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// THIS IS THE CRITICAL CHANGE:
// We tell the system that your project lives in C:\micdoc
const PROJECT_PATH = 'C:\\micdoc'; 

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  try {
    let command = '';
    let message = '';

    switch (action) {
      case 'install':
        command = 'dotnet tool update -g docfx';
        message = 'DocFX tools updated.';
        break;
      
      case 'init':
        // You already have a project, but we keep this just in case
        command = 'docfx init -q'; 
        message = 'New Docset initialized.';
        break;

      case 'build':
        // builds the docfx.json file inside C:\micdoc
        command = 'docfx docfx.json';
        message = 'Documentation built successfully.';
        break;
        
      case 'serve':
        // This command starts the preview server
        // NOTE: This might block the terminal, usually better run separately
        command = 'docfx serve _site';
        message = 'Server started.';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // execute the command inside C:\micdoc
    const { stdout, stderr } = await execAsync(command, { cwd: PROJECT_PATH });

    return NextResponse.json({ 
      success: true, 
      message, 
      logs: stdout, 
      errors: stderr 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Command failed", 
      details: error.stderr || ""
    }, { status: 500 });
  }
}