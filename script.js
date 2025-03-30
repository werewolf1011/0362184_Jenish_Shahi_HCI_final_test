// User Authentication System
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const authButtons = document.getElementById('authButtons');
const userProfile = document.getElementById('userProfile');
const userAvatar = document.getElementById('userAvatar');
const userDropdown = document.getElementById('userDropdown');
const logoutBtn = document.getElementById('logoutBtn');
const adminLink = document.getElementById('adminLink');
const adminPanel = document.getElementById('adminPanel');
const adminClose = document.getElementById('adminClose');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authToggleLink = document.getElementById('authToggleLink');
const authToggleText = document.getElementById('authToggleText');

// Sample user data (in a real app, this would be from a backend)
let currentUser = null;
const users = [
    { id: 1, name: "John Doe", email: "john@example.com", password: "password123", isAdmin: true },
    { id: 2, name: "Jane Smith", email: "jane@example.com", password: "password123", isAdmin: false }
];

// Authentication logs (would come from backend in real app)
let authLogs = [
    { id: 1, userId: 1, email: "john@example.com", timestamp: "2023-05-15 09:30:22", ip: "192.168.1.100", eventType: "success", details: "Successful login" },
    { id: 2, userId: null, email: "hacker@example.com", timestamp: "2023-05-15 10:15:45", ip: "45.33.12.154", eventType: "failed", details: "Failed login attempt" },
    { id: 3, userId: null, email: "admin'--", timestamp: "2023-05-15 10:16:12", ip: "45.33.12.154", eventType: "injection", details: "SQL injection attempt detected" },
    { id: 4, userId: null, email: "<script>alert('xss')<\/script>", timestamp: "2023-05-15 10:17:30", ip: "45.33.12.154", eventType: "injection", details: "XSS attempt detected" },
    { id: 5, userId: 2, email: "jane@example.com", timestamp: "2023-05-15 11:05:18", ip: "192.168.1.105", eventType: "success", details: "Successful login" }
];

// Security alerts (would come from backend in real app)
let securityAlerts = [
    { id: 1, timestamp: "2023-05-15 10:16:12", alertType: "SQL Injection", severity: "high", description: "Potential SQL injection attempt from IP 45.33.12.154", actionTaken: "Blocked IP, notified admin" },
    { id: 2, timestamp: "2023-05-15 10:17:30", alertType: "XSS Attempt", severity: "high", description: "Potential XSS attempt from IP 45.33.12.154", actionTaken: "Blocked IP, notified admin" },
    { id: 3, timestamp: "2023-05-15 10:45:22", alertType: "Brute Force", severity: "medium", description: "Multiple failed login attempts for user john@example.com", actionTaken: "Temporarily locked account" }
];

// Toggle between login and signup forms
loginTab.addEventListener('click', (e) => {
    e.preventDefault();
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    authToggleText.innerHTML = 'Don\'t have an account? <a href="#" id="authToggleLink">Sign up</a>';
});

signupTab.addEventListener('click', (e) => {
    e.preventDefault();
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
    authToggleText.innerHTML = 'Already have an account? <a href="#" id="authToggleLink">Login</a>';
});

authToggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (loginTab.classList.contains('active')) {
        signupTab.click();
    } else {
        loginTab.click();
    }
});

// Open auth modal
loginBtn.addEventListener('click', () => {
    authModal.style.display = 'flex';
    loginTab.click();
});

signupBtn.addEventListener('click', () => {
    authModal.style.display = 'flex';
    signupTab.click();
});

// Close auth modal when clicking outside
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.style.display = 'none';
    }
});

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Check for SQL/XSS injection attempts
    if (detectInjection(email) || detectInjection(password)) {
        logSecurityEvent(null, email, "injection", "Injection attempt detected during login");
        showAlert("Security Alert", "Our system detected potentially malicious input. Please try again with valid credentials.", "danger");
        return;
    }

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Successful login
        currentUser = user;
        authButtons.style.display = 'none';
        userProfile.style.display = 'flex';
        userAvatar.textContent = user.name.split(' ').map(n => n[0]).join('');
        authModal.style.display = 'none';

        // Log successful login
        logSecurityEvent(user.id, user.email, "success", "Successful login");

        // Show welcome message
        showAlert("Welcome Back", `You're logged in as ${user.name}`, "success");
    } else {
        // Failed login
        logSecurityEvent(null, email, "failed", "Failed login attempt");
        showAlert("Login Failed", "Invalid email or password. Please try again.", "warning");
    }
});

// Signup form submission
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Check for SQL/XSS injection attempts
    if (detectInjection(name) || detectInjection(email) || detectInjection(password)) {
        logSecurityEvent(null, email, "injection", "Injection attempt detected during signup");
        showAlert("Security Alert", "Our system detected potentially malicious input. Please try again with valid information.", "danger");
        return;
    }

    if (password !== confirmPassword) {
        showAlert("Signup Failed", "Passwords don't match. Please try again.", "warning");
        return;
    }

    // Check if user already exists
    if (users.some(u => u.email === email)) {
        showAlert("Signup Failed", "An account with this email already exists.", "danger");
        return;
    }

    // Create new user (in a real app, this would be a backend call)
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        isAdmin: false
    };

    users.push(newUser);
    currentUser = newUser;
    authButtons.style.display = 'none';
    userProfile.style.display = 'flex';
    userAvatar.textContent = newUser.name.split(' ').map(n => n[0]).join('');
    authModal.style.display = 'none';

    // Log successful signup
    logSecurityEvent(newUser.id, newUser.email, "success", "New account created");

    // Show welcome message
    showAlert("Welcome", `Account created successfully! You're logged in as ${newUser.name}`, "success");
});

// Logout
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) {
        logSecurityEvent(currentUser.id, currentUser.email, "logout", "User logged out");
        showAlert("Logged Out", `You've been successfully logged out.`, "success");
    }
    currentUser = null;
    authButtons.style.display = 'block';
    userProfile.style.display = 'none';
    userDropdown.classList.remove('show');

    // Close admin panel if open
    adminPanel.style.display = 'none';
});

// User dropdown
userAvatar.addEventListener('click', () => {
    userDropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-profile')) {
        userDropdown.classList.remove('show');
    }
});

// Admin panel
adminLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser && currentUser.isAdmin) {
        adminPanel.style.display = 'block';
        userDropdown.classList.remove('show');
        loadAdminPanel();
    }
});

adminClose.addEventListener('click', () => {
    adminPanel.style.display = 'none';
});

// Admin navigation
document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.getAttribute('data-section');

        // Update active nav link
        document.querySelectorAll('.admin-nav-link').forEach(navLink => {
            navLink.classList.remove('active');
        });
        e.target.classList.add('active');

        // Show selected section
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');
    });
});

// Load admin panel data
function loadAdminPanel() {
    // Load authentication logs
    const authLogsBody = document.getElementById('authLogsBody');
    authLogsBody.innerHTML = '';

    authLogs.forEach(log => {
        const row = document.createElement('tr');

        let eventTypeBadge;
        if (log.eventType === 'success') {
            eventTypeBadge = '<span class="badge badge-success">Success</span>';
        } else if (log.eventType === 'failed') {
            eventTypeBadge = '<span class="badge badge-danger">Failed</span>';
        } else {
            eventTypeBadge = '<span class="badge badge-warning">Injection</span>';
        }

        row.innerHTML = `
                    <td>${log.timestamp}</td>
                    <td>${log.email || 'N/A'}</td>
                    <td>${log.ip}</td>
                    <td>${eventTypeBadge}</td>
                    <td>${log.details}</td>
                `;
        authLogsBody.appendChild(row);
    });

    // Load security alerts
    const securityAlertsBody = document.getElementById('securityAlertsBody');
    securityAlertsBody.innerHTML = '';

    securityAlerts.forEach(alert => {
        const row = document.createElement('tr');

        let severityBadge;
        if (alert.severity === 'high') {
            severityBadge = '<span class="badge badge-danger">High</span>';
        } else if (alert.severity === 'medium') {
            severityBadge = '<span class="badge badge-warning">Medium</span>';
        } else {
            severityBadge = '<span class="badge badge-success">Low</span>';
        }

        row.innerHTML = `
                    <td>${alert.timestamp}</td>
                    <td>${alert.alertType}</td>
                    <td>${severityBadge}</td>
                    <td>${alert.description}</td>
                    <td>${alert.actionTaken}</td>
                `;
        securityAlertsBody.appendChild(row);
    });

    // Set up log filtering
    document.getElementById('logFilter').addEventListener('change', (e) => {
        const filter = e.target.value;
        const rows = authLogsBody.querySelectorAll('tr');

        rows.forEach(row => {
            if (filter === 'all') {
                row.style.display = '';
            } else {
                const eventType = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
                row.style.display = eventType.includes(filter) ? '' : 'none';
            }
        });
    });
}

// Security functions
function detectInjection(input) {
    // Simple detection for demonstration purposes
    // In a real app, you'd use more sophisticated methods
    const sqlKeywords = ['select', 'insert', 'update', 'delete', 'drop', 'union', '--', ';', "'", '"'];
    const xssPatterns = ['<script>', '<\/script>', 'javascript:', 'onerror', 'onload'];

    const lowerInput = input.toLowerCase();
    return sqlKeywords.some(kw => lowerInput.includes(kw)) ||
        xssPatterns.some(pattern => lowerInput.includes(pattern));
}

function logSecurityEvent(userId, email, eventType, details) {
    // In a real app, this would send to a backend
    const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const ip = generateRandomIP(); // Simulated IP

    const log = {
        id: authLogs.length + 1,
        userId: userId,
        email: email,
        timestamp: timestamp,
        ip: ip,
        eventType: eventType,
        details: details
    };

    authLogs.unshift(log); // Add to beginning

    // If this is an injection attempt, also create a security alert
    if (eventType === 'injection') {
        const alertType = email.includes("<script>") ? "XSS Attempt" : "SQL Injection";

        const alert = {
            id: securityAlerts.length + 1,
            timestamp: timestamp,
            alertType: alertType,
            severity: "high",
            description: `Potential ${alertType} attempt from IP ${ip}`,
            actionTaken: "Blocked request and notified security team"
        };

        securityAlerts.unshift(alert);

        // Notify admin if logged in
        if (currentUser && currentUser.isAdmin) {
            showAlert("Security Alert", `New ${alert.alertType} detected from IP ${ip}`, "danger");
        }
    }

    // Update admin panel if open
    if (adminPanel && adminPanel.style.display === "block") {
        loadAdminPanel();
    }
}

function generateRandomIP() {
    // Generate a random IP for demonstration
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Alert system
const securityAlert = document.getElementById('securityAlert');
const closeAlert = document.getElementById('closeAlert');
const alertMessage = document.getElementById('alertMessage');

closeAlert.addEventListener('click', () => {
    securityAlert.style.display = 'none';
});


function showAlert(title, message, type = "danger") {
    const securityAlert = document.getElementById("securityAlert");
    const alertMessage = document.getElementById("alertMessage");

    document.querySelector("#securityAlert h4").innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${title}`;
    alertMessage.textContent = message;

    // Set background color based on type
    if (type === "success") {
        securityAlert.style.backgroundColor = "green";
    } else if (type === "warning") {
        securityAlert.style.backgroundColor = "orange";
    } else {
        securityAlert.style.backgroundColor = "red"; // Default for danger
    }

    securityAlert.style.display = "block";

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (securityAlert.style.display === "block") {
            securityAlert.style.display = "none";
        }
    }, 5000);
}



// Simulate security alerts at random intervals
function simulateSecurityAlerts() {
    // const alerts = [
    //     {title: "New Login", message: "New login detected from your account from IP 192.168.1.105"},
    //     {title: "Security Update", message: "Our system just blocked a potential brute force attack"},
    //     {title: "System Notice", message: "All systems are operating normally. No security issues detected."}
    // ];

    const times = [10000, 30000, 45000, 60000, 90000];

    times.forEach(time => {
        setTimeout(() => {
            if (currentUser) {
                const alert = alerts[Math.floor(Math.random() * alerts.length)];
                showAlert(alert.title, alert.message);
            }
        }, time);
    });
}

// Start security alerts after page loads
setTimeout(simulateSecurityAlerts, 5000);

// Rest of your existing JavaScript (chatbot, diagnosis modals, etc.) remains the same
// Chatbot functionality
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');

chatbotToggle.addEventListener('click', () => {
    chatbotWindow.style.display = chatbotWindow.style.display === 'flex' ? 'none' : 'flex';
});

chatbotClose.addEventListener('click', () => {
    chatbotWindow.style.display = 'none';
});

chatbotSend.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = chatbotInput.value.trim();
    if (message === '') return;

    // Add user message
    addMessage(message, 'user');
    chatbotInput.value = '';

    // Show typing indicator
    showTyping();

    // Simulate AI response after delay
    setTimeout(() => {
        // Remove typing indicator
        removeTyping();

        // Generate response
        const response = generateResponse(message);

        // Check if we need to escalate to human
        if (response.escalate) {
            addMessage("I'm connecting you with a healthcare professional to better address your question. Please hold...", 'bot');
            setTimeout(() => {
                addMessage("You're now connected with Dr. Smith. How can I help you with your medical concern?", 'bot-human');
            }, 2000);
        } else {
            addMessage(response.text, 'bot');
        }
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    if (sender === 'user') {
        messageDiv.classList.add('user-message');
    } else if (sender === 'bot-human') {
        messageDiv.classList.add('bot-message');
        messageDiv.style.backgroundColor = '#e9f7ef';
        messageDiv.style.borderLeft = '3px solid var(--primary)';
    } else {
        messageDiv.classList.add('bot-message');
    }

    messageDiv.textContent = text;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing-indicator');
    typingDiv.id = 'typingIndicator';

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.classList.add('typing-dot');
        typingDiv.appendChild(dot);
    }

    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeTyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function generateResponse(message) {
    const lowerMessage = message.toLowerCase();

    // List of complex queries that should be escalated
    const complexQueries = [
        'heart attack', 'chest pain', 'severe pain', 'difficulty breathing',
        'pregnant', 'bleeding', 'suicidal', 'emergency', 'cancer', 'stroke',
        'allergic reaction', 'broken bone', 'severe headache', 'high fever',
        'lump', 'unconscious', 'seizure', 'poison', 'burn', 'cut'
    ];

    // Check if message contains any complex query
    const shouldEscalate = complexQueries.some(query => lowerMessage.includes(query));

    if (shouldEscalate) {
        return {
            text: "I'm detecting that your question may require professional medical attention. Let me connect you with a healthcare provider.",
            escalate: true
        };
    }

    // Simple responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return { text: "Hello! How can I assist you with your health today?" };
    } else if (lowerMessage.includes('symptom') || lowerMessage.includes('feel')) {
        return { text: "I can help analyze your symptoms. Please describe what you're experiencing in detail, including duration and severity." };
    } else if (lowerMessage.includes('headache')) {
        return { text: "Headaches can have many causes. Common ones include stress, dehydration, or eye strain. Drink water, rest your eyes, and consider over-the-counter pain relief. If severe or persistent, consult a doctor." };
    } else if (lowerMessage.includes('fever')) {
        return { text: "For adults, a fever below 102°F (38.9°C) can often be managed with rest and fluids. Higher fevers or those lasting more than 3 days should be evaluated by a doctor." };
    } else if (lowerMessage.includes('cold') || lowerMessage.includes('flu')) {
        return { text: "Common cold and flu symptoms include runny nose, cough, and fatigue. Rest, fluids, and over-the-counter medications can help. Seek medical attention if you have difficulty breathing or high fever." };
    } else if (lowerMessage.includes('allerg')) {
        return { text: "For mild allergies, antihistamines may help. For severe reactions (difficulty breathing, swelling), seek emergency care immediately." };
    } else if (lowerMessage.includes('report') || lowerMessage.includes('upload')) {
        return { text: "You can upload your medical reports in the 'Upload Reports' section. Our AI will analyze them and provide insights." };
    } else if (lowerMessage.includes('thank')) {
        return { text: "You're welcome! Let me know if you have any other health questions." };
    } else {
        return { text: "I'm designed to provide general health information. For specific medical advice, I recommend consulting with a healthcare professional. How else can I assist you?" };
    }
}

// Diagnosis modals
const uploadReportsBtn = document.getElementById('upload-reports');
const describeSymptomsBtn = document.getElementById('describe-symptoms');
const reportsModal = document.getElementById('reportsModal');
const symptomsModal = document.getElementById('symptomsModal');
const closeReportsModal = document.getElementById('closeReportsModal');
const closeSymptomsModal = document.getElementById('closeSymptomsModal');
const cancelReports = document.getElementById('cancelReports');
const cancelSymptoms = document.getElementById('cancelSymptoms');
const submitReports = document.getElementById('submitReports');
const submitSymptoms = document.getElementById('submitSymptoms');
const fileUploadArea = document.getElementById('fileUploadArea');
const medicalFiles = document.getElementById('medicalFiles');
const fileList = document.getElementById('fileList');

uploadReportsBtn.addEventListener('click', () => {
    if (!currentUser) {
        showAlert("Login Required", "Please login to upload medical reports.", "warning");
        authModal.style.display = 'flex';
        return;
    }
    reportsModal.style.display = 'flex';
});

describeSymptomsBtn.addEventListener('click', () => {
    if (!currentUser) {
        showAlert("Login Required", "Please login to describe symptoms.", "warning");
        authModal.style.display = 'flex';
        return;
    }
    symptomsModal.style.display = 'flex';
});

closeReportsModal.addEventListener('click', () => {
    reportsModal.style.display = 'none';
});

closeSymptomsModal.addEventListener('click', () => {
    symptomsModal.style.display = 'none';
});

cancelReports.addEventListener('click', () => {
    reportsModal.style.display = 'none';
});

cancelSymptoms.addEventListener('click', () => {
    symptomsModal.style.display = 'none';
});

submitReports.addEventListener('click', () => {
    const reportType = document.getElementById('reportType').value;
    const files = medicalFiles.files;

    if (!reportType || files.length === 0) {
        showAlert("Missing Information", "Please select a report type and upload at least one file.", "warning");
        return;
    }

    // In a real app, you would upload files and process them
    showAlert("Submission Successful", "Your reports have been submitted for AI analysis. You will receive your results shortly.", "success");
    reportsModal.style.display = 'none';

    // Simulate AI processing
    setTimeout(() => {
        showDiagnosisResult('reports');
    }, 3000);
});

submitSymptoms.addEventListener('click', () => {
    const mainSymptom = document.getElementById('mainSymptom').value;

    if (!mainSymptom) {
        showAlert("Missing Information", "Please describe at least your main symptom.", "warning");
        return;
    }

    // In a real app, you would process the symptoms
    showAlert("Submission Successful", "Your symptoms have been submitted for AI analysis.", "success");
    symptomsModal.style.display = 'none';

    // Simulate AI processing
    setTimeout(() => {
        showDiagnosisResult('symptoms');
    }, 3000);
});

function showDiagnosisResult(type) {
    const modalContent = `
                <div class="modal-header">
                    <h2>AI Diagnosis Results</h2>
                    <button class="modal-close" id="closeResultModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">Preliminary Assessment</h3>
                        <p>Based on ${type === 'reports' ? 'your medical reports' : 'your described symptoms'}, our AI system has identified the following possible conditions:</p>
                        <ul style="margin: 1rem 0 1rem 1.5rem;">
                            <li>Condition A (65% probability)</li>
                            <li>Condition B (25% probability)</li>
                            <li>Condition C (10% probability)</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">Recommended Actions</h3>
                        <ol style="margin: 1rem 0 1rem 1.5rem;">
                            <li>Monitor your symptoms for changes</li>
                            <li>Consider over-the-counter medication (specific recommendations would appear here)</li>
                            <li>Consult with a healthcare professional if symptoms worsen or persist beyond 3 days</li>
                        </ol>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 1rem; border-radius: 5px;">
                        <h4 style="color: var(--secondary); margin-bottom: 0.5rem;">Disclaimer</h4>
                        <p style="font-size: 0.9rem;">This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="saveResults">Save Results</button>
                    <button class="btn btn-primary" id="consultDoctor">Consult a Doctor</button>
                </div>
            `;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'resultModal';
    modal.style.display = 'flex';

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.innerHTML = modalContent;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Add event listeners for the new buttons
    document.getElementById('closeResultModal').addEventListener('click', () => {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    });

    document.getElementById('saveResults').addEventListener('click', () => {
        showAlert("Results Saved", "Your results have been saved to your MediSecure dashboard.", "success");
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    });

    document.getElementById('consultDoctor').addEventListener('click', () => {
        showAlert("Connecting", "Connecting you with an available healthcare professional...", "warning");
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// File upload handling
fileUploadArea.addEventListener('click', () => {
    medicalFiles.click();
});

medicalFiles.addEventListener('change', () => {
    fileList.innerHTML = '';
    const files = medicalFiles.files;

    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const fileItem = document.createElement('div');
            fileItem.style.display = 'flex';
            fileItem.style.alignItems = 'center';
            fileItem.style.marginBottom = '0.5rem';

            const icon = document.createElement('i');
            icon.className = 'fas fa-file-alt';
            icon.style.marginRight = '0.5rem';
            icon.style.color = '#6c757d';

            const fileName = document.createElement('span');
            fileName.textContent = files[i].name;
            fileName.style.fontSize = '0.9rem';

            fileItem.appendChild(icon);
            fileItem.appendChild(fileName);
            fileList.appendChild(fileItem);
        }
    }
});

// Drag and drop for file upload
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = 'var(--primary)';
    fileUploadArea.style.backgroundColor = 'rgba(42, 157, 143, 0.1)';
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.style.borderColor = '#e9ecef';
    fileUploadArea.style.backgroundColor = 'transparent';
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#e9ecef';
    fileUploadArea.style.backgroundColor = 'transparent';

    if (e.dataTransfer.files.length > 0) {
        medicalFiles.files = e.dataTransfer.files;
        const event = new Event('change');
        medicalFiles.dispatchEvent(event);
    }
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === reportsModal) {
        reportsModal.style.display = 'none';
    }
    if (e.target === symptomsModal) {
        symptomsModal.style.display = 'none';
    }
});

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});