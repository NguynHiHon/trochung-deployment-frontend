import React, { useState } from 'react';

const CloudinaryTest = () => {
  const [file, setFile] = useState(null);
  const [out, setOut] = useState('');
  const [lastPublicId, setLastPublicId] = useState(null);

  const handleUpload = async () => {
    if (!file) return setOut('Choose a file first');
    setOut('Requesting signature...');
    try {
  // For the local test router we added, include ?testAuth=1 so the test middleware permits the request.
  // In production you should use a real auth middleware and remove this query param.
  const signResp = await fetch('/api/cloudinary/sign?testAuth=1', { credentials: 'include' });
      if (!signResp.ok) throw new Error('sign failed: ' + signResp.status);
      const { signature, timestamp, apiKey, cloudName, folder } = await signResp.json();

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', apiKey);
      fd.append('timestamp', timestamp);
      fd.append('signature', signature);
      fd.append('folder', folder);

      setOut('Uploading to Cloudinary...');
      const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: fd });
      const json = await r.json();
      setLastPublicId(json.public_id);
      setOut('Upload result:\n' + JSON.stringify(json, null, 2));
    } catch (err) {
      setOut('Error: ' + String(err));
    }
  };

  const handleVerify = async () => {
    if (!lastPublicId) return setOut('No public_id to verify');
    setOut('Verifying...');
    try {
      const r = await fetch('/api/cloudinary/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ public_id: lastPublicId }) });
      const statusInfo = `HTTP ${r.status} ${r.statusText}`;
      const text = await r.text();
      try {
        const j = JSON.parse(text);
        setOut('Verify result: ' + statusInfo + '\n' + JSON.stringify(j, null, 2));
      } catch (parseErr) {
        // response was not JSON (e.g. proxy error or HTML) — show raw text to help debug
        setOut('Verify response not JSON: ' + statusInfo + '\n' + text);
      }
    } catch (err) {
      setOut('Verify error: ' + String(err));
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Cloudinary Direct Upload (React test)</h2>
      <input type="file" onChange={e => setFile(e.target.files && e.target.files[0])} />
      <div style={{ marginTop: 12 }}>
        <button onClick={handleUpload}>Upload</button>
        <button style={{ marginLeft: 8 }} onClick={handleVerify}>Verify last</button>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 12, marginTop: 12 }}>{out}</pre>
    </div>
  );
};

export default CloudinaryTest;
