      document.addEventListener('DOMContentLoaded', () => {
            const addBookmarkBtn = document.getElementById('addBookmarkBtn');
            const addBookmarkModal = document.getElementById('addBookmarkModal');
            const modalPanel = document.getElementById('modal-panel');
            const cancelBtn = document.getElementById('cancelBtn');
            const addBookmarkForm = document.getElementById('addBookmarkForm');
            const bookmarksGrid = document.getElementById('bookmarksGrid');
            const noResults = document.getElementById('noResults');
            const searchInput = document.getElementById('searchInput');
            const themeToggle = document.getElementById('themeToggle');
            const docElement = document.documentElement;

            let bookmarks = [];

            const getFaviconUrl = (url) => {
                try {
                    const urlObject = new URL(url);
                    return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=64`;
                } catch (e) {
                    return 'https://placehold.co/64x64/f1f5f9/94a3b8?text=?';
                }
            };

            const renderBookmarks = (items = bookmarks) => {
                bookmarksGrid.innerHTML = '';
                if (items.length === 0) {
                    noResults.classList.remove('hidden');
                    bookmarksGrid.classList.add('hidden');
                } else {
                    noResults.classList.add('hidden');
                    bookmarksGrid.classList.remove('hidden');
                }
                
                items.forEach(bookmark => {
                    const card = document.createElement('div');
                    card.className = 'bookmark-card rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow duration-300';
                    card.innerHTML = `
                        <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer" class="flex-grow">
                            <div class="flex items-center space-x-4 mb-3">
                                <img src="${getFaviconUrl(bookmark.url)}" alt="Favicon" class="w-8 h-8 rounded-md object-cover" onerror="this.onerror=null;this.src='https://placehold.co/64x64/f1f5f9/94a3b8?text=?';">
                                <h2 class="font-semibold text-slate-800 dark:text-slate-100 truncate" title="${bookmark.title}">${bookmark.title}</h2>
                            </div>
                            <p class="text-xs text-slate-500 dark:text-slate-400 break-all">${bookmark.url}</p>
                        </a>
                        <div class="mt-4 flex justify-end">
                            <button data-id="${bookmark.id}" class="remove-btn text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">Remove</button>
                        </div>
                    `;
                    bookmarksGrid.appendChild(card);
                });
            };
            
            const saveBookmarks = () => {
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            };

            const loadBookmarks = () => {
                const storedBookmarks = localStorage.getItem('bookmarks');
                bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [
                    { id: Date.now() + 1, title: 'Tailwind CSS', url: 'https://tailwindcss.com' },
                    { id: Date.now() + 2, title: 'Google Fonts', url: 'https://fonts.google.com' },
                    { id: Date.now() + 3, title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
                ];
                renderBookmarks();
            };

            const openModal = () => {
                addBookmarkModal.classList.remove('hidden');
                setTimeout(() => modalPanel.classList.add('scale-100'), 10);
            };

            const closeModal = () => {
                modalPanel.classList.remove('scale-100');
                addBookmarkModal.classList.add('hidden');
                addBookmarkForm.reset();
            };

            addBookmarkBtn.addEventListener('click', openModal);
            cancelBtn.addEventListener('click', closeModal);
            addBookmarkModal.addEventListener('click', (e) => {
                if (e.target === addBookmarkModal) {
                    closeModal();
                }
            });

            addBookmarkForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('bookmarkTitle').value;
                const url = document.getElementById('bookmarkUrl').value;
                
                const newBookmark = {
                    id: Date.now(),
                    title,
                    url
                };

                bookmarks.unshift(newBookmark);
                saveBookmarks();
                renderBookmarks();
                closeModal();
            });

            bookmarksGrid.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-btn')) {
                    const id = parseInt(e.target.dataset.id);
                    bookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
                    saveBookmarks();
                    const currentSearch = searchInput.value.toLowerCase();
                    const filtered = bookmarks.filter(b => b.title.toLowerCase().includes(currentSearch) || b.url.toLowerCase().includes(currentSearch));
                    renderBookmarks(filtered);
                }
            });

            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredBookmarks = bookmarks.filter(bookmark => 
                    bookmark.title.toLowerCase().includes(searchTerm) || 
                    bookmark.url.toLowerCase().includes(searchTerm)
                );
                renderBookmarks(filteredBookmarks);
            });

            const applyTheme = (isDark) => {
                if (isDark) {
                    docElement.classList.add('dark');
                } else {
                    docElement.classList.remove('dark');
                }
                themeToggle.checked = isDark;
            };

            themeToggle.addEventListener('change', () => {
                const isDark = themeToggle.checked;
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                applyTheme(isDark);
            });

            const loadTheme = () => {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
                applyTheme(isDark);
            };

            loadTheme();
            loadBookmarks();
        });