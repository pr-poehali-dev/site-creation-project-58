import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/auth';

interface HeaderProps {
  user: User | null;
  onLoginClick: () => void;
  onSubscribeClick: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
}

export default function Header({ user, onLoginClick, onSubscribeClick, onLogout, onSearch }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-primary">{t('siteName')}</h1>
          
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full"
                >
                  <Icon name="Search" size={18} />
                </Button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-3">
            <Select value={i18n.language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="tr">Türkçe</SelectItem>
              </SelectContent>
            </Select>

            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.username}
                </span>
                <Button onClick={onLogout} variant="outline" size="sm">
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onLoginClick} variant="outline" size="sm">
                  {t('login')}
                </Button>
                <Button onClick={onSubscribeClick} size="sm">
                  {t('subscribe')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
