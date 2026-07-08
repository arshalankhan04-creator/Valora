import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Listing Data States
  const [listing, setListing] = useState(null);
  const [fetching, setFetching] = useState(true);

  // Form Field States
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [kmDriven, setKmDriven] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('Manual');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  // New Image States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  // UI States
  const [savingText, setSavingText] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Fetch listing details on load
  const fetchListing = async () => {
    setFetching(true);
    try {
      const res = await api.get(`/listings/${id}`);
      const data = res.data;
      setListing(data);
      
      // Prefill text values
      setBrand(data.brand);
      setModel(data.model);
      setYear(data.year);
      setKmDriven(data.kmDriven);
      setFuelType(data.fuelType);
      setTransmission(data.transmission);
      setPrice(data.price);
      setDescription(data.description || '');
    } catch (err) {
      console.error('Fetch listing error:', err);
      setError('Listing not found');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  // Protect page: Loading check
  if (authLoading || fetching) {
    return <div>Loading details...</div>;
  }

  // Helper to extract string representation of seller ID
  const getSellerId = (seller) => {
    if (!seller) return '';
    if (typeof seller === 'object') return seller._id || '';
    return seller;
  };

  const sellerId = getSellerId(listing?.seller);
  const userId = user ? (user._id || user.id || '') : '';
  const isOwnListing = userId && sellerId && sellerId.toString() === userId.toString();

  // Access check
  if (!user || user.role !== 'seller' || !isOwnListing) {
    return (
      <div>
        <h2>Access Denied</h2>
        <p style={{ color: 'red' }}>You are not authorized to edit this listing.</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  // Deleting existing image
  const handleDeleteImage = async (index) => {
    setError('');
    setValidationError('');
    if (!window.confirm('Are you sure you want to remove this image?')) return;

    try {
      const res = await api.delete(`/listings/${id}/images/${index}`);
      // The API returns { message, listing }
      setListing(res.data.listing);
    } catch (err) {
      console.error('Delete image error:', err);
      setError(err.response?.data?.message || 'Failed to remove image.');
    }
  };

  // Handle new file selections
  const handleFileChange = (e) => {
    setValidationError('');
    setError('');
    const files = Array.from(e.target.files);

    const totalCount = (listing.images ? listing.images.length : 0) + files.length;
    if (totalCount > 6) {
      setValidationError(`Maximum of 6 images allowed total. Current images count: ${listing.images.length}. You selected: ${files.length}.`);
      return;
    }

    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (let file of files) {
      if (!validExtensions.includes(file.type)) {
        setValidationError(`Invalid file type: ${file.name}. Only JPG, JPEG, PNG, and WEBP are allowed.`);
        return;
      }
    }

    setSelectedFiles(files);

    const newUrls = files.map((file) => URL.createObjectURL(file));
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewPreviews(newUrls);
  };

  // Uploading new images
  const handleUploadImages = async (e) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    if (selectedFiles.length === 0) {
      setValidationError('Please select at least one image file to upload.');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    setUploadingImages(true);
    try {
      const res = await api.post(`/listings/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setListing(res.data); // Backend returns the updated listing object on success
      setSelectedFiles([]);
      setNewPreviews([]);
      alert('Images uploaded successfully.');
    } catch (err) {
      console.error('Upload images error:', err);
      setError(err.response?.data?.message || 'Failed to upload images.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Saving text fields changes
  const handleSaveText = async (e) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    if (!brand.trim() || !model.trim() || !year || !kmDriven || !price) {
      setValidationError('All fields except description are required.');
      return;
    }

    setSavingText(true);
    try {
      await api.put(`/listings/${id}`, {
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year),
        kmDriven: Number(kmDriven),
        fuelType,
        transmission,
        price: Number(price),
        description: description.trim()
      });
      navigate(`/listings/${id}`);
    } catch (err) {
      console.error('Save text fields error:', err);
      setError(err.response?.data?.message || 'Failed to save edits.');
    } finally {
      setSavingText(false);
    }
  };

  return (
    <div>
      <h2>Edit Vehicle Listing</h2>
      <Link to={`/listings/${id}`}>&larr; Cancel and Go Back</Link>
      <br /><br />

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

      {/* Part 1: Manage Existing Images */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Manage Images</h3>
        {listing.images && listing.images.length > 0 ? (
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
            {listing.images.map((img, index) => (
              <div key={index} style={{ textAlign: 'center', border: '1px solid #ddd', padding: '5px' }}>
                <img
                  src={`http://localhost:5000/${img}`}
                  alt={`Listing ${index + 1}`}
                  style={{ width: '120px', height: '80px', objectFit: 'cover', display: 'block', marginBottom: '5px' }}
                />
                <button type="button" onClick={() => handleDeleteImage(index)}>Delete</button>
              </div>
            ))}
          </div>
        ) : (
          <p>No images are uploaded for this listing.</p>
        )}

        {/* Upload New Images Form */}
        <form onSubmit={handleUploadImages} encType="multipart/form-data">
          <label htmlFor="new-images">Add New Images (Max 6 total):</label>
          <br />
          <input
            id="new-images"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
          />
          <br /><br />

          {newPreviews.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <p>Selected Images Preview:</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {newPreviews.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`New Preview ${index + 1}`}
                    style={{ width: '80px', height: '50px', objectFit: 'cover', border: '1px solid #ccc' }}
                  />
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={uploadingImages || selectedFiles.length === 0}>
            {uploadingImages ? 'Uploading...' : 'Upload New Images'}
          </button>
        </form>
      </div>

      {/* Part 2: Edit Vehicle Text Details */}
      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h3>Edit Details</h3>
        <form onSubmit={handleSaveText}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="brand">Brand *</label>
            <br />
            <input
              id="brand"
              type="text"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" disabled={savingText} id="edit-submit">
            {savingText ? 'Saving...' : 'Save Text Details'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
