import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Container,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  VerifiedUser as VerifiedIcon,
  Pending as PendingIcon,
  Article as ArticleIcon,
  Flag as FlagIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import type { DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'primary',
    subtitle 
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
    subtitle?: string;
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value.toLocaleString()}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon sx={{ fontSize: 40, color: `${color}.main` }} />
        </Box>
      </CardContent>
    </Card>
  );

  const VerificationProgress = () => {
    const progress = stats.totalUsers > 0 ? (stats.verifiedUsers / stats.totalUsers) * 100 : 0;
    
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Verification Progress
        </Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h4" component="div" sx={{ mr: 1 }}>
            {Math.round(progress)}%
          </Typography>
          <Typography variant="body2" color="textSecondary">
            verified
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="body2" color="textSecondary">
            {stats.verifiedUsers} verified
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {stats.totalUsers - stats.verifiedUsers} pending
          </Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={PeopleIcon}
          color="primary"
          subtitle="Registered users"
        />
        
        <StatCard
          title="Verified Users"
          value={stats.verifiedUsers}
          icon={VerifiedIcon}
          color="success"
          subtitle="Approved accounts"
        />
        
        <StatCard
          title="Pending Verifications"
          value={stats.pendingVerifications}
          icon={PendingIcon}
          color="warning"
          subtitle="Awaiting review"
        />
        
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={TrendingIcon}
          color="secondary"
          subtitle="This month"
        />
        
        <StatCard
          title="Total Content"
          value={stats.totalContent}
          icon={ArticleIcon}
          color="primary"
          subtitle="Posts & comments"
        />
        
        <StatCard
          title="Flagged Content"
          value={stats.flaggedContent}
          icon={FlagIcon}
          color="error"
          subtitle="Needs review"
        />
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3, mt: 3 }}>
        <VerificationProgress />
        
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Chip 
              label={`Review ${stats.pendingVerifications} verification requests`}
              color="warning"
              variant="outlined"
              clickable
            />
            <Chip 
              label={`Moderate ${stats.flaggedContent} flagged content`}
              color="error"
              variant="outlined"
              clickable
            />
            <Chip 
              label="View all users"
              color="primary"
              variant="outlined"
              clickable
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}; 