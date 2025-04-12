// Clipboard Manager Renderer Process
const { clipboard, Tray } = require('electron');
const path = require('path');
// Create the Tray icon
let tray;
const { checkForUpdates } = require("./updateManager");

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
const updateAppBtn = document.getElementById("update-app-btn")
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
    clipboard.writeText(item?.content);
    showToast("Copied to clipboard", item?.content)
  }else {
    showToast("Error", "Item not found")
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
drawerOverlay.addEventListener("click", closeDrawer);
updateAppBtn.addEventListener("click", () => {
    tray = new Tray(path.join(__dirname, 'assets/icons/copy_list.png')); // Use a transparent PNG for macOS
    checkForUpdates(tray)
})

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

let lastText = '';

setInterval(() => {
  const currentText = clipboard.readText();
  if (currentText && currentText !== lastText) {
    lastText = currentText;
    const newItem = {
      id: Date.now(),
      content: currentText,
      timestamp: Date.now(),
      isPinned: false
    };
    clipboardCopiedItems.unshift(newItem); // Add new item to the beginning of the array
    // Initialize
    loadItems(currentText)
    renderItems()
  }
}, 100); // check every second

