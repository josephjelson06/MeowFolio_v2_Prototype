import React, { useState } from 'react';
import { supabase } from 'lib/supabase';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to encode file as base64'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('FileReader failed to read the file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Returns an AbortSignal that fires after `ms` milliseconds.
 * Falls back to a manual AbortController for browsers that don't support
 * AbortSignal.timeout (iOS Safari < 16, Chrome Android < 103).
 */
function timeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  if (typeof AbortSignal.timeout === 'function') {
    return { signal: AbortSignal.timeout(ms), clear: () => {} };
  }
  const controller = new AbortController();
  const id = window.setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => window.clearTimeout(id) };
}

export function DebugPdfPage() {
  const [status, setStatus] = useState<string>('Idle');
  const [extractedText, setExtractedText] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('Reading file locally...');
    setExtractedText('');
    setErrorText('');

    try {
      const isTestSeam = typeof window !== 'undefined' && window.localStorage.getItem('TEST_SEAM_ACTIVE') === 'true';
      let token = '';

      if (isTestSeam) {
        token = 'test-seam-token';
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('You must be signed in to upload a file for parsing.');
        }
        token = session.access_token;
      }

      setStatus('Converting file to base64...');
      const base64 = await fileToBase64(file);

      setStatus('Calling /api/extract-text...');
      const startTime = Date.now();
      const { signal, clear } = timeoutSignal(60_000);

      let response: Response;
      try {
        response = await fetch('/api/extract-text', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file: base64, filename: file.name }),
          signal,
        });
      } catch (err) {
        clear();
        if (err instanceof DOMException && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
          throw new Error('File extraction timed out after 60s. Please try again.');
        }
        throw err;
      }

      clear();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (!response.ok) {
        let errStr = `HTTP ${response.status} ${response.statusText}`;
        try {
          const body = await response.json();
          if (body.error) errStr += ` - ${body.error}`;
        } catch (_) {}
        throw new Error(errStr);
      }

      setStatus(`Parsing JSON response...`);
      const result = await response.json() as { text: string };
      
      setStatus(`Success in ${duration}s! Extracted ${result.text.length} characters.`);
      setExtractedText(result.text);

    } catch (err) {
      console.error(err);
      setStatus('Failed');
      setErrorText(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Debug PDF Extraction</h1>
      <p className="text-sm text-gray-600">
        This is a monolithic debug page. It only does one thing: sends a PDF to <code>/api/extract-text</code> and outputs the raw text.
      </p>

      <div className="flex flex-col gap-2 p-6 bg-gray-50 border rounded-lg">
        <label className="font-semibold">Select PDF File</label>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileUpload}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="p-4 rounded-lg font-mono text-sm bg-blue-50 text-blue-900 border border-blue-200">
        Status: <strong>{status}</strong>
      </div>

      {errorText && (
        <div className="p-4 rounded-lg font-mono text-sm bg-red-50 text-red-900 border border-red-200">
          <strong>Error:</strong> {errorText}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="font-semibold">Extracted Text</label>
        <textarea 
          className="w-full h-96 p-4 border rounded-lg font-mono text-sm bg-gray-50"
          value={extractedText}
          readOnly
          placeholder="Extracted text will appear here..."
        />
      </div>
    </div>
  );
}
