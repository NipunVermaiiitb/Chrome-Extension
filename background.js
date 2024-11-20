chrome.runtime.onInstalled.addListener(() => {
    console.log("Video Summarizer Extension Installed");
  });
  
  // Function to save notes
  function saveNotes(videoId, notes) {
    chrome.storage.local.set({ [videoId]: notes }, () => {
      console.log("Notes saved for video:", videoId);
    });
  }
  
  // Function to retrieve notes
  function getNotes(videoId, callback) {
    chrome.storage.local.get([videoId], (result) => {
      callback(result[videoId] || []);
    });
  }