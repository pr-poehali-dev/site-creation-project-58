const VIDEOS_API = 'https://functions.poehali.dev/826a01d0-ba8e-4008-aee6-e8af852fbf7c';

export interface Video {
  id: number;
  title: string;
  tags: string[];
  external_url: string;
  image1_url: string;
  image2_url: string;
  image3_url: string;
  created_at: string;
  position: number;
}

export interface VideosResponse {
  videos: Video[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const fetchVideos = async (page: number = 1, search?: string, tag?: string): Promise<VideosResponse> => {
  const params = new URLSearchParams({ page: page.toString() });
  if (search) params.append('search', search);
  if (tag) params.append('tag', tag);
  
  const response = await fetch(`${VIDEOS_API}?${params.toString()}`);
  return response.json();
};

export const addVideo = async (
  videoData: {
    title: string;
    tags: string[];
    external_url: string;
    image1_url: string;
    image2_url: string;
    image3_url: string;
  },
  isAdmin: boolean
): Promise<{ success: boolean; id?: number; error?: string }> => {
  const response = await fetch(VIDEOS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Is-Admin': isAdmin.toString()
    },
    body: JSON.stringify(videoData)
  });
  
  return response.json();
};

export const deleteVideo = async (videoId: number, isAdmin: boolean): Promise<{ success: boolean; error?: string }> => {
  const response = await fetch(`${VIDEOS_API}?id=${videoId}`, {
    method: 'DELETE',
    headers: {
      'X-Is-Admin': isAdmin.toString()
    }
  });
  
  return response.json();
};
