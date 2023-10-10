const uploadForm = document.getElementById('uploadForm');
const fetchDataButton = document.getElementById('fetchDataButton');
const dataTable = document.getElementById('dataTable');
const loadingFeedback = document.getElementById('loadingFeedback');
const downloadFeedback = document.getElementById('downloadFeedback');
 // Counter variable to track the number of rows created

uploadForm.addEventListener('submit', handleUpload);
fetchDataButton.addEventListener('click', fetchData);

function handleUpload(event) {
    event.preventDefault();

    loadingFeedback.classList.remove('hidden');
    downloadFeedback.classList.add('hidden');

    const formData = new FormData(uploadForm);
    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
            loadingFeedback.classList.add('hidden');
            downloadFeedback.classList.remove('hidden');
        } else {
            throw new Error('Failed to upload Excel sheet.');
        }
    })
    .catch(error => {
        console.error('Error uploading Excel sheet:', error);
        loadingFeedback.classList.add('hidden');
    });
}

function fetchData() {
    loadingFeedback.classList.remove('hidden');
    downloadFeedback.classList.add('hidden');

    fetch('/data')
        .then(response => response.json())
        .then(data => {
            renderData(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        })
        .finally(() => {
            loadingFeedback.classList.add('hidden');
        });
}


function renderData(data) {
    dataTable.innerHTML = '';

    const headers = ['Status', 'Project ID:', 'Customer Name', 'Species Name', 'Sequencing ID', 'Kit Type', 'Name', 'Date', 'iLabID', 'Run Folder', 'Run Type'];

    const headerRow = dataTable.insertRow();

    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });

    data.forEach((rowData, index) => {
        const dataRow = dataTable.insertRow();
        dataRow.dataset.id = rowData._id;

        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = rowData.clicked;
        checkbox.disabled = true; // Disable checkbox
        checkboxCell.appendChild(checkbox);
        dataRow.appendChild(checkboxCell);

        const dataCells = [rowData.projectId,rowData.customerName,rowData.speciesName, rowData.sequencingID, rowData.kitType, rowData.name, rowData.datee,rowData.iLabID, rowData.runFolder, rowData.runType];
        dataCells.forEach(cellText => {
            const dataCell = document.createElement('td');
            dataCell.textContent = cellText;
            dataRow.appendChild(dataCell);
        });

        // Set background color based on checkbox state
        if (rowData.clicked) {
            checkboxCell.style.backgroundColor = 'green';
        } else {
            checkboxCell.style.backgroundColor = 'red';
        }
    });
}
