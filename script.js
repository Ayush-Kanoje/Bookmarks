 class BookmarkManager {
            constructor() {
                // We store bookmarks in memory during the session - each bookmark has title, url, category, date, and future visit info
                this.bookmarks = [];
                this.categories = new Set();
                this.init();
            }

            // Initialize the application by loading any existing data and setting up event listeners
            init() {
                this.loadBookmarks();
                this.setupEventListeners();
                this.renderBookmarks();
                this.updateStats();
            }

            // Set up all the interactive elements - form submission, filtering, and delete buttons
            setupEventListeners() {
                // Handle form submission for adding new bookmarks
                document.getElementById('bookmarkForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addBookmark();
                });

                // Handle category filtering - when users click filter buttons
                document.querySelectorAll('.category-filter').forEach(filter => {
                    filter.addEventListener('click', (e) => {
                        this.filterBookmarks(e.target.dataset.category);
                        
                        // Visual feedback - highlight active filter
                        document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
                        e.target.classList.add('active');
                    });
                });
            }

            // Add a new bookmark to our collection with smart categorization
            addBookmark() {
                const title = document.getElementById('title').value.trim();
                const url = document.getElementById('url').value.trim();
                const category = document.getElementById('category').value;
                const visitDate = document.getElementById('visitDate').value;

                // Validate required fields
                if (!title || !url) {
                    alert('Please fill in both title and URL');
                    return;
                }

                // Create bookmark object with current timestamp and future visit date if specified
                const bookmark = {
                    id: Date.now(), // Simple ID generation using timestamp
                    title,
                    url,
                    category,
                    dateAdded: new Date().toLocaleDateString(),
            
                };

                // Add to our collection and update the display
                this.bookmarks.push(bookmark);
                this.categories.add(category);
                this.saveBookmarks();
                this.renderBookmarks();
                this.updateStats();
                this.updateCategoryFilters();

                // Clear the form for next entry
                document.getElementById('bookmarkForm').reset();
            }

            // Remove a bookmark by its unique ID
            deleteBookmark(id) {
                // Confirm deletion to prevent accidental removal
                if (confirm('Are you sure you want to delete this bookmark?')) {
                    this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
                    this.saveBookmarks();
                    this.renderBookmarks();
                    this.updateStats();
                }
            }

            // Filter bookmarks based on category or special criteria like future visits
            filterBookmarks(category) {
                let filteredBookmarks;
                
                if (category === 'all') {
                    filteredBookmarks = this.bookmarks;
                } else if (category === 'future') {
                    // Show only bookmarks with future visit dates
                    filteredBookmarks = this.bookmarks.filter(bookmark => bookmark.isFuture);
                } else {
                    filteredBookmarks = this.bookmarks.filter(bookmark => bookmark.category === category);
                }

                this.renderBookmarks(filteredBookmarks);
            }

            // Render bookmarks grouped by category for better organization
            renderBookmarks(bookmarksToShow = this.bookmarks) {
                const container = document.getElementById('bookmarksContainer');
                
                if (bookmarksToShow.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">🔖</div>
                            <h3>No bookmarks found!</h3>
                            <p>Try adjusting your filters or add some bookmarks.</p>
                        </div>
                    `;
                    return;
                }

                // Group bookmarks by category for organized display
                const groupedBookmarks = this.groupByCategory(bookmarksToShow);
                
                container.innerHTML = '';

                // Create a section for each category with appropriate icons and styling
                Object.entries(groupedBookmarks).forEach(([category, bookmarks]) => {
                    const categorySection = this.createCategorySection(category, bookmarks);
                    container.appendChild(categorySection);
                });
            }

            // Group bookmarks by their category for organized display
            groupByCategory(bookmarks) {
                return bookmarks.reduce((groups, bookmark) => {
                    const category = bookmark.category;
                    if (!groups[category]) {
                        groups[category] = [];
                    }
                    groups[category].push(bookmark);
                    return groups;
                }, {});
            }

            // Create a visual section for each category with appropriate styling and icons
            createCategorySection(category, bookmarks) {
                const section = document.createElement('div');
                section.className = 'category-section';

                // Map categories to appropriate icons for visual appeal
                const categoryIcons = {
                    Productivity: '🚀', Development: '💻', Design: '🎨',
                    Learning: '📚', Entertainment: '🎬', News: '📰',
                    Shopping: '🛒', Social: '👥', Tools: '🔧', Other: '📂'
                };

                section.innerHTML = `
                    <div class="category-header">
                        <div class="category-icon">${categoryIcons[category] || '📂'}</div>
                        <div class="category-title">${category} (${bookmarks.length})</div>
                    </div>
                    <div class="bookmarks-list">
                        ${bookmarks.map(bookmark => this.createBookmarkHTML(bookmark)).join('')}
                    </div>
                `;

                // Add delete functionality to each bookmark
                section.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const bookmarkId = parseInt(e.target.dataset.id);
                        this.deleteBookmark(bookmarkId);
                    });
                });

                return section;
            }

            // Generate HTML for individual bookmark items with all necessary information
            createBookmarkHTML(bookmark) {
                const isFuture = bookmark.isFuture;
                const futureLabel = isFuture ? '<div class="future-badge">Future Visit</div>' : '';
                
                return `
                    <div class="bookmark-item">
                        ${futureLabel}
                        <a href="${bookmark.url}" target="_blank" class="bookmark-title">${bookmark.title}</a>
                        <a href="${bookmark.url}" target="_blank" class="bookmark-url">${bookmark.url}</a>
                        <div class="bookmark-meta">
                            <span class="bookmark-date">
                                Added: ${bookmark.dateAdded}
                                ${bookmark.visitDate ? ` | Visit: ${bookmark.visitDate}` : ''}
                            </span>
                            <button class="delete-btn" data-id="${bookmark.id}">Delete</button>
                        </div>
                    </div>
                `;
            }

            // Update statistics display to show current bookmark counts and categories
            updateStats() {
                document.getElementById('totalBookmarks').textContent = this.bookmarks.length;
                document.getElementById('categoriesCount').textContent = this.categories.size;
                document.getElementById('futureBookmarks').textContent = 
                    this.bookmarks.filter(b => b.isFuture).length;
            }

            // Dynamically add category filters based on existing bookmarks
            updateCategoryFilters() {
                const filterSection = document.querySelector('.filter-section');
                const existingCategories = new Set();
                
                // Keep track of existing filter buttons to avoid duplicates
                filterSection.querySelectorAll('.category-filter').forEach(filter => {
                    existingCategories.add(filter.dataset.category);
                });

                // Add new category filters for any new categories
                this.categories.forEach(category => {
                    if (!existingCategories.has(category)) {
                        const filterBtn = document.createElement('div');
                        filterBtn.className = 'category-filter';
                        filterBtn.dataset.category = category;
                        filterBtn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                        
                        filterBtn.addEventListener('click', (e) => {
                            this.filterBookmarks(e.target.dataset.category);
                            document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
                            e.target.classList.add('active');
                        });
                        
                        filterSection.appendChild(filterBtn);
                    }
                });
            }

            // Save bookmarks to memory (in a real app, this would persist to localStorage or a database)
            saveBookmarks() {
                // In this implementation, we keep data in memory for the session
                // The data will be reset when the page is refreshed
            }

            // Load bookmarks from storage (placeholder for future persistence)
            loadBookmarks() {
                // For demonstration, we start with some sample bookmarks
                this.bookmarks = [
                    {
                        id: 1,
                        title: "OpenAI ChatGPT",
                        url: "https://chat.openai.com",
                        category: "productivity",
                    
                    },
                    {
                        id: 2,
                        title: "GitHub",
                        url: "https://github.com",
                        category: "development",
                      
                    },
                 
                ];

                // Build category set from loaded bookmarks
                this.bookmarks.forEach(bookmark => {
                    this.categories.add(bookmark.category);
                });
            }
        }

        // Initialize the bookmark manager when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new BookmarkManager();
        });