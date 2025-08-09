import React, { useRef, useState } from "react";

function BulkUploadModal({ open, onClose, onSuccess }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileRef.current.files.length) return alert("Please select a CSV file.");
    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", fileRef.current.files[0]);

    try {
      const res = await fetch('/api/inventory/bulk-upload', {
        method: "POST",
        body: formData,
        // headers: { Authorization: `Bearer ...` }
      });
      const data = await res.json();
      setResult(data);
      setUploading(false);

      if (!res.ok) {
        alert("Upload failed: " + (data.message || "Unknown error"));
        return;
      }

      onSuccess && onSuccess(); // Refresh inventory if needed in parent
      alert("Upload Successful");
    } catch {
      setUploading(false);
      alert("Upload failed (network or server error)");
    }
  };

  if (!open) return null;
  return (
    <div className="modal-bg">
      <div className="modal">
        <h2>Bulk Upload Medicines (CSV)</h2>
        <form onSubmit={handleUpload}>
          <input type="file" accept=".csv" ref={fileRef} />
          <button type="submit" disabled={uploading} style={{ marginLeft: 12 }}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
        {result && (
          <div style={{ marginTop: 8 }}>
            <div>Inserted: {result.inserted}</div>
            <div>Updated: {result.updated}</div>
            {result.errors?.length > 0 &&
              <div>
                <b>Errors:</b>
                <ul>{result.errors.map((e, i) => <li key={i}>{JSON.stringify(e)}</li>)}</ul>
              </div>
            }
          </div>
        )}
        <button onClick={onClose} style={{ marginTop: 12 }}>Close</button>
      </div>
    </div>
  );
}

export default BulkUploadModal;
