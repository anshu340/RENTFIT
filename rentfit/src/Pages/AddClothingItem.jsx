import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUpload, FaTimes } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const AddClothingItem = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    gender: '',
    size: '',
    condition: '',
    rental_price: '',
    description: '',
    clothing_status: 'Available'
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    'Shirt', 'Pants', 'Dress', 'Jacket', 'Skirt', 'Shoes', 'Accessories', 'Other'
  ];

  const conditions = ['New', 'Like New', 'Good', 'Used'];
  
  const genders = ['Male', 'Female', 'Other'];
  
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free', 'Custom'];

  useEffect(() => {
    if (isEditMode) {
      fetchClothingItem();
    }
  }, [editId]);

  const fetchClothingItem = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`clothing/${editId}/`);
      if (response.data) {
        const item = response.data;
        setFormData({
          item_name: item.item_name || '',
          category: item.category || '',
          gender: item.gender || '',
          size: item.size || '',
          condition: item.condition || '',
          rental_price: item.rental_price || '',
          description: item.description || '',
          clothing_status: item.clothing_status || 'Available'
        });
        if (item.images) {
          setExistingImage(item.images);
        }
      }
    } catch (err) {
      console.error('Error fetching clothing item:', err);
      setError('Failed to load clothing item details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      
      // Append all fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append image if exists
      if (imageFile) {
        formDataToSend.append('images', imageFile);
      }

      let response;
      if (isEditMode) {
        response = await axiosInstance.put(`clothing/${editId}/update/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      } else {
        response = await axiosInstance.post('clothing/create/', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      }

      setSuccess(true);
      
      // Redirect to my clothing items after successful submission
      setTimeout(() => {
        navigate('/my-clothing-items');
      }, 1500);

    } catch (err) {
      console.error('Error saving clothing item:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save clothing item');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('clothingDraft', JSON.stringify({
      formData,
      imagePreview
    }));
    setSuccess(true);
    setError('');
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  if (loading && isEditMode) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clothing item...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button 
              onClick={() => navigate('/myclothingitems')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <FaArrowLeft className="mr-2" />
              Back to Inventory
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Clothing Item' : 'Add New Clothing Item'}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Fill in the details below to {isEditMode ? 'update' : 'add'} a clothing item to the rental platform
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              {isEditMode ? 'Clothing item updated successfully!' : 'Clothing item added successfully!'}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <div>
            {/* Item Information Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-semibold">+</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Item Information</h2>
                  <p className="text-sm text-gray-600">Provide accurate details for better customer experience</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Item Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    value={formData.item_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Designer Evening Gown"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Condition</option>
                    {conditions.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Gender</option>
                    {genders.map(gen => (
                      <option key={gen} value={gen}>{gen}</option>
                    ))}
                  </select>
                </div>

                {/* Rental Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Price (per day) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="rental_price"
                      value={formData.rental_price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size *
                </label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, size }))}
                      className={`py-2 px-4 border rounded-lg text-sm font-medium transition-colors ${
                        formData.size === size
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Images */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images {!isEditMode && '*'}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-48 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  ) : existingImage && !imageFile ? (
                    <div className="relative inline-block">
                      <img 
                        src={existingImage} 
                        alt="Current" 
                        className="max-h-48 rounded-lg"
                      />
                      <p className="text-sm text-gray-500 mt-2">Current Image</p>
                    </div>
                  ) : (
                    <div>
                      <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-1">Click to upload images</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="mt-4 inline-block px-6 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                  >
                    {imagePreview || existingImage ? 'Change Image' : 'Choose File'}
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the item details, material, occasion, care instructions..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/myclothingitems')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isEditMode ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Item' : '+ Add Item to Inventory'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddClothingItem;