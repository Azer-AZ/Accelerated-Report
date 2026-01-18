// ============================================
// Dashboard Configuration & Element References
// ============================================

const API_BASE_URL = 'http://localhost:8000';

// Dashboard UI elements that we'll update with data
const refreshBtn = document.getElementById('refreshBtn');
const reportsList = document.getElementById('reportsList');
const totalReports = document.getElementById('totalReports');
const crashCount = document.getElementById('crashCount');
const slowCount = document.getElementById('slowCount');
const bugCount = document.getElementById('bugCount');

// ============================================
// Initialize Dashboard on Page Load
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load reports immediately when page opens
    loadReports();

    // Allow user to manually refresh by clicking the refresh button
    refreshBtn.addEventListener('click', () => {
        loadReports();
    });

    // Keep dashboard updated automatically (refreshes every 10 seconds)
    setInterval(loadReports, 10000);
});

// ============================================
// Fetch Reports from Backend API
// ============================================

async function loadReports() {
    try {
        // Request the latest reports from the server
        const response = await fetch(`${API_BASE_URL}/reports`);

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`Server error: HTTP ${response.status}. Is the backend running?`);
        }

        // Parse the response and display the reports
        const data = await response.json();
        displayReports(data.reports);
        updateStats(data.reports);

    } catch (error) {
        // Show a friendly error message if something goes wrong
        console.error('Failed to load reports:', error);
        reportsList.innerHTML = `
            <div class="error">
                <p>❌ Oops! Couldn't load the reports.</p>
                <p>Please check that the backend server is running on ${API_BASE_URL}</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// Render Reports on Dashboard
// ============================================

function displayReports(reports) {
    // Show a friendly message if there are no reports yet
    if (reports.length === 0) {
        reportsList.innerHTML = '<div class="empty">📭 No reports yet. Submit your first report to get started!</div>';
        return;
    }

    reportsList.innerHTML = reports.map(report => `
        <div class="report-card">
            <div class="report-header">
                <span class="report-type ${report.type}">
                    ${getTypeEmoji(report.type)} ${report.type.toUpperCase()}
                </span>
                <span class="report-id">ID: ${report.id.substring(0, 8)}</span>
                <span class="report-time">${formatTime(report.created_at)}</span>
            </div>
            
            <div class="report-message">
                ${report.message}
            </div>
            
            <div class="report-meta">
                <span>📱 ${report.platform || 'web'}</span>
                <span>📦 v${report.app_version || '1.0.0'}</span>
                <span class="status-badge ${report.status}">${report.status}</span>
            </div>
            
            ${report.description ? `
                <div class="report-enrichment">
                    <strong>🤖 AI Analysis:</strong> ${report.description}<br>
                    <strong>Severity:</strong> <span class="severity ${report.severity}">${report.severity || 'unknown'}</span><br>
                    <strong>Category:</strong> ${report.category || 'unknown'}<br>
                    ${report.developer_action ? `<strong>Action:</strong> ${report.developer_action}<br>` : ''}
                    <strong>Confidence:</strong> ${formatConfidence(report.confidence)}
                </div>
            ` : ''}
            
            ${report.helpful_resources && report.helpful_resources.length > 0 ? `
                <div class="helpful-resources">
                    <strong>🔗 Helpful Resources (via Yellowcake):</strong>
                    <ul>
                        ${report.helpful_resources.map(resource => `
                            <li>
                                <a href="${resource.url}" target="_blank" rel="noopener">${resource.title}</a>
                                <span class="resource-type">${resource.type}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${report.sentry_event_id ? `
                <div class="sentry-link">
                    <strong>🔍 Sentry Event:</strong> <code>${report.sentry_event_id}</code>
                </div>
            ` : ''}
            
            ${report.screenshot_url ? `
                <div class="screenshot-container">
                    <strong>📸 Screenshot:</strong><br>
                    <a href="http://localhost:8000${report.screenshot_url}" target="_blank">
                        <img src="http://localhost:8000${report.screenshot_url}" alt="Report screenshot" class="report-screenshot">
                    </a>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ============================================
// Update Dashboard Statistics
// ============================================

function updateStats(reports) {
    // Display the total number of reports
    totalReports.textContent = reports.length;

    // Count how many reports we have of each type
    const reportCountsByType = {
        crash: 0,
        slow: 0,
        bug: 0,
        suggestion: 0,
    };

    // Tally up each report type
    reports.forEach(report => {
        if (reportCountsByType.hasOwnProperty(report.type)) {
            reportCountsByType[report.type]++;
        }
    });

    // Update the dashboard displays
    crashCount.textContent = reportCountsByType.crash;
    slowCount.textContent = reportCountsByType.slow;
    bugCount.textContent = reportCountsByType.bug;
}

// ============================================
// Helper Functions for Formatting & Display
// ============================================

// Get a visual emoji that represents the type of report
function getTypeEmoji(type) {
    const reportTypeEmojis = {
        crash: '🔴',      // Red circle for crashes
        slow: '🟡',        // Yellow circle for performance issues
        bug: '🐛',        // Bug emoji for bugs
        suggestion: '💡',  // Light bulb for suggestions
    };
    return reportTypeEmojis[type] || '📝';
}

// Convert ISO timestamp to a human-readable date and time
function formatTime(isoString) {
    const date = new Date(isoString);
    // Use the user's local timezone and language preferences
    return date.toLocaleString();
}

// Convert confidence score (0-1) to a percentage string
function formatConfidence(confidence) {
    if (!confidence) return 'N/A';
    // Round to nearest whole number for easier reading
    const percent = Math.round(confidence * 100);
    return `${percent}%`;
}

