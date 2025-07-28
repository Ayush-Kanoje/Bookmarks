// BookmarkManager Class - Handles all bookmark functionality
class BookmarkManager {
  constructor() {
    // We store bookmarks in memory during the session - each bookmark has title, url, category, date, and future visit info
    this.bookmarks = [];
    this.categories = new Set();
    this.selectedCategory = "All"; // Track current filter
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
    const bookmarkForm = document.getElementById("bookmarkForm");
    if (bookmarkForm) {
      bookmarkForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.addBookmark();
      });
    }

    // Handle category filtering - when users click filter buttons
    document.querySelectorAll(".category-filter").forEach((filter) => {
      filter.addEventListener("click", (e) => {
        this.selectedCategory = e.target.dataset.category || "All";
        this.filterBookmarks(this.selectedCategory);

        // Visual feedback - highlight active filter
        document
          .querySelectorAll(".category-filter")
          .forEach((f) => f.classList.remove("active"));
        e.target.classList.add("active");
      });
    });
  }

  // Add a new bookmark to our collection with smart categorization
  addBookmark() {
    const titleElement = document.getElementById("title");
    const urlElement = document.getElementById("url");
    const categoryElement = document.getElementById("category");

    if (!titleElement || !urlElement || !categoryElement) {
      console.error("Form elements not found");
      return;
    }

    const title = titleElement.value.trim();
    const url = urlElement.value.trim();
    const category = categoryElement.value;

    // Validate required fields
    if (!title || !url) {
      AnimationUtils.showNotification("Please fill in both title and URL", "error");
      return;
    }

    // Create bookmark object with current timestamp
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
    document.getElementById("bookmarkForm").reset();
    
    // Show success notification
    AnimationUtils.showNotification("Bookmark added successfully!", "success");
  }

  // Remove a bookmark by its unique ID
  deleteBookmark(id) {
    // Confirm deletion to prevent accidental removal
    if (confirm("Delete this bookmark?")) {
      const idx = this.bookmarks.findIndex((x) => x.id === id);
      if (idx !== -1) {
        const removed = this.bookmarks.splice(idx, 1)[0];
        // Update categories if needed
        if (!this.bookmarks.some((x) => x.category === removed.category)) {
          this.categories.delete(removed.category);
        }
        this.updateCategoryFilters();
        this.renderBookmarks();
        this.updateStats();
        this.saveBookmarks();
        
        // Show deletion notification
        AnimationUtils.showNotification("Bookmark deleted", "info");
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
    const bookmarkArea = document.getElementById("bookmarksContainer");
    if (!bookmarkArea) return;

    bookmarkArea.innerHTML = "";

    const items =
      this.selectedCategory === "All"
        ? this.bookmarks
        : this.bookmarks.filter((b) => b.category === this.selectedCategory);

    if (items.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state scroll-reveal";
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

    // Trigger scroll animations for new elements
    if (window.advancedAnimations) {
      window.advancedAnimations.observeNewElements();
    }
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
    const section = document.createElement("div");
    section.className = "category-section scroll-reveal";

    // Map categories to appropriate icons for visual appeal
    const categoryIcons = {
      Productivity: "🚀",
      Development: "💻",
      Design: "🎨",
      Learning: "📚",
      Entertainment: "🎬",
      News: "📰",
      Shopping: "🛒",
      Social: "👥",
      AI: "🤖",
      Other: "📂",
    };

    // Create category header
    const categoryHeader = document.createElement("div");
    categoryHeader.className = "category-header";
    categoryHeader.innerHTML = `
      <div class="category-icon parallax-element">${categoryIcons[category] || "📂"}</div>
      <div class="category-info">
        <div class="category-title">${
          category.charAt(0).toUpperCase() + category.slice(1)
        }</div>
        <div class="category-count">${bookmarks.length} bookmark${
      bookmarks.length !== 1 ? "s" : ""
    }</div>
      </div>
    `;
    section.appendChild(categoryHeader);

    // Create bookmarks grid for this category
    const bookmarksGrid = document.createElement("div");
    bookmarksGrid.className = "category-bookmarks-grid";

    bookmarks.forEach((bookmark, index) => {
      const bookmarkCard = this.createBookmarkCard(bookmark);
      bookmarkCard.style.animationDelay = `${index * 0.1}s`;
      bookmarksGrid.appendChild(bookmarkCard);
    });

    section.appendChild(bookmarksGrid);
    return section;
  }

  // Create individual bookmark card with modern design
  createBookmarkCard(bookmark) {
    const card = document.createElement("div");
    card.className = "bookmark-card scroll-reveal-scale ripple-effect";

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "bookmark-delete-btn";
    deleteBtn.innerHTML = "×";
    deleteBtn.setAttribute("aria-label", `Delete ${bookmark.title}`);
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.deleteBookmark(bookmark.id);
    });

    // Favicon
    const favicon = document.createElement("img");
    favicon.className = "bookmark-favicon parallax-element";
    favicon.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${this.extractDomain(
      bookmark.url
    )}`;
    favicon.alt = "";
    favicon.onerror = () => {
      favicon.src =
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
    };

    // Title link
    const titleLink = document.createElement("a");
    titleLink.href = bookmark.url;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.className = "bookmark-title";
    titleLink.textContent = bookmark.title;

    // Domain
    const domain = document.createElement("div");
    domain.className = "bookmark-domain";
    domain.textContent = this.extractDomain(bookmark.url);

    // Assemble card
    card.appendChild(deleteBtn);
    card.appendChild(favicon);
    card.appendChild(titleLink);
    card.appendChild(domain);

    return card;
  }

  // Update statistics display to show current bookmark counts and categories
  updateStats() {
    const totalElement = document.getElementById("totalBookmarks");
    const categoriesElement = document.getElementById("categoriesCount");

    if (totalElement) totalElement.textContent = this.bookmarks.length;
    if (categoriesElement) categoriesElement.textContent = this.categories.size;
  }

  // Dynamically add category filters based on existing bookmarks
  updateCategoryFilters() {
    const filterSection = document.querySelector(".filter-section");
    if (!filterSection) return;

    const existingCategories = new Set();

    // Keep track of existing filter buttons to avoid duplicates
    filterSection.querySelectorAll(".category-filter").forEach((filter) => {
      existingCategories.add(filter.dataset.category);
    });

    // Add new category filters for any new categories
    this.categories.forEach((category) => {
      if (!existingCategories.has(category)) {
        const filterBtn = document.createElement("div");
        filterBtn.className = "category-filter ripple-effect";
        filterBtn.dataset.category = category;
        filterBtn.textContent =
          category.charAt(0).toUpperCase() + category.slice(1);

        filterBtn.addEventListener("click", (e) => {
          this.filterBookmarks(e.target.dataset.category);
          document
            .querySelectorAll(".category-filter")
            .forEach((f) => f.classList.remove("active"));
          e.target.classList.add("active");
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
        category: "AI",
      },
      {
        id: 3,
        title: "Gemini",
        url: "https://gemini.google.com/u/1/app",
        category: "AI",
      },
      {
        id: 4,
        title: "CodeCrafters",
        url: "https://app.codecrafters.io/catalog",
        category: "Development",
      },
      {
        id: 5,
        title: "YouTube",
        url: "https://www.youtube.com/",
        category: "Learning",
      },
      {
        id: 6,
        title: "Claude AI",
        url: "https://claude.ai/new",
        category: "AI",
      },
      {
        id: 7,
        title: "Humanize AI",
        url: "https://aihumanize.io/",
        category: "AI",
      },
      {
        id: 8,
        title: "Quora",
        url: "https://www.quora.com/",
        category: "Productivity",
      },
      {
        id: 9,
        title: "Flaticon",
        url: "https://www.flaticon.com/",
        category: "Design",
      },
      {
        id: 10,
        title: "Figma",
        url: "https://www.figma.com/",
        category: "Design",
      },
      {
        id: 11,
        title: "Google",
        url: "https://www.google.com/",
        category: "Productivity",
      },
      {
        id: 12,
        title: "Vercel",
        url: "https://vercel.com/ayush-kanojes-projects",
        category: "Development",
      },
      {
        id: 13,
        title: "Stack Overflow",
        url: "https://stackoverflow.com/",
        category: "Development",
      },
      {
        id: 14,
        title: "MDN Web Docs",
        url: "https://developer.mozilla.org/en-US/",
        category: "Learning",
      },
      {
        id: 15,
        title: "CSS Tricks",
        url: "https://css-tricks.com/",
        category: "Development",
      },
      {
        id: 16,
        title: "FreeCodeCamp",
        url: "https://www.freecodecamp.org/",
        category: "Learning",
      },
      {
        id: 17,
        title: "GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/",
        category: "Learning",
      },
      {
        id: 18,
        title: "Firebase",
        url: "https://firebase.google.com/",
        category: "Development",
      },
      {
        id: 19,
        title: "HiAnime",
        url: "https://hianime.tv/",
        category: "Entertainment",
      },
      {
        id: 20,
        title: "GitHub",
        url: "https://github.com/Ayush-Kanoje",
        category: "Development",
      },
    ];

    // Build category set from loaded bookmarks
    this.bookmarks.forEach((bookmark) => {
      this.categories.add(bookmark.category);
    });
  }
}

// Advanced Scrolling & Web Opening Animations
class AdvancedAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.setupPageLoader();
    this.setupScrollAnimations();
    this.setupScrollProgress();
    this.setupScrollToTop();
    this.setupWebOpeningAnimations();
    this.setupParallaxEffects();
    this.setupRippleEffects();
    this.setupKeyboardNavigation();
    this.observeElements();
    this.monitorPerformance();
  }

  // Page Loading Animation
  setupPageLoader() {
    // Create loader HTML if it doesn't exist
    if (!document.querySelector('.page-loader')) {
      const loader = document.createElement('div');
      loader.className = 'page-loader';
      loader.innerHTML = `
        <div class="loader-content">
          <div class="loader-icon"></div>
          <div class="loader-text">Loading Bookmarks...</div>
        </div>
      `;
      document.body.appendChild(loader);
    }

    // Hide loader when page is loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loader = document.querySelector('.page-loader');
        if (loader) {
          loader.classList.add('fade-out');
          setTimeout(() => loader.remove(), 800);
        }
      }, 1000);
    });
  }

  // Scroll Progress Indicator
  setupScrollProgress() {
    // Create progress bar if it doesn't exist
    if (!document.querySelector('.scroll-progress')) {
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      document.body.appendChild(progressBar);
    }

    const progressBar = document.querySelector('.scroll-progress');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxHeight) * 100;
      
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    });
  }

  // Scroll to Top Button
  setupScrollToTop() {
    // Create scroll to top button if it doesn't exist
    if (!document.querySelector('.scroll-to-top')) {
      const scrollBtn = document.createElement('button');
      scrollBtn.className = 'scroll-to-top';
      scrollBtn.innerHTML = '↑';
      scrollBtn.setAttribute('aria-label', 'Scroll to top');
      document.body.appendChild(scrollBtn);
    }

    const scrollBtn = document.querySelector('.scroll-to-top');
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    });

    // Smooth scroll to top on click
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Advanced Scroll Animations
  setupScrollAnimations() {
    // Add scroll reveal classes to elements
    const elementsToAnimate = [
      { selector: '.category-section', class: 'scroll-reveal' },
      { selector: '.bookmark-card', class: 'scroll-reveal-scale' },
      { selector: '.add-form', class: 'scroll-reveal-left' },
      { selector: '.filter-section', class: 'scroll-reveal-right' },
      { selector: '.stats', class: 'scroll-reveal' }
    ];

    elementsToAnimate.forEach(({ selector, class: className }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (!el.classList.contains(className)) {
          el.classList.add(className);
        }
      });
    });
  }

  // Intersection Observer for scroll animations
  observeElements() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // Add stagger animation to child elements
          const children = entry.target.querySelectorAll('.bookmark-card, .stat-item');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('stagger-animation');
            }, index * 100);
          });
        }
      });
    }, observerOptions);

    // Observe all scroll reveal elements
    this.observeNewElements();
  }

  // Method to observe new elements (called when bookmarks are re-rendered)
  observeNewElements() {
    const revealElements = document.querySelectorAll('[class*="scroll-reveal"]:not(.observed)');
    revealElements.forEach(el => {
      el.classList.add('observed');
      this.observer.observe(el);
    });
  }

  // Web Opening Animations
  setupWebOpeningAnimations() {
    document.addEventListener('click', (e) => {
      const bookmarkCard = e.target.closest('.bookmark-card');
      const bookmarkLink = e.target.closest('a[href]');
      
      if (bookmarkCard && bookmarkLink) {
        e.preventDefault();
        this.animateWebOpening(bookmarkCard, bookmarkLink.href);
      }
    });
  }

  animateWebOpening(card, url) {
    // Add opening class and indicator
    card.classList.add('opening');
    
    // Create opening indicator if it doesn't exist
    if (!card.querySelector('.opening-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'opening-indicator';
      card.appendChild(indicator);
    }

    // Simulate loading time
    setTimeout(() => {
      // Remove animation classes
      card.classList.remove('opening');
      const indicator = card.querySelector('.opening-indicator');
      if (indicator) {
        indicator.remove();
      }
      
      // Open the URL with smooth transition
      this.openWithTransition(url);
    }, 1200);
  }

  openWithTransition(url) {
    // Create overlay for smooth transition
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
      window.open(url, '_blank');
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }, 300);
  }

  // Parallax Effects
  setupParallaxEffects() {
    // Advanced parallax scrolling
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');
      
      parallaxElements.forEach((el, index) => {
        const speed = (index % 3 + 1) * 0.02;
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    });
  }

  // Ripple Effects
  setupRippleEffects() {
    document.addEventListener('click', (e) => {
      const rippleElement = e.target.closest('.ripple-effect');
      if (!rippleElement) return;

      const ripple = document.createElement('span');
      const rect = rippleElement.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(102, 126, 234, 0.3);
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
      `;
      
      rippleElement.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  }

  // Enhanced keyboard navigation
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'Home':
          if (e.ctrlKey) {
            e.preventDefault();
            this.smoothScrollTo(document.body);
          }
          break;
        case 'End':
          if (e.ctrlKey) {
            e.preventDefault();
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth'
            });
          }
          break;
        case 'PageUp':
          e.preventDefault();
          window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
          break;
        case 'PageDown':
          e.preventDefault();
          window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
          break;
      }
    });
  }

  // Advanced scroll behaviors
  smoothScrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      const targetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Performance monitoring
  monitorPerformance() {
    let lastScrollTime = 0;
    let ticking = false;

    const optimizedScrollHandler = () => {
      lastScrollTime = performance.now();
      
      if (!ticking) {
        requestAnimationFrame(() => {
          // Only update if enough time has passed
          if (performance.now() - lastScrollTime < 16) {
            this.updateScrollEffects();
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
  }

  updateScrollEffects() {
    // Batch DOM updates for better performance
    const scrolled = window.pageYOffset;
    
    // Update scroll progress
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxHeight) * 100;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    }

    // Update scroll to top button
    const scrollBtn = document.querySelector('.scroll-to-top');
    if (scrollBtn) {
      scrollBtn.classList.toggle('visible', scrolled > 300);
    }
  }
}

// Animation Utilities
const AnimationUtils = {
  // Smooth scroll to element with callback
  scrollToElement(selector, callback, offset = 20) {
    const element = document.querySelector(selector);
    if (element) {
      const targetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      if (callback) {
        setTimeout(callback, 500);
      }
    }
  },

  // Add entrance animation to new elements
  animateNewElement(element, animationType = 'fadeInScale') {
    element.style.opacity = '0';
    element.style.transform = animationType === 'fadeInScale' ? 'scale(0.8)' : 'translateY(20px)';
    
    setTimeout(() => {
      element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      element.style.opacity = '1';
      element.style.transform = animationType === 'fadeInScale' ? 'scale(1)' : 'translateY(0)';
    }, 50);
  },

  // Create floating notification
  showNotification(message, type = 'info') {
    // Remove any existing notification
    const existing = document.querySelector('.floating-notification');
    if (existing) existing.remove();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `floating-notification ${type}`;
    notification.textContent = message;

    // Style for animation
    notification.style.cssText = `
      position: fixed;
      top: 30px;
      right: 30px;
      z-index: 9999;
      padding: 14px 28px;
      border-radius: 8px;
      background: ${type === 'success'
        ? '#4caf50'
        : type === 'error'
        ? '#f44336'
        : '#667eea'};
      color: #fff;
      font-size: 1rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
      opacity: 0;
      transform: translateY(-20px);
      transition: opacity 0.4s, transform 0.4s;
      pointer-events: none;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);

    // Auto-remove after 2.5s
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => notification.remove(), 400);
    }, 2500);
  }
};

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize animations first
  window.advancedAnimations = new AdvancedAnimations();
  
  // Then initialize bookmark manager
  window.bookmarkManager = new BookmarkManager();
});