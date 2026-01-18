// ============================================
// APP CONFIGURATION
// ============================================
// Backend server URL where reports are sent
const API_BASE_URL = 'http://localhost:8000';

// Local storage keys for persisting data
const QUEUE_KEY = 'accelerated_reports_queue';        // Reports waiting to be sent
const RECENT_KEY = 'accelerated_reports_recent';      // Recently submitted reports

// ============================================
// APP STATE
// ============================================
// Chaos mode helps test failure scenarios
let chaosMode = false;
// Reference to the auto-retry interval
let retryInterval = null;

// ============================================
// DOM ELEMENTS - Report Form & UI
// ============================================
const form = document.getElementById('reportForm');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');  // Shows success/error messages
const chaosModeToggle = document.getElementById('chaosMode');
const queueStatus = document.getElementById('queueStatus');      // Shows if reports are queued
const queueCount = document.getElementById('queueCount');        // Number of reports in queue
const recentList = document.getElementById('recentList');        // Recent submissions display
const quickDescription = document.getElementById('quickDescription');
const screenshotInput = document.getElementById('screenshot');
const screenshotPreview = document.getElementById('screenshotPreview');

// ============================================
// INITIALIZE APP ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Restore any reports that were queued from before
    loadQueue();
    // Restore the list of recently submitted reports
    loadRecent();
    // Start the auto-retry system for failed reports
    startQueueProcessor();

    // Let user toggle chaos mode for testing
    chaosModeToggle.addEventListener('change', (e) => {
        chaosMode = e.target.checked;
        showStatus(chaosMode ? '⚠️ Chaos Mode Enabled' : '✅ Normal Mode', chaosMode ? 'warning' : 'success');
    });

    // When user uploads a screenshot, show a preview of it
    screenshotInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                screenshotPreview.innerHTML = `<img src="${e.target.result}" alt="Screenshot">`;
                screenshotPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // Setup quick action buttons for one-click reporting
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const type = e.currentTarget.dataset.type;
            const message = e.currentTarget.dataset.message;

            // Give visual feedback when button is clicked
            e.currentTarget.classList.add('clicked');
            setTimeout(() => e.currentTarget.classList.remove('clicked'), 300);

            // Get any additional context the user provided
            const description = quickDescription.value.trim();

            // Try to automatically capture a screenshot
            let screenshotData = null;
            try {
                const screenshotBlob = await captureScreenshot();
                if (screenshotBlob) {
                    // Convert the image to base64 so we can send it as JSON
                    screenshotData = await blobToBase64(screenshotBlob);
                    showStatus('📸 Screenshot captured!', 'success');

                    // Show the user what will be sent
                    screenshotPreview.innerHTML = `<img src="${screenshotData}" alt="Screenshot">`;
                    screenshotPreview.classList.remove('hidden');
                }
            } catch (err) {
                console.log('Screenshot capture not available:', err);
            }

            // Submit the quick report with all collected data
            await submitReport({
                type: type,
                message: description ? `${message}. Note: ${description}` : message,
                platform: detectPlatform(),
                app_version: '1.0.0',
                screenshot: screenshotData,  // base64 string of the screenshot
            }, true); // true = quick action

            // Clean up the form after successful submission
            quickDescription.value = '';
            screenshotInput.value = '';
            screenshotPreview.innerHTML = '';
            screenshotPreview.classList.add('hidden');
        });
    });
});

// ============================================
// SCREENSHOT CAPTURE
// ============================================
// Try multiple methods to capture a screenshot (from automatic to manual)
async function captureScreenshot() {
    try {
        // Attempt 1: Use html2canvas to capture the page DOM
        if (typeof html2canvas !== 'undefined') {
            const canvas = await html2canvas(document.body);
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            return blob;
        }

        // Attempt 2: Use browser screen capture API
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'screen' }
            });

            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            // Wait for video to be ready
            await new Promise(resolve => {
                video.onloadedmetadata = resolve;
            });

            // Capture frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);

            // Stop stream
            stream.getTracks().forEach(track => track.stop());

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            return blob;
        }

        // Attempt 3: Check if user manually uploaded a file
        if (screenshotInput.files[0]) {
            return screenshotInput.files[0];
        }

        return null;
    } catch (err) {
        console.log('Screenshot capture failed:', err);
        // Fall back to manual file upload if automatic capture failed
        if (screenshotInput.files[0]) {
            return screenshotInput.files[0];
        }
        return null;
    }
}

// ============================================
// UTILITY: Convert Image Data
// ============================================
// Convert image blob to base64 string for JSON transmission
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ============================================
// UTILITY: Platform Detection
// ============================================
// Automatically detect what device/browser is being used
function detectPlatform() {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'web';
}

// ============================================
// FORM SUBMISSION
// ============================================
// Handle when user submits the main form
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const reportData = {
        type: document.getElementById('reportType').value,
        message: document.getElementById('message').value || document.getElementById('reportType').selectedOptions[0].textContent,
        platform: detectPlatform(),
        app_version: '1.0.0',
    };

    await submitReport(reportData, false);
});

// ============================================
// REPORT SUBMISSION
// ============================================
// Send a report to the backend, with auto-queue fallback if it fails
async function submitReport(reportData, isQuickAction = false) {
    if (submitBtn) submitBtn.disabled = true;
    showStatus('📤 Sending...', 'info');

    try {
        // Chaos mode: randomly fail to test the retry system
        if (chaosMode && Math.random() < 0.3) {
            throw new Error('Simulated network failure (Chaos Mode)');
        }

        // Chaos mode: randomly add delays to test patience
        if (chaosMode && Math.random() < 0.3) {
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        const response = await fetch(`${API_BASE_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData),
        });

        if (!response.ok) {
            throw new Error(`Server error: HTTP ${response.status}`);
        }

        const result = await response.json();

        // Show what the AI found (if any enrichment was done)
        if (result.ai_enriched) {
            showStatus(`✅ Sent! AI detected: ${result.category || 'analyzing'}`, 'success');
        } else {
            showStatus(`✅ Report sent!`, 'success');
        }

        // Add to recent submissions and reset the form
        addToRecent(reportData, result.report_id);
        if (form) form.reset();

    } catch (error) {
        console.error('Submit failed:', error);

        // Save the report to retry later when connection is restored
        queueReport(reportData);
        showStatus('⏳ Queued - will retry automatically', 'warning');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// ============================================
// QUEUE MANAGEMENT - Store & Retry Queued Reports
// ============================================
// Add a report to the local queue for later retry
function queueReport(reportData) {
    const queue = getQueue();
    queue.push({
        ...reportData,
        queued_at: new Date().toISOString(),
        retry_count: 0,  // Track how many times we've tried to send this
    });
    saveQueue(queue);
    updateQueueUI();
}

// Get all queued reports from local storage
function getQueue() {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save the queue to browser storage
function saveQueue(queue) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// Load queued reports when page loads
function loadQueue() {
    updateQueueUI();
}

// Update the UI to show how many reports are queued
function updateQueueUI() {
    const queue = getQueue();
    queueCount.textContent = queue.length;  // Show number of queued reports

    // Show the queue status only if there are items in it
    if (queue.length > 0) {
        queueStatus.classList.remove('hidden');
    } else {
        queueStatus.classList.add('hidden');
    }
}

// ============================================
// QUEUE AUTO-RETRY PROCESSOR
// ============================================
// Automatically try to send queued reports every 5 seconds
function startQueueProcessor() {
    retryInterval = setInterval(async () => {
        const queue = getQueue();

        // Nothing to do if queue is empty
        if (queue.length === 0) return;

        console.log(`Processing queue: ${queue.length} items waiting...`);

        // Take the first item from the queue and try to send it
        const item = queue[0];

        try {
            const response = await fetch(`${API_BASE_URL}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: item.type,
                    message: item.message,
                    platform: item.platform,
                    app_version: item.app_version,
                }),
            });

            if (!response.ok) {
                throw new Error(`Server error: HTTP ${response.status}`);
            }

            const result = await response.json();

            // Success! Remove from queue and add to recent
            queue.shift();
            saveQueue(queue);
            updateQueueUI();

            showStatus(`✅ Queued report delivered! ID: ${result.report_id.substring(0, 8)}...`, 'success');
            addToRecent(item, result.report_id);

        } catch (error) {
            console.error('Retry attempt failed:', error);

            // Track how many times we've tried
            item.retry_count = (item.retry_count || 0) + 1;

            // Give up after too many failed attempts
            if (item.retry_count > 10) {
                queue.shift();
                saveQueue(queue);
                updateQueueUI();
                showStatus('❌ Report failed after 10 retries. Discarded.', 'error');
            } else {
                // Update queue and try again next time
                queue[0] = item;
                saveQueue(queue);
            }
        }
    }, 5000); // Check queue every 5 seconds
}

// ============================================
// RECENT SUBMISSIONS - Track Last 5 Reports
// ============================================
// Add a report to the recent submissions list
function addToRecent(reportData, reportId) {
    const recent = getRecent();
    recent.unshift({
        id: reportId,
        type: reportData.type,
        message: reportData.message,
        timestamp: new Date().toISOString(),
    });

    // Only keep the 5 most recent to save space
    if (recent.length > 5) {
        recent.pop();
    }

    saveRecent(recent);
    displayRecent();
}

// Get all recent submissions from storage
function getRecent() {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save recent submissions to browser storage
function saveRecent(recent) {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

// Load and display recent submissions on page load
function loadRecent() {
    displayRecent();
}

// Render the recent submissions list on the page
function displayRecent() {
    const recent = getRecent();

    // Show friendly message if nothing has been submitted yet
    if (recent.length === 0) {
        recentList.innerHTML = '<p class="empty">📭 No recent submissions yet</p>';
        return;
    }

    recentList.innerHTML = recent.map(item => `
        <div class="recent-item">
            <span class="recent-type ${item.type}">${getTypeEmoji(item.type)} ${item.type}</span>
            <span class="recent-message">${truncate(item.message, 50)}</span>
            <span class="recent-time">${formatTime(item.timestamp)}</span>
        </div>
    `).join('');
}

// ============================================
// UI HELPERS - Display Messages & Format Data
// ============================================
// Show a status message to the user (success, warning, error, info)
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.classList.remove('hidden');

    // Auto-hide positive messages after 5 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 5000);
    }
}

// Get emoji icon for each report type
function getTypeEmoji(type) {
    const typeEmojis = {
        crash: '🔴',      // Red circle for crashes
        slow: '🟡',        // Yellow for performance
        bug: '🐛',        // Bug emoji for bugs
        suggestion: '💡',  // Lightbulb for ideas
    };
    return typeEmojis[type] || '📝';
}

// Shorten text to a maximum length with ellipsis
function truncate(str, length) {
    return str.length > length ? str.substring(0, length) + '...' : str;
}

// Convert timestamp to human-friendly relative time ("5m ago")
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);  // Time difference in seconds

    // Show relative time for recent submissions
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    // Show full date for older submissions
    return date.toLocaleDateString();
}
