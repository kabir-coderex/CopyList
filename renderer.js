const { clipboard } = require('electron');
const clipboardy = require('clipboardy');

// Array to store clipboard history
let clipboardHistory = [];

// Function to update the clipboard history UI
function updateClipboardList() {
  const list = document.getElementById('clipboard-list');
  list.innerHTML = ''; // Clear existing list

  clipboardHistory.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item;

    // Create a copy button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.style.backgroundColor = 'green'; // Green color for copy button
    copyBtn.style.color = 'white';
    copyBtn.style.padding = '8px 16px';
    copyBtn.style.margin = '5px';
    copyBtn.style.border = 'none';
    copyBtn.style.borderRadius = '5px';
    copyBtn.style.cursor = 'pointer';
    copyBtn.onclick = () => {
      clipboard.writeText(item); // Paste the selected item
      showSuccessMessage('Copied!');
    };

    // Create a delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.backgroundColor = 'red'; // Red color for delete button
    deleteBtn.style.color = 'white';
    deleteBtn.style.padding = '8px 16px';
    deleteBtn.style.margin = '5px';
    deleteBtn.style.border = 'none';
    deleteBtn.style.borderRadius = '5px';
    deleteBtn.style.cursor = 'pointer';
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
}

// Function to show success message when an item is copied
function showSuccessMessage(message) {
  const successMessage = document.createElement('div');
  successMessage.textContent = message;
  successMessage.style.backgroundColor = 'green';
  successMessage.style.color = 'white';
  successMessage.style.padding = '10px';
  successMessage.style.marginTop = '10px';
  successMessage.style.borderRadius = '5px';
  document.body.appendChild(successMessage);

  // Hide the success message after 2 seconds
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 2000);
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
    clipboardHistory.push(currentText);
    updateClipboardList();
  }
}, 1000); // Check every second
