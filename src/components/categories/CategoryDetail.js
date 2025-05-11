import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import categoryService from '../../services/categoryService';
import styles from '../../styles/CategoryDetail.module.css';

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [category, setCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: ''
  });
  
  // Fetch category and all categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoryResponse, categoriesResponse] = await Promise.all([
          categoryService.getCategoryById(id),
          categoryService.getAllCategories()
        ]);
        
        setCategory(categoryResponse.data);
        setAllCategories(categoriesResponse.data || []);
        
        // Initialize form data
        setFormData({
          name: categoryResponse.data.name || '',
          description: categoryResponse.data.description || '',
          parentCategory: categoryResponse.data.parentCategory?._id || ''
        });
        
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch category details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Handle form field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Reset form data when canceling edit
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parentCategory: category.parentCategory?._id || ''
      });
    }
    setEditMode(!editMode);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create a copy of the form data
      const categoryData = { ...formData };
      
      // Convert empty parentCategory to null
      if (categoryData.parentCategory === '') {
        categoryData.parentCategory = null;
      }
      
      console.log('Updating category with data:', categoryData);
      const response = await categoryService.updateCategory(id, categoryData);
      console.log('Update response:', response);
      setCategory(response.data);
      setEditMode(false);
      setError('');
    } catch (err) {
      console.error('Error updating category:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Render loading state
  if (loading && !category) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error && !category) {
    return (
      <Box mt={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/categories')}
          sx={{ mt: 2 }}
        >
          Back to Categories
        </Button>
      </Box>
    );
  }
  
  // Filter out the current category and its children from parent options
  const parentCategoryOptions = allCategories.filter(cat => cat._id !== id);
  
  return (
    <div className={styles.categoryDetailContainer}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/categories')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1">
            Category Details
          </Typography>
        </Box>
        
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
      
      {/* Category Detail Content */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {editMode ? (
            <Grid item xs={12} md={6}>
              <form>
                <TextField
                  fullWidth
                  label="Category Name"
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
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Parent Category</InputLabel>
                  <Select
                    name="parentCategory"
                    value={formData.parentCategory}
                    onChange={handleChange}
                    label="Parent Category"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {parentCategoryOptions.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </form>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {category.name}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {category.description || 'No description provided.'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Parent Category
                </Typography>
                <Typography variant="body1">
                  {category.parentCategory ? category.parentCategory.name : 'No parent category'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Box className={styles.metadataGrid}>
                  <Typography variant="body2">
                    <strong>Slug:</strong> {category.slug}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Created on:</strong> {formatDate(category.createdAt)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Last updated:</strong> {formatDate(category.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </div>
  );
};

export default CategoryDetail; 