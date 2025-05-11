import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import categoryService from '../../services/categoryService';
import styles from '../../styles/CategoriesList.module.css';

const CategoriesList = () => {
  const navigate = useNavigate();
  
  // States
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories. Please try again.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Open delete confirmation dialog
  const openDeleteDialog = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };
  
  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };
  
  // Handle delete category
  const handleDeleteCategory = async () => {
    try {
      await categoryService.deleteCategory(selectedCategory._id);
      setCategories(categories.filter(c => c._id !== selectedCategory._id));
      closeDeleteDialog();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    }
  };
  
  // Get parent category name
  const getParentCategoryName = (parentId) => {
    const parent = categories.find(cat => cat._id === parentId);
    return parent ? parent.name : 'None';
  };
  
  // Render loading state
  if (loading && categories.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <div className={styles.categoriesContainer}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Categories
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/categories/new')}
        >
          Add New Category
        </Button>
      </Box>
      
      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search categories by name or description"
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Categories grid */}
      {filteredCategories.length > 0 ? (
        <Grid container spacing={3}>
          {filteredCategories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category._id}>
              <Card className={styles.categoryCard}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CategoryIcon sx={{ mr: 1, color: '#FF9500' }} />
                        <Typography variant="h6" component="h2">
                          {category.name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Parent: {category.parentCategory 
                          ? getParentCategoryName(category.parentCategory) 
                          : 'None'}
                      </Typography>
                      
                      {category.description && (
                        <Typography variant="body2" className={styles.categoryDescription}>
                          {category.description}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box className={styles.actionButtons}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/categories/${category._id}`)}
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openDeleteDialog(category)}
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper className={styles.emptyState}>
          <Typography>
            {searchQuery ? 'No categories match your search.' : 'No categories found.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/categories/new')}
            sx={{ mt: 2 }}
          >
            Create First Category
          </Button>
        </Paper>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "{selectedCategory?.name}"? This action cannot be undone and may affect products assigned to this category.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteCategory} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CategoriesList; 