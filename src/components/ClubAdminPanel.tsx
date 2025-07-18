import React, { useState, useEffect } from 'react';
import { ClubService } from '../services/clubService';
import { ClubPostService } from '../services/clubPostService';
import { EventService } from '../services/eventService';
import type { Event } from '../types';
import type { Club, ClubMember, ClubPost } from '../types';
import {
  Box,
  Button,
  TextField,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Tooltip,
  Chip,
  Autocomplete
} from '@mui/material';
import PlacesAutocomplete from 'react-places-autocomplete';
import { useJsApiLoader } from '@react-google-maps/api';
import EventIcon from '@mui/icons-material/Event';
import PlaceIcon from '@mui/icons-material/Place';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import Avatar from '@mui/material/Avatar';
import { getAllUniversities } from '../services/clubService';
import { db } from '../firebase/config';
import { ref, get } from 'firebase/database';
import ClubManagementPanel from './ClubManagementPanel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { uploadFilesToStorage } from '../services/clubPostService';
import ErrorBoundary from './ErrorBoundary';

const roleOptions = [
  { value: 'Üye', label: 'Üye' },
  { value: 'Yönetici', label: 'Yönetici' },
];

const ClubAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabLabels = ['Gönderiler', 'Üyeler', 'Etkinlikler'];

  // Gönderiler
  const [postContent, setPostContent] = useState('');
  const [postLink, setPostLink] = useState('');
  const [postMediaFiles, setPostMediaFiles] = useState<File[]>([]);
  const [postMediaPreviews, setPostMediaPreviews] = useState<string[]>([]);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Üyeler
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [addMemberName, setAddMemberName] = useState('');
  const [addMemberUserId, setAddMemberUserId] = useState('');
  const [addMemberRole, setAddMemberRole] = useState('Üye');
  const [addMemberStatus, setAddMemberStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [addMemberMessage, setAddMemberMessage] = useState('');

  // Etkinlikler
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventFormattedAddress, setEventFormattedAddress] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventMediaFiles, setEventMediaFiles] = useState<File[]>([]);
  const [eventMediaPreviews, setEventMediaPreviews] = useState<string[]>([]);
  const [eventLink, setEventLink] = useState('');
  const [eventQuota, setEventQuota] = useState<number | ''>('');
  const [eventUnlimitedQuota, setEventUnlimitedQuota] = useState(false);
  const [eventPrice, setEventPrice] = useState('');
  const [eventType, setEventType] = useState('');
  const [customEventType, setCustomEventType] = useState('');
  const [showCustomType, setShowCustomType] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Event type options
  const eventTypeOptions = [
    'Seminer', 'Sosyal', 'Yarışma', 'Atölye', 'Diğer', '+ Yeni Tür Ekle'
  ];

  // Kulüp bilgisi
  const [club, setClub] = useState<Club | null>(null);
  const [clubLoading, setClubLoading] = useState(false);
  const [clubError, setClubError] = useState<string | null>(null);

  // Clubs management
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [createClubDialogOpen, setCreateClubDialogOpen] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubBio, setNewClubBio] = useState('');
  const [newClubLogo, setNewClubLogo] = useState<File | null>(null);
  const [newClubLogoPreview, setNewClubLogoPreview] = useState<string | null>(null);
  const [newClubBadgeRoles, setNewClubBadgeRoles] = useState<string>('');
  const [createClubLoading, setCreateClubLoading] = useState(false);
  const [createClubError, setCreateClubError] = useState<string | null>(null);

  // Universities
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);

  // Handle media file selection
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPostMediaFiles(files);
      setPostMediaPreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  // Gönderi oluşturma
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || !selectedClubId) return;
    try {
      setPostsError(null);
      // Simulate upload: use file names as URLs (replace with real upload in prod)
      const mediaUrls = postMediaFiles.map(f => f.name);
      const post: ClubPost = {
        postId: Date.now().toString(),
        clubId: selectedClubId,
        authorId: 'admin', // TODO: gerçek kullanıcı
        textContent: postContent,
        mediaUrls: mediaUrls,
        link: postLink || undefined,
        timestamp: new Date().toISOString(),
      };
      await ClubPostService.createPost(post);
      setPostContent('');
      setPostLink('');
      setPostMediaFiles([]);
      setPostMediaPreviews([]);
      fetchPosts();
    } catch (err) {
      setPostsError('Gönderi oluşturulamadı.');
    }
  };

  // Üye ekleme
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMemberName.trim() || !addMemberUserId.trim() || !selectedClubId) return;
    setAddMemberStatus('loading');
    setAddMemberMessage('');
    try {
      const newMember: ClubMember = {
        userId: addMemberUserId,
        name: addMemberName,
        role: addMemberRole,
        status: 'active',
      };
      await ClubService.addMember(selectedClubId, newMember);
      setAddMemberStatus('success');
      setAddMemberMessage('Üye başarıyla eklendi.');
      setAddMemberName('');
      setAddMemberUserId('');
      setAddMemberRole('Üye');
      fetchMembers();
    } catch (err) {
      setAddMemberStatus('error');
      setAddMemberMessage('Üye eklenemedi.');
    }
  };

  // Üye rolünü güncelle
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!selectedClubId) return;
    try {
      await ClubService.updateMemberRole(selectedClubId, userId, newRole);
      fetchMembers();
    } catch (err) {
      setMembersError('Rol güncellenemedi.');
    }
  };

  // Üyeyi at
  const handleKick = async (userId: string) => {
    if (!selectedClubId) return;
    if (!window.confirm('Üyeyi atmak istediğinize emin misiniz?')) return;
    try {
      await ClubService.kickMember(selectedClubId, userId);
      fetchMembers();
    } catch (err) {
      setMembersError('Üye atılamadı.');
    }
  };

  // Üyeyi şikayet et
  const handleReport = async (userId: string) => {
    if (!selectedClubId) return;
    if (!window.confirm('Üyeyi şikayet etmek istediğinize emin misiniz?')) return;
    try {
      await ClubService.reportMember(selectedClubId, userId);
      fetchMembers();
    } catch (err) {
      setMembersError('Üye şikayet edilemedi.');
    }
  };

  // Gönderileri getir
  const fetchPosts = async () => {
    if (!selectedClubId) return;
    setPostsLoading(true);
    setPostsError(null);
    try {
      const data = await ClubPostService.getPostsByClubId(selectedClubId);
      setPosts(data);
    } catch (err) {
      setPostsError('Gönderiler yüklenemedi.');
    } finally {
      setPostsLoading(false);
    }
  };

  // Üyeleri getir
  const fetchMembers = async () => {
    if (!selectedClubId) return;
    setMembersLoading(true);
    setMembersError(null);
    try {
      const clubData = await ClubService.getClubById(selectedClubId);
      setClub(clubData);
      setMembers(clubData?.memberList ? Object.values(clubData.memberList) : []);
    } catch (err) {
      setMembersError('Üyeler yüklenemedi.');
    } finally {
      setMembersLoading(false);
    }
  };

  // Handle event media file selection
  const handleEventMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setEventMediaFiles(files);
      setEventMediaPreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  // Post-event sharing dialog state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharePostContent, setSharePostContent] = useState('');
  const [sharePostLink, setSharePostLink] = useState('');
  const [sharePostMedia, setSharePostMedia] = useState<string[]>([]);
  const [shareEventId, setShareEventId] = useState<string | null>(null);

  // After event creation, ask to share as post
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !eventDate.trim() || !eventTime.trim() || !selectedClubId) return;
    try {
      setEventsError(null);
      const mediaUrls = eventMediaFiles.map(f => f.name);
      const selectedType = showCustomType && customEventType ? customEventType : eventType;
      const newEvent: Event = {
        eventId: Date.now().toString(),
        title: eventName,
        description: eventDescription,
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        formattedAddress: eventFormattedAddress || eventLocation,
        latitude: 0,
        longitude: 0,
        category: selectedType, // align with DB
        type: selectedType, // for UI
        imageUrl: mediaUrls[0] || '',
        mediaUrls: mediaUrls,
        link: eventLink || undefined,
        quota: eventUnlimitedQuota ? 'limitsiz' : eventQuota,
        price: eventPrice,
        organizerId: 'admin',
        organizerName: 'Yönetici',
        organizerImage: '',
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      await EventService.createEvent(newEvent);
      if (club) {
        const updatedEvents = club.events ? [...club.events, newEvent.eventId] : [newEvent.eventId];
        await ClubService.updateClub(selectedClubId, { events: updatedEvents });
        fetchMembers();
      }
      // Show share as post dialog
      setSharePostContent(`${eventName}\n${eventDescription}\nTarih: ${eventDate} ${eventTime}\nYer: ${eventLocation}`);
      setSharePostLink(eventLink);
      setSharePostMedia(mediaUrls);
      setShareEventId(newEvent.eventId);
      setShowShareDialog(true);
      // Reset event form
      setEventName('');
      setEventDate('');
      setEventTime('');
      setEventLocation('');
      setEventFormattedAddress('');
      setEventDescription('');
      setEventMediaFiles([]);
      setEventMediaPreviews([]);
      setEventLink('');
      setEventQuota('');
      setEventUnlimitedQuota(false);
      setEventPrice('');
      setEventType('');
      setCustomEventType('');
      setShowCustomType(false);
      fetchEvents();
    } catch (err) {
      setEventsError('Etkinlik oluşturulamadı.');
    }
  };

  // Share event as post
  const handleShareEventAsPost = async () => {
    if (!selectedClubId) return;
    try {
      const post: ClubPost = {
        postId: Date.now().toString(),
        clubId: selectedClubId,
        authorId: 'admin',
        textContent: sharePostContent,
        mediaUrls: sharePostMedia,
        link: sharePostLink || undefined,
        timestamp: new Date().toISOString(),
      };
      await ClubPostService.createPost(post);
      setShowShareDialog(false);
      setSharePostContent('');
      setSharePostLink('');
      setSharePostMedia([]);
      setShareEventId(null);
      fetchPosts();
    } catch (err) {
      setPostsError('Etkinlik gönderi olarak paylaşılamadı.');
    }
  };

  // Kulübe ait etkinlikleri getir
  const fetchEvents = async () => {
    if (!selectedClubId || !club) return;
    setEventsLoading(true);
    setEventsError(null);
    try {
      const allEvents = await EventService.getAllEvents();
      const clubEventIds = club?.events || [];
      const filtered = allEvents.filter(ev => clubEventIds.includes(ev.eventId));
      setEvents(filtered);
    } catch (err) {
      setEventsError('Etkinlikler yüklenemedi.');
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch all clubs from the database
  const fetchClubs = async () => {
    const clubsRef = ref(db, 'clubs');
    const snapshot = await get(clubsRef);
    if (!snapshot.exists()) {
      setClubs([]);
      return;
    }
    const obj = snapshot.val();
    const arr = Object.values(obj);
    setClubs(arr as Club[]);
  };

  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewClubLogo(e.target.files[0]);
      setNewClubLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Fetch universities on mount
  useEffect(() => {
    getAllUniversities().then(data => setUniversities(data));
  }, []);

  useEffect(() => {
    if (clubs.length && !selectedClubId) setSelectedClubId(clubs[0].clubId);
  }, [clubs]);

  useEffect(() => {
    if (selectedClubId) {
      setClubLoading(true);
      setClubError(null);
      ClubService.getClubById(selectedClubId)
        .then(clubData => setClub(clubData))
        .catch(() => setClubError('Kulüp yüklenemedi.'))
        .finally(() => setClubLoading(false));
    } else {
      setClub(null);
    }
  }, [selectedClubId]);

  useEffect(() => {
    if (club) fetchEvents();
  }, [club]);

  // Create club
  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateClubLoading(true);
    setCreateClubError(null);
    try {
      let logoUrl = '';
      if (newClubLogo) {
        const urls = await uploadFilesToStorage([newClubLogo], `clubLogos`);
        logoUrl = urls[0];
      }
      const club: Club = {
        clubId: Date.now().toString(),
        name: newClubName,
        bio: newClubBio,
        logoUrl,
        memberList: [],
        events: [],
        badgeRoles: newClubBadgeRoles.split(',').map(r => r.trim()).filter(Boolean),
        university: selectedUniversity,
      } as any;
      await ClubService.createClub(club);
      setClubs(prev => [...prev, club]);
      setSelectedClubId(club.clubId);
      setCreateClubDialogOpen(false);
      setNewClubName('');
      setNewClubBio('');
      setNewClubLogo(null);
      setNewClubLogoPreview(null);
      setNewClubBadgeRoles('');
      setSelectedUniversity(null);
    } catch (err) {
      setCreateClubError('Kulüp oluşturulamadı.');
    } finally {
      setCreateClubLoading(false);
    }
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDuzzqdz38Ecm7DIVRC6F1f6wzMSO6BB5o',
    libraries: ['places'],
  });

  useEffect(() => { fetchClubs(); }, []);

  useEffect(() => {
    if (clubs.length && !selectedClubId) setSelectedClubId(clubs[0].clubId);
  }, [clubs]);

  useEffect(() => {
    if (selectedClubId) {
      fetchPosts();
      fetchMembers();
    }
  }, [selectedClubId]);

  useEffect(() => {
    if (club) {
      fetchEvents();
    }
  }, [club]);

  return (
    <ErrorBoundary>
      <Box maxWidth={1100} mx="auto" p={{ xs: 1, sm: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
          <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddCircleOutlineIcon color="primary" fontSize="large" /> Kulüp Yönetimi
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateClubDialogOpen(true)} sx={{ borderRadius: 2, fontWeight: 600, minWidth: 180 }} aria-label="Kulüp Oluştur">
            Kulüp Oluştur
          </Button>
        </Box>
        {/* Club selector */}
        <Box mb={3} display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Typography variant="h6">Kulüp Seç:</Typography>
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Kulüp</InputLabel>
            <Select
              value={selectedClubId || ''}
              label="Kulüp"
              onChange={e => setSelectedClubId(e.target.value)}
              inputProps={{ 'aria-label': 'Kulüp Seç' }}
            >
              {(clubs || []).map(club => (
                <MenuItem key={club.clubId} value={club.clubId}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={club.logoUrl} alt={club.name} sx={{ width: 28, height: 28 }} />
                    {club.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {club && (
            <Box display="flex" alignItems="center" gap={2} ml={4} sx={{ background: '#fafbfc', p: 2, borderRadius: 3, boxShadow: 1 }}>
              <Avatar src={club.logoUrl} alt={club.name} sx={{ width: 48, height: 48, boxShadow: 2, border: '2px solid #eee' }} />
              <Box minWidth={200}>
                <Typography fontWeight={600}>{club.name}</Typography>
                <Typography variant="body2" color="text.secondary">{club.bio}</Typography>
                <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                  {(club?.badgeRoles || []).map((role, idx) => (
                    <Chip key={idx} label={role} size="small" color="secondary" sx={{ fontWeight: 600 }} />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
        {/* Create Club Dialog */}
        <Dialog open={createClubDialogOpen} onClose={() => setCreateClubDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}><AddCircleOutlineIcon color="primary" /> Yeni Kulüp Oluştur</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleCreateClub} display="flex" flexDirection="column" gap={2} mt={1}>
              <Autocomplete
                options={universities}
                getOptionLabel={option => option.name || ''}
                value={selectedUniversity}
                onChange={(_e, value) => setSelectedUniversity(value)}
                renderInput={params => <TextField {...params} label="Üniversite" required inputProps={{ ...params.inputProps, 'aria-label': 'Üniversite' }} />}
                renderOption={(props, option) => (
                  <li {...props} key={option.universityId}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar src={option.logo} alt={option.name} sx={{ width: 24, height: 24 }} />
                      <Box>
                        <Typography fontWeight={500}>{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{option.city} • {option.type}</Typography>
                      </Box>
                    </Box>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.universityId === value.universityId}
              />
              <TextField
                label="Kulüp Adı"
                value={newClubName}
                onChange={e => setNewClubName(e.target.value)}
                required
                inputProps={{ 'aria-label': 'Kulüp Adı' }}
              />
              <TextField
                label="Açıklama"
                value={newClubBio}
                onChange={e => setNewClubBio(e.target.value)}
                multiline
                minRows={2}
                inputProps={{ 'aria-label': 'Açıklama' }}
              />
              <Button variant="outlined" component="label" sx={{ borderRadius: 2, alignSelf: 'flex-start', transition: 'background 0.2s', ':hover': { background: '#e3e7fa' } }} aria-label="Logo Yükle">
                Logo Yükle
                <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
              </Button>
              {newClubLogoPreview && <Avatar src={newClubLogoPreview} alt="logo" sx={{ width: 64, height: 64, mx: 1, boxShadow: 2, border: '2px solid #eee' }} />}
              <TextField
                label="Rozet/Rol (virgülle ayır)"
                value={newClubBadgeRoles}
                onChange={e => setNewClubBadgeRoles(e.target.value)}
                helperText="Örn: Başkan, Yönetici, Üye"
                inputProps={{ 'aria-label': 'Rozet/Rol' }}
              />
              {createClubError && <Alert severity="error">{createClubError}</Alert>}
              <DialogActions>
                <Button onClick={() => setCreateClubDialogOpen(false)} color="inherit">İptal</Button>
                <Button type="submit" variant="contained" disabled={createClubLoading} sx={{ borderRadius: 2, fontWeight: 600, minWidth: 120 }}>
                  {createClubLoading ? 'Oluşturuluyor...' : 'Oluştur'}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>
        {/* Club management UI (show only if club selected) */}
        {club ? (
          <ClubManagementPanel club={club} />
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" color="text.secondary" py={6}>
            <InfoOutlinedIcon fontSize="large" sx={{ mb: 1 }} />
            <Typography mt={4}>Lütfen bir kulüp seçin veya oluşturun.</Typography>
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  );
};

export default ClubAdminPanel; 