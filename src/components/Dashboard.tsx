import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Button,
  Alert,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  VerifiedUser as VerifiedIcon,
  Pending as PendingIcon,
  Article as ArticleIcon,
  Flag as FlagIcon,
  TrendingUp as TrendingIcon,
  Assignment as VerificationIcon,
  Event as EventIcon
} from '@mui/icons-material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  onNavigateToVerifications?: () => void;
  loading?: boolean;
  error?: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, onNavigateToVerifications, loading = false, error = null }) => {
  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'primary',
    subtitle,
    loading = false
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
    subtitle?: string;
    loading?: boolean;
  }) => (
    <Card sx={{ 
      height: '100%',
      transition: 'all 0.3s ease-in-out',
      borderRadius: 3,
      boxShadow: 2,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: `${color}.main` }}>
              {loading ? '...' : value.toLocaleString()}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            p: 2, 
            borderRadius: 3, 
            backgroundColor: `${color}.light`,
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon sx={{ fontSize: 32 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const VerificationProgress = () => {
    const progress = stats.totalUsers > 0 ? (stats.verifiedUsers / stats.totalUsers) * 100 : 0;
    
    return (
      <Paper sx={{ 
        p: 4, 
        height: '100%',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        border: '1px solid rgb(226 232 240)',
        borderRadius: 3
      }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          Doğrulama İlerlemesi
        </Typography>
        <Box display="flex" alignItems="center" mb={3}>
          <Typography variant="h2" component="div" sx={{ mr: 2, fontWeight: 700, color: 'primary.main' }}>
            {loading ? '...' : Math.round(progress)}%
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
            doğrulandı
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={loading ? 0 : progress} 
          sx={{ 
            height: 12, 
            borderRadius: 6,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: 6
            }
          }}
        />
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Box textAlign="center">
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
              {loading ? '...' : stats.verifiedUsers}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Doğrulandı
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
              {loading ? '...' : stats.totalUsers - stats.verifiedUsers}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Bekliyor
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: { xs: 3, sm: 5 } }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: 24, sm: 36 } }}>
          Yönetim Paneli
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: 15, sm: 18 } }}>
          Hoş geldiniz! Bugün kampüs platformunuzda neler oluyor?
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, fontSize: { xs: 15, sm: 17 } }}>
          {error}
        </Alert>
      )}

      {/* Stat Cards Section */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 3 },
          mb: { xs: 3, sm: 5 },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <StatCard
            title="Toplam Kullanıcı"
            value={stats.totalUsers}
            icon={PeopleIcon}
            color="primary"
            subtitle="Kayıtlı kullanıcılar"
            loading={loading}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <StatCard
            title="Doğrulanmış Kullanıcı"
            value={stats.verifiedUsers}
            icon={VerifiedIcon}
            color="success"
            subtitle="Onaylı hesaplar"
            loading={loading}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <StatCard
            title="Bekleyen Doğrulama"
            value={stats.pendingVerifications}
            icon={PendingIcon}
            color="warning"
            subtitle="İnceleniyor"
            loading={loading}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <StatCard
            title="Aktif Kullanıcı"
            value={stats.activeUsers}
            icon={TrendingIcon}
            color="secondary"
            subtitle="Bu ay"
            loading={loading}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <StatCard
            title="Toplam İçerik"
            value={stats.totalContent}
            icon={ArticleIcon}
            color="primary"
            subtitle="Gönderi & yorum"
            loading={loading}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <StatCard
            title="İşaretli İçerik"
            value={stats.flaggedContent}
            icon={FlagIcon}
            color="error"
            subtitle="İncelenmesi gereken"
            loading={loading}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <StatCard
            title="Bekleyen Etkinlik"
            value={stats.pendingEvents}
            icon={EventIcon}
            color="warning"
            subtitle="Onay bekliyor"
            loading={loading}
          />
        </Box>
      </Box>

      <Divider sx={{ my: { xs: 3, sm: 5 } }} />

      {/* Progress & Actions Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 3, md: 4 },
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <VerificationProgress />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper
            sx={{
              p: { xs: 2, sm: 4 },
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgb(226 232 240)',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 180,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: 16, sm: 20 } }}>
              Hızlı İşlemler
            </Typography>
            <Button
              variant="contained"
              color="warning"
              startIcon={<VerificationIcon />}
              onClick={onNavigateToVerifications}
              fullWidth
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                borderRadius: 2,
                fontWeight: 700,
                fontSize: { xs: 15, sm: 17 },
                minHeight: 48,
                mt: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                },
              }}
              aria-label="Doğrulama Taleplerine Git"
            >
              Doğrulama Taleplerini Görüntüle
            </Button>
          </Paper>
        </Box>
      </Box>
      {/* Empty state example (if needed) */}
      {/*
      {stats.totalUsers === 0 && !loading && (
        <Box display="flex" flexDirection="column" alignItems="center" color="text.secondary" py={6}>
          <InfoOutlinedIcon fontSize="large" sx={{ mb: 1 }} />
          <Typography mt={4}>Henüz kullanıcı yok.</Typography>
        </Box>
      )}
      */}
    </Box>
  );
}; 