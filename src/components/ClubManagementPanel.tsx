import React, { useState, useEffect } from 'react';
import type { Club, ClubMember, ClubPost, Event } from '../types';
import { ClubService } from '../services/clubService';
import { ClubPostService, uploadFilesToStorage } from '../services/clubPostService';
import { EventService } from '../services/eventService';
import {
  Box, Typography, Tabs, Tab, Stack, Divider, Card, CardContent, CardMedia,  Chip, Button, TextField, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl,   Avatar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import Grid from '@mui/material/Grid';
import PlacesAutocomplete from 'react-places-autocomplete';
import { useJsApiLoader } from '@react-google-maps/api';
import EventIcon from '@mui/icons-material/Event';
import PlaceIcon from '@mui/icons-material/Place';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import PostAddIcon from '@mui/icons-material/PostAdd';
import GroupIcon from '@mui/icons-material/Group';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Autocomplete from '@mui/material/Autocomplete';
import { UserManagementService, type UserInfo } from '../services/userManagementService';
import ErrorBoundary from './ErrorBoundary';

const roleOptions = [
  { value: 'Kulüp Başkanı', label: 'Kulüp Başkanı' },
  { value: 'Başkan Yardımcısı', label: 'Başkan Yardımcısı' },
  { value: 'Genel Sekreter', label: 'Genel Sekreter' },
  { value: 'Sayman / Mali Sorumlu', label: 'Sayman / Mali Sorumlu' },
  { value: 'Etkinlik Sorumlusu', label: 'Etkinlik Sorumlusu' },
  { value: 'İletişim ve Sosyal Medya Sorumlusu', label: 'İletişim ve Sosyal Medya Sorumlusu' },
  { value: 'Üye İlişkileri Sorumlusu', label: 'Üye İlişkileri Sorumlusu' },
  { value: 'Proje Geliştirme Sorumlusu', label: 'Proje Geliştirme Sorumlusu' },
  { value: 'Eğitim/Atölye Sorumlusu', label: 'Eğitim/Atölye Sorumlusu' },
  { value: 'Tasarım Sorumlusu', label: 'Tasarım Sorumlusu' },
  { value: 'Medya ve Fotoğraf Sorumlusu', label: 'Medya ve Fotoğraf Sorumlusu' },
  { value: 'Dış İlişkiler / Kurumsal İlişkiler Sorumlusu', label: 'Dış İlişkiler / Kurumsal İlişkiler Sorumlusu' },
  { value: 'Gönüllü Koordinatörü', label: 'Gönüllü Koordinatörü' },
  { value: 'Üye', label: 'Üye' },
  // Add more as needed
];

const tabLabels = [
  { label: 'Gönderiler', icon: <PostAddIcon /> },
  { label: 'Üyeler', icon: <GroupIcon /> },
  { label: 'Etkinlikler', icon: <EventAvailableIcon /> },
];

const ClubManagementPanel: React.FC<{ club: Club; onBack?: () => void }> = ({ club, onBack }) => {
  const CLUB_ID = club.clubId;
  const [activeTab, setActiveTab] = useState(0);

  // Posts
  const [postContent, setPostContent] = useState('');
  const [postLink, setPostLink] = useState('');
  const [postMediaFiles, setPostMediaFiles] = useState<File[]>([]);
  const [postMediaPreviews, setPostMediaPreviews] = useState<string[]>([]);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Members
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [addMemberUser, setAddMemberUser] = useState<UserInfo | null>(null);
  const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
  const [addMemberRole, setAddMemberRole] = useState('Üye');
  const [addMemberStatus, setAddMemberStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [addMemberMessage, setAddMemberMessage] = useState('');

  // Events
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventFormattedAddress, setEventFormattedAddress] = useState('');
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

  // Post-event sharing dialog state

  // State for editing posts
  const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ClubPost | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostLink, setEditPostLink] = useState('');
  const [editPostMediaFiles, setEditPostMediaFiles] = useState<File[]>([]);
  const [editPostMediaPreviews, setEditPostMediaPreviews] = useState<string[]>([]);

  // State for editing events
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editEventName, setEditEventName] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventTime, setEditEventTime] = useState('');
  const [editEventLocation, setEditEventLocation] = useState('');
  const [editEventFormattedAddress, setEditEventFormattedAddress] = useState('');
  const [editEventDescription, setEditEventDescription] = useState('');
  const [editEventMediaFiles, setEditEventMediaFiles] = useState<File[]>([]);
  const [editEventMediaPreviews, setEditEventMediaPreviews] = useState<string[]>([]);
  const [editEventLink, setEditEventLink] = useState('');
  const [editEventQuota, setEditEventQuota] = useState<number | ''>('');
  const [editEventUnlimitedQuota, setEditEventUnlimitedQuota] = useState(false);
  const [editEventPrice, setEditEventPrice] = useState('');
  const [editEventType, setEditEventType] = useState('');
  const [editCustomEventType, setEditCustomEventType] = useState('');
  const [editShowCustomType, setEditShowCustomType] = useState(false);

  // Event type options
  const eventTypeOptions = [
    'Seminer', 'Sosyal', 'Yarışma', 'Atölye', 'Diğer', '+ Yeni Tür Ekle'
  ];

  // Add filter states
  const [userFilterUniversity, setUserFilterUniversity] = useState('');
  const [userFilterMajor, setUserFilterMajor] = useState('');
  const [userFilterGender, setUserFilterGender] = useState('');

  // Compute filtered users
  const filteredUsers = allUsers.filter(user => {
    return (
      (!userFilterUniversity || (user.university && user.university === userFilterUniversity)) &&
      (!userFilterMajor || (user.major && user.major === userFilterMajor)) &&
      (!userFilterGender || (user.gender && user.gender === userFilterGender))
    );
  });

  // Move libraries array outside the component to avoid re-creating it on every render
  const GOOGLE_MAPS_LIBRARIES = ['places'];
  // Google Maps API loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDuzzqdz38Ecm7DIVRC6F1f6wzMSO6BB5o',
    libraries: GOOGLE_MAPS_LIBRARIES as any,
  });

  // Fetch posts
  const fetchPosts = async () => {
    setPostsLoading(true);
    setPostsError(null);
    try {
      const data = await ClubPostService.getPostsByClubId(CLUB_ID);
      setPosts(data);
    } catch (err) {
      setPostsError('Gönderiler yüklenemedi.');
    } finally {
      setPostsLoading(false);
    }
  };

  // Fetch members
  const fetchMembers = async () => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      const clubData = await ClubService.getClubById(CLUB_ID);
      setMembers(clubData?.memberList ? Object.values(clubData.memberList) : []);
    } catch (err) {
      setMembersError('Üyeler yüklenemedi.');
    } finally {
      setMembersLoading(false);
    }
  };

  // Fetch events
  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const allEvents = await EventService.getAllEvents();
      const clubEventIds = club.events || [];
      const filtered = allEvents.filter(ev => clubEventIds.includes(ev.eventId));
      setEvents(filtered);
    } catch (err) {
      setEventsError('Etkinlikler yüklenemedi.');
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch all users for member add dropdown
  useEffect(() => {
    UserManagementService.getAllUsers().then(setAllUsers).catch(() => setAllUsers([]));
  }, []);

  // Fetch data when club changes
  useEffect(() => {
    fetchPosts();
    fetchMembers();
    fetchEvents();
    // eslint-disable-next-line
  }, [CLUB_ID]);

  // ...rest of the management logic (handleCreatePost, handleAddMember, handleCreateEvent, etc.)
  // ...copy from previous ClubAdminPanel, but use CLUB_ID everywhere

  // Polish the main container for responsiveness and spacing
  return (
    <ErrorBoundary>
      <Box maxWidth={1100} mx="auto" p={{ xs: 1, sm: 3 }} sx={{ width: '100%' }}>
        <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap" sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, minWidth: 100, mb: { xs: 2, sm: 0 } }} aria-label="Geri Dön">
            Geri
          </Button>
          <Avatar src={club.logoUrl} alt={club.name} sx={{ width: 64, height: 64, boxShadow: 2, border: '2px solid #eee', mb: { xs: 2, sm: 0 } }} />
          <Box minWidth={200}>
            <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: 22, sm: 28 } }}>{club.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 14, sm: 16 } }}>{club.bio}</Typography>
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              {(club.badgeRoles || []).map((role, idx) => (
                <Chip key={idx} label={role} size="small" color="secondary" sx={{ fontWeight: 600 }} />
              ))}
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }} variant="fullWidth" aria-label="Yönetim Sekmeleri">
          {tabLabels.map((tab, idx) => (
            <Tab key={tab.label} label={<Box display="flex" alignItems="center" gap={1}>{tab.icon}{tab.label}</Box>} aria-label={tab.label} sx={{ fontWeight: 700, fontSize: 16, minHeight: 48 }} />
          ))}
        </Tabs>
        {/* Posts Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" mb={2} fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: 18, sm: 22 } }}>
              <AddCircleOutlineIcon color="primary" /> Yeni Gönderi Oluştur
            </Typography>
            <Box component="form" onSubmit={async e => {
              e.preventDefault();
              if (!postContent.trim()) return;
              try {
                setPostsError(null);
                // Upload media files and get URLs
                let mediaUrls: string[] = [];
                if (postMediaFiles.length > 0) {
                  mediaUrls = await uploadFilesToStorage(postMediaFiles, `clubPosts/${CLUB_ID}`);
                }
                const post: ClubPost = {
                  postId: Date.now().toString(),
                  clubId: CLUB_ID,
                  authorId: 'admin',
                  textContent: postContent,
                  mediaUrls: mediaUrls,
                  link: postLink || undefined,
                  timestamp: new Date().toISOString(),
                };
                await ClubPostService.createPost(post);
                // Save postId under the related club
                const clubData = await ClubService.getClubById(CLUB_ID);
                const updatedPosts = clubData && clubData.posts ? [...clubData.posts, post.postId] : [post.postId];
                await ClubService.updateClub(CLUB_ID, { posts: updatedPosts });
                setPostContent('');
                setPostLink('');
                setPostMediaFiles([]);
                setPostMediaPreviews([]);
                fetchPosts();
              } catch (err) {
                setPostsError('Gönderi oluşturulamadı.');
              }
            }} mb={3} sx={{ background: '#fafbfc', p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: 1, mb: 4, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
              <TextField
                label="Gönderi içeriği"
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                fullWidth
                multiline
                minRows={3}
                required
                inputProps={{ maxLength: 2000, 'aria-label': 'Gönderi içeriği' }}
                helperText={`${postContent.length}/2000 karakter`}
                sx={{ mb: 1, fontSize: { xs: 14, sm: 16 } }}
              />
              <TextField
                label="Bağlantı (opsiyonel)"
                value={postLink}
                onChange={e => setPostLink(e.target.value)}
                fullWidth
                inputProps={{ 'aria-label': 'Bağlantı' }}
                sx={{ mb: 1, fontSize: { xs: 14, sm: 16 } }}
              />
              <Button
                variant="outlined"
                component="label"
                sx={{ mb: 1, borderRadius: 2, alignSelf: 'flex-start', transition: 'background 0.2s', ':hover': { background: '#e3e7fa' }, fontSize: { xs: 14, sm: 16 } }}
                aria-label="Medya Yükle"
              >
                Medya Yükle (Çoklu Seçim)
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  hidden
                  onChange={e => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files);
                      setPostMediaFiles(files);
                      setPostMediaPreviews(files.map(file => URL.createObjectURL(file)));
                    }
                  }}
                />
              </Button>
              <Box display="flex" gap={2} flexWrap="wrap" mb={1}>
                {postMediaPreviews.map((url, idx) => (
                  <Box key={idx} sx={{ border: '1px solid #eee', borderRadius: 2, overflow: 'hidden', boxShadow: 1, ':hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}>
                    {url.match(/video/) ? (
                      <video src={url} width={100} height={80} controls />
                    ) : (
                      <img src={url} alt="media" width={100} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
                    )}
                  </Box>
                ))}
              </Box>
              <Button type="submit" variant="contained" sx={{ borderRadius: 2, fontWeight: 600, px: 4, alignSelf: 'flex-end', minWidth: 160, fontSize: { xs: 15, sm: 17 } }} aria-label="Gönderi Oluştur">Gönderi Oluştur</Button>
            </Box>
            {postsLoading && <Box display="flex" justifyContent="center" my={2}><CircularProgress size={28} /></Box>}
            {postsError && <Alert severity="error" sx={{ mb: 2 }}>{postsError}</Alert>}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" mb={2} fontWeight={700} sx={{ fontSize: { xs: 18, sm: 22 } }}>Gönderiler</Typography>
            <Stack spacing={2}>
              {(posts || []).map(post => (
                <Card key={post.postId} sx={{ p: 2, boxShadow: 2, borderRadius: 3, transition: 'box-shadow 0.2s', ':hover': { boxShadow: 6 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <CardContent sx={{ p: 0 }}>
                    <Typography fontWeight={600} mb={1} sx={{ fontSize: { xs: 15, sm: 17 } }}>{post.textContent}</Typography>
                    {post.link && (
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <LinkIcon fontSize="small" color="primary" />
                        <a href={post.link} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'underline', wordBreak: 'break-all', fontSize: '15px' }}>{post.link}</a>
                      </Box>
                    )}
                    <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                      {(post.mediaUrls || []).map((url, idx) => (
                        <Box key={idx} sx={{ border: '1px solid #eee', borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
                          {url.match(/\.(mp4|webm|ogg)$/) ? (
                            <video src={url} width={100} height={80} controls />
                          ) : (
                            <img src={url} alt="media" width={100} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
                          )}
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">{new Date(post.timestamp).toLocaleString('tr-TR')}</Typography>
                    <Box display="flex" gap={1} mt={1}>
                      <Button
                        startIcon={<EditIcon />}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ borderRadius: 2, fontWeight: 600, minWidth: 100 }}
                        onClick={() => {
                          setEditingPost(post);
                          setEditPostContent(post.textContent);
                          setEditPostLink(post.link || '');
                          setEditPostMediaFiles([]);
                          setEditPostMediaPreviews(post.mediaUrls || []);
                          setEditPostDialogOpen(true);
                        }}
                        aria-label="Gönderiyi Düzenle"
                      >
                        Düzenle
                      </Button>
                      <Button
                        startIcon={<CloseIcon />}
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ borderRadius: 2, fontWeight: 600, minWidth: 100 }}
                        onClick={async () => {
                          if (window.confirm('Gönderiyi silmek istediğinize emin misiniz?')) {
                            await ClubPostService.deletePost(CLUB_ID, post.postId);
                            // Remove postId from club's posts array
                            const clubData = await ClubService.getClubById(CLUB_ID);
                            if (clubData && clubData.posts) {
                              const updatedPosts = clubData.posts.filter(id => id !== post.postId);
                              await ClubService.updateClub(CLUB_ID, { posts: updatedPosts });
                            }
                            fetchPosts();
                          }
                        }}
                        aria-label="Gönderiyi Sil"
                      >
                        Sil
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {posts.length === 0 && !postsLoading && (
                <Box display="flex" flexDirection="column" alignItems="center" color="text.secondary" py={4}>
                  <InfoOutlinedIcon fontSize="large" sx={{ mb: 1 }} />
                  <Typography sx={{ fontSize: { xs: 15, sm: 17 } }}>Henüz gönderi yok.</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}
        {/* Members Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" mb={2} fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: 18, sm: 22 } }}>
              <AddCircleOutlineIcon color="primary" /> Üye Ekle
            </Typography>
            {/* User Filters */}
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={2}>
              <FormControl fullWidth sx={{ minWidth: 160 }}>
                <InputLabel>Üniversite</InputLabel>
                <Select
                  value={userFilterUniversity}
                  label="Üniversite"
                  onChange={e => setUserFilterUniversity(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {[...new Set(allUsers.map(u => u.university).filter(Boolean))].map(uni => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ minWidth: 160 }}>
                <InputLabel>Bölüm</InputLabel>
                <Select
                  value={userFilterMajor}
                  label="Bölüm"
                  onChange={e => setUserFilterMajor(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {[...new Set(allUsers.map(u => u.major).filter(Boolean))].map(major => (
                    <MenuItem key={major} value={major}>{major}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ minWidth: 160 }}>
                <InputLabel>Cinsiyet</InputLabel>
                <Select
                  value={userFilterGender}
                  label="Cinsiyet"
                  onChange={e => setUserFilterGender(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {[...new Set(allUsers.map(u => u.gender).filter(Boolean))].map(gender => (
                    <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box component="form" onSubmit={async e => {
              e.preventDefault();
              if (!addMemberUser) return;
              setAddMemberStatus('loading');
              setAddMemberMessage('');
              try {
                const newMember: ClubMember = {
                  userId: addMemberUser.uid,
                  name: `${addMemberUser.name || ''} ${addMemberUser.surname || ''}`.trim() || addMemberUser.email || 'Kullanıcı',
                  role: addMemberRole,
                  status: 'active',
                };
                await ClubService.addMember(CLUB_ID, newMember);
                setAddMemberStatus('success');
                setAddMemberMessage('Üye başarıyla eklendi.');
                setAddMemberUser(null);
                setAddMemberRole('Üye');
                fetchMembers();
              } catch (err) {
                setAddMemberStatus('error');
                setAddMemberMessage('Üye eklenemedi.');
              }
            }} mb={3} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ background: '#fafbfc', p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: 1, mb: 4, flexWrap: 'wrap', maxWidth: 600 }}>
              <Autocomplete
                options={filteredUsers}
                getOptionLabel={(option: UserInfo) => `${option.name || ''} ${option.surname || ''}`.trim() || option.email || option.uid}
                filterOptions={(options: UserInfo[], { inputValue }: { inputValue: string }) =>
                  options.filter((option: UserInfo) =>
                    ((option.name && option.name.toLowerCase().includes(inputValue.toLowerCase())) ||
                    (option.surname && option.surname.toLowerCase().includes(inputValue.toLowerCase())) ||
                    ((option.name && option.surname) && (`${option.name} ${option.surname}`.toLowerCase().includes(inputValue.toLowerCase()))) ||
                    (option.email && option.email.toLowerCase().includes(inputValue.toLowerCase())) ||
                    (option.university && option.university.toLowerCase().includes(inputValue.toLowerCase())))
                  )
                }
                value={addMemberUser}
                onChange={(_event: React.SyntheticEvent, value: UserInfo | null) => setAddMemberUser(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Kullanıcı Seç" required fullWidth sx={{ fontSize: { xs: 14, sm: 16 } }} inputProps={{ ...params.inputProps, 'aria-label': 'Kullanıcı Seç' }} />
                )}
                isOptionEqualToValue={(option: UserInfo, value: UserInfo) => option.uid === value.uid}
                sx={{ minWidth: 200, flex: 1 }}
                renderOption={(props, option: UserInfo) => {
                  return (
                    <li {...props} key={option.uid} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar src={option.profileImageUrl} alt={`${option.name || ''} ${option.surname || ''}`.trim() || option.email || option.uid} sx={{ width: 32, height: 32, mr: 1 }} />
                      <Box>
                        <Typography fontWeight={600}>{`${option.name || ''} ${option.surname || ''}`.trim() || option.email || option.uid}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.university || 'Bilinmiyor'}
                        </Typography>
                      </Box>
                    </li>
                  );
                }}
              />
              <FormControl fullWidth sx={{ minWidth: 160 }}>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={addMemberRole}
                  label="Rol"
                  onChange={e => setAddMemberRole(e.target.value)}
                  inputProps={{ 'aria-label': 'Rol' }}
                >
                  {roleOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button type="submit" variant="contained" disabled={addMemberStatus === 'loading'} sx={{ borderRadius: 2, fontWeight: 600, px: 4, minWidth: 120, fontSize: { xs: 15, sm: 17 }, mt: { xs: 2, sm: 0 } }} aria-label="Üye Ekle">
                {addMemberStatus === 'loading' ? <CircularProgress size={20} /> : 'Ekle'}
              </Button>
            </Box>
            <Snackbar
              open={addMemberStatus === 'success' || addMemberStatus === 'error'}
              autoHideDuration={3000}
              onClose={() => setAddMemberStatus('idle')}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert severity={addMemberStatus === 'success' ? 'success' : 'error'} sx={{ fontWeight: 600 }}>
                {addMemberMessage}
              </Alert>
            </Snackbar>
            {membersLoading && <Box display="flex" justifyContent="center" my={2}><CircularProgress size={28} /></Box>}
            {membersError && <Alert severity="error" sx={{ mb: 2 }}>{membersError}</Alert>}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" mb={2} fontWeight={700} sx={{ fontSize: { xs: 18, sm: 22 } }}>Üyeler</Typography>
            <Box sx={{ width: '100%' }}>
              {membersLoading ? (
                <Box display="flex" justifyContent="center" my={2}><CircularProgress size={28} /></Box>
              ) : membersError ? (
                <Alert severity="error" sx={{ mb: 2 }}>{membersError}</Alert>
              ) : members.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" color="text.secondary" py={4}>
                  <InfoOutlinedIcon fontSize="large" sx={{ mb: 1 }} />
                  <Typography sx={{ fontSize: { xs: 15, sm: 17 } }}>Henüz üye yok.</Typography>
                </Box>
              ) : (
                <Grid container columns={12} columnSpacing={2} rowSpacing={2}>
                  {(members || []).map(member => (
                    <Grid key={member.userId} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                      <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 3, boxShadow: 2, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Avatar src={allUsers.find(u => u.uid === member.userId)?.profileImageUrl} alt={member.name} sx={{ width: 56, height: 56, mr: { sm: 2, xs: 0 }, mb: { xs: 1, sm: 0 } }} />
                        <Box flex={1} minWidth={0}>
                          <Typography fontWeight={700} sx={{ fontSize: { xs: 16, sm: 18 }, wordBreak: 'break-word' }}>{member.name}</Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
                            <Chip
                              label={member.role}
                              color={
                                member.role === 'Kulüp Başkanı' ? 'primary' :
                                member.role === 'Başkan Yardımcısı' ? 'secondary' :
                                member.role === 'Genel Sekreter' ? 'success' :
                                member.role === 'Sayman / Mali Sorumlu' ? 'warning' :
                                member.role === 'Etkinlik Sorumlusu' ? 'info' :
                                member.role === 'İletişim ve Sosyal Medya Sorumlusu' ? 'info' :
                                member.role === 'Üye İlişkileri Sorumlusu' ? 'info' :
                                member.role === 'Proje Geliştirme Sorumlusu' ? 'info' :
                                member.role === 'Eğitim/Atölye Sorumlusu' ? 'info' :
                                member.role === 'Tasarım Sorumlusu' ? 'info' :
                                member.role === 'Medya ve Fotoğraf Sorumlusu' ? 'info' :
                                member.role === 'Dış İlişkiler / Kurumsal İlişkiler Sorumlusu' ? 'info' :
                                member.role === 'Gönüllü Koordinatörü' ? 'info' :
                                member.role === 'Üye' ? 'default' :
                                'default'
                              }
                              size="small"
                              sx={{ fontWeight: 600 }}
                              aria-label={`Rol: ${member.role}`}
                            />
                            <Chip
                              label={member.status === 'active' ? 'Aktif' : member.status === 'kicked' ? 'Atıldı' : 'Şikayetli'}
                              color={member.status === 'active' ? 'success' : member.status === 'kicked' ? 'error' : 'warning'}
                              size="small"
                              sx={{ fontWeight: 600 }}
                              aria-label={`Durum: ${member.status}`}
                            />
                          </Box>
                        </Box>
                        <Box display="flex" flexDirection={{ xs: 'row', sm: 'column' }} gap={1} ml={{ sm: 2, xs: 0 }} mt={{ xs: 2, sm: 0 }}>
                          <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={member.role}
                              onChange={e => {
                                ClubService.updateMemberRole(CLUB_ID, member.userId, e.target.value).then(fetchMembers);
                              }}
                              disabled={member.status !== 'active'}
                              inputProps={{ 'aria-label': 'Rol Değiştir' }}
                            >
                              {roleOptions.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                              ))}
                              {/* Allow custom roles */}
                              {member.role && !roleOptions.some(opt => opt.value === member.role) && (
                                <MenuItem value={member.role}>{member.role}</MenuItem>
                              )}
                            </Select>
                          </FormControl>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => {
                              if (window.confirm('Üyeyi atmak istediğinize emin misiniz?')) {
                                ClubService.kickMember(CLUB_ID, member.userId).then(fetchMembers);
                              }
                            }}
                            disabled={member.status !== 'active'}
                            sx={{ borderRadius: 2, minWidth: 60, fontWeight: 600, ':focus': { outline: '2px solid #d32f2f' } }}
                            aria-label="Üyeyi At"
                          >
                            At
                          </Button>
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={() => {
                              if (window.confirm('Üyeyi şikayet etmek istediğinize emin misiniz?')) {
                                ClubService.reportMember(CLUB_ID, member.userId).then(fetchMembers);
                              }
                            }}
                            disabled={member.status !== 'active'}
                            sx={{ borderRadius: 2, minWidth: 100, fontWeight: 600, ':focus': { outline: '2px solid #ed6c02' } }}
                            aria-label="Üyeyi Şikayet Et"
                          >
                            Şikayet Et
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Box>
        )}
        {/* Events Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" mb={2} fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: 18, sm: 22 } }}>
              <AddCircleOutlineIcon color="primary" /> Yeni Etkinlik Oluştur
            </Typography>
            {!isLoaded ? (
              <Box display="flex" alignItems="center" gap={2} color="text.secondary" fontWeight={600}>
                <CircularProgress size={20} /> Google Haritalar yükleniyor...
              </Box>
            ) : (
              <Box component="form" onSubmit={async e => {
                e.preventDefault();
                if (!eventName.trim() || !eventDate.trim() || !eventTime.trim()) return;
                try {
                  setEventsError(null);
                  // Upload event media files to storage and get URLs
                  const mediaUrls = await uploadFilesToStorage(eventMediaFiles, `events/${CLUB_ID}`);
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
                    category: selectedType,
                    type: selectedType,
                    imageUrl: mediaUrls[0] || club.logoUrl || '',
                    mediaUrls: mediaUrls,
                    link: eventLink || undefined,
                    quota: eventUnlimitedQuota ? 'limitsiz' : eventQuota,
                    price: eventPrice,
                    organizerId: club.clubId,
                    organizerName: club.name,
                    organizerImage: club.logoUrl || '',
                    timestamp: new Date().toISOString(),
                    status: 'pending',
                  };
                  await EventService.createEvent(newEvent);
                  if (club) {
                    const updatedEvents = club.events ? [...club.events, newEvent.eventId] : [newEvent.eventId];
                    await ClubService.updateClub(CLUB_ID, { events: updatedEvents });
                    fetchMembers();
                  }
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
              }} mb={3} display="flex" flexWrap="wrap" gap={2} sx={{ background: '#fafbfc', p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: 1, mb: 4, maxWidth: 900 }}>
                <TextField
                  label="Etkinlik adı"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  required
                  sx={{ minWidth: 200, fontSize: { xs: 14, sm: 16 } }}
                  inputProps={{ 'aria-label': 'Etkinlik adı' }}
                />
                <TextField
                  label="Tarih"
                  type="date"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{ minWidth: 140, fontSize: { xs: 14, sm: 16 } }}
                  inputProps={{ 'aria-label': 'Tarih' }}
                />
                <TextField
                  label="Saat"
                  type="time"
                  value={eventTime}
                  onChange={e => setEventTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{ minWidth: 120, fontSize: { xs: 14, sm: 16 } }}
                  inputProps={{ 'aria-label': 'Saat' }}
                />
                <PlacesAutocomplete
                  value={eventLocation}
                  onChange={setEventLocation}
                  onSelect={(address: string) => {
                    setEventLocation(address);
                    setEventFormattedAddress(address);
                  }}
                  searchOptions={{ componentRestrictions: { country: 'tr' } }}
                >
                  {({ getInputProps, suggestions, getSuggestionItemProps, loading }: {
                    getInputProps: (options?: any) => any;
                    suggestions: Array<any>;
                    getSuggestionItemProps: (suggestion: any) => any;
                    loading: boolean;
                  }) => (
                    <Box sx={{ width: 250, position: 'relative' }}>
                      <TextField
                        {...getInputProps({ placeholder: 'Konum ara...' })}
                        label="Konum"
                        fullWidth
                        inputProps={{ 'aria-label': 'Konum' }}
                        sx={{ fontSize: { xs: 14, sm: 16 } }}
                      />
                      <Box sx={{ position: 'absolute', zIndex: 10, background: 'white', width: '100%', borderRadius: 2, boxShadow: 2 }}>
                        {loading && <div>Yükleniyor...</div>}
                        {suggestions.map((suggestion: any) => (
                          <Box
                            {...getSuggestionItemProps(suggestion)}
                            key={suggestion.placeId}
                            sx={{ p: 1, cursor: 'pointer', background: suggestion.active ? '#f0f0f0' : 'white', borderBottom: '1px solid #eee' }}
                          >
                            {suggestion.description}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </PlacesAutocomplete>
                <TextField
                  label="Açıklama"
                  value={eventDescription}
                  onChange={e => setEventDescription(e.target.value)}
                  sx={{ minWidth: 200, fontSize: { xs: 14, sm: 16 } }}
                  inputProps={{ 'aria-label': 'Açıklama' }}
                  fullWidth
                  multiline
                  minRows={4}
                />
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ borderRadius: 2, alignSelf: 'flex-start', transition: 'background 0.2s', ':hover': { background: '#e3e7fa' }, fontSize: { xs: 14, sm: 16 } }}
                  aria-label="Medya Yükle"
                >
                  Medya Yükle (Çoklu Seçim)
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    hidden
                    onChange={e => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        setEventMediaFiles(files);
                        setEventMediaPreviews(files.map(file => URL.createObjectURL(file)));
                      }
                    }}
                  />
                </Button>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {(eventMediaPreviews || []).map((url, idx) => (
                    <Box key={idx} sx={{ border: '1px solid #eee', borderRadius: 2, overflow: 'hidden', boxShadow: 1, ':hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}>
                      {url.match(/video/) ? (
                        <video src={url} width={100} height={80} controls />
                      ) : (
                        <img src={url} alt="media" width={100} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
                      )}
                    </Box>
                  ))}
                </Box>
                <TextField
                  label="Bağlantı (opsiyonel)"
                  value={eventLink}
                  onChange={e => setEventLink(e.target.value)}
                  fullWidth
                  sx={{ minWidth: 200, fontSize: { xs: 14, sm: 16 } }}
                  inputProps={{ 'aria-label': 'Bağlantı' }}
                />
                <TextField
                  label="Kontenjan"
                  type="number"
                  value={eventUnlimitedQuota ? '' : eventQuota}
                  onChange={e => setEventQuota(Number(e.target.value))}
                  disabled={eventUnlimitedQuota}
                  sx={{ maxWidth: 120, fontSize: { xs: 14, sm: 16 } }}
                  inputProps={{ 'aria-label': 'Kontenjan' }}
                />
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Tür</InputLabel>
                  <Select
                    value={showCustomType ? '+ Yeni Tür Ekle' : eventType}
                    label="Tür"
                    onChange={e => {
                      if (e.target.value === '+ Yeni Tür Ekle') {
                        setShowCustomType(true);
                        setEventType('');
                      } else {
                        setShowCustomType(false);
                        setEventType(e.target.value);
                      }
                    }}
                    inputProps={{ 'aria-label': 'Tür' }}
                    sx={{ fontSize: { xs: 14, sm: 16 } }}
                  >
                    {eventTypeOptions.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {showCustomType && (
                  <TextField
                    label="Yeni Tür"
                    value={customEventType}
                    onChange={e => setCustomEventType(e.target.value)}
                    onBlur={() => {
                      if (customEventType) {
                        setEventType(customEventType);
                      }
                    }}
                    required
                    sx={{ minWidth: 160, fontSize: { xs: 14, sm: 16 } }}
                    inputProps={{ 'aria-label': 'Yeni Tür' }}
                  />
                )}
                <TextField
                  label="Fiyat (₺)"
                  type="number"
                  value={eventPrice}
                  onChange={e => setEventPrice(e.target.value)}
                  sx={{ maxWidth: 120, fontSize: { xs: 14, sm: 16 } }}
                  inputProps={{ 'aria-label': 'Fiyat' }}
                />
                <FormControl>
                  <Box display="flex" alignItems="center" gap={1}>
                    <input
                      type="checkbox"
                      checked={eventUnlimitedQuota}
                      onChange={e => setEventUnlimitedQuota(e.target.checked)}
                      id="unlimited-quota"
                      aria-label="Limitsiz Kontenjan"
                    />
                    <label htmlFor="unlimited-quota" style={{ fontSize: 15 }}>Limitsiz Kontenjan</label>
                  </Box>
                </FormControl>
                <Button type="submit" variant="contained" sx={{ borderRadius: 2, fontWeight: 600, px: 4, alignSelf: 'flex-end', minWidth: 160, fontSize: { xs: 15, sm: 17 } }} aria-label="Etkinlik Oluştur">Etkinlik Oluştur</Button>
              </Box>
            )}
            {eventsLoading && <Box display="flex" justifyContent="center" my={2}><CircularProgress size={28} /></Box>}
            {eventsError && <Alert severity="error" sx={{ mb: 2 }}>{eventsError}</Alert>}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" mb={2} fontWeight={700} sx={{ fontSize: { xs: 18, sm: 22 } }}>Etkinlikler</Typography>
            <Stack spacing={2}>
              {(events || []).map((event: Event) => (
                <Card key={event.eventId} sx={{ display: 'flex', mb: 2, boxShadow: 3, borderRadius: 3, transition: 'box-shadow 0.2s', ':hover': { boxShadow: 8 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                  {event.imageUrl && (
                    <CardMedia
                      component={event.imageUrl.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'img'}
                      src={event.imageUrl}
                      alt={event.title}
                      sx={{ width: { xs: '100%', sm: 160 }, height: 120, objectFit: 'cover', borderRadius: 2, m: 2, boxShadow: 1 }}
                      controls={event.imageUrl.match(/\.(mp4|webm|ogg)$/) ? true : undefined}
                    />
                  )}
                  <CardContent sx={{ flex: 1 }}>
                    {/* @ts-ignore */}
                    <Grid container spacing={1} alignItems="center">
                      {/* @ts-ignore */}
                      <Grid xs={12} sm={8}>
                        <Typography variant="h6" fontWeight={600}>{event.title}</Typography>
                      </Grid>
                      {/* @ts-ignore */}
                      <Grid xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        <Tooltip title="Etkinlik Türü">
                          <Chip label={event.type} color="primary" sx={{ fontWeight: 600 }} />
                        </Tooltip>
                      </Grid>
                      {/* @ts-ignore */}
                      <Grid xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EventIcon fontSize="small" />
                          <Typography variant="body2">{event.date} {event.time}</Typography>
                        </Box>
                      </Grid>
                      {/* @ts-ignore */}
                      <Grid xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PlaceIcon fontSize="small" />
                          <Typography variant="body2">{event.location}</Typography>
                        </Box>
                      </Grid>
                      {/* @ts-ignore */}
                      <Grid xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AttachMoneyIcon fontSize="small" />
                          <Typography variant="body2">{event.price ? `${event.price}₺` : 'Ücretsiz'}</Typography>
                        </Box>
                      </Grid>
                      {/* @ts-ignore */}
                      <Grid xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PeopleIcon fontSize="small" />
                          <Typography variant="body2">{event.quota || 'Belirtilmedi'}</Typography>
                        </Box>
                      </Grid>
                      {/* @ts-ignore */}
                      {event.link && (
  // @ts-ignore
  <Grid xs={12}>
    <Box display="flex" alignItems="center" gap={1}>
      <LinkIcon fontSize="small" color="primary" />
      <a href={event.link} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'underline', wordBreak: 'break-all', fontSize: '15px' }}>{event.link}</a>
    </Box>
  </Grid>
)}
                    </Grid>
                    <Typography variant="body2" color="text.secondary" mt={1} sx={{ whiteSpace: 'pre-line' }}>{event.description}</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                      {(event.mediaUrls || []).slice(1).map((url: string, idx: number) => (
                        <Box key={idx} sx={{ border: '1px solid #eee', borderRadius: 2, overflow: 'hidden', boxShadow: 1, ':hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}>
                          {url.match(/\.(mp4|webm|ogg)$/) ? (
                            <video src={url} width={80} height={60} controls />
                          ) : (
                            <img src={url} alt="media" width={80} height={60} style={{ objectFit: 'cover', borderRadius: 6 }} />
                          )}
                        </Box>
                      ))}
                    </Box>
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ mt: 1, borderRadius: 2, fontWeight: 600, minWidth: 100 }}
                      onClick={() => {
                        setEditingEvent(event);
                        setEditEventName(event.title);
                        setEditEventDate(event.date);
                        setEditEventTime(event.time);
                        setEditEventLocation(event.location);
                        setEditEventFormattedAddress(event.formattedAddress || '');
                        setEditEventDescription(event.description);
                        setEditEventMediaFiles([]);
                        setEditEventMediaPreviews(event.mediaUrls || []);
                        setEditEventLink(event.link || '');
                        setEditEventQuota(event.quota ? Number(event.quota) : '');
                        setEditEventUnlimitedQuota(event.quota === 'limitsiz');
                        setEditEventPrice(event.price || '');
                        setEditEventType(event.type || '');
                        setEditCustomEventType('');
                        setEditShowCustomType(false);
                        setEditEventDialogOpen(true);
                      }}
                      aria-label="Etkinliği Düzenle"
                    >
                      Düzenle
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {events.length === 0 && !eventsLoading && (
                <Box display="flex" flexDirection="column" alignItems="center" color="text.secondary" py={4}>
                  <InfoOutlinedIcon fontSize="large" sx={{ mb: 1 }} />
                  <Typography sx={{ fontSize: { xs: 15, sm: 17 } }}>Henüz etkinlik yok.</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}
        {/* Render edit dialogs at the root so they are always available */}
        <Dialog open={editPostDialogOpen} onClose={() => setEditPostDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Gönderiyi Düzenle</DialogTitle>
          <DialogContent>
            <TextField
              label="Gönderi içeriği"
              value={editPostContent}
              onChange={e => setEditPostContent(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Bağlantı (opsiyonel)"
              value={editPostLink}
              onChange={e => setEditPostLink(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 2, borderRadius: 2, alignSelf: 'flex-start' }}
            >
              Medya Yükle (Çoklu Seçim)
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={e => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    setEditPostMediaFiles(files);
                    setEditPostMediaPreviews(files.map(file => URL.createObjectURL(file)));
                  }
                }}
              />
            </Button>
            <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
              {(editPostMediaPreviews || []).map((url, idx) => (
                <Box key={idx} sx={{ position: 'relative', border: '1px solid #eee', borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
                  <Tooltip title="Kaldır" placement="top">
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 2, right: 2, zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)' }}
                      onClick={() => {
                        setEditPostMediaPreviews(prev => prev.filter((_, i) => i !== idx));
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {url.match(/video/) ? (
                    <video src={url} width={100} height={80} controls />
                  ) : (
                    <img src={url} alt="media" width={100} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  )}
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditPostDialogOpen(false)} color="inherit">İptal</Button>
            <Button
              variant="contained"
              onClick={async () => {
                if (!editingPost) return;
                let mediaUrls = editPostMediaPreviews;
                if (editPostMediaFiles.length > 0) {
                  mediaUrls = await uploadFilesToStorage(editPostMediaFiles, `clubPosts/${CLUB_ID}`);
                }
                const updatedPost = {
                  ...editingPost,
                  textContent: editPostContent,
                  link: editPostLink || undefined,
                  mediaUrls,
                };
                await ClubPostService.updatePost(CLUB_ID, editingPost.postId, updatedPost);
                setEditPostDialogOpen(false);
                setEditingPost(null);
                fetchPosts();
              }}
              color="primary"
            >
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={editEventDialogOpen} onClose={() => setEditEventDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Etkinliği Düzenle</DialogTitle>
          <DialogContent>
            <TextField
              label="Etkinlik adı"
              value={editEventName}
              onChange={e => setEditEventName(e.target.value)}
              required
              sx={{ mb: 2, minWidth: 200 }}
            />
            <TextField
              label="Tarih"
              type="date"
              value={editEventDate}
              onChange={e => setEditEventDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              sx={{ mb: 2, minWidth: 140 }}
            />
            <TextField
              label="Saat"
              type="time"
              value={editEventTime}
              onChange={e => setEditEventTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              sx={{ mb: 2, minWidth: 120 }}
            />
            <PlacesAutocomplete
              value={editEventLocation}
              onChange={setEditEventLocation}
              onSelect={(address: string) => {
                setEditEventLocation(address);
                setEditEventFormattedAddress(address);
              }}
              searchOptions={{ componentRestrictions: { country: 'tr' } }}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps, loading }: {
                getInputProps: (options?: any) => any;
                suggestions: Array<any>;
                getSuggestionItemProps: (suggestion: any) => any;
                loading: boolean;
              }) => (
                <Box sx={{ mb: 2, minWidth: 200, position: 'relative' }}>
                  <TextField
                    {...getInputProps({ placeholder: 'Konum ara...' })}
                    label="Konum"
                    fullWidth
                    inputProps={{ 'aria-label': 'Konum' }}
                    sx={{ fontSize: { xs: 14, sm: 16 } }}
                  />
                  <Box sx={{ position: 'absolute', zIndex: 10, background: 'white', width: '100%', borderRadius: 2, boxShadow: 2 }}>
                    {loading && <div>Yükleniyor...</div>}
                    {suggestions.map((suggestion: any) => (
                      <Box
                        {...getSuggestionItemProps(suggestion)}
                        key={suggestion.placeId}
                        sx={{ p: 1, cursor: 'pointer', background: suggestion.active ? '#f0f0f0' : 'white', borderBottom: '1px solid #eee' }}
                      >
                        {suggestion.description}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </PlacesAutocomplete>
            <TextField
              label="Açıklama"
              value={editEventDescription}
              onChange={e => setEditEventDescription(e.target.value)}
              sx={{ mb: 2, minWidth: 200 }}
              fullWidth
              multiline
              minRows={4}
            />
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 2, borderRadius: 2, alignSelf: 'flex-start' }}
            >
              Medya Yükle (Çoklu Seçim)
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={e => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    setEditEventMediaFiles(files);
                    setEditEventMediaPreviews(files.map(file => URL.createObjectURL(file)));
                  }
                }}
              />
            </Button>
            <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
              {(editEventMediaPreviews || []).map((url, idx) => (
                <Box key={idx} sx={{ position: 'relative', border: '1px solid #eee', borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
                  <Tooltip title="Kaldır" placement="top">
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 2, right: 2, zIndex: 2, bgcolor: 'rgba(255,255,255,0.7)' }}
                      onClick={() => {
                        setEditEventMediaPreviews(prev => prev.filter((_, i) => i !== idx));
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {url.match(/video/) ? (
                    <video src={url} width={100} height={80} controls />
                  ) : (
                    <img src={url} alt="media" width={100} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  )}
                </Box>
              ))}
            </Box>
            <TextField
              label="Bağlantı (opsiyonel)"
              value={editEventLink}
              onChange={e => setEditEventLink(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Kontenjan"
              type="number"
              value={editEventUnlimitedQuota ? '' : editEventQuota}
              onChange={e => setEditEventQuota(Number(e.target.value))}
              disabled={editEventUnlimitedQuota}
              sx={{ mb: 2, maxWidth: 120 }}
            />
            <FormControl sx={{ minWidth: 180, mb: 2 }}>
              <InputLabel>Tür</InputLabel>
              <Select
                value={editShowCustomType ? '+ Yeni Tür Ekle' : editEventType}
                label="Tür"
                onChange={e => {
                  if (e.target.value === '+ Yeni Tür Ekle') {
                    setEditShowCustomType(true);
                    setEditEventType('');
                  } else {
                    setEditShowCustomType(false);
                    setEditEventType(e.target.value);
                  }
                }}
              >
                {eventTypeOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {editShowCustomType && (
              <TextField
                label="Yeni Tür"
                value={editCustomEventType}
                onChange={e => setEditCustomEventType(e.target.value)}
                onBlur={() => {
                  if (editCustomEventType) {
                    setEditEventType(editCustomEventType);
                  }
                }}
                required
                sx={{ mb: 2, minWidth: 160 }}
              />
            )}
            <TextField
              label="Fiyat (₺)"
              type="number"
              value={editEventPrice}
              onChange={e => setEditEventPrice(e.target.value)}
              sx={{ mb: 2, maxWidth: 120 }}
            />
            <FormControl sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <input
                  type="checkbox"
                  checked={editEventUnlimitedQuota}
                  onChange={e => setEditEventUnlimitedQuota(e.target.checked)}
                  id="edit-unlimited-quota"
                />
                <label htmlFor="edit-unlimited-quota" style={{ fontSize: 15 }}>Limitsiz Kontenjan</label>
              </Box>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditEventDialogOpen(false)} color="inherit">İptal</Button>
            <Button
              variant="contained"
              onClick={async () => {
                if (!editingEvent) return;
                let mediaUrls = editEventMediaPreviews;
                if (editEventMediaFiles.length > 0) {
                  mediaUrls = await uploadFilesToStorage(editEventMediaFiles, `events/${CLUB_ID}`);
                }
                const selectedType = editShowCustomType && editCustomEventType ? editCustomEventType : editEventType;
                const updatedEvent = {
                  ...editingEvent,
                  title: editEventName,
                  date: editEventDate,
                  time: editEventTime,
                  location: editEventLocation,
                  formattedAddress: editEventFormattedAddress || editEventLocation,
                  description: editEventDescription,
                  mediaUrls,
                  link: editEventLink || undefined,
                  quota: editEventUnlimitedQuota ? 'limitsiz' : editEventQuota,
                  price: editEventPrice,
                  type: selectedType,
                  category: selectedType,
                };
                await EventService.updateEvent(editingEvent.eventId, updatedEvent);
                setEditEventDialogOpen(false);
                setEditingEvent(null);
                fetchEvents();
              }}
              color="primary"
            >
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ErrorBoundary>
  );
};

export default ClubManagementPanel; 