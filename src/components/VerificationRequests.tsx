import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  Divider
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Image as ImageIcon,
  QrCode as BarcodeIcon
} from '@mui/icons-material';
import { VerificationService, type ManualVerificationRequest, type UserInfo } from '../services/verificationService';
import { auth } from '../firebase/config';

export const VerificationRequests: React.FC = () => {
  const [requests, setRequests] = useState<ManualVerificationRequest[]>([]);
  const [userInfoMap, setUserInfoMap] = useState<Record<string, UserInfo>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ManualVerificationRequest | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    loadVerificationRequests();
  }, []);

  const loadVerificationRequests = async () => {
    try {
      setLoading(true);
      const verificationRequests = await VerificationService.getManualVerificationRequests();
      setRequests(verificationRequests);

      // Load user info for each request
      const userInfoPromises = verificationRequests.map(request => 
        VerificationService.getUserInfo(request.userId)
      );
      const userInfoResults = await Promise.all(userInfoPromises);
      
      const userInfoMap: Record<string, UserInfo> = {};
      userInfoResults.forEach((userInfo, index) => {
        if (userInfo) {
          userInfoMap[verificationRequests[index].userId] = userInfo;
        }
      });
      setUserInfoMap(userInfoMap);
    } catch (err) {
      setError('Failed to load verification requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(requestId);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      await VerificationService.approveVerification(requestId, currentUser.uid);
      setSuccess('Verification approved successfully');
      await loadVerificationRequests(); // Reload the list
    } catch (err) {
      setError('Failed to approve verification');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(requestId);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      await VerificationService.rejectVerification(requestId, currentUser.uid);
      setSuccess('Verification rejected successfully');
      await loadVerificationRequests(); // Reload the list
    } catch (err) {
      setError('Failed to reject verification');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleViewImage = (request: ManualVerificationRequest) => {
    setSelectedRequest(request);
    setImageDialogOpen(true);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
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
          Student Verification Requests
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Review and approve student verification requests with uploaded documents.
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

      {requests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No pending verification requests
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            All verification requests have been processed
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 3 
        }}>
          {requests.map((request) => {
            const userInfo = userInfoMap[request.userId];
            const isProcessing = processing === request.id;
            
            return (
              <Box key={request.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {userInfo?.displayName || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {userInfo?.email || 'No email'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box mb={2}>
                      <Chip
                        icon={<BarcodeIcon />}
                        label={`Barcode: ${request.barcode}`}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={formatTimestamp(request.timestamp)}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Box mb={2}>
                      <Button
                        variant="outlined"
                        startIcon={<ImageIcon />}
                        onClick={() => handleViewImage(request)}
                        fullWidth
                        size="small"
                      >
                        View Document
                      </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box display="flex" gap={1}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => handleApprove(request.id)}
                        disabled={isProcessing}
                        fullWidth
                        size="small"
                      >
                        {isProcessing ? 'Processing...' : 'Approve'}
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => handleReject(request.id)}
                        disabled={isProcessing}
                        fullWidth
                        size="small"
                      >
                        {isProcessing ? 'Processing...' : 'Reject'}
                      </Button>
                                         </Box>
                   </CardContent>
                 </Card>
               </Box>
             );
           })}
         </Box>
      )}

      {/* Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Verification Document
          {selectedRequest && (
            <Typography variant="body2" color="textSecondary">
              Submitted by: {userInfoMap[selectedRequest.userId]?.displayName || 'Unknown User'}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <img
                src={selectedRequest.fileUrl}
                alt="Verification document"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 