import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Alert,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon
} from '@mui/icons-material';
import userService from '../../services/userService';
import styles from '../../styles/UsersList.module.css';
import { useAuth } from '../../context/authContext';

const UsersList = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Role options
  const roleLabels = {
    user: 'User',
    admin: 'Admin'
  };
  
  // Fetch users on component mount and when page or rowsPerPage changes
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);
  
  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers(page + 1, rowsPerPage);
      setUsers(response.data.users || []);
      setTotalUsers(response.data.totalCount || 0);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone && user.phone.includes(searchQuery))
  );
  
  // Open delete confirmation dialog
  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };
  
  // Open role change dialog
  const openRoleDialog = (user) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };
  
  // Close role change dialog
  const closeRoleDialog = () => {
    setRoleDialogOpen(false);
    setSelectedUser(null);
  };
  
  // Open status change dialog
  const openStatusDialog = (user) => {
    setSelectedUser(user);
    setStatusDialogOpen(true);
  };
  
  // Close status change dialog
  const closeStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedUser(null);
  };
  
  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser._id);
      setUsers(users.filter(u => u._id !== selectedUser._id));
      closeDeleteDialog();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };
  
  // Handle toggle user role
  const handleToggleRole = async () => {
    try {
      const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';
      await userService.updateUserRole(selectedUser._id, newRole);
      setUsers(users.map(u => 
        u._id === selectedUser._id ? { ...u, role: newRole } : u
      ));
      closeRoleDialog();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    }
  };
  
  // Handle toggle user active status
  const handleToggleStatus = async () => {
    try {
      const newStatus = !selectedUser.isActive;
      await userService.toggleUserActiveStatus(selectedUser._id, newStatus);
      setUsers(users.map(u => 
        u._id === selectedUser._id ? { ...u, isActive: newStatus } : u
      ));
      closeStatusDialog();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status. Please try again.');
    }
  };
  
  // Render loading state
  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <div className={styles.usersContainer}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Users
        </Typography>
      </Box>
      
      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name, email, or phone"
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
      
      {/* Users table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={user.avatar}
                          alt={user.name}
                          sx={{ mr: 2, width: 40, height: 40 }}
                        >
                          {user.name[0]}
                        </Avatar>
                        <Typography variant="body1">{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={roleLabels[user.role] || 'User'}
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                        icon={user.role === 'admin' ? <AdminIcon fontSize="small" /> : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box className={styles.actionButtons}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/users/${user._id}`)}
                          title="View Details"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        
                        {/* Don't allow self-deletion or role change */}
                        {currentUser?._id !== user._id && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => openRoleDialog(user)}
                              title="Change Role"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => openStatusDialog(user)}
                              title={user.isActive ? "Deactivate User" : "Activate User"}
                              color={user.isActive ? "default" : "success"}
                            >
                              {user.isActive ? 
                                <PersonOffIcon fontSize="small" /> : 
                                <PersonIcon fontSize="small" />
                              }
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => openDeleteDialog(user)}
                              title="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {searchQuery ? 'No users match your search.' : 'No users found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onClose={closeRoleDialog}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Change role for user "{selectedUser?.name}" from {selectedUser?.role === 'admin' ? 'Admin to User' : 'User to Admin'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRoleDialog}>Cancel</Button>
          <Button onClick={handleToggleRole} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onClose={closeStatusDialog}>
        <DialogTitle>Change User Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.isActive
              ? `Are you sure you want to deactivate "${selectedUser?.name}"'s account?`
              : `Are you sure you want to reactivate "${selectedUser?.name}"'s account?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog}>Cancel</Button>
          <Button onClick={handleToggleStatus} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UsersList; 