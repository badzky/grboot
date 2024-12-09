document.getElementById('searchStudent').addEventListener('click', searchStudentGrade);

async function searchStudentGrade() {
    const studentNumber = document.getElementById('studentNumber').value.trim();
    const url = 'https://sheets.googleapis.com/v4/spreadsheets/1PGa6-8DBEj7BtfeURESjLsFBoFsXau90iKTrChAex8k/values/Sheet1!A:K?key=AIzaSyBX9O3SFSLCuXiCigzNYXEVaJmNfSHC1IE';

    if (!studentNumber) {
        alert('Please enter a student number');
        return;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.values && data.values.length > 1) {
            const headers = data.values[0]; // First row as headers
            const filteredData = data.values.filter(row => row[6] === studentNumber); // Column G is index 6

            if (filteredData.length > 0) {
                displayTable(headers, filteredData);
            } else {
                alert('No records found for the given student number');
                clearTable();
            }
        } else {
            alert('No data available');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data. Please try again later.');
    }
}

function displayTable(headers, data) {
    const tableHeaders = document.querySelector('#tableHeaders');
    const tableBody = document.querySelector('#gradesTable tbody');

    // Clear existing content
    tableHeaders.innerHTML = '';
    tableBody.innerHTML = '';

    // Modify headers to reflect the combined column
    const combinedHeader = 'SY-SEM-TERM     ';
    const newHeaders = [combinedHeader, ...headers.slice(3)]; // Skip the first three headers

    // Populate headers
    newHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header || 'N/A';
        th.classList.add('text-center', 'p-1'); // Center align headers and reduce padding
        tableHeaders.appendChild(th);
    });

    // Populate rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        
        // Combine columns A, B, and C (indices 0, 1, 2)
        const combinedValue = [row[0], row[1], row[2]].filter(Boolean).join(' '); // Join with a space
        const td = document.createElement('td');
        td.textContent = combinedValue || 'N/A';
        td.classList.add('text-center', 'p-1'); // Center align the combined value and reduce padding
        tr.appendChild(td);

        // Append remaining columns starting from index 3
        row.slice(3).forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell || 'N/A';
            td.classList.add('text-center', 'p-1'); // Center align each cell and reduce padding
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
}

function clearTable() {
    document.querySelector('#tableHeaders').innerHTML = '';
    document.querySelector('#gradesTable tbody').innerHTML = '';
}
