import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Bell } from 'lucide-react';
import { Language, Theme, Profile, Message, UserProfile, ReportReason, FriendshipStatus } from './types';
import { INITIAL_PROFILES } from './data/mockProfiles';
import { Navbar } from './components/Navbar';
import { DiscoveryGrid } from './components/DiscoveryGrid';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { MessagingView } from './components/MessagingView';
import { UserProfileEditor } from './components/UserProfileEditor';
import { SettingsView } from './components/SettingsView';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AppLockModal } from './components/AppLockModal';
import { FriendsListModal } from './components/FriendsListModal';
import { ContactUsModal } from './components/ContactUsModal';

export default function App() {
  // Contact Us Modal state
  const [isContactUsOpen, setIsContactUsOpen] = useState(false);
  // Theme state
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('mawada_theme') as Theme) || 'dark';
  });

  // Language state (auto-detects phone/browser language if not saved)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('mawada_lang') as Language;
    if (saved && (saved === 'ar' || saved === 'fr')) return saved;
    // Auto detect phone / device language
    const sysLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    if (sysLang.startsWith('ar')) {
      return 'ar';
    }
    return 'fr';
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<'discovery' | 'messages' | 'profile' | 'settings'>('discovery');

  // App Lock Protection state (Protection d'application par mot de passe)
  const [isAppLockEnabled, setIsAppLockEnabled] = useState<boolean>(() => {
    return localStorage.getItem('mawada_app_lock_enabled') === 'true';
  });

  const [appPinCode, setAppPinCode] = useState<string>(() => {
    return localStorage.getItem('mawada_app_pin_code') || '1234';
  });

  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    return localStorage.getItem('mawada_app_lock_enabled') === 'true';
  });

  // Friends Modal state (قائمة الأصدقاء)
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);

  // User Privacy: hide friends list
  const [hideUserFriendsList, setHideUserFriendsList] = useState<boolean>(() => {
    return localStorage.getItem('mawada_hide_user_friends_list') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('mawada_hide_user_friends_list', hideUserFriendsList ? 'true' : 'false');
  }, [hideUserFriendsList]);

  // Friendship / Match Requests state per profile ID
  const [friendshipStatuses, setFriendshipStatuses] = useState<Record<string, FriendshipStatus>>(() => {
    const saved = localStorage.getItem('mawada_friendship_statuses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      p1: 'accepted',         // Amel (Already connected/friends for easy demo)
      p4: 'pending_received', // Riad sent a request to the user
      p7: 'pending_sent',     // User sent a request to Lynah
    };
  });

  // User's own profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mawada_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Walid',
      age: 28,
      gender: 'male',
      city: 'Alger',
      profession: 'Architecte Software',
      bio: 'Passionné de technologie, de rando dans le Djurdjura et de café noir. Je recherche une belle rencontre fondée sur la sincérité et le respect.',
      photos: [
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
      ],
      interests: ['High-Tech / تكنولوجيا', 'Randonnée / تجوال في الطبيعة', 'Café & Discuter / قهوة وحوار', 'Voyage / أسفار'],
      isVerified: true,
      lookingFor: 'Relation sérieuse / Mariage',
      lat: 36.7538,
      lng: 3.0588,
      locationName: 'Alger, Algérie'
    };
  });

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{
    lat?: number;
    lng?: number;
    city: string;
    isGpsActive: boolean;
    accuracy?: number;
  }>({
    lat: userProfile.lat || 36.7538,
    lng: userProfile.lng || 3.0588,
    city: userProfile.city || 'Alger',
    isGpsActive: false
  });

  const handleEnableGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
            city: userProfile.city || 'Alger',
            isGpsActive: true,
            accuracy: Math.round(accuracy)
          });
          setUserProfile((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            locationName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
        },
        (err) => {
          console.warn('Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const handleImpersonateSwitch = (profile: Profile) => {
    setUserProfile({
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      city: profile.city,
      profession: profile.profession,
      bio: profile.bio,
      photos: profile.photos,
      interests: profile.interests,
      isVerified: profile.isVerified,
      lookingFor: profile.lookingFor || 'Mariage',
      lat: profile.lat,
      lng: profile.lng,
      locationName: profile.city
    });
    if (profile.lat && profile.lng) {
      setUserLocation({
        lat: profile.lat,
        lng: profile.lng,
        city: profile.city,
        isGpsActive: true
      });
    }
  };

  // Profiles List
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('mawada_admin_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 30) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_PROFILES;
  });

  useEffect(() => {
    localStorage.setItem('mawada_admin_profiles', JSON.stringify(profiles));
  }, [profiles]);

  // Admin Control Panel & Custom Rules State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [voiceUnlockCount, setVoiceUnlockCount] = useState<number>(20);
  const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(true);

  // Admin Profile Handlers
  const handleAddProfile = (newProfile: Profile) => {
    setProfiles((prev) => [newProfile, ...prev]);
  };

  const handleUpdateProfile = (updatedProfile: Profile) => {
    setProfiles((prev) => prev.map((p) => p.id === updatedProfile.id ? updatedProfile : p));
  };

  const handleDeleteProfile = (profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
  };

  const handleBanToggleProfile = (profileId: string) => {
    setProfiles((prev) => prev.map((p) => p.id === profileId ? { ...p, isBanned: !p.isBanned } : p));
  };

  const handleClearConversation = (profileId: string) => {
    setMessages((prev) => prev.filter((m) => m.senderId !== profileId && m.receiverId !== profileId));
  };

  const handleSendMessageFromMock = (senderId: string, receiverId: string, text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: 'msg_admin_' + Date.now() + Math.random().toString().slice(2, 5),
      senderId,
      receiverId: receiverId === 'user' ? 'user' : receiverId,
      text,
      timestamp: timeStr,
      isRead: true
    };
    setMessages((prev) => [...prev, newMsg]);

    const senderProfile = profiles.find((p) => p.id === senderId);
    triggerMessageNotification(senderProfile ? senderProfile.name : 'Membre', senderId);
  };

  // Likes state
  const [likedProfileIds, setLikedProfileIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mawada_liked_ids');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ['p1', 'p4', 'p7']; // Initial pre-liked profiles for demo
  });

  const [blockedProfileIds, setBlockedProfileIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mawada_blocked_ids');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Track blocked identity signatures for blocking future new accounts
  const [blockedFutureIdentifiers, setBlockedFutureIdentifiers] = useState<string[]>(() => {
    const saved = localStorage.getItem('mawada_blocked_future_ids');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('mawada_blocked_future_ids', JSON.stringify(blockedFutureIdentifiers));
  }, [blockedFutureIdentifiers]);

  // Messages State
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('mawada_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'm1',
        senderId: 'p1',
        receiverId: 'user',
        text: 'Salam Walid ! Ravie de voir que nous partageons la passion de l\'architecture et du design 😊',
        timestamp: '10:15',
        isRead: true
      },
      {
        id: 'm2',
        senderId: 'user',
        receiverId: 'p1',
        text: 'Wa alaykom salam Amel ! Tout à fait, tes projets d\'aménagement intérieur sont magnifiques.',
        timestamp: '10:20',
        isRead: true
      },
      {
        id: 'm3',
        senderId: 'p7',
        receiverId: 'user',
        text: 'Azul ! Tu aimes la randonnée à Gouraya toi aussi ?',
        timestamp: 'Hier',
        isRead: false
      }
    ];
  });

  // Modal states
  const [selectedDetailProfile, setSelectedDetailProfile] = useState<Profile | null>(null);
  const [reportingProfile, setReportingProfile] = useState<Profile | null>(null);
  const [activeChatProfileId, setActiveChatProfileId] = useState<string | null>('p1');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Discreet, non-intrusive incoming message notification (No message content revealed)
  const [incomingNotification, setIncomingNotification] = useState<{ senderName: string; profileId: string } | null>(null);
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerMessageNotification = (senderName: string, profileId: string) => {
    // Single discreet notification - reset timer if another comes to avoid continuous spam
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setIncomingNotification({ senderName, profileId });
    notificationTimerRef.current = setTimeout(() => {
      setIncomingNotification(null);
    }, 4000);
  };

  // Sync theme & language DOM attributes
  useEffect(() => {
    localStorage.setItem('mawada_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mawada_lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // Persist local state
  useEffect(() => {
    localStorage.setItem('mawada_friendship_statuses', JSON.stringify(friendshipStatuses));
  }, [friendshipStatuses]);

  useEffect(() => {
    localStorage.setItem('mawada_app_lock_enabled', isAppLockEnabled ? 'true' : 'false');
  }, [isAppLockEnabled]);

  useEffect(() => {
    localStorage.setItem('mawada_app_pin_code', appPinCode);
  }, [appPinCode]);

  const handleToggleAppLock = (enabled: boolean, newPin?: string) => {
    setIsAppLockEnabled(enabled);
    if (newPin) {
      setAppPinCode(newPin);
    }
  };

  const handleLockApp = () => {
    if (isAppLockEnabled) {
      setIsAppLocked(true);
    }
  };

  useEffect(() => {
    localStorage.setItem('mawada_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('mawada_liked_ids', JSON.stringify(likedProfileIds));
  }, [likedProfileIds]);

  useEffect(() => {
    localStorage.setItem('mawada_blocked_ids', JSON.stringify(blockedProfileIds));
  }, [blockedProfileIds]);

  useEffect(() => {
    localStorage.setItem('mawada_messages', JSON.stringify(messages));
  }, [messages]);

  // Friendship request handlers
  const handleSendFriendRequest = (profileId: string) => {
    setFriendshipStatuses((prev) => ({
      ...prev,
      [profileId]: 'pending_sent'
    }));
  };

  const handleAcceptFriendRequest = (profileId: string) => {
    setFriendshipStatuses((prev) => ({
      ...prev,
      [profileId]: 'accepted'
    }));
  };

  const handleDeclineFriendRequest = (profileId: string) => {
    setFriendshipStatuses((prev) => ({
      ...prev,
      [profileId]: 'declined'
    }));
  };

  // Handle Like action
  const handleLike = (profile: Profile) => {
    if (likedProfileIds.includes(profile.id)) {
      setLikedProfileIds((prev) => prev.filter((id) => id !== profile.id));
    } else {
      setLikedProfileIds((prev) => [...prev, profile.id]);
    }
  };

  // Handle Start Chat directly
  const handleStartChat = (profile: Profile) => {
    setActiveChatProfileId(profile.id);
    setActiveTab('messages');
  };

  // Handle Send Message
  const handleSendMessage = (
    receiverId: string,
    text: string,
    mediaUrl?: string,
    isAudio?: boolean,
    audioDuration?: number,
    audioUrl?: string
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isBotReply = receiverId === 'user';
    const actualSender = isBotReply ? (activeChatProfileId || 'p1') : 'user';
    const actualReceiver = isBotReply ? 'user' : receiverId;

    const newMsg: Message = {
      id: 'msg_' + Date.now() + Math.random().toString().slice(2, 5),
      senderId: actualSender,
      receiverId: actualReceiver,
      text,
      timestamp: timeStr,
      isRead: true,
      mediaUrl,
      isAudio,
      audioDuration,
      audioUrl
    };

    setMessages((prev) => [...prev, newMsg]);

    // Trigger non-intrusive notification when receiving message from contact (no message content revealed)
    if (actualSender !== 'user') {
      const senderProfile = profiles.find((p) => p.id === actualSender);
      const senderName = senderProfile ? senderProfile.name : '';
      triggerMessageNotification(senderName, actualSender);
    }
  };

  // Handle Delete Message (undo error / sent message deletion)
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  // Handle Report & Block
  const handleConfirmReport = (profileId: string, reason: ReportReason, blockAlso: boolean, blockFutureAccounts?: boolean) => {
    if (blockAlso) {
      setBlockedProfileIds((prev) => Array.from(new Set([...prev, profileId])));
      setLikedProfileIds((prev) => prev.filter((id) => id !== profileId));
      if (activeChatProfileId === profileId) {
        setActiveChatProfileId(null);
      }

      if (blockFutureAccounts) {
        const prof = profiles.find((p) => p.id === profileId);
        if (prof) {
          setBlockedFutureIdentifiers((prev) =>
            Array.from(new Set([...prev, prof.id, prof.name.toLowerCase()]))
          );
        }
      }
    }
  };

  const handleUnblockProfile = (profileId: string) => {
    setBlockedProfileIds((prev) => prev.filter((id) => id !== profileId));
  };

  // Handle Permanent Account Deletion with complete data clearance
  const handleDeleteAccountPermanently = () => {
    // Clear user profile data
    const blankProfile: UserProfile = {
      name: '',
      age: 20,
      gender: 'male',
      city: 'Alger',
      profession: '',
      bio: '',
      photos: [],
      interests: [],
      isVerified: false,
      lookingFor: '',
    };
    setUserProfile(blankProfile);
    setMessages([]);
    setLikedProfileIds([]);
    setFriendshipStatuses({});
    
    localStorage.removeItem('mawada_user_profile');
    localStorage.removeItem('mawada_messages');
    localStorage.removeItem('mawada_liked_ids');
    localStorage.removeItem('mawada_friendship_statuses');

    // Switch to discovery & open AuthModal to re-register/login
    setActiveTab('discovery');
    setIsAuthModalOpen(true);
  };

  // Filter out blocked profiles from discovery and contacts (both profile ID & future account blocked names)
  const visibleProfiles = profiles.filter((p) => {
    if (blockedProfileIds.includes(p.id)) return false;
    if (blockedFutureIdentifiers.includes(p.id)) return false;
    if (blockedFutureIdentifiers.includes(p.name.toLowerCase())) return false;
    return true;
  });

  const blockedProfilesList = profiles.filter((p) => blockedProfileIds.includes(p.id));

  // Count unread messages and pending friend requests for badge notifications
  const unreadMessagesCount = messages.filter((m) => m.receiverId === 'user' && !m.isRead).length;
  const pendingRequestsCount = profiles.filter((p) => (friendshipStatuses[p.id] || 'none') === 'pending_received').length;
  const acceptedFriendsCount = profiles.filter((p) => (friendshipStatuses[p.id] || 'none') === 'accepted').length;

  return (
    <div className="min-h-screen bg-[#0A0F1D] dark:bg-[#0A0F1D] text-slate-100 font-sans transition-colors duration-200 pb-16 md:pb-0">
      
      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        unreadMessagesCount={unreadMessagesCount}
        pendingRequestsCount={pendingRequestsCount}
        friendsCount={acceptedFriendsCount}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        isAppLockEnabled={isAppLockEnabled}
        onLockApp={handleLockApp}
        onOpenFriendsModal={() => setIsFriendsModalOpen(true)}
        onOpenContactUs={() => setIsContactUsOpen(true)}
      />

      {/* Non-intrusive Discreet Incoming Message Notification (No message content revealed) */}
      {incomingNotification && (
        <div className="fixed top-18 right-4 left-4 md:left-auto z-50 animate-fadeIn">
          <div
            onClick={() => {
              setActiveChatProfileId(incomingNotification.profileId);
              setActiveTab('messages');
              setIncomingNotification(null);
            }}
            className="cursor-pointer bg-[#0F172A]/95 border border-amber-500/40 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between space-x-3 rtl:space-x-reverse backdrop-blur-md hover:bg-[#1E293B] transition-all max-w-sm ml-auto"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 font-bold text-xs shadow-inner">
                <MessageSquare className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-xs font-bold text-slate-100 truncate">
                  {language === 'fr'
                    ? `Nouveau message ${incomingNotification.senderName ? `de ${incomingNotification.senderName}` : ''}`
                    : `رسالة جديدة ${incomingNotification.senderName ? `من ${incomingNotification.senderName}` : ''}`}
                </p>
                <p className="text-[10px] text-amber-400/90 font-medium tracking-tight">
                  {language === 'fr'
                    ? '🔒 Appuyez pour ouvrir la messagerie'
                    : '🔒 اضغط للفتح (المحتوى محمي ومخفي)'}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIncomingNotification(null);
              }}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Fermer / إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Views Container */}
      <main className="w-full">
        {activeTab === 'discovery' && (
          <DiscoveryGrid
            profiles={visibleProfiles}
            likedProfileIds={likedProfileIds}
            friendshipStatuses={friendshipStatuses}
            onSendFriendRequest={handleSendFriendRequest}
            onAcceptFriendRequest={handleAcceptFriendRequest}
            onDeclineFriendRequest={handleDeclineFriendRequest}
            language={language}
            onLike={handleLike}
            onOpenDetails={(p) => setSelectedDetailProfile(p)}
            userLat={userLocation.lat}
            userLng={userLocation.lng}
            userCity={userLocation.city}
            isGpsActive={userLocation.isGpsActive}
            onEnableGps={handleEnableGps}
          />
        )}

        {activeTab === 'messages' && (
          <MessagingView
            allProfiles={visibleProfiles}
            activeProfileId={activeChatProfileId}
            setActiveProfileId={setActiveChatProfileId}
            messages={messages}
            friendshipStatuses={friendshipStatuses}
            onSendFriendRequest={handleSendFriendRequest}
            onAcceptFriendRequest={handleAcceptFriendRequest}
            onDeclineFriendRequest={handleDeclineFriendRequest}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            language={language}
            onOpenReportModal={(p) => setReportingProfile(p)}
            onOpenDetails={(p) => setSelectedDetailProfile(p)}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileEditor
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            language={language}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            blockedProfiles={blockedProfilesList}
            onUnblockProfile={handleUnblockProfile}
            onDeleteAccountPermanently={handleDeleteAccountPermanently}
            onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
            isAppLockEnabled={isAppLockEnabled}
            appPinCode={appPinCode}
            onToggleAppLock={handleToggleAppLock}
            onLockApp={handleLockApp}
            onOpenFriendsModal={() => setIsFriendsModalOpen(true)}
            friendsCount={profiles.filter(p => (friendshipStatuses[p.id] || 'none') === 'accepted').length}
            hideFriendsList={hideUserFriendsList}
            onToggleHideFriendsList={(hide) => setHideUserFriendsList(hide)}
            onOpenContactUs={() => setIsContactUsOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <FriendsListModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
        language={language}
        profiles={profiles}
        friendshipStatuses={friendshipStatuses}
        onUpdateFriendship={(profileId, status) => {
          setFriendshipStatuses((prev) => ({
            ...prev,
            [profileId]: status
          }));
        }}
        onSelectChatPartner={(profileId) => {
          setActiveChatProfileId(profileId);
          setActiveTab('messages');
          setIsFriendsModalOpen(false);
        }}
        onSelectProfile={(p) => setSelectedDetailProfile(p)}
      />

      <AppLockModal
        isLocked={isAppLocked}
        correctPin={appPinCode}
        onUnlock={() => setIsAppLocked(false)}
        language={language}
      />
      <ProfileDetailModal
        profile={selectedDetailProfile}
        onClose={() => setSelectedDetailProfile(null)}
        language={language}
        isLiked={selectedDetailProfile ? likedProfileIds.includes(selectedDetailProfile.id) : false}
        friendshipStatus={selectedDetailProfile ? (friendshipStatuses[selectedDetailProfile.id] || 'none') : 'none'}
        allProfiles={profiles}
        onSendFriendRequest={handleSendFriendRequest}
        onAcceptFriendRequest={handleAcceptFriendRequest}
        onDeclineFriendRequest={handleDeclineFriendRequest}
        onLike={handleLike}
        onStartChat={handleStartChat}
        onOpenReportModal={(p) => {
          setSelectedDetailProfile(null);
          setReportingProfile(p);
        }}
        userInterests={userProfile.interests}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        userCity={userLocation.city}
      />

      <ReportModal
        profile={reportingProfile}
        onClose={() => setReportingProfile(null)}
        language={language}
        onConfirmReport={handleConfirmReport}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
        onLoginSuccess={(data) => {
          setUserProfile((prev) => ({
            ...prev,
            ...data
          }));
        }}
      />

      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        language={language}
        profiles={profiles}
        messages={messages}
        onAddProfile={handleAddProfile}
        onUpdateProfile={handleUpdateProfile}
        onDeleteProfile={handleDeleteProfile}
        onBanToggleProfile={handleBanToggleProfile}
        onDeleteMessage={handleDeleteMessage}
        onClearConversation={handleClearConversation}
        totalMessagesCount={messages.length}
        onSendMessageFromMock={handleSendMessageFromMock}
        voiceUnlockCount={voiceUnlockCount}
        setVoiceUnlockCount={setVoiceUnlockCount}
        requireEmailVerification={requireEmailVerification}
        setRequireEmailVerification={setRequireEmailVerification}
        userProfile={userProfile}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        userCity={userLocation.city}
        isGpsActive={userLocation.isGpsActive}
        onEnableGps={handleEnableGps}
        onImpersonateSwitch={handleImpersonateSwitch}
      />

      <ContactUsModal
        isOpen={isContactUsOpen}
        onClose={() => setIsContactUsOpen(false)}
        language={language}
        userName={userProfile.name}
      />

    </div>
  );
}
