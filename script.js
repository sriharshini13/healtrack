document.addEventListener('DOMContentLoaded', () => {

    // --- Constants for Storage Keys ---
    const PATIENTS_KEY = 'healtrack_patients';
    const DOCTORS_KEY = 'healtrack_doctors';
    const LOGGED_IN_PATIENT_KEY = 'healtrack_logged_in_patient'; // sessionStorage key

    // =========================================================================
    // DATA INITIALIZATION & MANAGEMENT (Simulated Backend using localStorage)
    // =========================================================================

    /**
     * Initializes sample doctor and patient data in localStorage if it doesn't exist.
     * WARNING: Storing sensitive data like passwords directly in localStorage is
     *          highly insecure and is done here ONLY for demonstration purposes.
     *          A real application MUST use secure backend authentication and hashing.
     */
    function initializeData() {
        // --- Sample Doctors ---
        const sampleDoctors = [
            { id: 1, name: "Dr. Jane Doe", specialty: "Cardiology" },
            { id: 2, name: "Dr. John Smith", specialty: "Neurology" },
            { id: 3, name: "Dr. Anita Lee", specialty: "Pediatrics" },
            { id: 4, name: "Dr. Marcus Jones", specialty: "Orthopedics" },
            { id: 5, name: "Dr. Chen Wang", specialty: "Oncology" },
        ];

        // --- Sample Patients (*** WITH INDIAN PHONE NUMBERS ***) ---
        const samplePatients = [
            {
                id: 101,
                name: "Alice Wonderland",
                email: "alice@example.com", // Username
                password: "password123", // INSECURE: For demo only
                phone: "9876543210", // *** UPDATED FORMAT ***
                dob: "1985-05-15",
                assignedDoctorId: 1, // Dr. Jane Doe
                healthRecords: [
                    { date: "2024-03-10", type: "Check-up", notes: "Routine annual physical. Blood pressure slightly elevated.", resultLink: null },
                    { date: "2024-01-20", type: "Lab Test", notes: "Cholesterol Panel", resultLink: "#" }, // Placeholder link for "Pending"
                    { date: "2023-11-05", type: "Consultation", notes: "Discussed exercise plan.", resultLink: null }
                ]
            },
            {
                id: 102,
                name: "Bob The Builder",
                email: "bob@example.com",
                password: "password456", // INSECURE: For demo only
                phone: "8765432109", // *** UPDATED FORMAT ***
                dob: "1978-11-22",
                assignedDoctorId: 4, // Dr. Marcus Jones
                healthRecords: [
                    { date: "2024-04-01", type: "Follow-up", notes: "Post-op check for knee injury. Healing well.", resultLink: null },
                    { date: "2024-03-15", type: "Imaging", notes: "X-Ray Right Knee", resultLink: "downloads/sample-report.pdf" }, // Example link
                    { date: "2024-03-01", type: "Consultation", notes: "Initial consult for knee pain.", resultLink: null }
                ]
            },
            {
                id: 103,
                name: "Charlie Chaplin",
                email: "charlie@example.com",
                password: "password789", // INSECURE: For demo only
                phone: "+91 7654321098", // *** UPDATED FORMAT with +91 ***
                dob: "1992-08-01",
                assignedDoctorId: 2, // Dr. John Smith
                healthRecords: [
                    { date: "2024-02-14", type: "Telemedicine Visit", notes: "Follow-up for migraines. Adjusting medication.", resultLink: null },
                     { date: "2023-12-01", type: "Check-up", notes: "Neurology baseline assessment.", resultLink: null },
                ]
            }
            // Add more sample patients if needed
        ];

        // Check if data exists, if not, initialize
        if (!localStorage.getItem(DOCTORS_KEY)) {
            localStorage.setItem(DOCTORS_KEY, JSON.stringify(sampleDoctors));
            console.log("Initialized sample doctors in localStorage.");
        }
        if (!localStorage.getItem(PATIENTS_KEY)) {
            localStorage.setItem(PATIENTS_KEY, JSON.stringify(samplePatients));
            console.log("Initialized sample patients in localStorage.");
        }
    }

    // --- Retrieve Data Functions ---
    function getPatients() {
        return JSON.parse(localStorage.getItem(PATIENTS_KEY) || '[]');
    }
    function getDoctors() {
        return JSON.parse(localStorage.getItem(DOCTORS_KEY) || '[]');
    }
    function savePatients(patients) {
        localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
    }

    // Run data initialization on load
    initializeData();


    // =========================================================================
    // REGISTRATION LOGIC
    // =========================================================================
    const registrationForm = document.getElementById('registration-form');
    const registrationMessage = document.getElementById('registration-message');

    if (registrationForm && registrationMessage) {
        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            const passwordInput = document.getElementById('reg-password');
            const confirmPasswordInput = document.getElementById('reg-confirm-password');
            const emailInput = document.getElementById('reg-email');

            // --- Helper to display messages ---
            function showRegMessage(message, type) {
                registrationMessage.textContent = message;
                registrationMessage.className = `form-message ${type}`; // Add 'success' or 'error' class
                 // Add specific styles based on type
                 if (type === 'error') {
                    registrationMessage.style.backgroundColor = '#f8d7da';
                    registrationMessage.style.color = '#721c24';
                    registrationMessage.style.border = '1px solid #f5c6cb';
                 } else if (type === 'success') {
                    registrationMessage.style.backgroundColor = '#d4edda';
                    registrationMessage.style.color = '#155724';
                    registrationMessage.style.border = '1px solid #c3e6cb';
                 }
                 registrationMessage.style.display = 'block';
             }

             // --- Reset previous states ---
             showRegMessage('', ''); // Clear message
             registrationMessage.style.display = 'none';
             confirmPasswordInput.setCustomValidity(''); // Reset confirmation validity
             registrationForm.classList.remove('was-validated'); // Reset validation display state

            // --- 1. Password Confirmation ---
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity("Passwords do not match.");
                registrationForm.classList.add('was-validated'); // Trigger browser UI hints
                confirmPasswordInput.focus();
                console.log("Registration failed: Passwords mismatch");
                // No message shown here, browser handles it via setCustomValidity
                return;
            } else {
                confirmPasswordInput.setCustomValidity(''); // Clear validity if they match now
            }

            // --- 2. HTML5 Form Validation ---
            if (!registrationForm.checkValidity()) {
                 event.stopPropagation(); // Stop event bubbling
                 registrationForm.classList.add('was-validated'); // Add class to trigger CSS styles
                 console.log("Registration failed: Form invalid (HTML5)");
                 const firstInvalidField = registrationForm.querySelector(':invalid');
                 if (firstInvalidField) {
                     firstInvalidField.focus(); // Focus the first invalid field
                 }
                 return; // Stop processing
             }

            // --- 3. Check if Email Already Exists ---
            const patients = getPatients();
            const emailExists = patients.some(patient => patient.email.toLowerCase() === emailInput.value.toLowerCase());

            if (emailExists) {
                showRegMessage('Error: An account with this email already exists.', 'error');
                emailInput.focus();
                console.log("Registration failed: Email exists");
                return; // Stop processing
            }

            // --- 4. If All Checks Pass: Simulate Registration ---
            const newPatient = {
                id: Date.now(), // Simple unique ID generation for demo
                name: document.getElementById('reg-fullname').value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value, // !! INSECURE !! DEMO ONLY
                phone: document.getElementById('reg-phone').value.trim(),
                dob: document.getElementById('reg-dob').value,
                assignedDoctorId: null, // Can be assigned later
                healthRecords: [] // Start with empty records
            };

            patients.push(newPatient);
            savePatients(patients);

            console.log("Registration successful for:", newPatient.email);
            showRegMessage('Registration Successful! Redirecting to login...', 'success');
            registrationForm.reset(); // Clear the form fields
            registrationForm.classList.remove('was-validated'); // Reset validation display

            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = 'patient-portal-login.html';
            }, 2500);
        });

         // Add real-time password match validation feedback for registration form
         const passwordInput = registrationForm.querySelector('#reg-password');
         const confirmPasswordInput = registrationForm.querySelector('#reg-confirm-password');
         if(passwordInput && confirmPasswordInput){
             const validatePasswordMatch = () => {
                 if (passwordInput.value !== confirmPasswordInput.value && confirmPasswordInput.value) {
                     confirmPasswordInput.setCustomValidity("Passwords do not match.");
                 } else {
                     confirmPasswordInput.setCustomValidity('');
                 }
             };
             confirmPasswordInput.addEventListener('input', validatePasswordMatch);
             passwordInput.addEventListener('input', validatePasswordMatch); // Re-check confirm if main password changes
         }

     } // End if(registrationForm)

    // =========================================================================
    // LOGIN LOGIC
    // =========================================================================
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');

    if (loginForm && loginMessage) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default submission
            loginMessage.style.display = 'none'; // Hide previous messages
            loginMessage.textContent = '';
            loginForm.classList.remove('was-validated');

             // Basic HTML5 check first
            if (!loginForm.checkValidity()) {
                event.stopPropagation();
                loginForm.classList.add('was-validated');
                console.log("Login validation failed (HTML5)");
                const firstInvalidField = loginForm.querySelector(':invalid');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
                return;
            }

            const usernameInput = document.getElementById('login-username').value.trim().toLowerCase();
            const passwordInput = document.getElementById('login-password').value; // No trim for password

            const patients = getPatients();
            // !! INSECURE !! Plain text password comparison - DEMO ONLY
            const foundPatient = patients.find(patient => patient.email.toLowerCase() === usernameInput && patient.password === passwordInput);

            if (foundPatient) {
                console.log("Login successful for:", foundPatient.email);
                // Store minimal identifier in sessionStorage (cleared when browser tab closes)
                sessionStorage.setItem(LOGGED_IN_PATIENT_KEY, JSON.stringify({ id: foundPatient.id, email: foundPatient.email }));
                // Redirect to the actual portal page
                window.location.href = 'patient-portal.html';
            } else {
                console.log("Login failed: Invalid credentials for", usernameInput);
                loginMessage.textContent = 'Login failed. Please check your email and password.';
                loginMessage.style.display = 'block'; // Show the error message
                 // Optionally add error styling to message div
                 loginMessage.style.backgroundColor = '#f8d7da';
                 loginMessage.style.color = '#721c24';
                 loginMessage.style.border = '1px solid #f5c6cb';
                 loginForm.classList.add('was-validated'); // Indicate validation occurred
             }
         });
     }

    // --- Simplified Forgot Password ---
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (event) => {
            event.preventDefault();
            const email = prompt("Password Reset Simulation:\nPlease enter the email address associated with your account:");
            if (email) {
                const patients = getPatients();
                const foundPatient = patients.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
                if (foundPatient) {
                    // **NEVER** reveal the password like this in a real app.
                    alert(`Simulation: Account found for ${email}.\nIn a real application, a secure reset link would be emailed.\n(For this demo, the password in localStorage is: ${foundPatient.password})`);
                } else {
                    alert("Simulation: No account found for that email address in this demo database.");
                }
            } else {
                alert("Forgot password process cancelled.");
            }
        });
    }


    // =========================================================================
    // PATIENT PORTAL PAGE LOGIC
    // =========================================================================
    const portalContent = document.getElementById('portal-main-content');
    const portalLoading = document.getElementById('portal-loading');

    // Check if we are on the patient portal page AND the elements exist
    if (portalContent && portalLoading && window.location.pathname.includes('patient-portal.html')) {
        console.log("On patient portal page, checking authentication...");
        const loggedInData = sessionStorage.getItem(LOGGED_IN_PATIENT_KEY);

        if (loggedInData) {
            try {
                const loggedInUser = JSON.parse(loggedInData); // Contains { id, email }
                console.log("Session storage data found for user ID:", loggedInUser.id);

                const patients = getPatients();
                const doctors = getDoctors();

                // Find the full patient object using the ID from session storage
                const currentPatient = patients.find(p => p.id === loggedInUser.id);

                if (currentPatient) {
                    console.log("User authenticated:", currentPatient.email);
                    // --- Populate the portal page ---
                    document.getElementById('welcome-message').innerHTML = `<h2><i class="far fa-smile"></i> Welcome, ${currentPatient.name}!</h2><p>This is your secure health dashboard.</p>`;
                    document.getElementById('patient-name').textContent = currentPatient.name;
                    document.getElementById('patient-dob').textContent = currentPatient.dob || 'Not specified';
                    document.getElementById('patient-email').textContent = currentPatient.email;
                    document.getElementById('patient-phone').textContent = currentPatient.phone || 'Not specified'; // Display saved phone

                    // Find and display assigned doctor details
                    const assignedDoctorNameEl = document.getElementById('assigned-doctor-name');
                    const assignedDoctorSpecialtyEl = document.getElementById('assigned-doctor-specialty');
                    if (currentPatient.assignedDoctorId) {
                        const assignedDoctor = doctors.find(d => d.id === currentPatient.assignedDoctorId);
                        if (assignedDoctor) {
                            assignedDoctorNameEl.textContent = assignedDoctor.name;
                            assignedDoctorSpecialtyEl.textContent = assignedDoctor.specialty;
                        } else {
                             assignedDoctorNameEl.textContent = 'Doctor Not Found';
                             assignedDoctorSpecialtyEl.textContent = 'N/A';
                        }
                    } else {
                        assignedDoctorNameEl.textContent = 'Not Assigned';
                        assignedDoctorSpecialtyEl.textContent = 'N/A';
                    }

                    // Display health records in a table
                    const recordsContainer = document.getElementById('records-container');
                    if (currentPatient.healthRecords && currentPatient.healthRecords.length > 0) {
                        let recordsHtml = `
                            <table class="records-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Record Type</th>
                                        <th>Notes/Details</th>
                                        <th>Results/Link</th>
                                    </tr>
                                </thead>
                                <tbody>`;
                        // Sort records by date, most recent first
                        currentPatient.healthRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

                        currentPatient.healthRecords.forEach(record => {
                            let resultDisplay = 'N/A';
                            if (record.resultLink) {
                                if (record.resultLink === '#') {
                                    resultDisplay = '<i>Pending</i>';
                                } else {
                                     // Basic check for external vs internal link (can be improved)
                                    const isExternal = record.resultLink.startsWith('http') || record.resultLink.startsWith('//');
                                    resultDisplay = `<a href="${record.resultLink}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : 'download'}>View ${isExternal ? '<i class="fas fa-external-link-alt fa-xs"></i>' : '<i class="fas fa-download fa-xs"></i>'}</a>`;
                                }
                            }
                            recordsHtml += `
                                <tr>
                                    <td>${record.date}</td>
                                    <td>${record.type}</td>
                                    <td>${record.notes || ''}</td>
                                    <td>${resultDisplay}</td>
                                </tr>`;
                        });
                        recordsHtml += `</tbody></table>`;
                        recordsContainer.innerHTML = recordsHtml;
                    } else {
                        recordsContainer.innerHTML = '<p>No health records available at this time.</p>';
                    }

                    // --- Show content, hide loading ---
                    portalLoading.style.display = 'none';
                    portalContent.style.display = 'block';
                    // Trigger fade-in animation slightly after display change
                    requestAnimationFrame(() => {
                         requestAnimationFrame(() => { // Double RAF for reliability
                            portalContent.classList.add('is-visible');
                        });
                    });

                } else {
                    console.error("Logged in user ID from session storage not found in patient data.");
                    redirectToLogin("Error: Patient data not found."); // Redirect if patient data is missing
                }
            } catch (e) {
                console.error("Error parsing logged in user data from session storage:", e);
                redirectToLogin("Error: Invalid session data."); // Redirect on parsing error
            }
        } else {
            console.log("User not authenticated (no session data), redirecting to login.");
            redirectToLogin("Please log in to access the portal."); // Redirect if not logged in
        }
    }

    /**
     * Redirects the user to the login page, optionally displaying a message.
     * @param {string} [message] - An optional message to store in sessionStorage for display on the login page.
     */
    function redirectToLogin(message) {
        sessionStorage.removeItem(LOGGED_IN_PATIENT_KEY); // Ensure logged-out state
        if (message && typeof Storage !== 'undefined') { // Store message if Session Storage is available
            sessionStorage.setItem('loginRedirectMessage', message); // Use sessionStorage to pass message
        }
        window.location.href = 'patient-portal-login.html';
    }

    // --- Display redirect message on login page if present ---
     if (loginMessage && window.location.pathname.includes('patient-portal-login.html')) {
          if (typeof Storage !== 'undefined') {
               const redirectMsg = sessionStorage.getItem('loginRedirectMessage');
              if (redirectMsg) {
                  loginMessage.textContent = redirectMsg;
                  loginMessage.style.display = 'block';
                  loginMessage.style.backgroundColor = '#f8d7da'; // Use error styling for redirect messages
                  loginMessage.style.color = '#721c24';
                  loginMessage.style.border = '1px solid #f5c6cb';
                  sessionStorage.removeItem('loginRedirectMessage'); // Clear message after displaying
              }
          }
     }

    // =========================================================================
    // LOGOUT LOGIC
    // =========================================================================
    function handleLogout() {
        console.log("Logging out user...");
        if (typeof Storage !== 'undefined') {
             sessionStorage.removeItem(LOGGED_IN_PATIENT_KEY); // Clear login state from session
         }
        redirectToLogin("You have been logged out."); // Redirect to login page with message
    }

    // Add event listeners to ALL potential logout buttons
    document.querySelectorAll('#logout-button-nav, #logout-button-main').forEach(button => {
         if (button) {
             button.addEventListener('click', handleLogout);
         }
     });


    // =========================================================================
    // UI ENHANCEMENTS (Fade-in, FAQ, Form Validation, etc.)
    // =========================================================================

    // --- Intersection Observer for Fade-in Animations ---
    const fadeElements = document.querySelectorAll('.fade-in-element');
    if ("IntersectionObserver" in window) {
        const observerOptions = {
            root: null, // relative to document viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of the element is visible
        };
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: Stop observing the element once it's visible
                    // observer.unobserve(entry.target);
                }
                 // Optional: Remove class if scrolling back up (causes re-fade-in)
                 // else {
                 //    entry.target.classList.remove('is-visible');
                 // }
            });
        };
        const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
        fadeElements.forEach(el => intersectionObserver.observe(el));
    } else {
         // Fallback for older browsers: just make elements visible
        fadeElements.forEach(el => el.classList.add('is-visible'));
    }


    // --- Chatbot Functionality ---
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const messagesContainer = document.getElementById('chatbot-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    if (chatbotToggle && chatbotWindow && messagesContainer && userInput && sendButton) {
        chatbotToggle.addEventListener('click', () => {
            const isHidden = chatbotWindow.classList.toggle('hidden');
            chatbotToggle.setAttribute('aria-expanded', !isHidden); // ARIA for state
            if (!isHidden) {
                userInput.focus();
                 // Scroll to bottom only if user hasn't scrolled up significantly
                if (messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 100) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                 }
            }
        });

        // Function to safely add message HTML (escape user input)
        function addMessage(content, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

            if (sender === 'user') {
                // Sanitize user input by setting textContent
                 messageDiv.textContent = content;
            } else {
                // Bot responses can contain safe HTML (like links, icons)
                 messageDiv.innerHTML = content;
            }

            messagesContainer.appendChild(messageDiv);
            // Always scroll to bottom after adding a message
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Simple keyword-based bot responses
        function getBotResponse(userText) {
            const text = userText.toLowerCase().trim();
             let response = "I'm sorry, I can only handle basic queries right now. Try asking about 'appointment', 'doctor', 'services', 'contact', 'location', 'hours', 'insurance', 'billing', 'FAQ', 'portal login', 'register', or 'emergency'. For complex issues, please call us or use the contact form.";

             // Keywords and Responses (using links and icons)
             const responses = {
                greet: ["hello", "hi", "hey"],
                appointment: ["appointment", "book", "schedule", "visit"],
                doctor: ["doctor", "physician", "specialist", "find doctor"],
                services: ["service", "department", "care", "treatment", "specialty", "telemedicine", "surgery", "procedure"],
                contact: ["contact", "phone", "address", "location", "map", "direction"],
                emergency: ["emergency", "er", "911"],
                hours: ["hour", "visiting", "open", "when are you open"],
                insurance: ["insurance", "plan", "accept", "coverage"],
                billing: ["bill", "pay", "cost", "payment", "finance", "financial aid"],
                portal: ["portal", "record", "result", "login", "ehr", "mychart", "my health", "health record"],
                register: ["register", "sign up", "new account", "create account"],
                forgot_password: ["forgot password", "reset password", "cant login", "password help"],
                faq: ["faq", "question", "ask", "help"],
                feedback: ["feedback", "complaint", "suggestion", "review", "rate", "experience"],
                blog: ["blog", "news", "article", "health tip"],
                about: ["about", "mission", "history", "who are you"],
                thanks: ["bye", "thank", "thanks", "ok", "okay"]
            };

            for (const key in responses) {
                 if (responses[key].some(keyword => text.includes(keyword))) {
                     switch (key) {
                         case "greet":
                             response = "Hello! Welcome to HealTrack Hospitals digital assistant. How can I help you today? (e.g., 'book appointment', 'find doctor', 'patient portal login', 'register', 'insurance info')";
                             break;
                        case "appointment":
                            response = `You can easily book or manage appointments online! Visit our <a href='appointment.html' target='_blank' rel='noopener noreferrer'>Appointments page <i class="fas fa-external-link-alt fa-xs"></i></a>. You can select in-person or telemedicine options there.`;
                             break;
                         case "doctor":
                             response = `Find the right specialist using our directory: <a href='doctors.html' target='_blank' rel='noopener noreferrer'>Find a Doctor <i class="fas fa-external-link-alt fa-xs"></i></a>. Search by name, specialty, and check for telemedicine availability.`;
                             break;
                         case "services":
                             response = `We offer a wide range of clinical services and digital tools. See details on our <a href='services.html' target='_blank' rel='noopener noreferrer'>Platform Services page <i class="fas fa-external-link-alt fa-xs"></i></a>, including telemedicine, EHR access, and clinical specialties. For surgery info, check the <a href='surgery-demo.html' target='_blank' rel='noopener noreferrer'>Surgery Education page <i class="fas fa-external-link-alt fa-xs"></i></a>.`;
                             break;
                        case "contact":
                            response = `All contact details, address, a map, and phone numbers (including Main Line: 1-888-INFO-HTH) are on the <a href='contact.html' target='_blank' rel='noopener noreferrer'>Contact Us page <i class="fas fa-external-link-alt fa-xs"></i></a>.`;
                            break;
                         case "emergency":
                             response = `<b><i class="fas fa-exclamation-triangle"></i> For immediate life-threatening emergencies, please call 911 immediately.</b> For info about our ER services and when to visit, see the <a href='emergency-info.html' target='_blank' rel='noopener noreferrer'>Emergency Info page <i class="fas fa-external-link-alt fa-xs"></i></a>. Our 24/7 ER info line is 1-800-HEALTH-1 (not for dispatch).`;
                             break;
                        case "hours":
                            response = `General visiting hours are typically [Specify Hours, e.g., 11:00 AM to 8:00 PM daily]. However, these can vary by hospital unit. Please check the <a href='contact.html' target='_blank' rel='noopener noreferrer'>Contact Us page <i class="fas fa-external-link-alt fa-xs"></i></a> or call the main hospital line for specific details. Our ER is open 24/7.`;
                            break;
                        case "insurance":
                             response = `We accept many insurance plans. Find a list of major providers and contact info for billing on the <a href='insurance.html' target='_blank' rel='noopener noreferrer'>Insurance & Payments page <i class="fas fa-external-link-alt fa-xs"></i></a>. Please verify specific coverage with your provider.`;
                             break;
                        case "billing":
                             response = `Payment options, cost estimates, and financial assistance info are on our <a href='insurance.html' target='_blank' rel='noopener noreferrer'>Insurance & Payments page <i class="fas fa-external-link-alt fa-xs"></i></a>. Online bill pay is available via the <a href='patient-portal-login.html' target='_blank' rel='noopener noreferrer'>Patient Portal <i class="fas fa-external-link-alt fa-xs"></i></a> after login.`;
                            break;
                        case "portal":
                            response = `Access your secure Patient Portal here: <a href='patient-portal-login.html' target='_blank' rel='noopener noreferrer'>Patient Portal Login <i class="fas fa-external-link-alt fa-xs"></i></a>. View records, results, appointments, and pay bills online after logging in. If you need to register, visit the <a href='registration.html' target='_blank' rel='noopener noreferrer'>Registration Page <i class="fas fa-user-plus fa-xs"></i></a>.`;
                            break;
                        case "register":
                            response = `New user? You can create your patient portal account here: <a href='registration.html' target='_blank' rel='noopener noreferrer'>Register Now <i class="fas fa-user-plus fa-xs"></i></a>.`;
                            break;
                        case "forgot_password":
                            response = `If you forgot your password or are having trouble logging in, please go to the <a href='patient-portal-login.html' target='_blank' rel='noopener noreferrer'>Login Page <i class="fas fa-external-link-alt fa-xs"></i></a> and click the 'Forgot Password?' link. You can also contact support (see Contact Us page).`;
                            break;
                        case "faq":
                            response = `Have questions? Check our <a href='faq.html' target='_blank' rel='noopener noreferrer'>FAQ page <i class="fas fa-external-link-alt fa-xs"></i></a> for answers to common inquiries about appointments, billing, the portal, and more.`;
                            break;
                        case "feedback":
                             response = `We value your feedback! Share your experience using the form on our <a href='feedback.html' target='_blank' rel='noopener noreferrer'>Patient Feedback page <i class="fas fa-external-link-alt fa-xs"></i></a>.`;
                            break;
                         case "blog":
                            response = `Stay informed with health tips, hospital news, and insights on our <a href='blog.html' target='_blank' rel='noopener noreferrer'>HealthTrack Blog & News page <i class="fas fa-external-link-alt fa-xs"></i></a>.`;
                            break;
                         case "about":
                            response = `Learn about HealTrack Hospitals, our mission, values, and focus on integrated digital healthcare on the <a href='about.html' target='_blank' rel='noopener noreferrer'>About Us page <i class="fas fa-external-link-alt fa-xs"></i></a>.`;
                            break;
                        case "thanks":
                             response = "You're welcome! Let me know if anything else comes up. Have a healthy day! <i class='far fa-smile'></i>";
                             break;
                         default: // Should not happen if logic is correct
                             break;
                     }
                     return response; // Return the matched response
                 }
             }
            return response; // Return default if no match
        }

        // Handle sending message
        function sendMessage() {
            const userText = userInput.value.trim();
            if (userText === '') return;

            addMessage(userText, 'user'); // Display sanitized user message
            userInput.value = ''; // Clear input
            userInput.focus(); // Keep focus

            // Simulate bot thinking time & display response
            setTimeout(() => {
                const botResponseHtml = getBotResponse(userText);
                addMessage(botResponseHtml, 'bot'); // Add bot response (allows HTML)
            }, 600); // Slightly longer delay for realism
        }

        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (event) => {
            // Send on Enter key, unless Shift+Enter is pressed (for multi-line)
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent default newline behavior
                sendMessage();
            }
        });
    } // End if chatbot elements exist


    // --- FAQ Accordion Functionality ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answerPanel = item.querySelector('.faq-answer');

        if (questionButton && answerPanel) {
            // Set initial state based on class
            if (!answerPanel.classList.contains('active')) {
                 answerPanel.style.maxHeight = null;
            } else {
                // Ensure maxHeight is set if initially active (less common)
                answerPanel.style.maxHeight = answerPanel.scrollHeight + "px";
            }
             questionButton.setAttribute('aria-expanded', answerPanel.classList.contains('active')); // ARIA

            questionButton.addEventListener('click', () => {
                const isActive = questionButton.classList.toggle('active'); // Toggle button state
                answerPanel.classList.toggle('active'); // Toggle panel state
                questionButton.setAttribute('aria-expanded', isActive); // Update ARIA

                if (isActive) {
                    answerPanel.style.maxHeight = answerPanel.scrollHeight + "px";
                    // Smooth scroll to the item if it's opening AND partially off-screen
                    setTimeout(() => {
                        const itemRect = item.getBoundingClientRect();
                        const headerOffset = 80; // Adjust as needed for sticky header
                        const isAboveViewport = itemRect.top < headerOffset;
                        const isBelowViewport = itemRect.bottom > window.innerHeight;

                        if (isAboveViewport || isBelowViewport) {
                            const scrollTargetY = window.pageYOffset + itemRect.top - headerOffset - 10; // Add slight padding
                            window.scrollTo({
                                top: scrollTargetY,
                                behavior: 'smooth'
                            });
                        }
                    }, 310); // Delay slightly longer than transition
                } else {
                    answerPanel.style.maxHeight = null; // Collapse
                }

                // Optional: Close other FAQ items when one is opened
                // faqItems.forEach(otherItem => {
                //     if (otherItem !== item) {
                //         otherItem.querySelector('.faq-question').classList.remove('active');
                //         const otherAnswer = otherItem.querySelector('.faq-answer');
                //         otherAnswer.classList.remove('active');
                //         otherAnswer.style.maxHeight = null;
                //         otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                //     }
                // });
            });
        }
    });


    // --- HTML5 Form Validation Enhancement (Applies to all forms with .needs-validation) ---
    const formsToValidate = document.querySelectorAll('form.needs-validation');
    Array.from(formsToValidate).forEach(form => {
        form.addEventListener('submit', event => {
            // Re-check password confirmation specifically for registration form on submit
             if (form.id === 'registration-form') {
                 const passwordInput = form.querySelector('#reg-password');
                 const confirmPasswordInput = form.querySelector('#reg-confirm-password');
                 if (passwordInput && confirmPasswordInput && passwordInput.value !== confirmPasswordInput.value) {
                     confirmPasswordInput.setCustomValidity("Passwords do not match.");
                     // Need to manually trigger validation display for this field if not already invalid
                     if (confirmPasswordInput.checkValidity()) {
                          // confirmPasswordInput.reportValidity(); // This API can be inconsistent/annoying
                          // Just ensure the class is added below
                     }
                 } else if (confirmPasswordInput) {
                     confirmPasswordInput.setCustomValidity(''); // Clear if they match
                 }
             }

            // General checkValidity for all required fields, patterns, types etc.
            if (!form.checkValidity()) {
                 event.preventDefault(); // Prevent submission
                 event.stopPropagation(); // Stop bubbling
                 console.log(`Form [${form.id || 'No ID'}] validation failed.`);
                 const firstInvalidField = form.querySelector(':invalid');
                 if (firstInvalidField) {
                     firstInvalidField.focus();
                     // Optional: scroll into view smoothly
                     // firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                 }
            } else {
                console.log(`Form [${form.id || 'No ID'}] passed client-side validation.`);
                 // IMPORTANT: For Registration and Login, the actual logic (saving/checking/redirecting)
                 // is handled in their specific event listeners ABOVE this generic validation handler.
                 // For other forms (like contact, appointment request), we *do* prevent default here
                 // to stop normal submission and simulate success for the demo.
                if (form.id !== 'registration-form' && form.id !== 'login-form') {
                    // Example for other forms (e.g., Appointment Request, Contact, Feedback)
                    event.preventDefault(); // Prevent actual submission for demo purposes
                    // Simulate success feedback
                    form.reset(); // Clear the form
                    form.classList.remove('was-validated'); // Reset styles
                     // You could add a success message div to these forms too
                    alert(`Demo: Your request/message from "${form.id || 'Unnamed Form'}" has been submitted successfully!\n(In a real app, data would be sent to the server.)`);
                }
            }

            // Add 'was-validated' class AFTER checking validity, to trigger CSS styles for feedback
            form.classList.add('was-validated');
        }, false); // Use capture phase = false (default)
    });


    // --- Dynamic Minimum Date for Appointment Form ---
    function setMinDate() {
      const dateInput = document.getElementById('pref-date');
      if (dateInput && dateInput.type === 'date') { // Ensure it's a date input
          try {
                const today = new Date();
                // Adjust for timezone offset to get local date correctly
                today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
                const minDateString = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
                dateInput.min = minDateString;
                // console.log("Set min date for #pref-date to:", minDateString); // Keep for debugging if needed
          } catch(e) {
              console.error("Error setting min date:", e);
          }
      }
    }
    setMinDate(); // Set min date on load if appointment page is loaded


    // --- Smooth Scrolling for Internal Page Links ---
    const smoothScrollLinks = document.querySelectorAll('.smooth-scroll-link');
    if (smoothScrollLinks.length > 0) {
        const headerOffset = 80; // Adjust based on your sticky header's height
        smoothScrollLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                const href = this.getAttribute('href');
                // Ensure it's a valid internal hash link
                if (href && href.startsWith('#') && href.length > 1) {
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        event.preventDefault(); // Prevent default jump

                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });

                        // Optional: Add a visual highlight to the target section
                         targetElement.style.transition = 'box-shadow 0.3s ease-in-out 0.3s'; // Add slight delay
                         targetElement.style.boxShadow = '0 0 0 4px rgba(23, 162, 184, 0.4)'; // Teal highlight
                         targetElement.style.borderRadius = 'var(--border-radius-lg)'; // Match styling
                        setTimeout(() => {
                             targetElement.style.transition = 'box-shadow 0.3s ease-in-out';
                             targetElement.style.boxShadow = ''; // Remove highlight
                        }, 1800); // Keep highlight for ~1.5 seconds after scroll finishes
                    } else {
                        console.warn(`Smooth scroll target element not found: #${targetId}`);
                    }
                }
            });
        });
    }
    // ===== End Smooth Scrolling =====

}); // End DOMContentLoaded Wrapper