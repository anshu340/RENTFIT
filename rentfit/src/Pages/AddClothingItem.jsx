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

  const categories = ['Formal Wear', 'Casual', 'Party Wear', 'Traditional', 'Sports Wear'];
  const eventTypes = ['Wedding', 'Party', 'Formal', 'Casual'];
  const conditions = ['New', 'Like New', 'Good', 'Used'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free', 'Custom'];

  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    event_type: '',
    gender: '',
    size: '',
    condition: '',
    rental_price: '',
    security_deposit: '',
    stock_quantity: '1',
    description: '',
    clothing_status: 'Available'
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
          event_type: item.event_type || '',
          gender: item.gender || 'Female',
          size: item.size || '',
          condition: item.condition || '',
          rental_price: item.rental_price || '',
          security_deposit: item.security_deposit || '',
          stock_quantity: item.stock_quantity || '1',
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
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formDataToSend = new FormData();

      // Append all fields with cleanup
      Object.keys(formData).forEach(key => {
        let value = formData[key];

        // Data Cleanup: Ensure numeric fields are correctly handled
        if (['rental_price', 'security_deposit', 'stock_quantity'].includes(key)) {
          if (value === "" || value === null || value === undefined) {
            // Let backend handle defaults or required validation
            return;
          }
          value = Number(value);
        }

        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value);
        }
      });

      // Append image if exists
      if (imageFile) {
        formDataToSend.append('images', imageFile);
      }

      if (isEditMode) {
        await axiosInstance.put(`clothing/${editId}/update/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      } else {
        await axiosInstance.post('clothing/create/', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/myClothingItems');
      }, 1500);

    } catch (err) {
      console.error('Error saving clothing item:', err);

      // Improved Error Handling: Show field-level errors
      if (err.response?.data) {
        const backendErrors = err.response.data;
        if (typeof backendErrors === 'object' && !Array.isArray(backendErrors)) {
          const errorMessages = Object.keys(backendErrors).map(field => {
            const messages = Array.isArray(backendErrors[field])
              ? backendErrors[field].join(", ")
              : backendErrors[field];
            return `${field.replace('_', ' ')}: ${messages}`;
          });
          setError(errorMessages.join(" | "));
        } else {
          setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save clothing item');
        }
      } else {
        setError('Failed to connect to server. Please try again.');
      }
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {isEditMode ? 'Edit Clothing Item' : 'Add New Clothing Item'}
              </h1>
              <p className="text-gray-500 mt-1">
                Fill in the details below to {isEditMode ? 'update' : 'add'} a new clothing item to the rental platform
              </p>
            </div>
            <button
              onClick={() => navigate('/myClothingItems')}
              className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-bold text-gray-600 hover:text-purple-600 transition-all flex items-center gap-2"
            >
              <FaArrowLeft size={12} />
              Back to Inventory
            </button>
          </div>

          <div className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-medium animate-pulse">
                {isEditMode ? 'Item updated successfully!' : 'Item added successfully to inventory!'}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Information Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-2xl font-bold">+</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Item Information</h2>
                      <p className="text-sm text-gray-500">Provide accurate details for better customer experience</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Item Name */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Item Name *</label>
                      <input
                        type="text"
                        name="item_name"
                        value={formData.item_name}
                        onChange={handleInputChange}
                        placeholder="e.g., Designer Evening Gown"
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Category *</label>
                      <div className="relative">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none text-sm font-medium transition-all"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <FaArrowLeft className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-gray-400 pointer-events-none" size={12} />
                      </div>
                    </div>

                    {/* Gender Selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Gender *</label>
                      <div className="relative">
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none text-sm font-medium transition-all"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <FaArrowLeft className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-gray-400 pointer-events-none" size={12} />
                      </div>
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Condition *</label>
                      <div className="relative">
                        <select
                          name="condition"
                          value={formData.condition}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none text-sm font-medium transition-all"
                          required
                        >
                          <option value="">Select Condition</option>
                          {conditions.map(cond => (
                            <option key={cond} value={cond}>{cond}</option>
                          ))}
                        </select>
                        <FaArrowLeft className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-gray-400 pointer-events-none" size={12} />
                      </div>
                    </div>

                    {/* Event Type */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Event Type *</label>
                      <div className="relative">
                        <select
                          name="event_type"
                          value={formData.event_type}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none text-sm font-medium transition-all"
                          required
                        >
                          <option value="">Select Event Type</option>
                          {eventTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <FaArrowLeft className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-gray-400 pointer-events-none" size={12} />
                      </div>
                    </div>

                    {/* Stock Quantity */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Stock Quantity *</label>
                      <input
                        type="number"
                        name="stock_quantity"
                        value={formData.stock_quantity}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="1"
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium"
                        required
                      />
                    </div>

                    {/* Size Selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Size *</label>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, size }))}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${formData.size === size
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 scale-105'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Product Images */}
                    <div className="md:row-span-3">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Product Images *</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group relative">
                        {imagePreview || existingImage ? (
                          <div className="relative inline-block w-full">
                            <img
                              src={imagePreview || existingImage}
                              alt="Item Preview"
                              className="w-full aspect-[4/5] object-cover rounded-2xl shadow-md"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all"
                            >
                              <FaTimes size={14} />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="image-upload" className="block cursor-pointer py-10">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                              <FaUpload className="text-purple-600" size={24} />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">
                              {imageFile ? `Selected: ${imageFile.name}` : 'Click to upload images'}
                            </h3>
                            <p className="text-xs text-gray-400 font-medium">PNG, JPG up to 10MB each</p>
                            <div className="mt-6 px-6 py-2.5 bg-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-xl inline-block shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all">
                              {imageFile ? 'Change File' : 'Choose Files'}
                            </div>
                          </label>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                      </div>
                    </div>

                    {/* Rental Price */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Rental Price (per day) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input
                          type="number"
                          name="rental_price"
                          value={formData.rental_price}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Security Deposit */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Security Deposit *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input
                          type="number"
                          name="security_deposit"
                          value={formData.security_deposit}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the item details, material, occasion, care instructions..."
                        rows="6"
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-20">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-100 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                >
                  Save as Draft
                </button>
                <div className="flex w-full sm:w-auto gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/myClothingItems')}
                    className="flex-1 sm:flex-none px-8 py-3.5 bg-white border border-gray-100 text-gray-500 font-bold rounded-xl hover:text-red-500 transition-all uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none px-12 py-3.5 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 transition-all disabled:bg-purple-300 shadow-xl shadow-purple-100 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span>{isEditMode ? 'Update Item' : '+ Add Item to Inventory'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Tips Section */}
            <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100/50">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <span className="text-xl font-bold">💡</span>
                </div>
                <div>
                  <h3 className="text-blue-900 font-black uppercase tracking-tighter text-sm mb-4">Quick Tips for Better Listings</h3>
                  <ul className="space-y-3">
                    <li className="text-blue-700/80 text-sm font-medium flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Use high-quality, well-lit photos from multiple angles
                    </li>
                    <li className="text-blue-700/80 text-sm font-medium flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Include detailed measurements and fabric information
                    </li>
                    <li className="text-blue-700/80 text-sm font-medium flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Mention any special care instructions or restrictions
                    </li>
                    <li className="text-blue-700/80 text-sm font-medium flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      Set competitive pricing based on similar items in your area
                    </li>
                  </ul>
                </div>
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