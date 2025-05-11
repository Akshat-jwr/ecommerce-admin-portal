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
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import categoryService from '../../services/categoryService';
import styles from '../../styles/CategoryForm.module.css';

const CreateCategory = () => {
  const navigate = useNavigate();
  
  // States
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to fetch categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Form validation
    if (!formData.name) {
      setError('Please provide a category name');
      setSubmitting(false);
      return;
    }
    
    try {
      // Create a copy of the form data
      const categoryData = { ...formData };
      
      // Convert empty parentCategory to null
      if (categoryData.parentCategory === '') {
        categoryData.parentCategory = null;
      }
      
      const response = await categoryService.createCategory(categoryData);
      
      // Navigate to category detail page
      navigate(`/categories/${response.data._id}`);
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err.response?.data?.message || 'Failed to create category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className={styles.categoryFormContainer}>
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
            Create New Category
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create Category'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Category Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <TextField
              fullWidth
              label="Category Name"
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
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Parent Category</InputLabel>
              <Select
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleChange}
                label="Parent Category"
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
            
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/categories')}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
              >
                Create Category
              </Button>
            </Box>
          </form>
        </Paper>
      )}
    </div>
  );
};

export default CreateCategory; 