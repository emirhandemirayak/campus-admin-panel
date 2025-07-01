import { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Divider,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  VerifiedUser as VerifiedIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { VerificationRequests } from './components/VerificationRequests';
import { UserManagement } from './components/UserManagement';
import { EventModeration } from './components/EventModeration';
import { AuthService } from './services/authService';
import { DashboardService } from './services/dashboardService';
import type { AdminUser, DashboardStats } from './types';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // Modern indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899', // Modern pink
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid rgb(226 232 240)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    totalContent: 0,
    flaggedContent: 0,
    activeUsers: 0,
    pendingEvents: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Load dashboard stats
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const loadStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const dashboardStats = await DashboardService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        setStatsError('Failed to load dashboard statistics');
      } finally {
        setStatsLoading(false);
      }
    };

    if (admin) {
      loadStats();
      
      // Set up real-time updates
      DashboardService.subscribeToStatsUpdates((newStats) => {
        setStats(newStats);
      }).then((cleanupFn) => {
        cleanup = cleanupFn;
      });
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [admin]);

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setAdmin(user);
    });

    return unsubscribe;
  }, []);

  const handleLogin = (adminUser: AdminUser) => {
    setAdmin(adminUser);
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setAdmin(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' },
    { text: 'User Management', icon: <PeopleIcon />, page: 'users' },
    { text: 'Event Moderation', icon: <EventIcon />, page: 'events' },
    { text: 'Content Moderation', icon: <ArticleIcon />, page: 'content' },
    { text: 'Verifications', icon: <VerifiedIcon />, page: 'verifications' },
    { text: 'Settings', icon: <SettingsIcon />, page: 'settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', backgroundColor: 'background.paper' }}>
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgb(226 232 240)',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
      }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
          Campus Admin
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Management Portal
        </Typography>
      </Box>
      
      <Box sx={{ p: 2 }}>
        <List sx={{ pt: 0 }}>
          {menuItems.map((item) => (
            <ListItem 
              key={item.text}
              onClick={() => {
                setCurrentPage(item.page);
                setMobileOpen(false);
              }}
              sx={{ 
                cursor: 'pointer',
                borderRadius: 2,
                mb: 1,
                backgroundColor: currentPage === item.page ? 'primary.main' : 'transparent',
                color: currentPage === item.page ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: currentPage === item.page ? 'primary.dark' : 'action.hover',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon sx={{ 
                color: currentPage === item.page ? 'white' : 'text.secondary',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontWeight: currentPage === item.page ? 600 : 500
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <List>
          <ListItem 
            onClick={handleLogout} 
            sx={{ 
              cursor: 'pointer',
              borderRadius: 2,
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  const handleNavigateToVerifications = () => {
    setCurrentPage('verifications');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard 
          stats={stats} 
          onNavigateToVerifications={handleNavigateToVerifications}
          loading={statsLoading}
          error={statsError}
        />;
      case 'users':
        return <UserManagement />;
      case 'events':
        return <EventModeration />;
      case 'content':
        return <div>Content Moderation - Coming Soon</div>;
      case 'verifications':
        return <VerificationRequests />;
      case 'settings':
        return <div>Settings - Coming Soon</div>;
      default:
        return <Dashboard 
          stats={stats} 
          onNavigateToVerifications={handleNavigateToVerifications}
          loading={statsLoading}
          error={statsError}
        />;
    }
  };

  if (!admin) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            backgroundColor: 'background.paper',
            borderBottom: '1px solid rgb(226 232 240)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { sm: 'none' },
                color: 'text.primary'
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {admin.displayName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {admin.role} • Admin Portal
              </Typography>
            </Box>
            <Chip 
              label="Online" 
              color="success" 
              size="small" 
              sx={{ 
                backgroundColor: 'success.light',
                color: 'white',
                fontWeight: 600
              }}
            />
          </Toolbar>
        </AppBar>
        
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 8,
            backgroundColor: 'background.default',
            minHeight: '100vh'
          }}
        >
          <Box sx={{ 
            maxWidth: '1400px', 
            mx: 'auto',
            animation: 'fadeIn 0.3s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
            {renderPage()}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
