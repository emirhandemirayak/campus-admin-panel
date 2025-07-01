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
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  VerifiedUser as VerifiedIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AuthService } from './services/authService';
import type { AdminUser, DashboardStats } from './types';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats] = useState<DashboardStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    totalContent: 0,
    flaggedContent: 0,
    activeUsers: 0
  });

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
    { text: 'Content Moderation', icon: <ArticleIcon />, page: 'content' },
    { text: 'Verifications', icon: <VerifiedIcon />, page: 'verifications' },
    { text: 'Settings', icon: <SettingsIcon />, page: 'settings' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Campus Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text}
            onClick={() => {
              setCurrentPage(item.page);
              setMobileOpen(false);
            }}
            sx={{ 
              cursor: 'pointer',
              backgroundColor: currentPage === item.page ? 'action.selected' : 'transparent'
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem onClick={handleLogout} sx={{ cursor: 'pointer' }}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'users':
        return <div>User Management - Coming Soon</div>;
      case 'content':
        return <div>Content Moderation - Coming Soon</div>;
      case 'verifications':
        return <div>Verifications - Coming Soon</div>;
      case 'settings':
        return <div>Settings - Coming Soon</div>;
      default:
        return <Dashboard stats={stats} />;
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
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {admin.displayName} - {admin.role}
            </Typography>
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
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 8
          }}
        >
          {renderPage()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
