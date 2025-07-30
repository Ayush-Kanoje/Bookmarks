let bookmarks = [];
        let filteredBookmarks = [];
        let currentShareFormat = 'json';
        let pendingImportData = null;

        // Load bookmarks from memory (since localStorage is not supported)
        function loadBookmarks() {
            // Initialize with sample data or keep existing bookmarks
            if (bookmarks.length === 0) {
                initializeSampleData();
            }
            filteredBookmarks = [...bookmarks];
            renderBookmarks();
            updateCounter();
        }

        // Save bookmarks (in memory only)
        function saveBookmarks() {
            // In a real environment, this would save to localStorage
            // For now, bookmarks persist only during the session
            console.log('Bookmarks saved to memory:', bookmarks.length);
        }

        // Use high-quality favicon sources for better clarity
        function getFaviconUrl(url) {
            try {
                const domain = new URL(url).hostname;
                // Prioritize Google's high-resolution favicon service for clarity.
                return [
                    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
                    `https://icons.duckduckgo.com/ip3/${domain}.ico`
                ];
            } catch (e) {
                return [];
            }
        }

        // Generate random starting position for screen-wide floating
        function getRandomPosition() {
            const viewportHeight = window.innerHeight;
            const iconSize = 60; // Adjusted for new smaller icon size
            const headerHeight = 120; // Approximate header height
            
            // Start from left side of screen at various heights
            return {
                x: -iconSize, // Start off-screen left
                y: Math.random() * (viewportHeight - headerHeight - iconSize) + headerHeight
            };
        }

        // Check if position is too close to existing bookmarks (not needed for screen-wide movement)
        function isPositionOccupied(newPos) {
            return false; // Allow overlapping since they're moving across screen
        }

        // Enhanced bookmark element creation with screen-wide floating
        function createBookmarkElement(bookmark, index) {
            const position = getRandomPosition();
            const faviconUrls = getFaviconUrl(bookmark.url);
            
            const bookmarkEl = document.createElement('div');
            bookmarkEl.className = 'bookmark-icon floating';
            bookmarkEl.style.left = position.x + 'px';
            bookmarkEl.style.top = position.y + 'px';
            
            // Stagger animation start times to prevent clustering
            const animationDelay = (index * 3) + Math.random() * 2;
            bookmarkEl.style.animationDelay = animationDelay + 's';
            
            // Add different animation durations for variety
            const baseDuration = 15;
            const variation = Math.random() * 10 - 5; // -5 to +5 seconds
            bookmarkEl.style.animationDuration = (baseDuration + variation) + 's';
            
            bookmarkEl.onclick = (e) => {
                e.stopPropagation();
                window.open(bookmark.url, '_blank');
            };
            
            const actionsEl = document.createElement('div');
            actionsEl.className = 'bookmark-actions';
            actionsEl.innerHTML = `<button class="delete-btn" onclick="event.stopPropagation(); deleteBookmark(${index})" title="Delete bookmark">×</button>`;
            
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'bookmark-tooltip';
            tooltipEl.textContent = bookmark.title;
            
            // Enhanced hover behavior to pause animation and scale in place
            bookmarkEl.addEventListener('mouseenter', () => {
                const computedStyle = window.getComputedStyle(bookmarkEl);
                const currentTransform = computedStyle.transform;

                // Apply current transform and add scaling, then pause animation
                if (currentTransform && currentTransform !== 'none') {
                    bookmarkEl.style.transform = `${currentTransform} scale(1.3)`;
                } else {
                    bookmarkEl.style.transform = 'scale(1.3)';
                }
                bookmarkEl.style.animationPlayState = 'paused';
            });
            
            bookmarkEl.addEventListener('mouseleave', () => {
                // Clear inline transform to let CSS animation take over
                bookmarkEl.style.transform = '';
                bookmarkEl.style.animationPlayState = 'running';
            });
            
            // Try multiple favicon sources
            if (faviconUrls.length > 0) {
                const img = document.createElement('img');
                let urlIndex = 0;
                
                const tryNextUrl = () => {
                    if (urlIndex < faviconUrls.length) {
                        img.src = faviconUrls[urlIndex];
                        urlIndex++;
                    } else {
                        // All URLs failed, show fallback
                        img.style.display = 'none';
                        showFallback();
                    }
                };
                
                const showFallback = () => {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-icon';
                    // Use different icons based on domain
                    const domain = bookmark.url.toLowerCase();
                    if (domain.includes('github')) {
                        fallback.textContent = '💻';
                    } else if (domain.includes('youtube') || domain.includes('video')) {
                        fallback.textContent = '📺';
                    } else if (domain.includes('twitter') || domain.includes('social')) {
                        fallback.textContent = '🐦';
                    } else if (domain.includes('shop') || domain.includes('buy')) {
                        fallback.textContent = '🛒';
                    } else if (domain.includes('news')) {
                        fallback.textContent = '📰';
                    } else {
                        fallback.textContent = '🌐';
                    }
                    bookmarkEl.appendChild(fallback);
                };
                
                img.onload = () => {
                    // Image loaded successfully
                    bookmarkEl.appendChild(img);
                };
                
                img.onerror = tryNextUrl;
                
                // Start trying the first URL
                tryNextUrl();
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

        // Render all bookmarks with staggered animation
        function renderBookmarks() {
            const container = document.getElementById('bookmarkContainer');
            container.innerHTML = '';
            
            filteredBookmarks.forEach((bookmark, index) => {
                setTimeout(() => {
                    const bookmarkEl = createBookmarkElement(bookmark, index);
                    container.appendChild(bookmarkEl);
                    
                    // Add entrance animation
                    bookmarkEl.style.opacity = '0';
                    bookmarkEl.style.transform = 'scale(0) translateY(-50px)';
                    
                    requestAnimationFrame(() => {
                        bookmarkEl.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                        bookmarkEl.style.opacity = '1';
                        bookmarkEl.style.transform = 'scale(1) translateY(0)';
                    });
                }, index * 100);
            });
        }

        // Update bookmark counter with animation
        function updateCounter() {
            const counter = document.getElementById('bookmarkCounter');
            const count = filteredBookmarks.length;
            counter.style.transform = 'scale(0.8)';
            setTimeout(() => {
                counter.textContent = `${count} Bookmark${count !== 1 ? 's' : ''}`;
                counter.style.transform = 'scale(1)';
            }, 150);
        }

        function openAddModal() {
            document.getElementById('addModal').style.display = 'block';
            document.getElementById('bookmarkTitle').focus();
        }

        function closeAddModal() {
            document.getElementById('addModal').style.display = 'none';
            document.getElementById('bookmarkTitle').value = '';
            document.getElementById('bookmarkUrl').value = '';
        }

        // Share functionality
        function openShareModal() {
            document.getElementById('shareModal').style.display = 'block';
            updateShareContent();
            updateShareStats();
        }

        function closeShareModal() {
            document.getElementById('shareModal').style.display = 'none';
        }

        function setShareFormat(format) {
            currentShareFormat = format;
            
            // Update button states
            document.querySelectorAll('.share-option-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(format + 'Btn').classList.add('active');
            
            updateShareContent();
        }

        function updateShareStats() {
            const totalBookmarks = bookmarks.length;
            const createdDate = new Date().toLocaleDateString();
            
            document.getElementById('shareStats').textContent = `Total bookmarks: ${totalBookmarks}`;
            document.getElementById('shareCreated').textContent = `Created: ${createdDate}`;
        }

        function updateShareContent() {
            const shareCode = document.getElementById('shareCode');
            let content = '';

            switch (currentShareFormat) {
                case 'json':
                    content = JSON.stringify({
                        version: '1.0',
                        created: new Date().toISOString(),
                        bookmarks: bookmarks
                    }, null, 2);
                    break;
                    
                case 'html':
                    content = generateHTMLExport();
                    break;
                    
                case 'text':
                    content = generateTextExport();
                    break;
            }
            
            shareCode.value = content;
        }

        function generateHTMLExport() {
            let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Floating Bookmarks Export</TITLE>
<H1>Floating Bookmarks</H1>
<DL><p>
`;
            
            bookmarks.forEach(bookmark => {
                html += `    <DT><A HREF="${bookmark.url}">${bookmark.title}</A>\n`;
            });
            
            html += `</DL><p>`;
            return html;
        }

        function generateTextExport() {
            let text = `Floating Bookmarks Export\n`;
            text += `Created: ${new Date().toLocaleDateString()}\n`;
            text += `Total: ${bookmarks.length} bookmarks\n\n`;
            
            bookmarks.forEach((bookmark, index) => {
                text += `${index + 1}. ${bookmark.title}\n   ${bookmark.url}\n\n`;
            });
            
            return text;
        }

        function copyShareCode() {
            const shareCode = document.getElementById('shareCode');
            const copyBtn = document.getElementById('copyBtn');
            
            shareCode.select();
            shareCode.setSelectionRange(0, 99999);
            
            try {
                navigator.clipboard.writeText(shareCode.value).then(() => {
                    copyBtn.textContent = '✅ Copied!';
                    copyBtn.classList.add('copied');
                    
                    setTimeout(() => {
                        copyBtn.textContent = '📋 Copy to Clipboard';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                }).catch(() => {
                    // Fallback for older browsers
                    document.execCommand('copy');
                    copyBtn.textContent = '✅ Copied!';
                });
            } catch (err) {
                console.error('Copy failed:', err);
                copyBtn.textContent = '❌ Copy failed';
            }
        }

        function downloadBookmarks() {
            let filename, content, mimeType;
            
            switch (currentShareFormat) {
                case 'json':
                    filename = 'floating-bookmarks.json';
                    content = document.getElementById('shareCode').value;
                    mimeType = 'application/json';
                    break;
                case 'html':
                    filename = 'floating-bookmarks.html';
                    content = document.getElementById('shareCode').value;
                    mimeType = 'text/html';
                    break;
                case 'text':
                    filename = 'floating-bookmarks.txt';
                    content = document.getElementById('shareCode').value;
                    mimeType = 'text/plain';
                    break;
            }
            
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Import functionality
        function openImportModal() {
            document.getElementById('importModal').style.display = 'block';
            document.getElementById('importText').focus();
        }

        function closeImportModal() {
            document.getElementById('importModal').style.display = 'none';
            document.getElementById('importText').value = '';
            document.getElementById('importFile').value = '';
            document.getElementById('importPreview').style.display = 'none';
            document.getElementById('importBtn').disabled = true;
            pendingImportData = null;
        }

        function handleFileImport(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('importText').value = e.target.result;
                previewImport();
            };
            reader.readAsText(file);
        }

        function previewImport() {
            const importText = document.getElementById('importText').value.trim();
            if (!importText) {
                document.getElementById('importPreview').style.display = 'none';
                document.getElementById('importBtn').disabled = true;
                return;
            }
            
            try {
                let importedBookmarks = [];
                
                // Try to parse as JSON first
                if (importText.startsWith('{') || importText.startsWith('[')) {
                    const data = JSON.parse(importText);
                    if (data.bookmarks && Array.isArray(data.bookmarks)) {
                        importedBookmarks = data.bookmarks;
                    } else if (Array.isArray(data)) {
                        importedBookmarks = data;
                    }
                }
                // Try to parse as HTML bookmark file
                else if (importText.includes('<DT><A HREF=')) {
                    importedBookmarks = parseHTMLBookmarks(importText);
                }
                // Try to parse as plain text
                else {
                    importedBookmarks = parseTextBookmarks(importText);
                }
                
                if (importedBookmarks.length > 0) {
                    pendingImportData = importedBookmarks;
                    showImportPreview(importedBookmarks);
                    document.getElementById('importBtn').disabled = false;
                } else {
                    throw new Error('No valid bookmarks found');
                }
                
            } catch (error) {
                document.getElementById('importPreview').style.display = 'none';
                document.getElementById('importBtn').disabled = true;
                alert('Invalid bookmark format. Please check your data and try again.');
            }
        }

        function parseHTMLBookmarks(html) {
            const bookmarks = [];
            const regex = /<DT><A HREF="([^"]+)"[^>]*>([^<]+)<\/A>/gi;
            let match;
            
            while ((match = regex.exec(html)) !== null) {
                bookmarks.push({
                    id: Date.now() + Math.random(),
                    url: match[1],
                    title: match[2]
                });
            }
            
            return bookmarks;
        }

        function parseTextBookmarks(text) {
            const bookmarks = [];
            const lines = text.split('\n');
            let currentTitle = null;
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                
                // Look for URLs
                if (trimmed.match(/^https?:\/\//)) {
                    if (currentTitle) {
                        bookmarks.push({
                            id: Date.now() + Math.random(),
                            url: trimmed,
                            title: currentTitle
                        });
                        currentTitle = null;
                    }
                }
                // Look for titles (lines that don't start with http and aren't numbers)
                else if (!trimmed.match(/^\d+\./) && trimmed.length > 0) {
                    currentTitle = trimmed.replace(/^\d+\.\s*/, '');
                }
            }
            
            return bookmarks;
        }

        function showImportPreview(importedBookmarks) {
            const preview = document.getElementById('previewContent');
            const previewDiv = document.getElementById('importPreview');
            
            let html = `<p style="color: #10b981; margin-bottom: 10px;"><strong>${importedBookmarks.length} bookmarks found:</strong></p>`;
            
            importedBookmarks.slice(0, 10).forEach((bookmark, index) => {
                html += `<div style="margin: 8px 0; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                    <strong style="color: #e5e7eb;">${bookmark.title}</strong><br>
                    <small style="color: #9ca3af;">${bookmark.url}</small>
                </div>`;
            });
            
            if (importedBookmarks.length > 10) {
                html += `<p style="color: #9ca3af; margin-top: 10px;">...and ${importedBookmarks.length - 10} more</p>`;
            }
            
            preview.innerHTML = html;
            previewDiv.style.display = 'block';
        }

        function importBookmarks() {
            if (!pendingImportData || pendingImportData.length === 0) {
                alert('No bookmarks to import');
                return;
            }
            
            const importCount = pendingImportData.length;
            const duplicateCheck = confirm(`Import ${importCount} bookmarks? This will add them to your existing collection.`);
            
            if (duplicateCheck) {
                // Add imported bookmarks to existing collection
                bookmarks.push(...pendingImportData);
                saveBookmarks();
                filterBookmarks();
                closeImportModal();
                
                alert(`Successfully imported ${importCount} bookmarks!`);
            }
        }

        // Add event listener for import text preview
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('importText').addEventListener('input', previewImport);
        });

        function addBookmark() {
            const title = document.getElementById('bookmarkTitle').value.trim();
            const url = document.getElementById('bookmarkUrl').value.trim();
            
            if (!title || !url) {
                alert('Please fill in both title and URL');
                return;
            }
            
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
            
            // Re-filter bookmarks based on current search
            filterBookmarks();
            
            closeAddModal();
        }

        function deleteBookmark(index) {
            if (confirm('Are you sure you want to delete this bookmark?')) {
                const bookmarkToDelete = filteredBookmarks[index];
                const originalIndex = bookmarks.findIndex(b => b.id === bookmarkToDelete.id);
                
                if (originalIndex !== -1) {
                    // Add exit animation
                    const bookmarkEl = document.querySelectorAll('.bookmark-icon')[index];
                    if (bookmarkEl) {
                        bookmarkEl.style.transition = 'all 0.3s ease';
                        bookmarkEl.style.transform = 'scale(0) rotate(180deg)';
                        bookmarkEl.style.opacity = '0';
                        
                        setTimeout(() => {
                            bookmarks.splice(originalIndex, 1);
                            filterBookmarks();
                        }, 300);
                    } else {
                        bookmarks.splice(originalIndex, 1);
                        filterBookmarks();
                    }
                }
            }
        }

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

        // Initialize with some sample data if empty
        function initializeSampleData() {
            if (bookmarks.length === 0) {
                bookmarks = [
                    { id: 1, title: "GitHub", url: "https://github.com" },
                    { id: 2, title: "Stack Overflow", url: "https://stackoverflow.com" },
                    { id: 3, title: "MDN Web Docs", url: "https://developer.mozilla.org" },
                    { id: 4, title: "CodePen", url: "https://codepen.io" },
                    { id: 5, title: "Claude AI", url: "https://claude.ai" }
                ];
            }
        }

        // Search functionality with debouncing
        let searchTimeout;
        document.getElementById('searchBar').addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(filterBookmarks, 300);
        });

        // Modal keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAddModal();
                closeShareModal();
                closeImportModal();
            }
            if (e.key === 'Enter' && document.getElementById('addModal').style.display === 'block') {
                e.preventDefault();
                addBookmark();
            }
        });

        // Close modal when clicking outside
        document.getElementById('addModal').addEventListener('click', (e) => {
            if (e.target.className === 'modal') {
                closeAddModal();
            }
        });

        document.getElementById('shareModal').addEventListener('click', (e) => {
            if (e.target.className === 'modal') {
                closeShareModal();
            }
        });

        document.getElementById('importModal').addEventListener('click', (e) => {
            if (e.target.className === 'modal') {
                closeImportModal();
            }
        });

        // Handle window resize with animation restart
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Restart animations after resize
                const icons = document.querySelectorAll('.bookmark-icon');
                icons.forEach(icon => {
                    icon.style.animation = 'none';
                    setTimeout(() => {
                        icon.classList.add('floating');
                    }, 100);
                });
            }, 250);
        });

        // Initialize app
        document.addEventListener('DOMContentLoaded', () => {
            loadBookmarks();
            document.getElementById('importText').addEventListener('input', previewImport);
        });

        // Remove the old mouse movement effect since icons now move across screen
        // Icons will naturally move around the screen in floating animation