const fs = require('fs');
const path = require('path');

// Define the path where pinned items will be saved persistently
const pinnedFilePath = path.join(__dirname, 'pinnedItems.json');

/**
 * Load pinned items from the pinnedItems.json file.
 * If the file doesn't exist, return an empty array.
 */
function loadPinnedItems() {
  try {
    if (!fs.existsSync(pinnedFilePath)) {
      return [];
    }
    const data = fs.readFileSync(pinnedFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading pinned items:', error);
    return [];
  }
}

/**
 * Save pinned items to pinnedItems.json file.
 * @param {Array} items - Array of pinned item objects to save
 */
function savePinnedItems(items) {
  try {
    fs.writeFileSync(pinnedFilePath, JSON.stringify(items, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving pinned items:', error);
  }
}

/**
 * Pin an item by adding it to the pinned list and saving.
 * @param {Object} item - Clipboard item to pin
 */
function pinItem(item) {
  const pinnedItems = loadPinnedItems();
  const exists = pinnedItems.find(i => i.id === item.id);

  if (!exists) {
    item.isPinned = true;
    pinnedItems.push(item);
    savePinnedItems(pinnedItems);
    console.log(`Item pinned: ${item.content}`);
  }
}

/**
 * Unpin an item by removing it from the pinned list.
 * @param {Number} itemId - ID of the item to unpin
 */
function unpinItem(itemId) {
  let pinnedItems = loadPinnedItems();
  pinnedItems = pinnedItems.filter(item => item.id !== itemId);
  savePinnedItems(pinnedItems);
  console.log(`Item unpinned: ${itemId}`);
}

/**
 * Delete a pinned item completely.
 * @param {Number} itemId - ID of the item to delete
 */
function deletePinnedItem(itemId) {
  unpinItem(itemId); // Since unpin is essentially delete from pinned
  console.log(`Pinned item deleted: ${itemId}`);
}

/**
 * Get all pinned items
 * @returns {Array} List of pinned items
 */
function getPinnedItems() {
  return loadPinnedItems();
}

/**
 * Clear all pinned items by overwriting the file with an empty array.
 */
function clearAllPinnedItems() {
    try {
      savePinnedItems([]);
      console.log('All pinned items cleared.');
    } catch (error) {
      console.error('Error clearing pinned items:', error);
    }
}

// Exporting the functions to be used elsewhere
module.exports = {
  pinItem,
  unpinItem,
  deletePinnedItem,
  getPinnedItems,
  clearAllPinnedItems,
};
