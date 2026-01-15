# VideoStream - Professional Video Platform

A modern YouTube-like video streaming website built with HTML5, CSS3, JavaScript and Supabase.

## Features

- 🎥 **Video Upload** - Easy drag-and-drop video upload with progress tracking
- 📺 **Video Player** - Responsive HTML5 video player with controls
- ❤️ **Like System** - Like/unlike videos with real-time count updates
- 💬 **Comments** - Add and view comments on videos
- 🔗 **Share Functionality** - Copy link and social media sharing
- 📱 **Fully Responsive** - Works perfectly on all devices
- 🌙 **Dark UI** - Modern YouTube-inspired dark theme
- ⚡ **Fast Loading** - Optimized performance with lazy loading

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL + Storage)
- **UI**: Modern CSS with animations and transitions
- **Icons**: Font Awesome

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy your Project URL and Publishable Key
3. Update the credentials in `script.js`:

```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_PUBLISHABLE_KEY';
```

### 2. Database Tables

Run these SQL queries in your Supabase SQL Editor:

```sql
-- Videos table
CREATE TABLE videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `videos`
3. Set up Row Level Security (RLS) policies:

```sql
-- Allow public access to videos
CREATE POLICY "Allow public access to videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- Allow public uploads to videos
CREATE POLICY "Allow public uploads to videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos');

-- Allow public updates to videos
CREATE POLICY "Allow public updates to videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'videos');

-- Allow public deletes to videos
CREATE POLICY "Allow public deletes to videos" ON storage.objects
FOR DELETE USING (bucket_id = 'videos');
```

### 4. Run the Website

1. Open `index.html` in your web browser
2. Or serve it with a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

3. Visit `http://localhost:8000` in your browser

## Usage

### Uploading Videos

1. Click the "Upload" button in the navigation
2. Drag and drop a video file or click to browse
3. Enter a title and optional description
4. Click "Upload Video"
5. Wait for the upload to complete

### Watching Videos

1. Click on any video thumbnail on the home page
2. Use the video player controls to play/pause
3. Like videos using the heart button
4. Add comments using the comment form
5. Share videos using the share button

### Sharing Videos

- Click the share button on any video page
- Copy the direct link
- Share on social media platforms
- Videos can be accessed directly via their URLs

## File Structure

```
website video/
├── index.html          # Main HTML file with all pages
├── styles.css          # Complete CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Features Details

### Home Page
- Grid layout similar to YouTube
- Video thumbnails with hover effects
- Video titles and upload dates
- Responsive grid that adapts to screen size

### Upload Page
- Drag-and-drop file upload
- File validation (video types only)
- Progress indicator during upload
- Form validation for title and description

### Watch Page
- Large responsive video player
- Video information display
- Like button with count
- Comment system with timestamps
- Share functionality with social media

### Design Features
- Modern dark theme inspired by YouTube
- Smooth animations and transitions
- Hover effects on interactive elements
- Mobile-responsive design
- Keyboard shortcuts (Space to play/pause, Escape to close modals)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Performance Optimizations

- Lazy loading for video thumbnails
- Optimized CSS animations
- Efficient JavaScript event handling
- Responsive image loading
- Minimal external dependencies

## Security Notes

- No authentication required (as specified)
- Public access to all videos
- Client-side validation with server-side verification
- Safe file upload handling in Supabase

## Troubleshooting

### Upload Issues
- Check file size (max 100MB)
- Verify file format (MP4, WebM, OGG)
- Ensure Supabase credentials are correct
- Check storage bucket permissions

### Video Playback Issues
- Verify video URL is accessible
- Check browser video format support
- Ensure CORS is configured in Supabase

### Database Issues
- Verify tables exist in Supabase
- Check RLS policies are correctly set
- Ensure API keys have proper permissions

## Future Enhancements

- Video search functionality
- User authentication system
- Video categories/tags
- Video editing capabilities
- Live streaming support
- Video analytics dashboard

## License

This project is open source and available under the MIT License.
