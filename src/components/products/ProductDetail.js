import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  ImageList,
  ImageListItem,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
  Add as AddIcon
} from '@mui/icons-material';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import styles from '../../styles/ProductDetail.module.css';

const ProductDetail = ({ editMode: initialEditMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(initialEditMode || false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    discountPercentage: 0,
    stock: 0,
    category: '',
    features: [],
    specifications: {},
    customizationOptions: []
  });

  // Image management
  const [newImages, setNewImages] = useState([]);
  const [keepExistingImages, setKeepExistingImages] = useState(true);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  
  // Feature management
  const [newFeature, setNewFeature] = useState('');
  
  // Specification management
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  
  // Customization option management
  const [newCustomizationName, setNewCustomizationName] = useState('');
  const [newCustomizationOptions, setNewCustomizationOptions] = useState('');
  
  // Fetch product and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productResponse, categoriesResponse] = await Promise.all([
          productService.getProductById(id),
          categoryService.getAllCategories()
        ]);
        
        const productData = productResponse.data;
        setProduct(productData);
        setCategories(categoriesResponse.data || []);
        
        // Parse JSON strings if needed
        let features = productData.features || [];
        let specifications = productData.specifications || {};
        let customizationOptions = productData.customizationOptions || [];
        
        // Check if data needs to be parsed from strings
        if (typeof features === 'string') {
          try {
            features = JSON.parse(features);
          } catch (e) {
            console.error('Error parsing features JSON:', e);
            features = [];
          }
        }
        
        if (typeof specifications === 'string') {
          try {
            specifications = JSON.parse(specifications);
          } catch (e) {
            console.error('Error parsing specifications JSON:', e);
            specifications = {};
          }
        }
        
        if (typeof customizationOptions === 'string') {
          try {
            customizationOptions = JSON.parse(customizationOptions);
          } catch (e) {
            console.error('Error parsing customizationOptions JSON:', e);
            customizationOptions = [];
          }
        }
        
        // Initialize form data
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price || 0,
          discountPercentage: productData.discountPercentage || 0,
          stock: productData.stock || 0,
          category: productData.category?._id || '',
          features,
          specifications,
          customizationOptions
        });
        
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle form field change
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    });
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Reset form data when canceling edit
      let features = product.features || [];
      let specifications = product.specifications || {};
      let customizationOptions = product.customizationOptions || [];
      
      // Check if data needs to be parsed from strings
      if (typeof features === 'string') {
        try {
          features = JSON.parse(features);
        } catch (e) {
          features = [];
        }
      }
      
      if (typeof specifications === 'string') {
        try {
          specifications = JSON.parse(specifications);
        } catch (e) {
          specifications = {};
        }
      }
      
      if (typeof customizationOptions === 'string') {
        try {
          customizationOptions = JSON.parse(customizationOptions);
        } catch (e) {
          customizationOptions = [];
        }
      }
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        discountPercentage: product.discountPercentage || 0,
        stock: product.stock || 0,
        category: product.category?._id || '',
        features,
        specifications,
        customizationOptions
      });
      
      // Reset image management
      setNewImages([]);
      setKeepExistingImages(true);
      setImagesToRemove([]);
    }
    setEditMode(!editMode);
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const maxNewImages = 5 - (product.images?.length || 0) + imagesToRemove.length;
    const filesToAdd = files.slice(0, maxNewImages);
    
    // Preview images
    const uploadedImages = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setNewImages([...newImages, ...uploadedImages]);
  };
  
  // Remove uploaded image
  const handleRemoveNewImage = (index) => {
    const updatedImages = [...newImages];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(updatedImages[index].preview);
    
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);
  };
  
  // Mark existing image for removal
  const handleMarkImageForRemoval = (index) => {
    if (!imagesToRemove.includes(index)) {
      setImagesToRemove([...imagesToRemove, index]);
    }
  };
  
  // Unmark image for removal
  const handleUnmarkImageForRemoval = (index) => {
    setImagesToRemove(imagesToRemove.filter(i => i !== index));
  };
  
  // Add new feature
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };
  
  // Remove feature
  const handleRemoveFeature = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: newFeatures
    });
  };
  
  // Add new specification
  const handleAddSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specKey.trim()]: specValue.trim()
        }
      });
      setSpecKey('');
      setSpecValue('');
    }
  };
  
  // Remove specification
  const handleRemoveSpecification = (key) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({
      ...formData,
      specifications: newSpecs
    });
  };
  
  // Add new customization option
  const handleAddCustomizationOption = () => {
    if (newCustomizationName.trim() && newCustomizationOptions.trim()) {
      const options = newCustomizationOptions.split(',').map(option => option.trim()).filter(option => option);
      
      if (options.length > 0) {
        setFormData({
          ...formData,
          customizationOptions: [
            ...formData.customizationOptions,
            {
              name: newCustomizationName.trim(),
              options
            }
          ]
        });
        setNewCustomizationName('');
        setNewCustomizationOptions('');
      }
    }
  };
  
  // Remove customization option
  const handleRemoveCustomizationOption = (index) => {
    const newCustomOptions = [...formData.customizationOptions];
    newCustomOptions.splice(index, 1);
    setFormData({
      ...formData,
      customizationOptions: newCustomOptions
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create FormData object for multipart/form-data
      const productFormData = new FormData();
      
      // Add basic fields
      productFormData.append('name', formData.name);
      productFormData.append('description', formData.description);
      productFormData.append('price', formData.price);
      if (formData.discountPercentage) {
        productFormData.append('discountPercentage', formData.discountPercentage);
      }
      productFormData.append('stock', formData.stock || 0);
      if (formData.category) {
        productFormData.append('category', formData.category);
      }
      
      // Add features as JSON string
      if (formData.features.length > 0) {
        productFormData.append('features', JSON.stringify(formData.features));
      }
      
      // Add specifications as JSON string
      if (Object.keys(formData.specifications).length > 0) {
        productFormData.append('specifications', JSON.stringify(formData.specifications));
      }
      
      // Add customizationOptions as JSON string
      if (formData.customizationOptions.length > 0) {
        productFormData.append('customizationOptions', JSON.stringify(formData.customizationOptions));
      }
      
      // Add image management
      productFormData.append('keepExistingImages', keepExistingImages.toString());
      
      if (imagesToRemove.length > 0) {
        productFormData.append('imagesToRemove', JSON.stringify(imagesToRemove));
      }
      
      // Add new images
      newImages.forEach(image => {
        productFormData.append('images', image.file);
      });
      
      // Log for debugging
      console.log('Updating product with form data:', {
        name: formData.name,
        price: formData.price,
        stock: formData.stock,
        category: formData.category,
        features: formData.features.length,
        specifications: Object.keys(formData.specifications).length,
        customizationOptions: formData.customizationOptions.length,
        keepExistingImages,
        imagesToRemoveCount: imagesToRemove.length,
        newImagesCount: newImages.length
      });
      
      const response = await productService.updateProduct(id, productFormData);
      setProduct(response.data);
      setEditMode(false);
      setError('');
      
      // Reset image management
      setNewImages([]);
      setImagesToRemove([]);
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Check if image is marked for removal
  const isImageMarkedForRemoval = (index) => {
    return imagesToRemove.includes(index);
  };
  
  // Get discounted price
  const getDiscountedPrice = (price, discountPercentage) => {
    if (!discountPercentage || discountPercentage <= 0) return null;
    const discount = (price * discountPercentage) / 100;
    return price - discount;
  };
  
  // Render loading state
  if (loading && !product) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error && !product) {
    return (
      <Box mt={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  // Calculate discounted price if there's a discount
  const discountedPrice = getDiscountedPrice(product?.price, product?.discountPercentage);
  
  return (
    <div className={styles.productDetailContainer}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Product Details
        </Typography>
        
        <Box>
          <Button
            variant={editMode ? "outlined" : "contained"}
            color={editMode ? "secondary" : "primary"}
            startIcon={editMode ? <CancelIcon /> : <EditIcon />}
            onClick={toggleEditMode}
            sx={{ mr: 1 }}
          >
            {editMode ? 'Cancel' : 'Edit'}
          </Button>
          
          {editMode && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
            >
              Save
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Basic Info" />
          <Tab label="Images" />
          <Tab label="Features & Specs" />
          <Tab label="Inventory" />
        </Tabs>
      </Paper>
      
      {/* Product Detail Content */}
      <Paper sx={{ p: 3 }}>
        {/* Basic Info Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={editMode ? 8 : 6}>
              {editMode ? (
                <form>
                  <TextField
                    fullWidth
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    multiline
                    rows={4}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        required
                        InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Discount Percentage"
                        name="discountPercentage"
                        type="number"
                        value={formData.discountPercentage}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        InputProps={{ inputProps: { min: 0, max: 100, step: "0.1" } }}
                        helperText="Leave empty or 0 if no discount"
                      />
                    </Grid>
                  </Grid>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Category"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </form>
              ) : (
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {product.name}
                  </Typography>
                  
                  {product.discountPercentage > 0 && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="h6" color="error" sx={{ mr: 2 }}>
                        {formatCurrency(discountedPrice)} 
                        <Chip 
                          label={`${product.discountPercentage}% OFF`} 
                          color="error" 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                      >
                        {formatCurrency(product.price)}
                      </Typography>
                    </Box>
                  )}
                  
                  {!product.discountPercentage && (
                    <Typography variant="h6" gutterBottom>
                      {formatCurrency(product.price)}
                    </Typography>
                  )}
                  
                  <Box mt={2} mb={3}>
                    <Typography variant="body1" className={styles.productDescription}>
                      {product.description || 'No description'}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2">
                    <strong>Category:</strong> {product.category?.name || 'Uncategorized'}
                  </Typography>
                  
                  <Typography variant="body2">
                    <strong>Stock:</strong> {product.stock || 0} units
                  </Typography>
                  
                  <Typography variant="body2">
                    <strong>Created on:</strong> {formatDate(product.createdAt)}
                  </Typography>
                  
                  <Typography variant="body2">
                    <strong>Last updated:</strong> {formatDate(product.updatedAt)}
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={editMode ? 4 : 6}>
              <Box sx={{ mb: 2 }}>
                <img
                  src={product.images && product.images.length > 0
                    ? product.images[0].url
                    : '/placeholder-product.png'}
                  alt={product.name}
                  className={styles.mainProductImage}
                />
              </Box>
              
              {!editMode && product.images && product.images.length > 1 && (
                <ImageList cols={4} gap={8} sx={{ mt: 2 }}>
                  {product.images.slice(1).map((image, index) => (
                    <ImageListItem key={index} className={styles.thumbnailItem}>
                      <img 
                        src={image.url} 
                        alt={`${product.name} ${index + 2}`}
                        className={styles.thumbnailImage}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </Grid>
          </Grid>
        )}
        
        {/* Images Tab */}
        {tabValue === 1 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Product Images</Typography>
              {editMode && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  disabled={newImages.length + (product.images?.length || 0) - imagesToRemove.length >= 5}
                >
                  Upload Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    hidden
                  />
                </Button>
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You can upload up to 5 images. The first image will be used as the featured image.
            </Typography>
            
            {product.images && product.images.length > 0 ? (
              <Grid container spacing={2}>
                {product.images.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box className={styles.imageItem}>
                      <img 
                        src={image.url} 
                        alt={`Product ${index + 1}`}
                        className={`${styles.galleryImage} ${isImageMarkedForRemoval(index) ? styles.imageMarkedForRemoval : ''}`}
                      />
                      {editMode && (
                        <Box className={styles.imageActions}>
                          {isImageMarkedForRemoval(index) ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleUnmarkImageForRemoval(index)}
                            >
                              Restore
                            </Button>
                          ) : (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleMarkImageForRemoval(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      )}
                      {index === 0 && (
                        <Box className={styles.featuredBadge}>
                          Featured
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
                
                {/* Newly uploaded images */}
                {editMode && newImages.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} key={`new-${index}`}>
                    <Box className={styles.imageItem}>
                      <img 
                        src={image.preview} 
                        alt={`New Upload ${index + 1}`}
                        className={styles.galleryImage}
                      />
                      <Box className={styles.imageActions}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Box className={styles.newImageBadge}>
                        New
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">No images available</Typography>
              </Box>
            )}
          </Box>
        )}
        
        {/* Features & Specs Tab */}
        {tabValue === 2 && (
          <Box>
            {editMode ? (
              <Grid container spacing={3}>
                {/* Features Section */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Product Features
                  </Typography>
                  
                  <Box mb={2}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <TextField
                          fullWidth
                          label="Add Feature"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleAddFeature}
                          startIcon={<AddIcon />}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box mt={2}>
                    {formData.features.length > 0 ? (
                      <ul className={styles.featuresList}>
                        {formData.features.map((feature, index) => (
                          <li key={index} className={styles.featureItem}>
                            <Typography variant="body2">{feature}</Typography>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRemoveFeature(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Typography color="textSecondary" variant="body2">
                        No features added yet
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                {/* Specifications Section */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Product Specifications
                  </Typography>
                  
                  <Box mb={2}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          label="Specification Name"
                          value={specKey}
                          onChange={(e) => setSpecKey(e.target.value)}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          label="Specification Value"
                          value={specValue}
                          onChange={(e) => setSpecValue(e.target.value)}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={handleAddSpecification}
                          startIcon={<AddIcon />}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box mt={2}>
                    {Object.keys(formData.specifications).length > 0 ? (
                      <div className={styles.specificationsList}>
                        {Object.entries(formData.specifications).map(([key, value]) => (
                          <div key={key} className={styles.specificationItem}>
                            <Typography variant="body2">
                              <strong>{key}:</strong> {value}
                            </Typography>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRemoveSpecification(key)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography color="textSecondary" variant="body2">
                        No specifications added yet
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                {/* Customization Options Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Customization Options
                  </Typography>
                  
                  <Box mb={2}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Option Name (e.g. Size, Color)"
                          value={newCustomizationName}
                          onChange={(e) => setNewCustomizationName(e.target.value)}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Values (comma separated)"
                          value={newCustomizationOptions}
                          onChange={(e) => setNewCustomizationOptions(e.target.value)}
                          variant="outlined"
                          size="small"
                          helperText="e.g. Small, Medium, Large"
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={handleAddCustomizationOption}
                          startIcon={<AddIcon />}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box mt={2}>
                    {formData.customizationOptions.length > 0 ? (
                      <div className={styles.customizationList}>
                        {formData.customizationOptions.map((option, index) => (
                          <div key={index} className={styles.customizationItem}>
                            <Typography variant="body2">
                              <strong>{option.name}:</strong> {option.options.join(', ')}
                            </Typography>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRemoveCustomizationOption(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography color="textSecondary" variant="body2">
                        No customization options added yet
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={4}>
                {/* Features Section */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Product Features
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {product.features && product.features.length > 0 ? (
                      <List dense className={styles.featureDisplayList}>
                        {product.features.map((feature, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="textSecondary">
                        No features available for this product
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                {/* Specifications Section */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Product Specifications
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {Object.entries(product.specifications).map(([key, value]) => (
                              <TableRow key={key}>
                                <TableCell component="th" scope="row" width="40%">
                                  <Typography variant="body2" fontWeight="medium">
                                    {key}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {value}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="textSecondary">
                        No specifications available for this product
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                {/* Customization Options Section */}
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Customization Options
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {product.customizationOptions && product.customizationOptions.length > 0 ? (
                      <Grid container spacing={2}>
                        {product.customizationOptions.map((option, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {option.name}
                              </Typography>
                              <Box display="flex" flexWrap="wrap" gap={1}>
                                {option.options.map((value, i) => (
                                  <Chip key={i} label={value} size="small" />
                                ))}
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography color="textSecondary">
                        No customization options available for this product
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
        
        {/* Inventory Tab */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Inventory
            </Typography>
            
            {editMode ? (
              <TextField
                label="Stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
                required
              />
            ) : (
              <Box mt={2}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        Current Stock
                      </Typography>
                      <Typography variant="h6">
                        {product.stock || 0} units
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        Status
                      </Typography>
                      <Chip
                        label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </div>
  );
};

export default ProductDetail; 