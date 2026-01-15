// Supabase Configuration
const SUPABASE_URL = 'https://axvntzjbbflzdlbemtun.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aB2UDNBfSVWDbUIawWWHdw_-uwkrgbf';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global Variables
let currentVideoId = null;
let videos = [];

// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const videoGrid = document.getElementById('videoGrid');
const emptyState = document.getElementById('emptyState');
const uploadForm = document.getElementById('uploadForm');
const videoFile = document.getElementById('videoFile');
const fileUploadArea = document.getElementById('fileUploadArea');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFile');
const uploadBtn = document.getElementById('uploadBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const loadingOverlay = document.getElementById('loadingOverlay');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Watch Page Elements
const videoPlayer = document.getElementById('videoPlayer');
const videoTitle = document.getElementById('videoTitle');
const videoDescription = document.getElementById('videoDescription');
const uploadDate = document.getElementById('uploadDate');
const likeBtn = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');
const shareBtn = document.getElementById('shareBtn');
const commentInput = document.getElementById('commentInput');
const postCommentBtn = document.getElementById('postCommentBtn');
const commentsList = document.getElementById('commentsList');
const noComments = document.getElementById('noComments');

// Share Modal Elements
const shareModal = document.getElementById('shareModal');
const closeShareModal = document.getElementById('closeShareModal');
const shareLink = document.getElementById('shareLink');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const shareBtns = document.querySelectorAll('.share-btn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupFileUpload();
    setupUploadForm();
    setupVideoActions();
    setupShareModal();
    loadVideos();
}

// Navigation
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
        });
    });
}

function showPage(pageName) {
    // Hide all pages
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
    
    // Update URL hash
    window.location.hash = pageName;
}

// File Upload
function setupFileUpload() {
    // Click to upload
    fileUploadArea.addEventListener('click', () => {
        videoFile.click();
    });
    
    // File selection
    videoFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });
    
    // Drag and drop
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });
    
    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            videoFile.files = e.dataTransfer.files;
            handleFileSelect(file);
        } else {
            showToast('Please select a valid video file', 'error');
        }
    });
    
    // Remove file
    removeFileBtn.addEventListener('click', () => {
        videoFile.value = '';
        fileInfo.style.display = 'none';
        fileUploadArea.style.display = 'block';
    });
}

function handleFileSelect(file) {
    // Validate file
    if (!file.type.startsWith('video/')) {
        showToast('Please select a valid video file', 'error');
        return;
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB
        showToast('File size must be less than 100MB', 'error');
        return;
    }
    
    // Show file info
    fileName.textContent = file.name;
    fileInfo.style.display = 'flex';
    fileUploadArea.style.display = 'none';
}

// Upload Form
function setupUploadForm() {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = videoFile.files[0];
        const title = document.getElementById('videoTitle').value;
        const description = document.getElementById('videoDescription').value;
        
        if (!file || !title) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        await uploadVideo(file, title, description);
    });
}

async function uploadVideo(file, title, description) {
    try {
        // Show progress
        progressContainer.style.display = 'block';
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        // Generate unique filename
        const fileName = `${Date.now()}-${file.name}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('videos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (uploadError) {
            throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from('videos')
            .getPublicUrl(fileName);
        
        // Save to database
        const { data: videoData, error: dbError } = await supabase
            .from('videos')
            .insert([{
                title,
                description,
                video_url: urlData.publicUrl,
                thumbnail_url: `https://picsum.photos/seed/${fileName}/640/360.jpg`
            }])
            .select();
        
        if (dbError) {
            throw dbError;
        }
        
        // Show success
        showToast('Video uploaded successfully!');
        
        // Reset form
        uploadForm.reset();
        videoFile.value = '';
        fileInfo.style.display = 'none';
        fileUploadArea.style.display = 'block';
        progressContainer.style.display = 'none';
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Video';
        
        // Redirect to home
        setTimeout(() => {
            showPage('home');
            loadVideos();
        }, 1500);
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed. Please try again.', 'error');
        
        // Reset UI
        progressContainer.style.display = 'none';
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Video';
    }
}

// Load Videos
async function loadVideos() {
    try {
        showLoading(true);
        
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        videos = data || [];
        displayVideos();
        
    } catch (error) {
        console.error('Load videos error:', error);
        showToast('Failed to load videos', 'error');
    } finally {
        showLoading(false);
    }
}

function displayVideos() {
    if (videos.length === 0) {
        videoGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    videoGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    videoGrid.innerHTML = videos.map(video => `
        <div class="video-card" onclick="watchVideo('${video.id}')">
            <div class="video-thumbnail">
                <img src="${video.thumbnail_url}" alt="${video.title}" loading="lazy">
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-meta">
                    <span>${formatDate(video.created_at)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Watch Video
async function watchVideo(videoId) {
    try {
        currentVideoId = videoId;
        
        const video = videos.find(v => v.id === videoId);
        if (!video) {
            showToast('Video not found', 'error');
            return;
        }
        
        // Update video player
        videoPlayer.src = video.video_url;
        videoTitle.textContent = video.title;
        videoDescription.textContent = video.description || 'No description available';
        uploadDate.textContent = formatDate(video.created_at);
        
        // Load likes and comments
        await loadLikes();
        await loadComments();
        
        // Show watch page
        showPage('watch');
        
        // Start playing video
        videoPlayer.play();
        
    } catch (error) {
        console.error('Watch video error:', error);
        showToast('Failed to load video', 'error');
    }
}

// Likes
async function loadLikes() {
    try {
        const { data, error } = await supabase
            .from('likes')
            .select('*')
            .eq('video_id', currentVideoId);
        
        if (error) {
            throw error;
        }
        
        const likeCountValue = data ? data.length : 0;
        likeCount.textContent = likeCountValue;
        
        // Check if user has liked (using localStorage for demo)
        const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
        if (likedVideos.includes(currentVideoId)) {
            likeBtn.classList.add('liked');
            likeBtn.innerHTML = '<i class="fas fa-heart"></i> <span id="likeCount">' + likeCountValue + '</span>';
        } else {
            likeBtn.classList.remove('liked');
            likeBtn.innerHTML = '<i class="far fa-heart"></i> <span id="likeCount">' + likeCountValue + '</span>';
        }
        
    } catch (error) {
        console.error('Load likes error:', error);
    }
}

async function toggleLike() {
    try {
        const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
        const isLiked = likedVideos.includes(currentVideoId);
        
        if (isLiked) {
            // Remove like
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('video_id', currentVideoId);
            
            if (error) throw error;
            
            // Update localStorage
            const newLikedVideos = likedVideos.filter(id => id !== currentVideoId);
            localStorage.setItem('likedVideos', JSON.stringify(newLikedVideos));
            
            likeBtn.classList.remove('liked');
            showToast('Like removed');
        } else {
            // Add like
            const { error } = await supabase
                .from('likes')
                .insert([{
                    video_id: currentVideoId
                }]);
            
            if (error) throw error;
            
            // Update localStorage
            likedVideos.push(currentVideoId);
            localStorage.setItem('likedVideos', JSON.stringify(likedVideos));
            
            likeBtn.classList.add('liked');
            showToast('Video liked!');
        }
        
        // Reload likes
        await loadLikes();
        
    } catch (error) {
        console.error('Toggle like error:', error);
        showToast('Failed to update like', 'error');
    }
}

// Comments
async function loadComments() {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('video_id', currentVideoId)
            .order('created_at', { ascending: true });
        
        if (error) {
            throw error;
        }
        
        displayComments(data || []);
        
    } catch (error) {
        console.error('Load comments error:', error);
    }
}

function displayComments(comments) {
    if (comments.length === 0) {
        commentsList.style.display = 'none';
        noComments.style.display = 'block';
        return;
    }
    
    commentsList.style.display = 'block';
    noComments.style.display = 'none';
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-text">${comment.comment_text}</div>
            <div class="comment-time">${formatDate(comment.created_at)}</div>
        </div>
    `).join('');
}

async function postComment() {
    try {
        const commentText = commentInput.value.trim();
        
        if (!commentText) {
            showToast('Please enter a comment', 'error');
            return;
        }
        
        const { error } = await supabase
            .from('comments')
            .insert([{
                video_id: currentVideoId,
                comment_text: commentText
            }]);
        
        if (error) {
            throw error;
        }
        
        // Clear input
        commentInput.value = '';
        
        // Reload comments
        await loadComments();
        
        showToast('Comment posted!');
        
    } catch (error) {
        console.error('Post comment error:', error);
        showToast('Failed to post comment', 'error');
    }
}

// Share Functionality
function setupShareModal() {
    shareBtn.addEventListener('click', () => {
        const url = `${window.location.origin}${window.location.pathname}#watch?id=${currentVideoId}`;
        shareLink.value = url;
        shareModal.classList.add('active');
    });
    
    closeShareModal.addEventListener('click', () => {
        shareModal.classList.remove('active');
    });
    
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.classList.remove('active');
        }
    });
    
    copyLinkBtn.addEventListener('click', () => {
        shareLink.select();
        document.execCommand('copy');
        showToast('Link copied to clipboard!');
    });
    
    shareBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.dataset.platform;
            const url = encodeURIComponent(shareLink.value);
            const text = encodeURIComponent('Check out this video!');
            
            let shareUrl = '';
            
            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${text}%20${url}`;
                    break;
            }
            
            window.open(shareUrl, '_blank', 'width=600,height=400');
        });
    });
}

// Video Actions
function setupVideoActions() {
    likeBtn.addEventListener('click', toggleLike);
    postCommentBtn.addEventListener('click', postComment);
    
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            postComment();
        }
    });
}

// Utility Functions
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    if (type === 'error') {
        toast.querySelector('i').className = 'fas fa-exclamation-circle';
        toast.querySelector('i').style.color = '#f44336';
    } else {
        toast.querySelector('i').className = 'fas fa-check-circle';
        toast.querySelector('i').style.color = '#4caf50';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

// Handle URL hash for direct video links
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    
    if (hash.startsWith('watch?id=')) {
        const videoId = hash.split('=')[1];
        if (videoId) {
            // Load videos first, then watch
            loadVideos().then(() => {
                watchVideo(videoId);
            });
        }
    } else if (hash) {
        showPage(hash);
    } else {
        showPage('home');
    }
});

// Check hash on initial load
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    
    if (hash.startsWith('watch?id=')) {
        const videoId = hash.split('=')[1];
        if (videoId) {
            loadVideos().then(() => {
                watchVideo(videoId);
            });
        }
    } else if (hash) {
        showPage(hash);
    }
});

// Simulate upload progress (for demo purposes)
function simulateUploadProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
    }, 200);
}

// Error handling for video player
videoPlayer.addEventListener('error', () => {
    showToast('Failed to load video', 'error');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && shareModal.classList.contains('active')) {
        shareModal.classList.remove('active');
    }
    
    // Space to pause/play video when on watch page
    if (e.key === ' ' && document.getElementById('watch').classList.contains('active')) {
        e.preventDefault();
        if (videoPlayer.paused) {
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }
    }
});
