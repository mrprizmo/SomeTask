// Mock data 
const studentData = {
    groups: [
        {
            id: 1,
            name: "Computer Science 101",
            description: "Introduction to Programming with Python",
            subject: "Computer Science",
            teacher: "Dr. Smith",
            joinDate: "2023-09-01"
        },
        {
            id: 2,
            name: "Web Development",
            description: "Modern Web Technologies and Frameworks",
            subject: "Computer Science",
            teacher: "Prof. Johnson",
            joinDate: "2023-09-15"
        }
    ],
    activeAssignments: [
        {
            id: 1,
            groupId: 1,
            title: "Python Basics",
            description: "Write a program that demonstrates variables, data types, and basic operations.",
            deadline: "2023-11-05",
            maxScore: 100,
            type: "homework",
            status: "active",
            submitted: false
        },
        {
            id: 2,
            groupId: 1,
            title: "Functions and Loops",
            description: "Create functions with parameters and implement different types of loops.",
            deadline: "2023-11-12",
            maxScore: 100,
            type: "homework",
            status: "active",
            submitted: false
        },
        {
            id: 3,
            groupId: 2,
            title: "HTML/CSS Project",
            description: "Create a responsive webpage using HTML and CSS.",
            deadline: "2023-11-08",
            maxScore: 100,
            type: "project",
            status: "active",
            submitted: true
        }
    ],
    submittedAssignments: [
        {
            id: 1,
            assignmentId: 3,
            title: "HTML/CSS Project",
            groupName: "Web Development",
            submissionDate: "2023-11-05 14:30",
            status: "graded",
            grade: 92,
            maxScore: 100,
            teacherFeedback: "Отличная работа! Хорошо продуманный дизайн и адаптивная верстка. Можно улучшить семантическую разметку.",
            files: ["project.zip"]
        },
        {
            id: 2,
            assignmentId: 4,
            title: "Data Structures",
            groupName: "Computer Science 101",
            submissionDate: "2023-10-25 10:15",
            status: "graded",
            grade: 85,
            maxScore: 100,
            teacherFeedback: "Хорошая реализация основных структур данных. Обратите внимание на эффективность алгоритмов.",
            files: ["data_structures.py"]
        },
        {
            id: 3,
            assignmentId: 5,
            title: "JavaScript Basics",
            groupName: "Web Development",
            submissionDate: "2023-11-02 16:45",
            status: "submitted",
            grade: null,
            maxScore: 100,
            teacherFeedback: "",
            files: ["js_basics.js"]
        }
    ]
};

// Application state
let currentState = {
    activeAssignment: null,
    activeSubmission: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    renderActiveAssignments();
    renderSubmittedAssignments();
    renderGroups();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    document.getElementById('joinGroupForm').addEventListener('submit', function (e) {
        e.preventDefault();
        joinGroup();
        closeAllModals();
    });

    document.getElementById('submitAssignmentForm').addEventListener('submit', function (e) {
        e.preventDefault();
        submitAssignment();
        closeAllModals();
    });

    document.querySelectorAll('.close-btn, .btn:not([type="submit"])').forEach(btn => {
        btn.addEventListener('click', function () {
            if (this.id === 'cancelJoinBtn' || this.id === 'cancelSubmitBtn' ||
                this.id === 'closeViewBtn' || this.classList.contains('close-btn')) {
                closeAllModals();
            }
        });
    });

    // Закрытие модальных окон при клике на фон
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        if (item.getAttribute('data-tab')) {
            item.addEventListener('click', function () {
                const tab = this.getAttribute('data-tab');
                switchTab(tab);
            });
        }
    });

    // Join group buttons
    document.getElementById('joinGroupBtn').addEventListener('click', () => {
        document.getElementById('joinGroupModal').classList.add('active');
    });

    document.getElementById('joinGroupBtn2').addEventListener('click', () => {
        document.getElementById('joinGroupModal').classList.add('active');
    });

    // Close modals
    document.querySelectorAll('.close-btn, .btn:not([type="submit"])').forEach(btn => {
        btn.addEventListener('click', function () {
            if (this.id === 'cancelJoinBtn' || this.id === 'cancelSubmitBtn' ||
                this.id === 'closeViewBtn' || this.classList.contains('close-btn')) {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    });

    // Form submissions
    document.getElementById('joinGroupForm').addEventListener('submit', function (e) {
        e.preventDefault();
        joinGroup();
    });

    document.getElementById('submitAssignmentForm').addEventListener('submit', function (e) {
        e.preventDefault();
        submitAssignment();
    });
}

// Switch between tabs
function switchTab(tabId) {
    // Update active menu item
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.sidebar-menu li[data-tab="${tabId}"]`).classList.add('active');

    // Show corresponding content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

// Render active assignments
function renderActiveAssignments() {
    const container = document.getElementById('activeAssignmentsContainer');
    container.innerHTML = '';

    if (studentData.activeAssignments.length === 0) {
        container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="fas fa-tasks"></i>
                        <h3>Нет активных заданий</h3>
                        <p>Все задания выполнены или ожидайте новых заданий от преподавателей.</p>
                    </div>
                `;
        return;
    }

    studentData.activeAssignments.forEach(assignment => {
        const group = studentData.groups.find(g => g.id === assignment.groupId);
        const daysLeft = calculateDaysLeft(assignment.deadline);
        const statusClass = assignment.submitted ? 'status-graded' : 'status-pending';
        const statusText = assignment.submitted ? 'Сдано' : 'Ожидает сдачи';

        const assignmentCard = document.createElement('div');
        assignmentCard.className = 'assignment-card';
        assignmentCard.innerHTML = `
                    <div class="assignment-header">
                        <h3>${assignment.title}</h3>
                        <span class="deadline ${daysLeft < 3 ? 'urgent' : ''}">
                            <i class="fas fa-clock"></i> ${formatDeadline(assignment.deadline)}
                        </span>
                    </div>
                    <p class="assignment-description">${assignment.description}</p>
                    <div class="assignment-details">
                        <span><i class="fas fa-users"></i> ${group.name}</span>
                        <span><i class="fas fa-star"></i> Макс. балл: ${assignment.maxScore}</span>
                    </div>
                    <div class="assignment-footer">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <button class="btn ${assignment.submitted ? 'btn-secondary' : 'btn-primary'} submit-btn" 
                                data-id="${assignment.id}">
                            ${assignment.submitted ? 'Просмотр' : 'Сдать ссылкой'}
                        </button>
                    </div>
                `;
        container.appendChild(assignmentCard);
    });

    // Add event listeners for submit buttons
    document.querySelectorAll('.submit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const assignmentId = parseInt(this.getAttribute('data-id'));
            const assignment = studentData.activeAssignments.find(a => a.id === assignmentId);

            if (assignment.submitted) {
                // View submission
                const submission = studentData.submittedAssignments.find(s => s.assignmentId === assignmentId);
                if (submission) {
                    openSubmission(submission);
                }
            } else {
                // Submit assignment
                openSubmitAssignment(assignment);
            }
        });
    });
}

// Render submitted assignments
function renderSubmittedAssignments() {
    const tbody = document.querySelector('#submittedAssignmentsTable tbody');
    tbody.innerHTML = '';

    if (studentData.submittedAssignments.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-table">
                            <i class="fas fa-check-circle"></i>
                            <p>Нет сданных заданий</p>
                        </td>
                    </tr>
                `;
        return;
    }

    studentData.submittedAssignments.forEach(submission => {
        const statusClass = submission.status === 'graded' ? 'status-graded' : 'status-submitted';
        const statusText = submission.status === 'graded' ? 'Проверено' : 'На проверке';
        const gradeDisplay = submission.grade ? `${submission.grade}/${submission.maxScore}` : '-';

        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${submission.title}</td>
                    <td>${submission.groupName}</td>
                    <td>${submission.submissionDate}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${gradeDisplay}</td>
                    <td>
                        <button class="btn btn-primary view-result-btn" data-id="${submission.id}">
                            <i class="fas fa-eye"></i> Просмотр
                        </button>
                    </td>
                `;
        tbody.appendChild(row);
    });

    // Add event listeners for view buttons
    document.querySelectorAll('.view-result-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const submissionId = parseInt(this.getAttribute('data-id'));
            const submission = studentData.submittedAssignments.find(s => s.id === submissionId);
            if (submission) {
                openSubmission(submission);
            }
        });
    });
}

// Render groups
function renderGroups() {
    const container = document.getElementById('groupsContainer');
    container.innerHTML = '';

    if (studentData.groups.length === 0) {
        container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="fas fa-users"></i>
                        <h3>Нет групп</h3>
                        <p>Вступите в группу, чтобы начать получать задания.</p>
                        <button class="btn btn-primary" id="createFirstGroupBtn" style="margin-top: 15px;">
                            <i class="fas fa-plus"></i> Вступить в группу
                        </button>
                    </div>
                `;

        document.getElementById('createFirstGroupBtn').addEventListener('click', () => {
            document.getElementById('joinGroupModal').classList.add('active');
        });
        return;
    }

    studentData.groups.forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.innerHTML = `
                    <h3>${group.name}</h3>
                    <p>${group.description}</p>
                    <div class="group-details">
                        <span><i class="fas fa-user-tie"></i> ${group.teacher}</span>
                        <span><i class="fas fa-calendar"></i> В группе с: ${group.joinDate}</span>
                    </div>
                `;
        container.appendChild(groupCard);
    });
}

// Open submit assignment modal
function openSubmitAssignment(assignment) {
    const group = studentData.groups.find(g => g.id === assignment.groupId);

    document.getElementById('assignmentTitle').textContent = assignment.title;
    document.getElementById('assignmentGroup').textContent = group.name;
    document.getElementById('assignmentDeadline').textContent = formatDeadline(assignment.deadline);
    document.getElementById('assignmentDescription').textContent = assignment.description;

    currentState.activeAssignment = assignment;
    document.getElementById('submitAssignmentModal').classList.add('active');
}

// Open submission view modal
function openSubmission(submission) {
    document.getElementById('viewAssignmentTitle').textContent = submission.title;
    document.getElementById('viewAssignmentGroup').textContent = submission.groupName;
    document.getElementById('submissionDate').textContent = submission.submissionDate;
    document.getElementById('gradeValue').textContent = submission.grade || '-';
    document.getElementById('maxScoreValue').textContent = submission.maxScore;
    document.getElementById('teacherFeedback').textContent = submission.teacherFeedback || 'Комментарий отсутствует';

    // Fill link information
    const filesList = document.getElementById('submittedFilesList');
    filesList.innerHTML = '';

    if (submission.link) {
        const li = document.createElement('li');
        li.className = 'file-item';
        li.innerHTML = `
            <a href="${submission.link}" target="_blank" class="file-name">
                <i class="fas fa-external-link-alt"></i> ${submission.link}
            </a>
            <button class="btn btn-primary small-btn" onclick="window.open('${submission.link}', '_blank')">
                <i class="fas fa-external-link-alt"></i> Открыть
            </button>
        `;
        filesList.appendChild(li);
    } else {
        const li = document.createElement('li');
        li.textContent = 'Ссылка не приложена';
        filesList.appendChild(li);
    }

    // Show student's comment if exists
    if (submission.comment) {
        const commentElement = document.createElement('div');
        commentElement.className = 'form-group';
        commentElement.innerHTML = `
            <label>Ваш комментарий:</label>
            <div class="feedback-box">
                <p>${submission.comment}</p>
            </div>
        `;
        filesList.parentNode.insertBefore(commentElement, filesList.nextSibling);
    }

    currentState.activeSubmission = submission;
    document.getElementById('viewSubmissionModal').classList.add('active');
}

// Join group
function joinGroup() {
    const inviteCode = document.getElementById('inviteCode').value;

    // In a real app, this would be an API call
    if (inviteCode) {
        // Simulate joining a group
        const newGroup = {
            id: studentData.groups.length + 1,
            name: "Новая группа",
            description: "Описание новой группы",
            subject: "Предмет",
            teacher: "Преподаватель",
            joinDate: new Date().toISOString().slice(0, 10)
        };

        studentData.groups.push(newGroup);
        renderGroups();

        // Close modal and reset form
        document.getElementById('joinGroupModal').classList.remove('active');
        document.getElementById('joinGroupForm').reset();

        alert(`Вы успешно вступили в группу!`);

        // Switch to groups tab
        switchTab('groups');
    } else {
        alert('Пожалуйста, введите код приглашения');
    }
}

// Submit assignment
function submitAssignment() {
    const link = document.getElementById('submissionLink').value;
    const comment = document.getElementById('submissionComment').value;

    // Validation
    if (!link) {
        alert('Пожалуйста, укажите ссылку на задание в облачном хранилище');
        return;
    }

    // Basic URL validation
    if (!isValidUrl(link)) {
        alert('Пожалуйста, введите корректную ссылку');
        return;
    }

    // In a real app, this would be an API call
    // Update assignment status
    const assignmentIndex = studentData.activeAssignments.findIndex(a => a.id === currentState.activeAssignment.id);
    if (assignmentIndex !== -1) {
        studentData.activeAssignments[assignmentIndex].submitted = true;
    }

    // Prepare submission data
    const group = studentData.groups.find(g => g.id === currentState.activeAssignment.groupId);
    const submissionData = {
        id: studentData.submittedAssignments.length + 1,
        assignmentId: currentState.activeAssignment.id,
        title: currentState.activeAssignment.title,
        groupName: group.name,
        submissionDate: new Date().toLocaleString('ru-RU'),
        status: 'submitted',
        grade: null,
        maxScore: currentState.activeAssignment.maxScore,
        teacherFeedback: '',
        submissionType: 'link',
        link: link,
        comment: comment
    };

    studentData.submittedAssignments.push(submissionData);

    // Close modal and reset form
    document.getElementById('submitAssignmentModal').classList.remove('active');
    document.getElementById('submitAssignmentForm').reset();

    // Refresh views
    renderActiveAssignments();
    renderSubmittedAssignments();

    alert('Задание успешно отправлено по ссылке!');
}

// Helper function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Helper functions
function calculateDaysLeft(deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDeadline(deadline) {
    const daysLeft = calculateDaysLeft(deadline);
    if (daysLeft < 0) {
        return 'Просрочено';
    } else if (daysLeft === 0) {
        return 'Сегодня';
    } else if (daysLeft === 1) {
        return 'Завтра';
    } else {
        return `Осталось ${daysLeft} дней`;
    }
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}