import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import styles from '../../styles/ProductForm.module.css';

const CreateProduct = () => {
  const navigate = useNavigate();
  
  // States
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPercentage: '',
    stock: '',
    category: '',
    features: [],
    specifications: {},
    customizationOptions: []
  });
  
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  
  // Feature input state
  const [newFeature, setNewFeature] = useState('');
  
  // Specification input state
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  
  // Customization option state
  const [newCustomizationName, setNewCustomizationName] = useState('');
  const [newCustomizationOptions, setNewCustomizationOptions] = useState('');
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to fetch categories. Please try again.');
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle form field change
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    });
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Preview images
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setImages([...images, ...newImages]);
  };
  
  // Remove image
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newImages[index].preview);
    
    newImages.splice(index, 1);
    setImages(newImages);
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
    setSubmitting(true);
    setError('');
    
    // Form validation
    if (!formData.name || !formData.price) {
      setError('Please fill all required fields');
      setSubmitting(false);
      return;
    }
    
    try {
      // Create FormData object for multipart/form-data
      const productFormData = new FormData();
      
      // Add basic fields with correct types
      productFormData.append('name', formData.name);
      productFormData.append('description', formData.description || '');
      productFormData.append('price', parseFloat(formData.price) || 0);
      
      if (formData.discountPercentage) {
        productFormData.append('discountPercentage', parseFloat(formData.discountPercentage) || 0);
      }
      
      productFormData.append('stock', parseInt(formData.stock) || 0);
      
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
      
      // Add images
      images.forEach(image => {
        productFormData.append('images', image.file);
      });
      
      console.log('Submitting product data:', {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        features: formData.features.length,
        specifications: Object.keys(formData.specifications).length,
        customizationOptions: formData.customizationOptions.length,
        images: images.length
      });
      
      const response = await productService.createProduct(productFormData);
      
      // Navigate to product detail page
      navigate(`/products/${response.data._id}`);
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.response?.data?.message || 'Failed to create product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className={styles.productFormContainer}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/products')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1">
            Create New Product
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create Product'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                error={!!error && !formData.name}
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
                    error={!!error && !formData.price}
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
                    helperText="Leave empty if no discount"
                  />
                </Grid>
              </Grid>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Category"
                      displayEmpty
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
                </Grid>
              </Grid>
              
              {/* Features Section */}
              <Accordion sx={{ mt: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Product Features</Typography>
                </AccordionSummary>
                <AccordionDetails>
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
                </AccordionDetails>
              </Accordion>
              
              {/* Specifications Section */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Product Specifications</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Specification Name"
                        value={specKey}
                        onChange={(e) => setSpecKey(e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Specification Value"
                        value={specValue}
                        onChange={(e) => setSpecValue(e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
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
                </AccordionDetails>
              </Accordion>
              
              {/* Customization Options Section */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Customization Options</Typography>
                </AccordionSummary>
                <AccordionDetails>
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
                </AccordionDetails>
              </Accordion>
            </Grid>
            
            {/* Images */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Product Images
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box className={styles.imagesContainer}>
                {images.map((image, index) => (
                  <Box key={index} className={styles.imagePreviewWrapper}>
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className={styles.imagePreview}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(index)}
                      className={styles.removeImageButton}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {index === 0 && (
                      <Box className={styles.featuredBadge}>
                        Featured
                      </Box>
                    )}
                  </Box>
                ))}
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  className={styles.uploadButton}
                  disabled={images.length >= 5}
                >
                  Upload Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    hidden
                    disabled={images.length >= 5}
                  />
                </Button>
              </Box>
              
              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                First image will be set as featured. You can upload up to 5 images.
              </Typography>
              
              <Tooltip title="For best results, use images with a 1:1 aspect ratio and at least 600x600 pixels" arrow>
                <Box display="flex" alignItems="center" mt={1}>
                  <InfoIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="caption" color="textSecondary">
                    Image requirements
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default CreateProduct;