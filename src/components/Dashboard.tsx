import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Button,
  Alert
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
        border: '1px solid rgb(226 232 240)'
      }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          Verification Progress
        </Typography>
        <Box display="flex" alignItems="center" mb={3}>
          <Typography variant="h2" component="div" sx={{ mr: 2, fontWeight: 700, color: 'primary.main' }}>
            {loading ? '...' : Math.round(progress)}%
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
            verified
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
              Verified
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
              {loading ? '...' : stats.totalUsers - stats.verifiedUsers}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Pending
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Welcome back! Here's what's happening with your campus platform today.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={PeopleIcon}
          color="primary"
          subtitle="Registered users"
          loading={loading}
        />
        
        <StatCard
          title="Verified Users"
          value={stats.verifiedUsers}
          icon={VerifiedIcon}
          color="success"
          subtitle="Approved accounts"
          loading={loading}
        />
        
        <StatCard
          title="Pending Verifications"
          value={stats.pendingVerifications}
          icon={PendingIcon}
          color="warning"
          subtitle="Awaiting review"
          loading={loading}
        />
        
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={TrendingIcon}
          color="secondary"
          subtitle="This month"
          loading={loading}
        />
        
        <StatCard
          title="Total Content"
          value={stats.totalContent}
          icon={ArticleIcon}
          color="primary"
          subtitle="Posts & comments"
          loading={loading}
        />
        
        <StatCard
          title="Flagged Content"
          value={stats.flaggedContent}
          icon={FlagIcon}
          color="error"
          subtitle="Needs review"
          loading={loading}
        />
        
        <StatCard
          title="Pending Events"
          value={stats.pendingEvents}
          icon={EventIcon}
          color="warning"
          subtitle="Awaiting approval"
          loading={loading}
        />
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3, mt: 3 }}>
        <VerificationProgress />
        
        <Paper sx={{ 
          p: 4, 
          height: '100%',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgb(226 232 240)'
        }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
            Quick Actions
          </Typography>
          <Box display="flex" flexDirection="column" gap={3}>
            <Button
              variant="contained"
              color="warning"
              startIcon={<VerificationIcon />}
              onClick={onNavigateToVerifications}
              fullWidth
              sx={{ 
                py: 1.5,
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                }
              }}
            >
              Review {stats.pendingVerifications} Verification Requests
            </Button>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              sx={{ py: 1.5 }}
            >
              Moderate {stats.flaggedContent} Flagged Content
            </Button>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ py: 1.5 }}
            >
              View All Users
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<EventIcon />}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Review {stats.pendingEvents} Pending Events
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}; 