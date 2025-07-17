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
  InfoOutlined as InfoOutlinedIcon,
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
      setError('Kullanıcılar yüklenemedi');
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
      setError('Filtreler uygulanamadı');
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
      setSuccess('Kullanıcı başarıyla onaylandı');
      await loadUsers(); // Reload to get updated data
    } catch (err) {
      setError('Kullanıcı onaylanamadı');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectUser = async (uid: string) => {
    try {
      setProcessing(uid);
      await UserManagementService.updateUserVerification(uid, false, 'rejected');
      setSuccess('Kullanıcı başarıyla reddedildi');
      await loadUsers(); // Reload to get updated data
    } catch (err) {
      setError('Kullanıcı reddedilemedi');
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
    if (isVerified) return 'Doğrulandı';
    if (status === 'rejected') return 'Reddedildi';
    if (status === 'pending') return 'Beklemede';
    return 'Doğrulanmadı';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Yok';
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
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: { xs: 3, sm: 5 } }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: 24, sm: 36 } }}>
          Kullanıcı Yönetimi
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: 15, sm: 18 } }}>
          Kampüs platformunuzdaki tüm kullanıcıları yönetin ve izleyin.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: { xs: 15, sm: 17 } }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, fontSize: { xs: 15, sm: 17 } }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 3 },
          mb: { xs: 3, sm: 5 },
        }}>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Card sx={{ transition: 'all 0.3s', borderRadius: 3, boxShadow: 2, '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                  Toplam Kullanıcı
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {stats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Card sx={{ transition: 'all 0.3s', borderRadius: 3, boxShadow: 2, '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                  Doğrulanmış Kullanıcı
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {stats.verifiedUsers}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      <Divider sx={{ my: { xs: 3, sm: 5 } }} />

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <TextField
              placeholder="Kullanıcıları ara..."
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
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Filtreler
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            >
              Filtre
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Temizle
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            >
              Temizle
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Uygula
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}
              sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            >
              Uygula
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
                  <InputLabel>Doğrulama Durumu</InputLabel>
                  <Select
                    value={filters.verificationStatus}
                    onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                    label="Doğrulama Durumu"
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="pending">Beklemede</MenuItem>
                    <MenuItem value="approved">Onaylandı</MenuItem>
                    <MenuItem value="rejected">Reddedildi</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Bölüm</InputLabel>
                  <Select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    label="Bölüm"
                  >
                    <MenuItem value="">Tüm Bölümler</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Yıl</InputLabel>
                  <Select
                    value={filters.year || ''}
                    onChange={(e) => handleFilterChange('year', e.target.value || undefined)}
                    label="Yıl"
                  >
                    <MenuItem value="">Tüm Yıllar</MenuItem>
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
      <Box sx={{ width: '100%', overflowX: 'auto', mb: 4 }}>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, minWidth: 800 }}>
          <Table aria-label="Kullanıcı Tablosu">
            <TableHead>
              <TableRow sx={{ background: '#f5f6fa' }}>
                <TableCell sx={{ fontWeight: 700 }}>Ad Soyad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>E-posta</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Bölüm</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <Tooltip title="Kullanıcı doğrulama durumu">
                    <span>Doğrulama</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <Tooltip title="Kullanıcı aktiflik durumu (son 1 saat)">
                    <span>Aktiflik</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" color="text.secondary">
                    <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                      <InfoOutlinedIcon fontSize="large" sx={{ mb: 1 }} />
                      <Typography>Kullanıcı bulunamadı.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.uid} hover sx={{ transition: 'background 0.2s', py: 1.5 }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar src={user.profileImageUrl}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.name || 'Bilinmiyor'}
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
                        {user.email || 'Yok'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SchoolIcon fontSize="small" color="action" />
                        {user.department || 'Bilinmiyor'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getVerificationStatusText(user.verificationStatus, user.isVerifiedStudent)}
                        color={getVerificationStatusColor(user.verificationStatus, user.isVerifiedStudent) as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Aktif' : 'Pasif'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Detayları Görüntüle">
                          <IconButton
                            size="small"
                            onClick={() => handleViewUser(user)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {!user.isVerifiedStudent && (
                          <>
                            <Tooltip title="Kullanıcıyı Onayla">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApproveUser(user.uid)}
                                disabled={processing === user.uid}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Kullanıcıyı Reddet">
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* User Detail Dialog */}
      <Dialog
        open={userDetailDialog}
        onClose={() => setUserDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Kullanıcı Detayları
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
                <Typography variant="h6">Profil Bilgileri</Typography>
                <Box>
                  <Typography variant="body2" color="textSecondary">Ad</Typography>
                  <Typography variant="body1">{selectedUser.name || 'Bilinmiyor'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">E-posta</Typography>
                  <Typography variant="body1">{selectedUser.email || 'Yok'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Bölüm</Typography>
                  <Typography variant="body1">{selectedUser.major || 'Bilinmiyor'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Cinsiyet</Typography>
                  <Typography variant="body1">{selectedUser.gender || 'Bilinmiyor'}</Typography>
                </Box>
                                  <Box>
                    <Typography variant="body2" color="textSecondary">Doğum Tarihi</Typography>
                    <Typography variant="body1">{formatDate(selectedUser.dateOfBirth)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Son Aktivite</Typography>
                    <Typography variant="body1">
                      {selectedUser.lastActivity ? formatDate(selectedUser.lastActivity) : 'Hiç'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Platform</Typography>
                    <Typography variant="body1">{selectedUser.platform || 'Bilinmiyor'}</Typography>
                  </Box>
              </Box>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="h6">Hesap Durumu</Typography>
                <Box>
                  <Typography variant="body2" color="textSecondary">Doğrulama Durumu</Typography>
                  <Chip
                    label={getVerificationStatusText(selectedUser.verificationStatus, selectedUser.isVerifiedStudent)}
                    color={getVerificationStatusColor(selectedUser.verificationStatus, selectedUser.isVerifiedStudent) as any}
                  />
                </Box>
                                  <Box>
                    <Typography variant="body2" color="textSecondary">Hakkında</Typography>
                    <Typography variant="body1">{selectedUser.about || 'Hakkında bilgi yok'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Aktivite Durumu</Typography>
                    <Chip
                      label={selectedUser.isActive ? 'Aktif' : 'Pasif'}
                      color={selectedUser.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                {selectedUser.profileImageUrl && (
                  <Box>
                    <Typography variant="body2" color="textSecondary">Profil Resmi</Typography>
                    <img
                      src={selectedUser.profileImageUrl}
                      alt="Profil"
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
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 