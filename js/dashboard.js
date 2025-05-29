// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
});

// Check if user is authenticated
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
}

// Initialize dashboard
function initializeDashboard() {
    // Set active section
    showSection('checkin');
    
    // Load user profile
    loadUserProfile();
    
    // Load customizations
    loadCustomizations();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active state
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Settings menu
    document.getElementById('settingsBtn').addEventListener('click', function() {
        const menu = document.getElementById('settingsMenu');
        menu.classList.toggle('active');
    });
    
    // Settings submenu
    document.querySelectorAll('.settings-submenu-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-settings');
            showSection(section);
            
            // Close settings menu
            document.getElementById('settingsMenu').classList.remove('active');
        });
    });
    
    // Check-in search
    document.getElementById('searchPerson').addEventListener('input', function(e) {
        searchPeople(e.target.value);
    });
    
    // Add visitor
    document.getElementById('addVisitorBtn').addEventListener('click', function() {
        document.getElementById('visitorModal').style.display = 'block';
    });
    
    // Modal close
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('visitorModal').style.display = 'none';
    });
    
    // Visitor form
    document.getElementById('visitorForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addVisitor();
    });
    
    // Report type change
    document.getElementById('reportType').addEventListener('change', function() {
        loadReport(this.value);
    });
    
    // Report view toggle
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            updateReportView(view);
        });
    });
    
    // Clear report
    document.getElementById('clearReportBtn').addEventListener('click', clearReport);
    
    // Download report
    document.getElementById('downloadReportBtn').addEventListener('click', downloadReport);
    
    // Gallery upload
    document.getElementById('uploadImageBtn').addEventListener('click', function() {
        document.getElementById('imageInput').click();
    });
    
    document.getElementById('imageInput').addEventListener('change', function(e) {
        uploadImages(e.target.files);
    });
    
    // Remove images
    document.getElementById('removeImageBtn').addEventListener('click', removeSelectedImages);
    
    // Cadastro form
    document.getElementById('cadastroForm').addEventListener('submit', function(e) {
        e.preventDefault();
        cadastrarPessoa();
    });
    
    // Color pickers
    document.getElementById('primaryColor').addEventListener('change', function() {
        updateThemeColor('primary', this.value);
    });
    
    document.getElementById('secondaryColor').addEventListener('change', function() {
        updateThemeColor('secondary', this.value);
    });
}

// Show section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
}

// Load user profile
async function loadUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        document.getElementById('profileEmail').value = user.email || '';
        // Load additional profile data from database
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
        if (data) {
            document.getElementById('profileName').value = data.name || '';
            document.getElementById('profilePhone').value = data.phone || '';
        }
    }
}

// Load customizations
function loadCustomizations() {
    // Load saved theme colors
    const primaryColor = localStorage.getItem('primaryColor') || '#7FA869';
    const secondaryColor = localStorage.getItem('secondaryColor') || '#0F5DA4';
    
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    
    document.getElementById('primaryColor').value = primaryColor;
    document.getElementById('secondaryColor').value = secondaryColor;
    
    // Load company logo
    const companyLogo = localStorage.getItem('companyLogo');
    if (companyLogo) {
        document.getElementById('logoEmpresa').src = companyLogo;
        document.getElementById('logoPreview').src = companyLogo;
    }
}

// Load dashboard data
async function loadDashboardData() {
    // Load people for check-in
    loadPeopleList();
    
    // Load gallery
    loadGallery();
    
    // Load registered people
    loadRegisteredPeople();
}

// Load people list for check-in
async function loadPeopleList() {
    const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('name');
        
    if (data) {
        const peopleList = document.getElementById('peopleList');
        peopleList.innerHTML = '';
        
        data.forEach(person => {
            const personItem = createPersonItem(person, 'checkin');
            peopleList.appendChild(personItem);
        });
    }
}

// Create person item
function createPersonItem(person, type) {
    const div = document.createElement('div');
    div.className = 'person-item';
    
    const info = document.createElement('div');
    info.className = 'person-info';
    info.innerHTML = `
        <div class="person-name">${person.name}</div>
        <div class="person-email">${person.email || ''}</div>
    `;
    
    const button = document.createElement('button');
    
    if (type === 'checkin') {
        button.className = 'btn-checkin';
        button.textContent = 'Check-in';
        button.onclick = () => doCheckIn(person);
    } else {
        button.className = 'btn-checkout';
        button.textContent = 'Check-out';
        button.onclick = () => doCheckOut(person);
    }
    
    div.appendChild(info);
    div.appendChild(button);
    
    return div;
}

// Do check-in
async function doCheckIn(person) {
    const { data, error } = await supabase
        .from('checkins')
        .insert([
            {
                person_id: person.id,
                checked_in_at: new Date().toISOString()
            }
        ]);
        
    if (!error) {
        // Move to checked-in list
        loadPeopleList();
        loadCheckedInList();
        
        // Show success message
        showNotification('Check-in realizado com sucesso!', 'success');
    }
}

// Load checked-in list
async function loadCheckedInList() {
    const { data, error } = await supabase
        .from('checkins')
        .select('*, people(*)')
        .is('checked_out_at', null)
        .order('checked_in_at', { ascending: false });
        
    if (data) {
        const checkedInList = document.getElementById('checkedInList');
        checkedInList.innerHTML = '';
        
        data.forEach(checkin => {
            const personItem = createPersonItem(checkin.people, 'checkout');
            checkedInList.appendChild(personItem);
        });
    }
}

// Search people
function searchPeople(query) {
    const items = document.querySelectorAll('.person-item');
    
    items.forEach(item => {
        const name = item.querySelector('.person-name').textContent.toLowerCase();
        const email = item.querySelector('.person-email').textContent.toLowerCase();
        
        if (name.includes(query.toLowerCase()) || email.includes(query.toLowerCase())) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Add visitor
async function addVisitor() {
    const form = document.getElementById('visitorForm');
    const name = form.elements[0].value;
    const document = form.elements[1].value;
    
    const { data, error } = await supabase
        .from('people')
        .insert([
            {
                name: name,
                document: document,
                is_visitor: true
            }
        ]);
        
    if (!error) {
        form.reset();
        document.getElementById('visitorModal').style.display = 'none';
        loadPeopleList();
        showNotification('Visitante adicionado com sucesso!', 'success');
    }
}

// Load report
function loadReport(type) {
    if (!type) return;
    
    const reportDisplay = document.getElementById('reportDisplay');
    
    // Simulate report data
    if (type === 'presenca') {
        reportDisplay.innerHTML = `
            <h3>Relatório de Presença</h3>
            <canvas id="presenceChart"></canvas>
        `;
        
        // Create chart
        createPresenceChart();
    } else if (type === 'horarios') {
        reportDisplay.innerHTML = `
            <h3>Relatório de Horários</h3>
            <canvas id="timeChart"></canvas>
        `;
        
        createTimeChart();
    } else if (type === 'frequencia') {
        reportDisplay.innerHTML = `
            <h3>Relatório de Frequência</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Total de Presenças</th>
                        <th>Última Presença</th>
                    </tr>
                </thead>
                <tbody id="frequencyTable"></tbody>
            </table>
        `;
        
        loadFrequencyTable();
    }
}

// Update report view
function updateReportView(view) {
    // Toggle between chart and table view
    const reportDisplay = document.getElementById('reportDisplay');
    
    if (view === 'table') {
        // Convert chart to table
        reportDisplay.classList.add('table-view');
    } else {
        // Show chart
        reportDisplay.classList.remove('table-view');
    }
}

// Clear report
function clearReport() {
    document.getElementById('reportType').value = '';
    document.getElementById('reportDisplay').innerHTML = '';
}

// Download report
function downloadReport() {
    // Implement CSV download
    showNotification('Relatório baixado com sucesso!', 'success');
}

// Upload images
async function uploadImages(files) {
    for (const file of files) {
        const fileName = `${Date.now()}_${file.name}`;
        
        const { data, error } = await supabase.storage
            .from('gallery')
            .upload(fileName, file);
            
        if (!error) {
            // Save to database
            const { data: urlData } = supabase.storage
                .from('gallery')
                .getPublicUrl(fileName);
                
            await supabase
                .from('gallery_images')
                .insert([
                    {
                        url: urlData.publicUrl,
                        name: file.name
                    }
                ]);
        }
    }
    
    loadGallery();
    showNotification('Imagens enviadas com sucesso!', 'success');
}

// Load gallery
async function loadGallery() {
    const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });
        
    if (data) {
        const galleryGrid = document.getElementById('galleryGrid');
        galleryGrid.innerHTML = '';
        
        data.forEach(image => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `<img src="${image.url}" alt="${image.name}">`;
            
            item.addEventListener('click', function() {
                this.classList.toggle('selected');
                updateRemoveButton();
            });
            
            galleryGrid.appendChild(item);
        });
    }
}

// Update remove button state
function updateRemoveButton() {
    const selectedItems = document.querySelectorAll('.gallery-item.selected');
    const removeBtn = document.getElementById('removeImageBtn');
    
    removeBtn.disabled = selectedItems.length === 0;
}

// Remove selected images
async function removeSelectedImages() {
    const selectedItems = document.querySelectorAll('.gallery-item.selected');
    
    for (const item of selectedItems) {
        // Remove from storage and database
        // Implementation depends on your storage structure
    }
    
    loadGallery();
    showNotification('Imagens removidas com sucesso!', 'success');
}

// Cadastrar pessoa
async function cadastrarPessoa() {
    const form = document.getElementById('cadastroForm');
    
    const { data, error } = await supabase
        .from('people')
        .insert([
            {
                name: form.nome.value,
                email: form.email.value,
                phone: form.telefone.value,
                document: form.documento.value
            }
        ]);
        
    if (!error) {
        form.reset();
        loadRegisteredPeople();
        showNotification('Pessoa cadastrada com sucesso!', 'success');
    }
}

// Load registered people
async function loadRegisteredPeople() {
    const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: false });
        
    if (data) {
        const peopleTable = document.getElementById('peopleTable');
                peopleTable.innerHTML = data.map(person => `
            <tr>
                <td>${person.name}</td>
                <td>${person.email}</td>
                <td>${person.phone || '-'}</td>
                <td>${person.department || '-'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editPerson('${person.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deletePerson('${person.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Edit person
async function editPerson(id) {
    const { data } = await supabase
        .from('people')
        .select('*')
        .eq('id', id)
        .single();
        
    if (data) {
        document.getElementById('personName').value = data.name;
        document.getElementById('personEmail').value = data.email;
        document.getElementById('personPhone').value = data.phone || '';
        document.getElementById('personDepartment').value = data.department || '';
        
        // Store ID for update
        document.getElementById('registerForm').dataset.editId = id;
        
        // Change button text
        document.querySelector('#registerForm button[type="submit"]').textContent = 'Atualizar';
    }
}

// Delete person
async function deletePerson(id) {
    if (confirm('Tem certeza que deseja excluir esta pessoa?')) {
        const { error } = await supabase
            .from('people')
            .delete()
            .eq('id', id);
            
        if (!error) {
            loadRegisteredPeople();
            showNotification('Pessoa excluída com sucesso!', 'success');
        }
    }
}

// Reports functions
function loadReportTypes() {
    const reportTypes = [
        { value: 'checkin', label: 'Relatório de Check-ins' },
        { value: 'attendance', label: 'Taxa de Presença' },
        { value: 'peak', label: 'Horários de Pico' },
        { value: 'department', label: 'Presença por Departamento' },
        { value: 'monthly', label: 'Relatório Mensal' }
    ];
    
    const select = document.getElementById('reportType');
    select.innerHTML = '<option value="">Selecione um tipo de relatório</option>' +
        reportTypes.map(type => `<option value="${type.value}">${type.label}</option>`).join('');
}

// Generate report
async function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const displayType = document.querySelector('input[name="displayType"]:checked').value;
    
    if (!reportType) {
        showNotification('Selecione um tipo de relatório', 'error');
        return;
    }
    
    // Simulate report generation
    const reportArea = document.getElementById('reportArea');
    
    if (displayType === 'chart') {
        reportArea.innerHTML = `
            <div class="chart-container">
                <canvas id="reportChart"></canvas>
            </div>
        `;
        
        // Create sample chart
        const ctx = document.getElementById('reportChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                datasets: [{
                    label: 'Check-ins',
                    data: [12, 19, 15, 17, 14],
                    backgroundColor: '#7FA869',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    } else {
        reportArea.innerHTML = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Total Check-ins</th>
                        <th>Taxa de Presença</th>
                        <th>Horário de Pico</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>01/12/2024</td>
                        <td>45</td>
                        <td>89%</td>
                        <td>09:00</td>
                    </tr>
                    <tr>
                        <td>02/12/2024</td>
                        <td>52</td>
                        <td>92%</td>
                        <td>08:30</td>
                    </tr>
                </tbody>
            </table>
        `;
    }
}

// Clear reports
function clearReports() {
    document.getElementById('reportArea').innerHTML = '';
    document.getElementById('reportType').value = '';
}

// Download report
function downloadReport() {
    // Simulate CSV download
    const csvContent = "data:text/csv;charset=utf-8,Data,Total Check-ins,Taxa de Presença,Horário de Pico\n01/12/2024,45,89%,09:00\n02/12/2024,52,92%,08:30";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_todentro.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Gallery functions
function addImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
        const files = e.target.files;
        for (let file of files) {
            // Upload to Supabase storage
            const fileName = `${Date.now()}_${file.name}`;
            const { data, error } = await supabase.storage
                .from('gallery')
                .upload(fileName, file);
                
            if (data) {
                loadGallery();
            }
        }
    };
    
    input.click();
}

// Load gallery
async function loadGallery() {
    const { data } = await supabase.storage
        .from('gallery')
        .list();
        
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (data && data.length > 0) {
        galleryGrid.innerHTML = data.map(file => `
            <div class="gallery-item" data-file="${file.name}">
                <img src="${supabase.storage.from('gallery').getPublicUrl(file.name).data.publicUrl}" alt="${file.name}">
                <div class="gallery-overlay">
                    <button onclick="removeImage('${file.name}')" class="remove-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        galleryGrid.innerHTML = '<p class="empty-state">Nenhuma imagem na galeria</p>';
    }
}

// Remove image
async function removeImage(fileName) {
    if (confirm('Tem certeza que deseja remover esta imagem?')) {
        const { error } = await supabase.storage
            .from('gallery')
            .remove([fileName]);
            
        if (!error) {
            loadGallery();
            showNotification('Imagem removida com sucesso!', 'success');
        }
    }
}

// Settings functions
function openSettings(section) {
    document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}Settings`).classList.add('active');
    document.querySelector('.settings-menu').classList.remove('active');
}

// Update profile
async function updateProfile(event) {
    event.preventDefault();
    
    const updates = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value
    };
    
    const { error } = await supabase.auth.updateUser({
        data: updates
    });
    
    if (!error) {
        showNotification('Perfil atualizado com sucesso!', 'success');
    }
}

// Upload company logo
async function uploadCompanyLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const fileName = `company_logo_${Date.now()}.${file.name.split('.').pop()}`;
        const { data, error } = await supabase.storage
            .from('logos')
            .upload(fileName, file);
            
        if (data) {
            const logoUrl = supabase.storage.from('logos').getPublicUrl(fileName).data.publicUrl;
            document.getElementById('companyLogoPreview').innerHTML = 
                `<img src="${logoUrl}" alt="Logo da Empresa">`;
            
            // Save to user metadata
            await supabase.auth.updateUser({
                data: { company_logo: logoUrl }
            });
        }
    }
}

// Apply theme colors
function applyThemeColors() {
    const primaryColor = document.getElementById('primaryColor').value;
    const secondaryColor = document.getElementById('secondaryColor').value;
    
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    
    // Save to user preferences
    localStorage.setItem('theme_colors', JSON.stringify({ primary: primaryColor, secondary: secondaryColor }));
}

// Upload background image
async function uploadBackground(event) {
    const file = event.target.files[0];
    if (file) {
        const fileName = `background_${Date.now()}.${file.name.split('.').pop()}`;
        const { data, error } = await supabase.storage
            .from('backgrounds')
            .upload(fileName, file);
            
        if (data) {
            const bgUrl = supabase.storage.from('backgrounds').getPublicUrl(fileName).data.publicUrl;
            document.getElementById('backgroundPreview').innerHTML = 
                `<img src="${bgUrl}" alt="Imagem de Fundo">`;
            document.querySelector('.dashboard-container').style.backgroundImage = `url(${bgUrl})`;
        }
    }
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Logout function
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = '../index.html';
    }
}

// Initialize Chart.js if needed
if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(script);
}