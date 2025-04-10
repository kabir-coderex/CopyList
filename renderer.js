// Clipboard Manager Renderer Process
const { clipboard } = require('electron');
const clipboardy = require('clipboardy');

// DOM Elements
const menuButton = document.getElementById("menu-button")
const closeDrawerButton = document.getElementById("close-drawer")
const drawer = document.getElementById("drawer")
const drawerOverlay = document.getElementById("drawer-overlay")
const allItemsBtn = document.getElementById("all-items-btn")
const pinnedItemsBtn = document.getElementById("pinned-items-btn")
const paginationToggle = document.getElementById("pagination-toggle")
const modeDropdownBtn = document.getElementById("mode-dropdown-btn")
const modeDropdownContent = document.getElementById("mode-dropdown-content")
const modeItems = document.querySelectorAll(".dropdown-item")
const currentModeText = document.getElementById("current-mode")
const modeIcon = document.getElementById("mode-icon")
const clearClipboardBtn = document.getElementById("clear-clipboard-btn")
const clearPinnedBtn = document.getElementById("clear-pinned-btn")
const forceQuitBtn = document.getElementById("force-quit-btn")
const itemsContainer = document.getElementById("items-container")
const pagination = document.getElementById("pagination")
const prevPageBtn = document.getElementById("prev-page")
const nextPageBtn = document.getElementById("next-page")
const pageInfo = document.getElementById("page-info")
const itemTemplate = document.getElementById("item-template")
const toastContainer = document.getElementById("toast-container")

// State
let clipboardCopiedItems = []
let activeTab = "all"
let isPaginationEnabled = true
let currentPage = 1
const itemsPerPage = 6
let currentTheme = localStorage.getItem("theme") || "light"

// Initialize theme
setTheme(currentTheme)

// Load items from localStorage
function loadItems() {
  const savedItems = localStorage.getItem("clipboardItems")
  if (savedItems) {
    clipboardCopiedItems = JSON.parse(savedItems)
  } else {
    // Sample items for demonstration
    clipboardCopiedItems = [
      {
        id: "1",
        content: "https://example.com/important-link",
        isPinned: true,
        timestamp: Date.now() - 3600000,
      },
      {
        id: "2",
        content: "Remember to check the documentation",
        isPinned: false,
        timestamp: Date.now() - 7200000,
      },
      {
        id: "3",
        content: "Meeting notes: Discuss project timeline and deliverables",
        isPinned: false,
        timestamp: Date.now() - 10800000,
      },
      {
        id: "4",
        content: "https://github.com/vercel/next.js",
        isPinned: true,
        timestamp: Date.now() - 14400000,
      },
      {
        id: "5",
        content: "Don't forget to update the dependencies",
        isPinned: false,
        timestamp: Date.now() - 18000000,
      },
      {
        id: "6",
        content: "Client meeting at 3 PM tomorrow",
        isPinned: false,
        timestamp: Date.now() - 21600000,
      },
      {
        id: "7",
        content: "https://tailwindcss.com/docs",
        isPinned: false,
        timestamp: Date.now() - 25200000,
      },
    ]
    saveItems()
  }
}

// Save items to localStorage
function saveItems() {
  localStorage.setItem("clipboardItems", JSON.stringify(clipboardCopiedItems))
}

// Toggle drawer
function toggleDrawer() {
  drawer.classList.toggle("active")
  drawerOverlay.classList.toggle("active")
}

// Close drawer
function closeDrawer() {
  drawer.classList.remove("active")
  drawerOverlay.classList.remove("active")
}

// Set theme
function setTheme(theme) {
  currentTheme = theme
  document.body.setAttribute("data-theme", theme)
  localStorage.setItem("theme", theme)

  // Update UI
  currentModeText.textContent = theme === "dark" ? "Dark" : "Light"

  // Update icon
  if (theme === "dark") {
    modeIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
      </svg>
    `
  } else {
    modeIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="m6.34 17.66-1.41 1.41"></path>
        <path d="m19.07 4.93-1.41 1.41"></path>
      </svg>
    `
  }
}

// Toggle dropdown
function toggleDropdown() {
  modeDropdownContent.classList.toggle("active")
}

// Close dropdown when clicking outside
window.addEventListener("click", (e) => {
  if (!modeDropdownBtn.contains(e.target) && modeDropdownContent.classList.contains("active")) {
    modeDropdownContent.classList.remove("active")
  }
})

// Set active tab
function setActiveTab(tab) {
  activeTab = tab
  allItemsBtn.classList.toggle("active", tab === "all")
  pinnedItemsBtn.classList.toggle("active", tab === "pinned")
  currentPage = 1
  renderItems()
}

// Toggle pagination
function togglePagination() {
  isPaginationEnabled = paginationToggle.checked
  currentPage = 1
  renderItems()
}

// Render items
function renderItems() {
  // Clear container
  itemsContainer.innerHTML = ""

  // Filter items based on active tab
  const filteredItems = activeTab === "all" ? clipboardCopiedItems : clipboardCopiedItems.filter((item) => item.isPinned)

  // Apply pagination if enabled
  const paginatedItems = isPaginationEnabled
    ? filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredItems

  // Render items
  paginatedItems.forEach((item) => {
    const itemElement = itemTemplate.content.cloneNode(true).querySelector(".item")

    // Set data attributes
    itemElement.setAttribute("data-id", item.id)
    itemElement.setAttribute("data-pinned", item.isPinned)

    // Set content
    itemElement.querySelector(".item-time").textContent = new Date(item.timestamp).toLocaleTimeString()
    itemElement.querySelector(".item-content").textContent = item.content

    // Add event listeners
    itemElement.querySelector(".copy-btn").addEventListener("click", () => handleCopyItem(item.id))
    itemElement.querySelector(".pin-btn").addEventListener("click", () => handleTogglePin(item.id))
    itemElement.querySelector(".delete-btn").addEventListener("click", () => handleDeleteItem(item.id))

    // Add keyboard event listener
    itemElement.addEventListener("keydown", (e) => {
      if (e.key === "c" && (e.ctrlKey || e.metaKey)) handleCopyItem(item.id)
      else if (e.key === "p") handleTogglePin(item.id)
      else if (e.key === "d") handleDeleteItem(item.id)
    })

    // Append to container
    itemsContainer.appendChild(itemElement)
  })

  // Update pagination
  updatePagination(filteredItems.length)
}

// Update pagination
function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Update page info
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`

  // Update buttons
  prevPageBtn.disabled = currentPage === 1
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0

  // Show/hide pagination
  if (isPaginationEnabled && totalPages > 1) {
    pagination.classList.remove("hidden")
  } else {
    pagination.classList.add("hidden")
  }
}

// Handle copy item
function handleCopyItem(id) {
  const item = clipboardCopiedItems.find((item) => item.id === id)
  if (item) {
    navigator.clipboard
      .writeText(item.content)
      .then(() => {
        showToast("Copied to clipboard", item.content)
      })
      .catch((err) => {
        console.error("Could not copy text: ", err)
      })
  }
}

// Handle toggle pin
function handleTogglePin(id) {
  clipboardCopiedItems = clipboardCopiedItems.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item))
  saveItems()
  renderItems()
}

// Handle delete item
function handleDeleteItem(id) {
  const item = clipboardCopiedItems.find((item) => item.id === id)
  if (item && !item.isPinned) {
    clipboardCopiedItems = clipboardCopiedItems.filter((item) => item.id !== id)
    saveItems()
    renderItems()
  }
}

// Handle clear clipboard
function handleClearClipboard() {
  clipboardCopiedItems = clipboardCopiedItems.filter((item) => item.isPinned)
  saveItems()
  renderItems()
  closeDrawer()
}

// Handle clear pinned items
function handleClearPinnedItems() {
  clipboardCopiedItems = clipboardCopiedItems.filter((item) => !item.isPinned)
  saveItems()
  renderItems()
  closeDrawer()
}

// Handle force quit
function handleForceQuit() {
  handleClearClipboard()
  closeDrawer()
}

// Show toast notification
function showToast(title, content) {
  const toast = document.createElement("div")
  toast.className = "toast"
  toast.innerHTML = `
    <div class="toast-header">${title}</div>
    <div class="toast-body">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="success-icon">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div class="toast-content">${content}</div>
    </div>
  `

  toastContainer.appendChild(toast)

  // Remove toast after 2 seconds
  setTimeout(() => {
    toast.classList.add("hide")
    setTimeout(() => {
      toast.remove()
    }, 300)
  }, 2000)
}

// Event listeners
menuButton.addEventListener("click", toggleDrawer)
closeDrawerButton.addEventListener("click", closeDrawer)
drawerOverlay.addEventListener("click", closeDrawer)

allItemsBtn.addEventListener("click", () => {
  setActiveTab("all")
  closeDrawer()
})

pinnedItemsBtn.addEventListener("click", () => {
  setActiveTab("pinned")
  closeDrawer()
})

paginationToggle.addEventListener("change", togglePagination)

modeDropdownBtn.addEventListener("click", toggleDropdown)

modeItems.forEach((item) => {
  item.addEventListener("click", () => {
    const mode = item.getAttribute("data-mode")
    setTheme(mode)
    modeDropdownContent.classList.remove("active")
  })
})

clearClipboardBtn.addEventListener("click", handleClearClipboard)
clearPinnedBtn.addEventListener("click", handleClearPinnedItems)
forceQuitBtn.addEventListener("click", handleForceQuit)

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--
    renderItems()
  }
})

nextPageBtn.addEventListener("click", () => {
  const filteredItems = activeTab === "all" ? clipboardCopiedItems : clipboardCopiedItems.filter((item) => item.isPinned)
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  if (currentPage < totalPages) {
    currentPage++
    renderItems()
  }
})

function updateClipboardList() {
  const list = document.getElementById('clipboard-list');
  list.innerHTML = '';

  const pageItems = isPaginationEnabled 
    ? clipboardHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : clipboardHistory; // Show all items if pagination is disabled

  pageItems.forEach((item, index) => {
      const li = document.createElement('li');
      li.classList.add('clipboard-item');

      const isCode = isCodeSnippet(item);
      const header = document.createElement('div');
      header.classList.add('clipboard-item-header');
      header.innerHTML = `<span>${isCode ? "Code Snippet" : "Copied Item"}</span>`;

      const copyBtn = document.createElement('button');
      copyBtn.classList.add('copy-btn');
      copyBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path>
          </svg>
      `;
      copyBtn.onclick = () => {
          clipboard.writeText(item);
          showSuccessMessage('Copied!');
      };

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete-btn');
      deleteBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9 3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4H19C19.5523 4 20 4.44772 20 5C20 5.55228 19.5523 6 19 6H18.4656L17.4376 20.2044C17.3747 21.0813 16.6425 21.75 15.7636 21.75H8.23637C7.3575 21.75 6.62532 21.0813 6.5624 20.2044L5.53444 6H5C4.44772 6 4 5.55228 4 5C4 4.44772 4.44772 4 5 4H9V3ZM7.53444 6L8.52298 20H15.477L16.4656 6H7.53444Z" fill="currentColor"></path>
          </svg>
      `;
      deleteBtn.onclick = (e) => {
          if (confirm('Delete this item?')) {
              e.stopPropagation(); // Prevent the click event from propagating to the li
              // Remove the item from the clipboard history
              const index = clipboardHistory.indexOf(item);
              if (index === -1) {
                  console.error('Item not found in clipboard history:', item);
                  return;
              }

              if(0 === index) clipboard.writeText(''); // Clear the clipboard if the first item is deleted
              // Remove the item from the array
              clipboardHistory.splice(index, 1);



              // Update the UI
              updateClipboardList(); // Re-render the list
              // Show a confirmation message
              alert('Item deleted successfully!');
              // Log the item being deleted
              console.log('Deleting item:', item);
          }
      };

      header.appendChild(copyBtn);
      header.appendChild(deleteBtn);

      const content = document.createElement(isCode ? 'pre' : 'p');
      content.classList.add('clipboard-content');
      content.textContent = item;

      li.appendChild(header);
      li.appendChild(content);
      list.appendChild(li);
      
      li.onclick = () => {
        clipboard.writeText(item);
        showSuccessMessage('Copied!');
      };
  });

  updatePagination();
}

// Initialize
loadItems()
renderItems()

setInterval(() => {
  const currentText = clipboard.readText();
  
  // Only add to the history if it's new or different and not already in the list
  if (currentText !== '' && !clipboardCopiedItems.includes(currentText)) {
    clipboardCopiedItems.unshift(currentText); // Add to the top of the list
    updateClipboardList();
  }
}, 100);
