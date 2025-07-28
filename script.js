document.addEventListener("DOMContentLoaded", () => {
  /**
   * The main class to manage floating icons.
   * It handles loading data, rendering icons, animation, and search.
   */
  class IconManager {
    constructor() {
      this.container = document.getElementById("icon-container");
      this.searchBar = document.getElementById("search-bar");
      this.iconCountEl = document.getElementById("icon-count");

      this.allBookmarks = []; // All bookmarks loaded from storage
      this.icons = []; // Array to hold icon elements and their physics data
      this.animationFrameId = null;

      this._init();
    }

    /**
     * Initializes the application.
     */
    _init() {
      this.loadBookmarks();
      this.setupEventListeners();
      this.renderIcons(this.allBookmarks);
      this.startAnimation();
    }

    /**
     * Sets up event listeners for search and window resizing.
     */
    setupEventListeners() {
      // Live search functionality
      this.searchBar.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredBookmarks = this.allBookmarks.filter((bookmark) =>
          bookmark.title.toLowerCase().includes(searchTerm)
        );
        this.renderIcons(filteredBookmarks);
      });

      // Adjust animation boundaries on window resize
      window.addEventListener("resize", () => {
        this.container.width = window.innerWidth;
        this.container.height = window.innerHeight;
      });
    }

    /**
     * Loads bookmarks from localStorage or uses a default sample set.
     */
    loadBookmarks() {
      const savedBookmarks = localStorage.getItem("bookmarks");
      if (savedBookmarks) {
        this.allBookmarks = JSON.parse(savedBookmarks);
      } else {
        // Default set of bookmarks if none are in localStorage
        this.allBookmarks = [
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
            url: "https://gemini.google.com/",
            category: "AI",
          },
          {
            id: 4,
            title: "CodeCrafters",
            url: "https://app.codecrafters.io/catalog",
            category: "development",
          },
          {
            id: 5,
            title: "YouTube",
            url: "https://www.youtube.com",
            category: "entertainment",
          },
          {
            id: 6,
            title: "Quora",
            url: "https://www.quora.com/",
            category: "social",
          },
          {
            id: 7,
            title: "Flaticon",
            url: "https://www.flaticon.com/",
            category: "design",
          },
          {
            id: 8,
            title: "Figma",
            url: "https://www.figma.com/",
            category: "design",
          },
          {
            id: 9,
            title: "Google",
            url: "https://www.google.com/",
            category: "productivity",
          },
          {
            id: 10,
            title: "Vercel",
            url: "https://vercel.com/",
            category: "development",
          },
          {
            id: 11,
            title: "Hianime",
            url: "https://hianime.tv/",
            category: "entertainment",
          },
          {
            id: 12,
            title: "Github",
            url: "https://github.com/",
            category: "development",
          },
          {
            id: 13,
            title: "GFG",
            url: "https://www.geeksforgeeks.org/",
            category: "education",
          },
          {
            id: 14,
            title: "Firebase",
            url: "https://firebase.google.com/",
            category: "development",
          },
          {
            id: 15,
            title: "Css Tricks",
            url: "https://css-tricks.com/",
            category: "development",
          },
          {
            id: 16,
            title: "Humanize Ai",
            url: "https://aihumanize.io/",
            category: "AI",
          },
          {
            id: 17,
            title: "Claude AI",
            url: "https://claude.ai/",
            category: "AI",
          },
        ];
        localStorage.setItem("bookmarks", JSON.stringify(this.allBookmarks));
      }
    }

    /**
     * Renders the icons on the screen based on the provided bookmarks data.
     * @param {Array} bookmarks - The list of bookmarks to render as icons.
     */
    renderIcons(bookmarks) {
      this.container.innerHTML = ""; // Clear existing icons
      this.icons = []; // Reset the icons array

      this.iconCountEl.textContent = bookmarks.length;

      bookmarks.forEach((bookmark) => {
        const iconEl = this.createIconElement(bookmark);
        this.container.appendChild(iconEl);

        // Initialize physics properties for each icon
        this.icons.push({
          el: iconEl,
          x: Math.random() * (this.container.clientWidth - 80),
          y: Math.random() * (this.container.clientHeight - 80),
          vx: (Math.random() - 0.5) * 2, // Horizontal velocity
          vy: (Math.random() - 0.5) * 2, // Vertical velocity
        });
      });
    }

    /**
     * Creates a single icon DOM element.
     * @param {Object} bookmark - The bookmark data for the icon.
     * @returns {HTMLElement} The created 'a' element for the icon.
     */
    createIconElement(bookmark) {
      const domain = new URL(bookmark.url).hostname;
      const faviconSrc = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;

      const el = document.createElement("a");
      el.className = "web-icon";
      el.href = bookmark.url;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
      el.title = bookmark.title;

      el.innerHTML = `
                <img src="${faviconSrc}" alt="${bookmark.title} favicon" class="icon-favicon" onerror="this.style.display='none'">
                <span class="icon-category">${bookmark.category}</span>
            `;

      return el;
    }

    /**
     * Starts the animation loop.
     */
    startAnimation() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      const animate = () => {
        this.updateIconPositions();
        this.animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    }

    /**
     * Updates the position of each icon in the animation frame.
     * Handles bouncing off the container walls.
     */
    updateIconPositions() {
      const containerWidth = this.container.clientWidth;
      const containerHeight = this.container.clientHeight;
      const headerHeight = 80; // Approximate height of the header
      const iconSize = 80;

      this.icons.forEach((icon) => {
        // Update position
        icon.x += icon.vx;
        icon.y += icon.vy;

        // Wall collision detection (bounce)
        if (icon.x <= 0 || icon.x >= containerWidth - iconSize) {
          icon.vx *= -1; // Reverse horizontal velocity
        }
        if (icon.y <= 0 || icon.y >= containerHeight - iconSize) {
          icon.vy *= -1; // Reverse vertical velocity
        }

        // Ensure icons don't go out of bounds
        icon.x = Math.max(0, Math.min(icon.x, containerWidth - iconSize));
        icon.y = Math.max(0, Math.min(icon.y, containerHeight - iconSize));

        // Apply the new position using transform for better performance
        icon.el.style.transform = `translate(${icon.x}px, ${icon.y}px)`;
      });
    }
  }

  // Create an instance of the manager to run the app
  new IconManager();
});
