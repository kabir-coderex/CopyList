const { clipboard } = require('electron');
const clipboardy = require('clipboardy');

// Array to store clipboard history
let clipboardHistory = [];
let currentPage = 1;
const itemsPerPage = 5; // Number of items per page

// Function to determine if the text is code based on patterns
function isCode(text) {
  // Check if the text has multiple lines and starts with indentation (which is typical for code)
  const lines = text.split('\n');
  const hasIndentedLine = lines.some(line => /^\s+/.test(line)); // Line starts with spaces/tabs
  const hasCodePattern = /function\s+\w+\s*\(.*\)\s*\{/.test(text) || /class\s+\w+/.test(text); // Simple regex patterns for functions or classes

  // Combine both conditions: either indented lines or recognizable code patterns
  return hasIndentedLine || hasCodePattern;
}

// Function to update the clipboard history UI with code styling
function isCodeSnippet(text) {
  // Check if the text has multiple lines and starts with indentation (which is typical for code)
  const lines = text.split('\n');
  const hasIndentedLine = lines.some(line => /^\s+/.test(line)); // Line starts with spaces/tabs
  const hasCodePattern = /function\s+\w+\s*\(.*\)\s*\{/.test(text) || /class\s+\w+/.test(text); // Simple regex patterns for functions or classes

  // Combine both conditions: either indented lines or recognizable code patterns
  return hasIndentedLine || hasCodePattern;
}

function updateClipboardList() {
  const list = document.getElementById('clipboard-list');
  list.innerHTML = '';

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = clipboardHistory.slice(startIndex, endIndex);

  pageItems.forEach((item, index) => {
      const li = document.createElement('li');
      li.classList.add('clipboard-item');

      const isCode = isCodeSnippet(item);

      // Create header with buttons
      const header = document.createElement('div');
      header.classList.add('clipboard-item-header');
      header.innerHTML = `<span>${isCode ? "Code Snippet" : "Copied Item"}</span>`;

      // Copy button with SVG icon
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

      // Delete button with SVG icon
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete-btn');
      deleteBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9 3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4H19C19.5523 4 20 4.44772 20 5C20 5.55228 19.5523 6 19 6H18.4656L17.4376 20.2044C17.3747 21.0813 16.6425 21.75 15.7636 21.75H8.23637C7.3575 21.75 6.62532 21.0813 6.5624 20.2044L5.53444 6H5C4.44772 6 4 5.55228 4 5C4 4.44772 4.44772 4 5 4H9V3ZM7.53444 6L8.52298 20H15.477L16.4656 6H7.53444Z" fill="currentColor"></path>
          </svg>
      `;
      deleteBtn.onclick = () => {
          if (confirm('Delete this item?')) {
              clipboardHistory.splice(index, 1);
              updateClipboardList();
          }
      };

      // Append buttons to header
      header.appendChild(copyBtn);
      header.appendChild(deleteBtn);

      // Create content block
      const content = document.createElement(isCode ? 'pre' : 'p');
      content.classList.add('clipboard-content');
      content.textContent = item;

      // Append to list item
      li.appendChild(header);
      li.appendChild(content);
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
