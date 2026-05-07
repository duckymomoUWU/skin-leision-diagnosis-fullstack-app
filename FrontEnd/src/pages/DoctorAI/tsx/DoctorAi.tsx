import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../../../api/Axios";
import '../css/DoctorAI.css';

const DoctorAI: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("UNKNOWN");

  // Get user info
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id);
      } catch {
        setUserId("UNKNOWN");
      }
    }
  }, []);

  // Generate diagnose_id
  function generateDiagnoseId(): string {
    return 'DGN-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setResult(null);
      setConfidence(null);
      setError(null);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image.");
      return;
    }
    setLoading(true);
    setResult(null);
    setConfidence(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("description", "Chẩn đoán từ hệ thống AI");

      // Gọi duy nhất 1 API tới NestJS. NestJS sẽ lo việc upload Cloudinary, gọi AI và lưu Oracle!
      const response = await axiosInstance.post('/diagnose', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const data = response.data;

      if (data && data.prediction) {
        setResult(data.prediction);
        setConfidence(data.confidence);
      } else {
        setError("No valid result received from AI.");
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError("Failed to save result: " + err.response.data.message);
      } else {
        setError(err.message || "An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctorai-container">
      <h1 className="doctorai-title">
        AI Doctor <span className="doctorai-emoji">🩺</span>
      </h1>
      <form onSubmit={handleSubmit} className="doctorai-form">
        <label className="doctorai-upload-label">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            className="doctorai-file-input"
          />
          <span className="doctorai-upload-button">Choose Image</span>
        </label>
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="doctorai-preview-img"
          />
        )}
        <button
          type="submit"
          disabled={!selectedFile || loading}
          className="doctorai-submit-button"
        >
          {loading ? (
            <span className="doctorai-spinner"></span>
          ) : (
            "Diagnose"
          )}
        </button>
      </form>
      {error && <div className="doctorai-error">{error}</div>}
      {result && (
        <div className="doctorai-result-box">
          <h3>AI Result:</h3>
          <div className="doctorai-result">
            Prediction: <b>{result}</b>
          </div>
          {confidence !== null && (
            <div className="doctorai-result">
              Confidence: <b>{confidence}%</b>
            </div>
          )}
          <div className="doctorai-tip">
            (Classification: bkl, nv, df, mel, vasc, bcc, akiec)
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAI;