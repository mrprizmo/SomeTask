// Mock data 
const mockData = {
    groups: [
        {
            id: 1,
            name: "Основы и методологии прогроммирования",
            description: "петон плохо",
            subject: "Computer Science",
            studentCount: 28,
            assignmentCount: 5,
            activeAssignments: 3,
            inviteCode: "CS101-SPRING2023"
        },
        {
            id: 2,
            name: "Веб разработка",
            description: "спринг бут джава я не шиз",
            subject: "Computer Science",
            studentCount: 22,
            assignmentCount: 4,
            activeAssignments: 2,
            inviteCode: "WEBDEV-2023"
        },
        {
            id: 3,
            name: "Базы данных",
            description: "постгрес библиотека",
            subject: "Information Systems",
            studentCount: 35,
            assignmentCount: 6,
            activeAssignments: 1,
            inviteCode: "DB-SYSTEMS-F23"
        }
    ],
    students: [
        { id: 1, name: "Alex Johnson", email: "alex.johnson@student.edu" },
        { id: 2, name: "Maria Garcia", email: "maria.garcia@student.edu" },
        { id: 3, name: "James Wilson", email: "james.wilson@student.edu" },
        { id: 4, name: "Sarah Miller", email: "sarah.miller@student.edu" },
        { id: 5, name: "David Brown", email: "david.brown@student.edu" }
    ],
    assignments: [
        {
            id: 1,
            groupId: 1,
            title: "Python Basics",
            description: "Write a program that demonstrates variables, data types, and basic operations.",
            deadline: "2023-11-05",
            submitted: 24,
            graded: 18,
            maxScore: 100,
            type: "homework",
            status: "active"
        },
        {
            id: 2,
            groupId: 1,
            title: "Functions and Loops",
            description: "Create functions with parameters and implement different types of loops.",
            deadline: "2023-11-12",
            submitted: 20,
            graded: 12,
            maxScore: 100,
            type: "homework",
            status: "active"
        },
        {
            id: 3,
            groupId: 1,
            title: "Midterm Project",
            description: "Build a console-based application using all concepts learned so far.",
            deadline: "2023-11-20",
            submitted: 15,
            graded: 5,
            maxScore: 200,
            type: "project",
            status: "active"
        },
        {
            id: 4,
            groupId: 1,
            title: "Data Structures",
            description: "Implement basic data structures in Python.",
            deadline: "2023-10-25",
            submitted: 28,
            graded: 28,
            maxScore: 100,
            type: "homework",
            status: "completed"
        }
    ],
    submissions: [
        {
            id: 1,
            studentId: 1,
            assignmentId: 1,
            studentName: "Alex Johnson",
            assignmentName: "Python Basics",
            submissionDate: "2023-11-03 14:30",
            status: "graded",
            grade: 92,
            maxScore: 100,
            files: ["python_basics.py", "readme.txt"]
        },
        {
            id: 2,
            studentId: 2,
            assignmentId: 1,
            studentName: "Maria Garcia",
            assignmentName: "Python Basics",
            submissionDate: "2023-11-04 10:15",
            status: "submitted",
            grade: null,
            maxScore: 100,
            files: ["assignment1.zip"]
        },
        {
            id: 3,
            studentId: 3,
            assignmentId: 1,
            studentName: "James Wilson",
            assignmentName: "Python Basics",
            submissionDate: "2023-11-02 16:45",
            status: "graded",
            grade: 78,
            maxScore: 100,
            files: ["python_basics.py"]
        },
        {
            id: 4,
            studentId: 4,
            assignmentId: 2,
            studentName: "Sarah Miller",
            assignmentName: "Functions and Loops",
            submissionDate: "2023-11-10 09:30",
            status: "submitted",
            grade: null,
            maxScore: 100,
            files: ["functions_loops.py", "test_cases.py"]
        },
        {
            id: 5,
            studentId: 1,
            assignmentId: 3,
            studentName: "Alex Johnson",
            assignmentName: "Midterm Project",
            submissionDate: "2023-11-18 11:20",
            status: "graded",
            grade: 185,
            maxScore: 200,
            files: ["midterm_project.zip"]
        }
    ]
};

// Application state
let currentState = {
    activeGroup: null,
    activeTab: 'groups'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    renderGroups();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', function () {
            const tab = this.getAttribute('data-tab');
            if (tab === 'groups') {
                showGroupsTab();
            }
            // Other tabs can be implemented later
        });
    });

    // Group tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');
            switchGroupTab(tabId);
        });
    });

    // Modal buttons
    document.getElementById('createGroupBtn').addEventListener('click', () => {
        document.getElementById('createGroupModal').classList.add('active');
    });

    document.getElementById('inviteStudentsBtn').addEventListener('click', () => {
        if (currentState.activeGroup) {
            document.getElementById('inviteLink').value = `https://homework-system.edu/join/${currentState.activeGroup.inviteCode}`;
            document.getElementById('inviteStudentsModal').classList.add('active');
        }
    });

    document.getElementById('createAssignmentBtn').addEventListener('click', () => {
        if (currentState.activeGroup) {
            // Set minimum date to today
            const today = new Date().toISOString().slice(0, 16);
            document.getElementById('assignmentDeadline').min = today;
            document.getElementById('createAssignmentModal').classList.add('active');
        }
    });

    // Close modals
    document.querySelectorAll('.close-btn, .btn:not([type="submit"])').forEach(btn => {
        btn.addEventListener('click', function () {
            if (this.id === 'cancelGroupBtn' || this.id === 'cancelAssignmentBtn' ||
                this.id === 'closeInviteBtn' || this.id === 'cancelSubmissionBtn' ||
                this.classList.contains('close-btn')) {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    });

    // Form submissions
    document.getElementById('createGroupForm').addEventListener('submit', function (e) {
        e.preventDefault();
        createGroup();
    });

    document.getElementById('createAssignmentForm').addEventListener('submit', function (e) {
        e.preventDefault();
        createAssignment();
    });

    // Copy invite link
    document.getElementById('copyLinkBtn').addEventListener('click', function () {
        const linkInput = document.getElementById('inviteLink');
        linkInput.select();
        document.execCommand('copy');
        alert('Invitation link copied to clipboard!');
    });

    // Save grade
    document.getElementById('saveSubmissionBtn').addEventListener('click', function () {
        saveGrade();
    });

    // Back to groups
    document.getElementById('backToGroups').addEventListener('click', function () {
        showGroupsTab();
    });
}

// Render groups list
function renderGroups() {
    const groupsContainer = document.getElementById('groupsContainer');
    groupsContainer.innerHTML = '';

    if (mockData.groups.length === 0) {
        groupsContainer.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="fas fa-users"></i>
                        <h3>No Groups Yet</h3>
                        <p>Create your first teaching group to get started.</p>
                        <button class="btn btn-primary" id="createFirstGroupBtn" style="margin-top: 15px;">
                            <i class="fas fa-plus"></i> Create Group
                        </button>
                    </div>
                `;

        document.getElementById('createFirstGroupBtn').addEventListener('click', () => {
            document.getElementById('createGroupModal').classList.add('active');
        });
        return;
    }

    mockData.groups.forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.innerHTML = `
                    <h3>${group.name}</h3>
                    <p>${group.description}</p>
                    <div class="group-stats">
                        <span><i class="fas fa-user-graduate"></i> ${group.studentCount} students</span>
                        <span><i class="fas fa-tasks"></i> ${group.assignmentCount} assignments</span>
                    </div>
                `;
        groupCard.addEventListener('click', () => {
            openGroup(group.id);
        });
        groupsContainer.appendChild(groupCard);
    });
}

// Open group details
function openGroup(groupId) {
    const group = mockData.groups.find(g => g.id === groupId);
    if (!group) return;

    currentState.activeGroup = group;

    // Update group info
    document.getElementById('group-name').textContent = group.name;
    document.getElementById('group-description').textContent = group.description;
    document.getElementById('students-count').textContent = group.studentCount;
    document.getElementById('assignments-count').textContent = group.assignmentCount;
    document.getElementById('active-assignments').textContent = group.activeAssignments;

    // Render tables
    renderStudentsTable();
    renderAssignmentsTable();
    renderSubmissionsTable();

    // Switch to group details view
    document.getElementById('groups-tab').style.display = 'none';
    document.getElementById('group-details').style.display = 'block';

    // Reset to first tab
    switchGroupTab('students');
}

// Switch between group tabs
function switchGroupTab(tabId) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');

    // Show corresponding content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Return to groups list
function showGroupsTab() {
    document.getElementById('groups-tab').style.display = 'block';
    document.getElementById('group-details').style.display = 'none';
    currentState.activeGroup = null;
}

// Render students table
function renderStudentsTable() {
    const tbody = document.querySelector('#students-table tbody');
    tbody.innerHTML = '';

    mockData.students.forEach(student => {
        const statusClass = student.status === 'active' ? 'status-graded' : 'status-pending';
        const statusText = student.status === 'active' ? 'Active' : 'Inactive';

        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                `;
        tbody.appendChild(row);
    });
}

// Render assignments table
function renderAssignmentsTable() {
    const tbody = document.querySelector('#assignments-table tbody');
    tbody.innerHTML = '';

    // Filter assignments for current group
    const groupAssignments = mockData.assignments.filter(a => a.groupId === currentState.activeGroup.id);

    groupAssignments.forEach(assignment => {
        const statusClass = assignment.status === 'active' ? 'status-submitted' :
            assignment.status === 'completed' ? 'status-graded' : 'status-pending';
        const statusText = assignment.status === 'active' ? 'Active' :
            assignment.status === 'completed' ? 'Completed' : 'Draft';

        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${assignment.title}</td>
                    <td>${assignment.deadline}</td>
                    <td>${assignment.submitted}/${currentState.activeGroup.studentCount}</td>
                    <td>${assignment.graded}/${assignment.submitted}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td class="action-buttons">
                        <button class="btn btn-primary small-btn extend-deadline-btn" data-id="${assignment.id}">
                            <i class="fas fa-calendar-plus"></i> Extend
                        </button>
                        <button class="btn btn-danger small-btn delete-assignment-btn" data-id="${assignment.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
        tbody.appendChild(row);
    });

    // Add event listeners for assignment actions
    document.querySelectorAll('.extend-deadline-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const assignmentId = parseInt(this.getAttribute('data-id'));
            extendDeadline(assignmentId);
        });
    });

    document.querySelectorAll('.delete-assignment-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const assignmentId = parseInt(this.getAttribute('data-id'));
            deleteAssignment(assignmentId);
        });
    });
}

// Render submissions table
function renderSubmissionsTable() {
    const tbody = document.querySelector('#submissions-table tbody');
    tbody.innerHTML = '';

    // Filter submissions for current group
    const groupAssignmentIds = mockData.assignments
        .filter(a => a.groupId === currentState.activeGroup.id)
        .map(a => a.id);

    const groupSubmissions = mockData.submissions.filter(s =>
        groupAssignmentIds.includes(s.assignmentId)
    );

    groupSubmissions.forEach(submission => {
        const statusClass = submission.status === 'graded' ? 'status-graded' :
            submission.status === 'submitted' ? 'status-submitted' : 'status-pending';
        const statusText = submission.status === 'graded' ? 'Graded' :
            submission.status === 'submitted' ? 'Submitted' : 'Pending Review';

        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${submission.studentName}</td>
                    <td>${submission.assignmentName}</td>
                    <td>${submission.submissionDate}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${submission.grade ? `${submission.grade}/${submission.maxScore}` : '-'}</td>
                    <td>
                        <button class="btn btn-primary view-submission-btn" data-id="${submission.id}">
                            <i class="fas fa-eye"></i> ${submission.status === 'graded' ? 'View' : 'Grade'}
                        </button>
                    </td>
                `;
        tbody.appendChild(row);
    });

    // Add event listeners for submission buttons
    document.querySelectorAll('.view-submission-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const submissionId = parseInt(this.getAttribute('data-id'));
            openSubmission(submissionId);
        });
    });
}

// Create a new group
function createGroup() {
    const name = document.getElementById('groupName').value;
    const description = document.getElementById('groupDescription').value;
    const subject = document.getElementById('groupSubject').value;

    // Generate invite code
    const inviteCode = generateInviteCode(name, subject);

    // In a real app, this would be an API call
    const newGroup = {
        id: mockData.groups.length + 1,
        name,
        description,
        subject,
        studentCount: 0,
        assignmentCount: 0,
        activeAssignments: 0,
        inviteCode
    };

    mockData.groups.push(newGroup);
    renderGroups();

    // Close modal and reset form
    document.getElementById('createGroupModal').classList.remove('active');
    document.getElementById('createGroupForm').reset();

    alert(`Group "${name}" created successfully!`);
}

// Create a new assignment
function createAssignment() {
    const title = document.getElementById('assignmentTitle').value;
    const description = document.getElementById('assignmentDescription').value;
    const deadline = document.getElementById('assignmentDeadline').value;
    const maxScore = document.getElementById('assignmentMaxScore').value;
    const type = document.getElementById('assignmentType').value;

    // In a real app, this would be an API call
    const newAssignment = {
        id: mockData.assignments.length + 1,
        groupId: currentState.activeGroup.id,
        title,
        description,
        deadline: new Date(deadline).toLocaleDateString('en-US'),
        submitted: 0,
        graded: 0,
        maxScore: parseInt(maxScore),
        type,
        status: 'active'
    };

    mockData.assignments.push(newAssignment);

    // Update group assignment counts
    currentState.activeGroup.assignmentCount++;
    currentState.activeGroup.activeAssignments++;

    if (currentState.activeGroup) {
        renderAssignmentsTable();
        document.getElementById('assignments-count').textContent = currentState.activeGroup.assignmentCount;
        document.getElementById('active-assignments').textContent = currentState.activeGroup.activeAssignments;
    }

    // Close modal and reset form
    document.getElementById('createAssignmentModal').classList.remove('active');
    document.getElementById('createAssignmentForm').reset();

    alert(`Assignment "${title}" created successfully!`);
}

// Extend assignment deadline
function extendDeadline(assignmentId) {
    const assignment = mockData.assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const newDeadline = prompt("Enter new deadline (YYYY-MM-DD):", assignment.deadline);

    if (newDeadline) {
        assignment.deadline = newDeadline;
        renderAssignmentsTable();
        alert("Deadline extended successfully!");
    }
}

// Delete assignment
function deleteAssignment(assignmentId) {
    if (confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) {
        const assignmentIndex = mockData.assignments.findIndex(a => a.id === assignmentId);
        if (assignmentIndex !== -1) {
            const assignment = mockData.assignments[assignmentIndex];
            mockData.assignments.splice(assignmentIndex, 1);

            // Update group counts
            currentState.activeGroup.assignmentCount--;
            if (assignment.status === 'active') {
                currentState.activeGroup.activeAssignments--;
            }

            renderAssignmentsTable();
            document.getElementById('assignments-count').textContent = currentState.activeGroup.assignmentCount;
            document.getElementById('active-assignments').textContent = currentState.activeGroup.activeAssignments;
            alert("Assignment deleted successfully!");
        }
    }
}

// Open submission for grading
function openSubmission(submissionId) {
    const submission = mockData.submissions.find(s => s.id === submissionId);
    if (!submission) return;

    // Find the assignment to get max score
    const assignment = mockData.assignments.find(a => a.id === submission.assignmentId);

    // Fill submission details
    document.getElementById('submissionStudentName').textContent = submission.studentName;
    document.getElementById('submissionAssignmentName').textContent = submission.assignmentName;
    document.getElementById('submissionDate').textContent = submission.submissionDate;
    document.getElementById('maxScore').textContent = assignment ? assignment.maxScore : submission.maxScore;
    document.getElementById('submissionGrade').value = submission.grade || '';
    document.getElementById('submissionFeedback').value = '';

    // Fill file list
    const filesList = document.getElementById('submissionFiles');
    filesList.innerHTML = '';

    submission.files.forEach(file => {
        const li = document.createElement('li');
        li.className = 'file-item';
        li.innerHTML = `
                    <a href="#" class="file-name">
                        <i class="fas fa-file"></i> ${file}
                    </a>
                    <button class="btn btn-primary small-btn">
                        <i class="fas fa-download"></i> Download
                    </button>
                `;
        filesList.appendChild(li);
    });

    // Open modal
    document.getElementById('submissionModal').classList.add('active');
}

// Save grade and feedback
function saveGrade() {
    const grade = document.getElementById('submissionGrade').value;
    const feedback = document.getElementById('submissionFeedback').value;

    // In a real app, this would be an API call
    alert(`Grade ${grade} saved successfully! Feedback: ${feedback}`);

    // Close modal
    document.getElementById('submissionModal').classList.remove('active');

    // Refresh submissions table
    if (currentState.activeGroup) {
        renderSubmissionsTable();
    }
}

// Generate invite code
function generateInviteCode(name, subject) {
    const prefix = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const subjectCode = subject.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${subjectCode}-${randomNum}`;
}