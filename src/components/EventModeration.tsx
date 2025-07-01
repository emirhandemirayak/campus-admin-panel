import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Avatar,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CardMedia,
  Tabs,
  Tab,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Flag as FlagIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { EventService, type Event } from '../services/eventService';

type EventStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const EventModeration: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDetailDialog, setEventDetailDialog] = useState(false);
  const [moderationDialog, setModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'flag'>('approve');
  const [moderationNotes, setModerationNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  const statusTabs: { label: string; value: EventStatus; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }[] = [
    { label: 'All Events', value: 'all', color: 'default' },
    { label: 'Pending', value: 'pending', color: 'warning' },
    { label: 'Approved', value: 'approved', color: 'success' },
    { label: 'Rejected', value: 'rejected', color: 'error' },
    { label: 'Flagged', value: 'flagged', color: 'error' }
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, tabValue, searchTerm, showOnlyPending]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await EventService.getAllEvents();
      setEvents(allEvents);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;
    
    const currentStatus = statusTabs[tabValue].value;
    if (currentStatus !== 'all') {
      filtered = filtered.filter(event => event.status === currentStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (showOnlyPending) {
      filtered = filtered.filter(event => event.status === 'pending');
    }
    
    setFilteredEvents(filtered);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleModerationAction = async () => {
    if (!selectedEvent) return;
    
    try {
      setProcessing(selectedEvent.eventId);
      await EventService.updateEventStatus(selectedEvent.eventId, moderationAction, moderationNotes);
      setSuccess(`Event ${moderationAction}d successfully`);
      setModerationDialog(false);
      setModerationNotes('');
      await loadEvents();
    } catch (err) {
      setError(`Failed to ${moderationAction} event`);
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      setProcessing(eventId);
      await EventService.deleteEvent(eventId);
      setSuccess('Event deleted successfully');
      await loadEvents();
    } catch (err) {
      setError('Failed to delete event');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'flagged': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved': return <ThumbUpIcon />;
      case 'rejected': return <ThumbDownIcon />;
      case 'flagged': return <WarningIcon />;
      case 'pending': return <ScheduleIcon />;
      default: return <EventIcon />;
    }
  };

  const formatDate = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${timeString}`;
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card sx={{ 
      mb: 2, 
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px -5px rgb(0 0 0 / 0.1)',
      }
    }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <CardMedia
            component="img"
            sx={{ width: 120, height: 90, borderRadius: 2, objectFit: 'cover' }}
            image={event.imageUrl}
            alt={event.title}
          />
          <Box flex={1}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {event.title}
              </Typography>
              <Chip
                icon={getStatusIcon(event.status)}
                label={event.status || 'pending'}
                color={getStatusColor(event.status)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {event.description}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(event.date, event.time)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {event.formattedAddress}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar src={event.organizerImage} sx={{ width: 24, height: 24 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {event.organizerName}
                </Typography>
              </Box>
              <Chip
                icon={<CategoryIcon />}
                label={event.category}
                size="small"
                variant="outlined"
              />
            </Box>
            
            <Box display="flex" gap={1}>
              <Button
                size="small"
                startIcon={<ViewIcon />}
                onClick={() => {
                  setSelectedEvent(event);
                  setEventDetailDialog(true);
                }}
              >
                View Details
              </Button>
              
              {event.status === 'pending' && (
                <>
                  <Button
                    size="small"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => {
                      setSelectedEvent(event);
                      setModerationAction('approve');
                      setModerationDialog(true);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => {
                      setSelectedEvent(event);
                      setModerationAction('reject');
                      setModerationDialog(true);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="small"
                    color="warning"
                    startIcon={<FlagIcon />}
                    onClick={() => {
                      setSelectedEvent(event);
                      setModerationAction('flag');
                      setModerationDialog(true);
                    }}
                  >
                    Flag
                  </Button>
                </>
              )}
              
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteEvent(event.eventId)}
                disabled={processing === event.eventId}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

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
          Event Moderation
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Review and moderate events in your campus platform.
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

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="center">
          <Box flex={1}>
            <TextField
              fullWidth
              placeholder="Search events by title, description, organizer, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyPending}
                  onChange={(e) => setShowOnlyPending(e.target.checked)}
                />
              }
              label="Show only pending events"
            />
            <Chip
              icon={<FilterIcon />}
              label={`${filteredEvents.length} events`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {statusTabs.map((tab) => (
            <Tab
              key={tab.value}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {tab.label}
                  <Chip
                    label={events.filter(e => tab.value === 'all' ? true : e.status === tab.value).length}
                    size="small"
                    color={tab.color}
                    sx={{ minWidth: 20, height: 20, fontSize: '0.75rem' }}
                  />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={tabValue}>
        {filteredEvents.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No events found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search terms' : 'There are no events matching the current filters'}
            </Typography>
          </Paper>
        ) : (
          <Box>
            {filteredEvents.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </Box>
        )}
      </TabPanel>

      <Dialog
        open={eventDetailDialog}
        onClose={() => setEventDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <EventIcon color="primary" />
                <Typography variant="h6">{selectedEvent.title}</Typography>
                <Chip
                  icon={getStatusIcon(selectedEvent.status)}
                  label={selectedEvent.status || 'pending'}
                  color={getStatusColor(selectedEvent.status)}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                <Box flex={1}>
                  <CardMedia
                    component="img"
                    sx={{ width: '100%', height: 200, borderRadius: 2, objectFit: 'cover' }}
                    image={selectedEvent.imageUrl}
                    alt={selectedEvent.title}
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" gutterBottom>Event Details</Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Description</Typography>
                      <Typography variant="body1">{selectedEvent.description}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                      <Typography variant="body1">{formatDate(selectedEvent.date, selectedEvent.time)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Location</Typography>
                      <Typography variant="body1">{selectedEvent.formattedAddress}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                      <Chip label={selectedEvent.category} size="small" />
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Organizer Information</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={selectedEvent.organizerImage} sx={{ width: 48, height: 48 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedEvent.organizerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Organizer ID: {selectedEvent.organizerId}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {selectedEvent.moderationNotes && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Moderation Notes</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="body2">{selectedEvent.moderationNotes}</Typography>
                  </Paper>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEventDetailDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={moderationDialog}
        onClose={() => setModerationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {moderationAction === 'approve' && 'Approve Event'}
          {moderationAction === 'reject' && 'Reject Event'}
          {moderationAction === 'flag' && 'Flag Event'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to {moderationAction} "{selectedEvent?.title}"?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Add moderation notes (optional)..."
            value={moderationNotes}
            onChange={(e) => setModerationNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModerationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={moderationAction === 'approve' ? 'success' : moderationAction === 'reject' ? 'error' : 'warning'}
            onClick={handleModerationAction}
            disabled={processing === selectedEvent?.eventId}
            startIcon={
              moderationAction === 'approve' ? <ApproveIcon /> :
              moderationAction === 'reject' ? <RejectIcon /> : <FlagIcon />
            }
          >
            {processing === selectedEvent?.eventId ? 'Processing...' : moderationAction}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 