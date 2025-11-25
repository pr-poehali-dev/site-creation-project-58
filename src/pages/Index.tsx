import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import VideoCard from '@/components/VideoCard';
import Pagination from '@/components/Pagination';
import LoginDialog from '@/components/LoginDialog';
import SubscribeDialog from '@/components/SubscribeDialog';
import AdminPanel from '@/components/AdminPanel';
import { Button } from '@/components/ui/button';
import { fetchVideos, Video } from '@/lib/videos';
import { User, getStoredAuth, saveAuth, clearAuth } from '@/lib/auth';
import '../lib/i18n';
import Icon from '@/components/ui/icon';

export default function Index() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth) {
      setUser(auth.user);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [currentPage, searchQuery, tagFilter]);

  const loadVideos = async () => {
    try {
      const response = await fetchVideos(currentPage, searchQuery, tagFilter);
      setVideos(response.videos);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Failed to load videos:', error);
    }
  };

  const handleLoginSuccess = (userData: User, token: string) => {
    setUser(userData);
    saveAuth(userData, token);
  };

  const handleLogout = () => {
    setUser(null);
    clearAuth();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setTagFilter('');
    setCurrentPage(1);
  };

  const handleTagClick = (tag: string) => {
    setTagFilter(tag);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleVideoClick = (video: Video) => {
    if (user) {
      window.open(video.external_url, '_blank');
    } else {
      setSubscribeOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLoginClick={() => setLoginOpen(true)}
        onSubscribeClick={() => setSubscribeOpen(true)}
        onLogout={handleLogout}
        onSearch={handleSearch}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            {tagFilter && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t('tags')}: <strong>{tagFilter}</strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTagFilter('');
                    setCurrentPage(1);
                  }}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            )}
          </div>
          
          {user?.is_admin && (
            <Button onClick={() => setAdminOpen(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              {t('addVideo')}
            </Button>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 my-8">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isAuthenticated={!!user}
              onTagClick={handleTagClick}
              onVideoClick={handleVideoClick}
            />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      <SubscribeDialog
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
      />

      {user?.is_admin && (
        <AdminPanel
          open={adminOpen}
          onOpenChange={setAdminOpen}
          onVideoAdded={loadVideos}
        />
      )}
    </div>
  );
}
