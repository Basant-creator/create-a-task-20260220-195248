const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const path = window.location.pathname;

    // Redirect to login if not authenticated
    if (!token) {
        window.location.href = '../public/login.html';
        return;
    }

    // --- Common Dashboard & Profile/Settings Functions ---

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Also remove user data if stored
        window.location.href = '../public/login.html';
    };

    // Attach logout to all logout buttons
    document.querySelectorAll('[id^="logoutButton"]').forEach(button => {
        button.addEventListener('click', handleLogout);
    });

    // Fetch user data and update UI (sidebar, dashboard greeting, profile forms)
    const fetchUserData = async () => {
        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const user = data.data.user;
                localStorage.setItem('user', JSON.stringify(user)); // Store user data

                // Update sidebar details
                document.getElementById('sidebarUserName') && (document.getElementById('sidebarUserName').textContent = user.name || 'User');
                document.getElementById('sidebarUserEmail') && (document.getElementById('sidebarUserEmail').textContent = user.email || '');

                // Update dashboard greeting
                document.getElementById('dashboardUserName') && (document.getElementById('dashboardUserName').textContent = user.name.split(' ')[0] || 'User');

                // Update profile form fields if on profile page
                if (path.includes('profile.html')) {
                    document.getElementById('profileName') && (document.getElementById('profileName').value = user.name || '');
                    document.getElementById('profileEmail') && (document.getElementById('profileEmail').value = user.email || '');
                }
            } else if (response.status === 401) {
                // Token expired or invalid
                handleLogout();
            } else {
                console.error('Failed to fetch user data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Consider more robust error handling / notifications
        }
    };

    // Initialize user data fetch
    fetchUserData();


    // --- Dashboard Specific Logic ---
    if (path.includes('dashboard.html')) {
        const taskList = document.getElementById('taskList');
        const noTasksMessage = document.getElementById('noTasksMessage');
        const taskModal = document.getElementById('taskModal');
        const openAddTaskModalBtn = document.getElementById('openAddTaskModal');
        const closeTaskModalBtn = document.getElementById('closeTaskModal');
        const taskForm = document.getElementById('taskForm');
        const taskIdInput = document.getElementById('taskId');
        const taskTitleInput = document.getElementById('taskTitle');
        const taskDescriptionInput = document.getElementById('taskDescription');
        const taskDueDateInput = document.getElementById('taskDueDate');
        const taskStatusSelect = document.getElementById('taskStatus');
        const modalTitle = document.getElementById('modalTitle');
        const saveTaskButton = document.getElementById('saveTaskButton');
        const saveButtonText = document.getElementById('saveButtonText');
        const saveTaskSpinner = document.getElementById('saveTaskSpinner');
        const taskTitleError = document.getElementById('taskTitleError');
        const modalError = document.getElementById('modalError');
        const taskFilter = document.getElementById('taskFilter');
        const taskSearch = document.getElementById('taskSearch');

        let allTasks = []; // Store all fetched tasks for filtering/searching

        // Helper to display modal errors
        const displayModalError = (message) => {
            modalError.textContent = message;
            modalError.style.display = message ? 'block' : 'none';
        };

        // Helper to set button loading state
        const setLoadingState = (button, textSpan, spinner, isLoading) => {
            if (isLoading) {
                textSpan.style.display = 'none';
                spinner.style.display = 'inline-block';
                button.disabled = true;
            } else {
                textSpan.style.display = 'inline-block';
                spinner.style.display = 'none';
                button.disabled = false;
            }
        };

        // Fetch tasks for the authenticated user
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${API_BASE}/users/me/tasks`, { // Use /users/me/tasks
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    allTasks = data.data.tasks || [];
                    renderTasks(allTasks); // Initial render
                    updateDashboardStats(allTasks);
                } else if (response.status === 401) {
                    handleLogout();
                } else {
                    console.error('Failed to fetch tasks:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        // Render tasks to the UI
        const renderTasks = (tasksToRender) => {
            taskList.innerHTML = ''; // Clear existing tasks
            if (tasksToRender.length === 0) {
                noTasksMessage.style.display = 'block';
                return;
            }
            noTasksMessage.style.display = 'none';

            tasksToRender.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.className = `task-card status-${task.status}`;
                taskCard.innerHTML = `
                    <div class="task-header">
                        <h3 class="task-title">${task.title}</h3>
                        <span class="task-status-badge status-${task.status}">${task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                    </div>
                    <p class="task-description">${task.description || 'No description provided.'}</p>
                    <div class="task-meta">
                        <span class="task-due-date"><i class="far fa-calendar-alt"></i> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                    </div>
                    <div class="task-actions">
                        <button class="edit-btn" data-id="${task._id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" data-id="${task._id}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                taskList.appendChild(taskCard);
            });

            // Attach event listeners for edit/delete buttons
            taskList.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => openTaskModalForEdit(e.currentTarget.dataset.id));
            });
            taskList.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteTask(e.currentTarget.dataset.id));
            });
        };

        // Update dashboard statistics
        const updateDashboardStats = (tasks) => {
            const totalTasks = tasks.length;
            const pendingTasks = tasks.filter(task => task.status === 'pending').length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;

            document.getElementById('totalTasksCount').textContent = totalTasks;
            document.getElementById('pendingTasksCount').textContent = pendingTasks;
            document.getElementById('completedTasksCount').textContent = completedTasks;
        };

        // Filter and search tasks
        const applyFilters = () => {
            const filterStatus = taskFilter.value;
            const searchTerm = taskSearch.value.toLowerCase();

            let filteredTasks = allTasks;

            if (filterStatus !== 'all') {
                filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
            }

            if (searchTerm) {
                filteredTasks = filteredTasks.filter(task =>
                    task.title.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm)
                );
            }
            renderTasks(filteredTasks);
        };

        taskFilter.addEventListener('change', applyFilters);
        taskSearch.addEventListener('input', applyFilters);

        // Open Add Task Modal
        openAddTaskModalBtn.addEventListener('click', () => {
            modalTitle.textContent = 'Add New Task';
            saveButtonText.textContent = 'Add Task';
            taskIdInput.value = '';
            taskForm.reset(); // Clear form fields
            displayModalError('');
            taskTitleError.textContent = '';
            taskModal.classList.add('active');
        });

        // Open Task Modal for editing
        const openTaskModalForEdit = (id) => {
            const task = allTasks.find(t => t._id === id);
            if (task) {
                modalTitle.textContent = 'Edit Task';
                saveButtonText.textContent = 'Save Changes';
                taskIdInput.value = task._id;
                taskTitleInput.value = task.title;
                taskDescriptionInput.value = task.description || '';
                taskDueDateInput.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
                taskStatusSelect.value = task.status;
                displayModalError('');
                taskTitleError.textContent = '';
                taskModal.classList.add('active');
            }
        };

        // Close Task Modal
        closeTaskModalBtn.addEventListener('click', () => {
            taskModal.classList.remove('active');
        });

        // Close modal if clicked outside
        window.addEventListener('click', (event) => {
            if (event.target === taskModal) {
                taskModal.classList.remove('active');
            }
        });

        // Handle Add/Edit Task Form Submission
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            taskTitleError.textContent = '';
            displayModalError('');
            setLoadingState(saveTaskButton, saveButtonText, saveTaskSpinner, true);

            const user = JSON.parse(localStorage.getItem('user')); // Get current user info

            const taskId = taskIdInput.value;
            const title = taskTitleInput.value;
            const description = taskDescriptionInput.value;
            const dueDate = taskDueDateInput.value || null;
            const status = taskStatusSelect.value;

            if (!title) {
                taskTitleError.textContent = 'Task title is required.';
                setLoadingState(saveTaskButton, saveButtonText, saveTaskSpinner, false);
                return;
            }

            const taskData = { title, description, dueDate, status };
            let url = `${API_BASE}/users/me/tasks`; // POST for new task
            let method = 'POST';

            if (taskId) {
                url = `${API_BASE}/users/me/tasks/${taskId}`; // PUT for existing task
                method = 'PUT';
            }

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(taskData)
                });

                const data = await response.json();

                if (response.ok) {
                    taskModal.classList.remove('active');
                    fetchTasks(); // Re-fetch and render tasks
                } else {
                    displayModalError(data.message || 'Failed to save task. Please try again.');
                }
            } catch (error) {
                console.error('Error saving task:', error);
                displayModalError('An unexpected error occurred. Please try again.');
            } finally {
                setLoadingState(saveTaskButton, saveButtonText, saveTaskSpinner, false);
            }
        });

        // Delete Task
        const deleteTask = async (id) => {
            if (!confirm('Are you sure you want to delete this task?')) {
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/users/me/tasks/${id}`, { // DELETE specific task
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    fetchTasks(); // Re-fetch and render tasks
                } else if (response.status === 401) {
                    handleLogout();
                } else {
                    const data = await response.json();
                    alert(data.message || 'Failed to delete task.');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('An unexpected error occurred while deleting the task.');
            }
        };

        // Initial fetch of tasks when dashboard loads
        fetchTasks();
    }


    // --- Profile Page Specific Logic ---
    if (path.includes('profile.html')) {
        const profileForm = document.getElementById('profileForm');
        const passwordForm = document.getElementById('passwordForm');
        const profileSuccess = document.getElementById('profileSuccess');
        const profileError = document.getElementById('profileError');
        const passwordSuccess = document.getElementById('passwordSuccess');
        const passwordError = document.getElementById('passwordError');

        // Helper to display messages
        const displayFormMessage = (element, message, type) => {
            element.textContent = message;
            element.className = `form-message ${type}-message`;
            element.style.display = message ? 'block' : 'none';
        };

        // Helper to clear errors specific to a form
        const clearFormErrors = (form) => {
            form.querySelectorAll('.error-message').forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });
            form.querySelectorAll('.form-message').forEach(el => {
                el.style.display = 'none';
            });
        };

        // Handle Profile Update
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                clearFormErrors(profileForm);
                setLoadingState(document.getElementById('saveProfileButton'), document.getElementById('saveProfileText'), document.getElementById('saveProfileSpinner'), true);

                const name = document.getElementById('profileName').value;
                const user = JSON.parse(localStorage.getItem('user')); // Get current user info for ID

                let isValid = true;
                if (!name) {
                    document.getElementById('profileNameError').textContent = 'Full Name is required.';
                    isValid = false;
                }

                if (!isValid) {
                    setLoadingState(document.getElementById('saveProfileButton'), document.getElementById('saveProfileText'), document.getElementById('saveProfileSpinner'), false);
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE}/users/${user._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ name })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        displayFormMessage(profileSuccess, 'Profile updated successfully!', 'success');
                        // Update local user data
                        const updatedUser = { ...user, name: name };
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        // Re-fetch user data to update sidebar
                        fetchUserData();
                    } else {
                        displayFormMessage(profileError, data.message || 'Failed to update profile.', 'error');
                    }
                } catch (error) {
                    console.error('Error updating profile:', error);
                    displayFormMessage(profileError, 'An unexpected error occurred. Please try again later.', 'error');
                } finally {
                    setLoadingState(document.getElementById('saveProfileButton'), document.getElementById('saveProfileText'), document.getElementById('saveProfileSpinner'), false);
                }
            });

            document.getElementById('cancelProfileButton').addEventListener('click', () => {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    document.getElementById('profileName').value = user.name;
                    document.getElementById('profileEmail').value = user.email;
                }
                clearFormErrors(profileForm);
            });
        }

        // Handle Password Change
        if (passwordForm) {
            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                clearFormErrors(passwordForm);
                setLoadingState(document.getElementById('changePasswordButton'), document.getElementById('changePasswordText'), document.getElementById('changePasswordSpinner'), true);

                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;
                const user = JSON.parse(localStorage.getItem('user'));

                let isValid = true;
                if (!currentPassword) {
                    document.getElementById('currentPasswordError').textContent = 'Current password is required.';
                    isValid = false;
                }
                if (!newPassword) {
                    document.getElementById('newPasswordError').textContent = 'New password is required.';
                    isValid = false;
                } else if (newPassword.length < 6) {
                    document.getElementById('newPasswordError').textContent = 'New password must be at least 6 characters.';
                    isValid = false;
                }
                if (newPassword !== confirmNewPassword) {
                    document.getElementById('confirmNewPasswordError').textContent = 'New passwords do not match.';
                    isValid = false;
                }

                if (!isValid) {
                    setLoadingState(document.getElementById('changePasswordButton'), document.getElementById('changePasswordText'), document.getElementById('changePasswordSpinner'), false);
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE}/users/${user._id}/password`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ currentPassword, newPassword })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        displayFormMessage(passwordSuccess, 'Password changed successfully!', 'success');
                        passwordForm.reset(); // Clear password fields
                    } else {
                        displayFormMessage(passwordError, data.message || 'Failed to change password.', 'error');
                    }
                } catch (error) {
                    console.error('Error changing password:', error);
                    displayFormMessage(passwordError, 'An unexpected error occurred. Please try again later.', 'error');
                } finally {
                    setLoadingState(document.getElementById('changePasswordButton'), document.getElementById('changePasswordText'), document.getElementById('changePasswordSpinner'), false);
                }
            });

            document.getElementById('cancelPasswordButton').addEventListener('click', () => {
                passwordForm.reset();
                clearFormErrors(passwordForm);
            });
        }
    }

    // --- Settings Page Specific Logic ---
    if (path.includes('settings.html')) {
        const preferencesForm = document.getElementById('preferencesForm');
        const preferencesSuccess = document.getElementById('preferencesSuccess');
        const preferencesError = document.getElementById('preferencesError');
        const deleteAccountButton = document.getElementById('deleteAccountButton');
        const deleteAccountError = document.getElementById('deleteAccountError');

        // Helper to display messages (reusing from profile)
        const displayFormMessage = (element, message, type) => {
            element.textContent = message;
            element.className = `form-message ${type}-message`;
            element.style.display = message ? 'block' : 'none';
        };

        // Helper to clear errors specific to a form (reusing from profile)
        const clearFormErrors = (form) => {
            form.querySelectorAll('.error-message').forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });
            form.querySelectorAll('.form-message').forEach(el => {
                el.style.display = 'none';
            });
        };

        // Handle Preferences Form Submission
        if (preferencesForm) {
            preferencesForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                clearFormErrors(preferencesForm);
                displayFormMessage(preferencesSuccess, 'Preferences saved!', 'success');
                // In a real app, this would send preference data to the backend
                // and update UI based on selected theme etc.
                // console.log("Preferences saved (frontend mock):", {
                //     theme: document.getElementById('themeSelect').value,
                //     notifications: document.getElementById('notificationToggle').checked
                // });
            });
        }

        // Handle Delete Account
        if (deleteAccountButton) {
            deleteAccountButton.addEventListener('click', async () => {
                if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                    return;
                }

                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user._id) {
                    displayFormMessage(deleteAccountError, 'User ID not found. Cannot delete account.', 'error');
                    return;
                }

                try {
                    // This endpoint would need to be implemented in backend/routes/users.js
                    const response = await fetch(`${API_BASE}/users/${user._id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        alert('Account deleted successfully. Redirecting to homepage.');
                        handleLogout(); // Log out and redirect
                    } else if (response.status === 401) {
                        handleLogout();
                    } else {
                        const data = await response.json();
                        displayFormMessage(deleteAccountError, data.message || 'Failed to delete account.', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    displayFormMessage(deleteAccountError, 'An unexpected error occurred. Please try again later.', 'error');
                }
            });
        }
    }
});