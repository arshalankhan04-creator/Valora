import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CreateListing = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Form Field States
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [kmDriven, setKmDriven] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('Manual');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  // Image Upload States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // API Call States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Revoke preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Protect route: Allow only logged-in sellers
  if (authLoading) {
    return <div>Loading authentication status...</div>;
  }

  if (!user || user.role !== 'seller') {
    return (
      <div>
        <h2>Access Denied</h2>
        <p style={{ color: 'red' }}>Only authenticated sellers are authorized to create vehicle listings.</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  // Handle image selections and previews
  const handleFileChange = (e) => {
    setValidationError('');
    setError('');
    const files = Array.from(e.target.files);

    if (files.length > 6) {
      setValidationError('You can upload a maximum of 6 images.');
      return;
    }

    // Verify file types
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (let file of files) {
      if (!validExtensions.includes(file.type)) {
        setValidationError(`Invalid file type: ${file.name}. Only JPG, JPEG, PNG, and WEBP are allowed.`);
        return;
      }
    }

    setSelectedFiles(files);

    // Create preview object URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    // Revoke old previews to prevent memory leaks
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(newPreviews);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    // Client-side text field validations
    if (!brand.trim() || !model.trim() || !year || !kmDriven || !price) {
      setValidationError('All fields except description are required.');
      return;
    }

    // FormData Construction
    const formData = new FormData();
    formData.append('brand', brand.trim());
    formData.append('model', model.trim());
    formData.append('year', year);
    formData.append('kmDriven', kmDriven);
    formData.append('fuelType', fuelType);
    formData.append('transmission', transmission);
    formData.append('price', price);
    formData.append('description', description.trim());

    // Append images
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    setLoading(true);
    try {
      const res = await api.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newListing = res.data;
      navigate(`/listings/${newListing._id}`);
    } catch (err) {
      console.error('Create listing error:', err);
      const serverMessage = err.response?.data?.message || 'Failed to create listing. Please try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Vehicle Listing</h2>
      <Link to="/">&larr; Back to Home</Link>
      <br /><br />

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {validationError && (
          <div style={{ color: 'red', marginBottom: '15px' }} id="validation-error">
            {validationError}
          </div>
        )}
        {error && (
          <div style={{ color: 'darkred', marginBottom: '15px', fontWeight: 'bold' }} id="server-error">
            {error}
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="brand">Brand *</label>
          <br />
          <input
            id="brand"
            type="text"
            placeholder="e.g. Audi"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="model">Model *</label>
          <br />
          <input
            id="model"
            type="text"
            placeholder="e.g. A6"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="year">Year *</label>
          <br />
          <input
            id="year"
            type="number"
            placeholder="e.g. 2020"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="kmDriven">Kilometers Driven *</label>
          <br />
          <input
            id="kmDriven"
            type="number"
            placeholder="e.g. 25000"
            value={kmDriven}
            onChange={(e) => setKmDriven(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="fuelType">Fuel Type *</label>
          <br />
          <select id="fuelType" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="CNG">CNG</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="transmission">Transmission *</label>
          <br />
          <select id="transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)}>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="price">Price (₹) *</label>
          <br />
          <input
            id="price"
            type="number"
            placeholder="e.g. 4500000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="description">Description</label>
          <br />
          <textarea
            id="description"
            rows="4"
            cols="40"
            placeholder="Details about vehicle condition, service history, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Multiple File Input */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="images">Select Images (Max 6, JPG/JPEG/PNG/WEBP)</label>
          <br />
          <input
            id="images"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
          />
        </div>

        {/* Preview Thumbnails */}
        {previews.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <p>Image Previews:</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {previews.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Preview ${index + 1}`}
                  style={{ width: '100px', height: '70px', objectFit: 'cover', border: '1px solid #ccc' }}
                />
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} id="create-submit">
          {loading ? 'Saving...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;
