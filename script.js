   let bookmarks = [];
        let filteredBookmarks = [];

        // Load bookmarks from localStorage on page load
        function loadBookmarks() {
            const saved = localStorage.getItem('floatingBookmarks');
            if (saved) {
                try {
                    bookmarks = JSON.parse(saved);
                    filteredBookmarks = [...bookmarks];
                    renderBookmarks();
                    updateCounter();
                } catch (e) {
                    console.error('Error loading bookmarks:', e);
                    bookmarks = [];
                    filteredBookmarks = [];
                }
            }
        }

        // Save bookmarks to localStorage
        function saveBookmarks() {
            localStorage.setItem('floatingBookmarks', JSON.stringify(bookmarks));
        }

        // Generate random position for floating icons
        function getRandomPosition() {
            const container = document.getElementById('bookmarkContainer');
            const maxX = container.clientWidth - 80;
            const maxY = container.clientHeight - 80;
            return {
                x: Math.random() * Math.max(maxX, 0) + 20,
                y: Math.random() * Math.max(maxY, 0) + 20
            };
        }

        // Get favicon URL
        function getFaviconUrl(url) {
            try {
                const domain = new URL(url).hostname;
                return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
            } catch (e) {
                return null;
            }
        }

        // Create bookmark element
        function createBookmarkElement(bookmark, index) {
            const position = getRandomPosition();
            const faviconUrl = getFaviconUrl(bookmark.url);
            
            const bookmarkEl = document.createElement('div');
            bookmarkEl.className = 'bookmark-icon';
            bookmarkEl.style.left = position.x + 'px';
            bookmarkEl.style.top = position.y + 'px';
            bookmarkEl.style.animationDelay = (index * 0.5) + 's';
            bookmarkEl.onclick = () => window.open(bookmark.url, '_blank');
            
            const actionsEl = document.createElement('div');
            actionsEl.className = 'bookmark-actions';
            actionsEl.innerHTML = `<button class="delete-btn" onclick="event.stopPropagation(); deleteBookmark(${index})">×</button>`;
            
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'bookmark-tooltip';
            tooltipEl.textContent = bookmark.title;
            
            if (faviconUrl) {
                const img = document.createElement('img');
                img.src = faviconUrl;
                img.onerror = () => {
                    img.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-icon';
                    fallback.textContent = '🌐';
                    bookmarkEl.appendChild(fallback);
                };
                bookmarkEl.appendChild(img);
            } else {
                const fallback = document.createElement('div');
                fallback.className = 'fallback-icon';
                fallback.textContent = '🌐';
                bookmarkEl.appendChild(fallback);
            }
            
            bookmarkEl.appendChild(actionsEl);
            bookmarkEl.appendChild(tooltipEl);
            
            return bookmarkEl;
        }

        // Render all bookmarks
        function renderBookmarks() {
            const container = document.getElementById('bookmarkContainer');
            container.innerHTML = '';
            
            filteredBookmarks.forEach((bookmark, index) => {
                const bookmarkEl = createBookmarkElement(bookmark, index);
                container.appendChild(bookmarkEl);
            });
        }

        // Update bookmark counter
        function updateCounter() {
            const counter = document.getElementById('bookmarkCounter');
            const count = filteredBookmarks.length;
            counter.textContent = `${count} Bookmark${count !== 1 ? 's' : ''}`;
        }

        // Open add bookmark modal
        function openAddModal() {
            document.getElementById('addModal').style.display = 'block';
            document.getElementById('bookmarkTitle').focus();
        }

        // Close add bookmark modal
        function closeAddModal() {
            document.getElementById('addModal').style.display = 'none';
            document.getElementById('bookmarkTitle').value = '';
            document.getElementById('bookmarkUrl').value = '';
        }

        // Add new bookmark
        function addBookmark() {
            const title = document.getElementById('bookmarkTitle').value.trim();
            const url = document.getElementById('bookmarkUrl').value.trim();
            
            if (!title || !url) {
                alert('Please fill in both title and URL');
                return;
            }
            
            // Add protocol if missing
            let formattedUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                formattedUrl = 'https://' + url;
            }
            
            const newBookmark = {
                id: Date.now(),
                title: title,
                url: formattedUrl
            };
            
            bookmarks.push(newBookmark);
            saveBookmarks();
            
            // Re-filter bookmarks based on current search
            filterBookmarks();
            
            closeAddModal();
        }

        // Delete bookmark
        function deleteBookmark(index) {
            if (confirm('Are you sure you want to delete this bookmark?')) {
                const bookmarkToDelete = filteredBookmarks[index];
                const originalIndex = bookmarks.findIndex(b => b.id === bookmarkToDelete.id);
                
                if (originalIndex !== -1) {
                    bookmarks.splice(originalIndex, 1);
                    saveBookmarks();
                    filterBookmarks();
                }
            }
        }

        // Filter bookmarks based on search
        function filterBookmarks() {
            const searchTerm = document.getElementById('searchBar').value.toLowerCase();
            
            if (searchTerm) {
                filteredBookmarks = bookmarks.filter(bookmark => 
                    bookmark.title.toLowerCase().includes(searchTerm) ||
                    bookmark.url.toLowerCase().includes(searchTerm)
                );
            } else {
                filteredBookmarks = [...bookmarks];
            }
            
            renderBookmarks();
            updateCounter();
        }

        // Search functionality
        document.getElementById('searchBar').addEventListener('input', filterBookmarks);

        // Modal keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAddModal();
            }
            if (e.key === 'Enter' && document.getElementById('addModal').style.display === 'block') {
                addBookmark();
            }
        });

        // Close modal when clicking outside
        document.getElementById('addModal').addEventListener('click', (e) => {
            if (e.target.className === 'modal') {
                closeAddModal();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            setTimeout(renderBookmarks, 100);
        });

        // Initialize app
        document.addEventListener('DOMContentLoaded', () => {
            loadBookmarks();
        });

        // Watch for localStorage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'floatingBookmarks') {
                loadBookmarks();
            }
        });