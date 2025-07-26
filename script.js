class BookmarkManager {
    constructor() {
        // We store bookmarks in memory during the session - each bookmark has title, url, category, date, and future visit info
        this.bookmarks = [];
        this.categories = new Set();
        this.selectedCategory = 'All'; // Track current filter
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
                this.selectedCategory = e.target.dataset.category || 'All';
                this.filterBookmarks(this.selectedCategory);
               
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
        if (confirm('Delete this bookmark?')) {
            const idx = this.bookmarks.findIndex(x => x.id === id);
            if (idx !== -1) {
                const removed = this.bookmarks.splice(idx, 1)[0];
                // Update categories if needed
                if (!this.bookmarks.some(x => x.category === removed.category)) {
                    this.categories.delete(removed.category);
                }
                this.updateCategoryFilters();
                this.renderBookmarks();
                this.updateStats();
            }
        }
    }

    // Filter bookmarks based on category or special criteria like future visits
    filterBookmarks(category) {
        this.selectedCategory = category;
        this.renderBookmarks();
    }

    // Extract domain from URL for favicon and display purposes
    extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch (e) {
            return url;
        }
    }

    // Render bookmarks grouped by categories with beautiful card layout
    renderBookmarks() {
        const bookmarkArea = document.getElementById('bookmarksContainer');
        bookmarkArea.innerHTML = '';
        
        const items = this.selectedCategory === 'All'
            ? this.bookmarks
            : this.bookmarks.filter(b => b.category === this.selectedCategory);

        if (items.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-icon">🔖</div>
                <h3>No bookmarks found!</h3>
                <p>Try adjusting your filters or add some bookmarks.</p>
            `;
            bookmarkArea.appendChild(emptyState);
            return;
        }

        // Group bookmarks by category for organized display
        const groupedBookmarks = this.groupByCategory(items);
        
        // Create a section for each category
        Object.entries(groupedBookmarks).forEach(([category, bookmarks]) => {
            const categorySection = this.createCategorySection(category, bookmarks);
            bookmarkArea.appendChild(categorySection);
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

    // Create a visual section for each category with beautiful card layout
    createCategorySection(category, bookmarks) {
        const section = document.createElement('div');
        section.className = 'category-section';

        // Map categories to appropriate icons for visual appeal
        const categoryIcons = {
     
            Productivity: '🚀', Development: '💻', Design: '🎨',
            Learning: '📚', Entertainment: '🎬', News: '📰',
            Shopping: '🛒', Social: '👥', AI: '🤖', Other: '📂'
        };

        // Create category header
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.innerHTML = `
            <div class="category-icon">${categoryIcons[category] || '📂'}</div>
            <div class="category-info">
                <div class="category-title">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                <div class="category-count">${bookmarks.length} bookmark${bookmarks.length !== 1 ? 's' : ''}</div>
            </div>
        `;
        section.appendChild(categoryHeader);

        // Create bookmarks grid for this category
        const bookmarksGrid = document.createElement('div');
        bookmarksGrid.className = 'category-bookmarks-grid';

        bookmarks.forEach(bookmark => {
            const bookmarkCard = this.createBookmarkCard(bookmark);
            bookmarksGrid.appendChild(bookmarkCard);
        });

        section.appendChild(bookmarksGrid);
        return section;
    }

    // Create individual bookmark card with modern design
    createBookmarkCard(bookmark) {
        const card = document.createElement('div');
        card.className = 'bookmark-card';

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'bookmark-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.setAttribute('aria-label', `Delete ${bookmark.title}`);
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.deleteBookmark(bookmark.id);
        });

        // Favicon
        const favicon = document.createElement('img');
        favicon.className = 'bookmark-favicon';
        favicon.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${this.extractDomain(bookmark.url)}`;
        favicon.alt = '';
        favicon.onerror = () => {
            favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
        };

        // Title link
        const titleLink = document.createElement('a');
        titleLink.href = bookmark.url;
        titleLink.target = '_blank';
        titleLink.rel = 'noopener noreferrer';
        titleLink.className = 'bookmark-title';
        titleLink.textContent = bookmark.title;

        // Domain
        const domain = document.createElement('div');
        domain.className = 'bookmark-domain';
        domain.textContent = this.extractDomain(bookmark.url);

        // Assemble card
        card.appendChild(deleteBtn);
        card.appendChild(favicon);
        card.appendChild(titleLink);
        card.appendChild(domain);

        return card;
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
                    <button class="delete-btn" data-id="${bookmark.id}">Delete</button>
                </div>
            </div>
        `;
    }

    // Update statistics display to show current bookmark counts and categories
    updateStats() {
        const totalElement = document.getElementById('totalBookmarks');
        const categoriesElement = document.getElementById('categoriesCount');
        const futureElement = document.getElementById('futureBookmarks');
        
        if (totalElement) totalElement.textContent = this.bookmarks.length;
        if (categoriesElement) categoriesElement.textContent = this.categories.size;
        if (futureElement) {
            futureElement.textContent = this.bookmarks.filter(b => b.isFuture).length;
        }
    }

    // Dynamically add category filters based on existing bookmarks
    updateCategoryFilters() {
        const filterSection = document.querySelector('.filter-section');
        if (!filterSection) return;
        
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
                title: "ChatGPT",
                url: "https://chat.openai.com",
                category: "AI",
            },
            {
                id: 2,
                title: "Perplexity AI",
                url: "https://www.perplexity.ai/",
                category: "AI"
            },

            {
                id:3,
                title: "GitHub",
                url: "https://gemini.google.com/u/1/app",
                category: "AI",
            },
            {
                id:4,
                title: "CodeCrafters",
                url: "https://app.codecrafters.io/catalog",
                category: "development",
            },

            {
                id: 5,
                title: "You-Tube",
                url: "https://www.youtube.com/",
                category: "Learning",
            },

            {
                id: 6,
                title: "Claude AI",
                url: "https://claude.ai/new",
                category: "AI",
            }
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