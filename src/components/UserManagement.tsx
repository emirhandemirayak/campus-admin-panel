import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,

  Clear as ClearIcon
} from '@mui/icons-material';
import { UserManagementService, type UserInfo, type UserFilters, type UserStats } from '../services/userManagementService';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserInfo[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<UserFilters>({
    verificationStatus: 'all',
    searchTerm: '',
    department: '',
    year: undefined
  });
  
  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [userDetailDialog, setUserDetailDialog] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [allUsers, userStats, deptList, yearList] = await Promise.all([
        UserManagementService.getAllUsers(),
        UserManagementService.getUserStats(),
        UserManagementService.getDepartments(),
        UserManagementService.getYears()
      ]);
      
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      setStats(userStats);
      setDepartments(deptList);
      setYears(yearList);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await UserManagementService.filterUsers(filters);
      setFilteredUsers(filtered);
    } catch (err) {
      setError('Failed to apply filters');
      console.error(err);
    }
  };

  const handleFilterChange = (field: keyof UserFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      verificationStatus: 'all',
      searchTerm: '',
      department: '',
      year: undefined
    });
    setFilteredUsers(users);
  };

  const handleApproveUser = async (uid: string) => {
    try {
      setProcessing(uid);
      await UserManagementService.updateUserVerification(uid, true, 'approved');
      setSuccess('User approved successfully');
      await loadUsers(); // Reload to get updated data
    } catch (err) {
      setError('Failed to approve user');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectUser = async (uid: string) => {
    try {
      setProcessing(uid);
      await UserManagementService.updateUserVerification(uid, false, 'rejected');
      setSuccess('User rejected successfully');
      await loadUsers(); // Reload to get updated data
    } catch (err) {
      setError('Failed to reject user');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleViewUser = (user: UserInfo) => {
    setSelectedUser(user);
    setUserDetailDialog(true);
  };

  const getVerificationStatusColor = (status?: string, isVerified?: boolean) => {
    if (isVerified) return 'success';
    if (status === 'rejected') return 'error';
    if (status === 'pending') return 'warning';
    return 'default';
  };

  const getVerificationStatusText = (status?: string, isVerified?: boolean) => {
    if (isVerified) return 'Verified';
    if (status === 'rejected') return 'Rejected';
    if (status === 'pending') return 'Pending';
    return 'Not Verified';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          User Management
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Manage and monitor all users in your campus platform.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

            {/* Stats Cards */}
      {stats && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 3, 
          mb: 4 
        }}>
          <Card sx={{ 
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                Total Users
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                Verified Users
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats.verifiedUsers}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                Pending Users
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {stats.pendingUsers}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                Active Users (1h)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {stats.activeUsers}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <TextField
              placeholder="Search users..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}
            >
              Apply
            </Button>
          </Box>

          {showFilters && (
            <Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: 2 
              }}>
                <FormControl fullWidth>
                  <InputLabel>Verification Status</InputLabel>
                  <Select
                    value={filters.verificationStatus}
                    onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                    label="Verification Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    label="Department"
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={filters.year || ''}
                    onChange={(e) => handleFilterChange('year', e.target.value || undefined)}
                    label="Year"
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {years.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Major</TableCell>
              <TableCell>Verification Status</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Platform</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.uid}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar src={user.profileImageUrl}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {user.name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {user.uid}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon fontSize="small" color="action" />
                    {user.email || 'N/A'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SchoolIcon fontSize="small" color="action" />
                    {user.major || 'N/A'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getVerificationStatusText(user.verificationStatus, user.isVerifiedStudent)}
                    color={getVerificationStatusColor(user.verificationStatus, user.isVerifiedStudent) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    {user.lastActivity && (
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(user.lastActivity)}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.platform || 'Unknown'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewUser(user)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {!user.isVerifiedStudent && (
                      <>
                        <Tooltip title="Approve User">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveUser(user.uid)}
                            disabled={processing === user.uid}
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectUser(user.uid)}
                            disabled={processing === user.uid}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Detail Dialog */}
      <Dialog
        open={userDetailDialog}
        onClose={() => setUserDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          User Details
          {selectedUser && (
            <Typography variant="body2" color="textSecondary">
              {selectedUser.name} ({selectedUser.email})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: 3 
            }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="h6">Profile Information</Typography>
                <Box>
                  <Typography variant="body2" color="textSecondary">Name</Typography>
                  <Typography variant="body1">{selectedUser.name || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{selectedUser.email || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Major</Typography>
                  <Typography variant="body1">{selectedUser.major || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Gender</Typography>
                  <Typography variant="body1">{selectedUser.gender || 'N/A'}</Typography>
                </Box>
                                  <Box>
                    <Typography variant="body2" color="textSecondary">Date of Birth</Typography>
                    <Typography variant="body1">{formatDate(selectedUser.dateOfBirth)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Last Activity</Typography>
                    <Typography variant="body1">
                      {selectedUser.lastActivity ? formatDate(selectedUser.lastActivity) : 'Never'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Platform</Typography>
                    <Typography variant="body1">{selectedUser.platform || 'Unknown'}</Typography>
                  </Box>
              </Box>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="h6">Account Status</Typography>
                <Box>
                  <Typography variant="body2" color="textSecondary">Verification Status</Typography>
                  <Chip
                    label={getVerificationStatusText(selectedUser.verificationStatus, selectedUser.isVerifiedStudent)}
                    color={getVerificationStatusColor(selectedUser.verificationStatus, selectedUser.isVerifiedStudent) as any}
                  />
                </Box>
                                  <Box>
                    <Typography variant="body2" color="textSecondary">About</Typography>
                    <Typography variant="body1">{selectedUser.about || 'No bio provided'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Activity Status</Typography>
                    <Chip
                      label={selectedUser.isActive ? 'Active' : 'Inactive'}
                      color={selectedUser.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                {selectedUser.profileImageUrl && (
                  <Box>
                    <Typography variant="body2" color="textSecondary">Profile Image</Typography>
                    <img
                      src={selectedUser.profileImageUrl}
                      alt="Profile"
                      style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover' }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 