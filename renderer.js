const { clipboard } = require('electron');
const clipboardy = require('clipboardy');

// Array to store clipboard history
let clipboardHistory = [];
let currentPage = 1;
const itemsPerPage = 5; // Number of items per page

// Function to update the clipboard history UI
function updateClipboardList() {
  const list = document.getElementById('clipboard-list');
  list.innerHTML = ''; // Clear existing list

  // Get the items for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = clipboardHistory.slice(startIndex, endIndex);

  pageItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.classList.add('clipboard-item');
    li.textContent = item;

    // Create a copy button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.classList.add('copy-btn');
    copyBtn.onclick = () => {
      clipboard.writeText(item); // Paste the selected item
      showSuccessMessage('Copied!');
    };

    // Create a delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.onclick = () => {
      const confirmDelete = confirm('Are you sure you want to delete this item?');
      if (confirmDelete) {
        clipboardHistory.splice(index, 1); // Remove the item from the history
        updateClipboardList(); // Re-render the list
      }
    };

    // Add buttons to the list item
    li.appendChild(copyBtn);
    li.appendChild(deleteBtn);

    // Add to the list in the UI
    list.appendChild(li);
  });

  updatePagination();
}

// Function to show success message when an item is copied
function showSuccessMessage(message) {
  const successMessage = document.createElement('div');
  successMessage.textContent = message;
  successMessage.classList.add('success-message');
  document.body.appendChild(successMessage);

  // Hide the success message after 2 seconds
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 2000);
}

// Pagination control
function updatePagination() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = ''; // Clear existing pagination

  const totalPages = Math.ceil(clipboardHistory.length / itemsPerPage);

  // Previous page button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.classList.add('pagination-btn');
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    currentPage--;
    updateClipboardList();
  };

  // Next page button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.classList.add('pagination-btn');
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    currentPage++;
    updateClipboardList();
  };

  pagination.appendChild(prevBtn);
  pagination.appendChild(nextBtn);
}

// Handle the "Clear Clipboard" button click
const clearBtn = document.getElementById('clear-btn');
clearBtn.addEventListener('click', () => {
  const confirmClear = confirm('Are you sure you want to clear the clipboard?');
  if (confirmClear) {
    clipboardy.writeSync('');  // Clear the clipboard content
    clipboardHistory = []; // Clear the history
    alert('Clipboard Cleared!');
    updateClipboardList(); // Re-render the list
  }
});

// Set up a timer to check the clipboard every second (1000ms)
setInterval(() => {
  const currentText = clipboard.readText();
  
  // Only add to the history if it's new or different and not already in the list
  if (currentText !== '' && !clipboardHistory.includes(currentText)) {
    clipboardHistory.unshift(currentText); // Add new item at the top
    updateClipboardList();
  }
}, 1000); // Check every second
