// Check if a video element is present
const video = document.querySelector('video');

if (video) {
    // Function to handle time updates and visual detection
    video.addEventListener('timeupdate', async () => {
        const currentTime = video.currentTime;
        console.log(`Current time: ${currentTime}`);

        // Integrate with Gemini Nano for visual detection
        try {
            const analysis = await geminiNano.analyzeVideo(video, currentTime);
            console.log("Visual Analysis:", analysis);
            // You can process the analysis result as needed
        } catch (error) {
            console.error("Error analyzing video:", error);
        }
    });
}

// Function to add user notes
// Function to add user notes
// Function to add user notes
// Function to add user notes
function addUserNote() {
    const note = prompt("Enter your note:");
    if (note) {
        // More robust video ID extraction
        const videoId = extractVideoId();
        const timestamp = video ? video.currentTime.toFixed(2) : 'N/A';

        console.log('Attempting to save note:', {
            note,
            videoId,
            timestamp
        });

        // Directly save the note to storage
        saveNoteToStorage(videoId, note, timestamp);
    }
}

// Robust video ID extraction
function extractVideoId() {
    // Multiple methods to extract video ID
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v') || 
           window.location.pathname.split('/').pop() || 
           'unknown_video';
}

// Function to save notes to chrome storage
function saveNoteToStorage(videoId, noteText, timestamp) {
    if (!videoId || videoId === 'unknown_video') {
        console.error("No valid video ID found");
        alert("Error: Could not save note - invalid video");
        return;
    }

    const noteEntry = { 
        timestamp: new Date().toISOString(), 
        note: noteText, 
        videoTimestamp: timestamp 
    };

    chrome.storage.local.get(['notes'], (result) => {
        // Create notes object if it doesn't exist
        const notes = result.notes || {};
        
        console.log('Existing notes before save:', notes);

        // Ensure video ID array exists
        if (!notes[videoId]) {
            notes[videoId] = [];
        }

        // Add note to video's notes
        notes[videoId].push(noteEntry);
        
        // Save updated notes
        chrome.storage.local.set({ notes: notes }, () => {
            console.log("Note saved successfully:", noteEntry);
            console.log("Updated notes in storage:", notes);
            alert("Note saved successfully!");
        });
    });
}

// Function to download notes (same as before)
function downloadNotes() {
    chrome.storage.local.get(['notes'], (result) => {
        const notes = result.notes || {};
        console.log("Retrieved notes from storage:", notes);

        let notesContent = '';

        // Convert notes into a string format
        for (const videoId in notes) {
            notesContent += `Video ID: ${videoId}\n`;
            notes[videoId].forEach(note => {
                notesContent += `Saved At: ${note.timestamp}, Video Timestamp: ${note.videoTimestamp || 'N/A'}, Note: ${note.note}\n`;
            });
            notesContent += '\n';
        }

        if (notesContent === '') {
            alert('No notes available to download.');
            return;
        }

        // Create a blob and trigger download
        const blob = new Blob([notesContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Button to download notes
const downloadButton = document.createElement('button');
downloadButton.textContent = "Download Notes";
downloadButton.style.position = 'absolute';
downloadButton.style.zIndex = 1000; // Ensure it's on top of other elements
downloadButton.style.top = '90px';
downloadButton.style.right = '10px';
downloadButton.onclick = downloadNotes; // Attach download function
document.body.appendChild(downloadButton);

// Button to add note
const noteButton = document.createElement('button');
noteButton.textContent = "Add Note";
noteButton.style.position = 'absolute';
noteButton.style.zIndex = 1000; // Ensure it's on top of other elements
noteButton.style.top = '10px';
noteButton.style.right = '10px';
noteButton.onclick = addUserNote;
document.body.appendChild(noteButton);

// Function to generate summary
async function generateSummary() {
    const videoId = window.location.search.split('v=')[1]; // Get video ID

    // Call the Gemini Nano API to generate a summary
    try {
        const summary = await geminiNano.summarizeVideo(video);
        console.log("Generated Summary:", summary);

        // Save the summary
        chrome.runtime.sendMessage({ action: "saveSummary", videoId, summary }, (response) => {
            if (response.success) {
                alert("Summary generated and saved!");
            } else {
                alert("Error generating summary.");
            }
        });
    } catch (error) {
        console.error("Error generating summary:", error);
        alert("Failed to generate summary.");
    }
}

// Add a button to generate summary
const summaryButton = document.createElement('button');
summaryButton.textContent = "Generate Summary";
summaryButton.style.position = 'absolute';
summaryButton.style.zIndex = 1000; // Ensure it's on top of other elements
summaryButton.style.top = '50px';
summaryButton.style.right = '10px';
summaryButton.onclick = generateSummary;
document.body.appendChild(summaryButton);

chrome.storage.local.get(['notes'], (result) => {
    console.log(result.notes);
});