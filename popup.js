document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const downloadButton = document.getElementById('downloadNotes');

    console.log('Popup DOM fully loaded and parsed');

    // Debugging: Log ALL storage contents
    chrome.storage.local.get(null, (allData) => {
        console.log('COMPLETE STORAGE CONTENTS:', allData);
    });

    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            console.log('Download Notes button clicked');
            
            // Comprehensive storage access
            chrome.storage.local.get(['notes'], (result) => {
                // Extensive logging
                console.log('Raw storage retrieval:', result);
                console.log('Notes object:', result.notes);
                console.log('Notes object type:', typeof result.notes);
                console.log('Notes object keys:', result.notes ? Object.keys(result.notes) : 'No notes object');

                if (!result.notes) {
                    console.error('No notes found in storage');
                    statusDiv.textContent = 'No notes found';
                    return;
                }

                let notesContent = '';
                
                // Detailed note processing
                try {
                    // Check if notes exist and are structured correctly
                    if (typeof result.notes === 'object' && Object.keys(result.notes).length > 0) {
                        for (const videoId in result.notes) {
                            console.log(`Processing notes for video: ${videoId}`);
                            notesContent += `Video ID: ${videoId}\n`;
                            
                            // Verify notes array exists and is not empty
                            if (Array.isArray(result.notes[videoId]) && result.notes[videoId].length > 0) {
                                result.notes[videoId].forEach((note, index) => {
                                    console.log(`Note ${index}:`, note);
                                    notesContent += `Timestamp: ${note.timestamp}, Note: ${note.note}\n`;
                                });
                            } else {
                                console.warn(`No notes found for video ${videoId}`);
                            }
                            
                            notesContent += '\n';
                        }
                    } else {
                        console.warn('Notes object is empty or invalid');
                    }

                    // Verify notes content before download
                    console.log('Generated Notes Content:', notesContent);

                    if (notesContent.trim() === '') {
                        console.error('No notes content to download');
                        statusDiv.textContent = 'No notes to download';
                        return;
                    }

                    // Download process
                    const blob = new Blob([notesContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'video_notes.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    console.log('Download process completed');
                    statusDiv.textContent = 'Notes downloaded successfully';

                } catch (error) {
                    console.error('Error processing notes:', error);
                    statusDiv.textContent = `Error: ${error.message}`;
                }
            });
        });
    } else {
        console.error('Download button not found');
    }
});