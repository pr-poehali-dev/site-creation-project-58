import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Video } from '@/lib/videos';

interface VideoCardProps {
  video: Video;
  isAuthenticated: boolean;
  onTagClick: (tag: string) => void;
  onVideoClick: (video: Video) => void;
}

export default function VideoCard({ video, isAuthenticated, onTagClick, onVideoClick }: VideoCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [video.image1_url, video.image2_url, video.image3_url];

  const handleMouseEnter = () => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % 3);
    }, 500);
    
    return () => clearInterval(interval);
  };

  const handleMouseLeave = () => {
    setCurrentImage(0);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onVideoClick(video)}
    >
      <CardContent className="p-0">
        <div 
          className="relative aspect-video bg-muted"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={images[currentImage]}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-black/60 rounded-full p-4">
              <Icon name="Play" size={32} className="text-white" />
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
          <div className="flex flex-wrap gap-2">
            {video.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag);
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
