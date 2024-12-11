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
            const headers = data.values[0];
            const filteredData = data.values.filter(row => row[6] === studentNumber);

            if (filteredData.length > 0) {
                showConfirmationBox(() => {
                    displayTable(headers, filteredData);
                });
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

function showConfirmationBox(onConfirm) {
    const messageBox = document.createElement('div');
    messageBox.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 scale-in';
    
    const content = document.createElement('div');
    content.className = 'bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4 transform transition-all duration-300';
    content.innerHTML = `
        <div class="text-center">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Are you ready?</h3>
            <p class="text-gray-600 mb-6">Your grades are about to be displayed.</p>
            <div class="flex justify-center space-x-4">
                <button id="confirmYes" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transform transition-all duration-300 hover:scale-105">
                    Yes, I'm ready
                </button>
                <button id="confirmNo" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transform transition-all duration-300 hover:scale-105">
                    Not yet
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(messageBox);
    messageBox.appendChild(content);

    const yesButton = content.querySelector('#confirmYes');
    const noButton = content.querySelector('#confirmNo');

    yesButton.addEventListener('click', () => {
        messageBox.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageBox);
            onConfirm();
        }, 300);
    });

    noButton.addEventListener('click', () => {
        messageBox.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageBox);
            clearTable();
        }, 300);
    });

    setTimeout(() => {
        messageBox.style.opacity = '1';
    }, 10);
}

function displayTable(headers, data) {
    const tableHeaders = document.querySelector('#tableHeaders');
    const tableBody = document.querySelector('#gradesTable tbody');

    // Clear existing content
    tableHeaders.innerHTML = '';
    tableBody.innerHTML = '';

    // Modify headers to reflect the combined column and remove column H (index 7)
    const combinedHeader = 'SY-SEM-TERM     ';
    const newHeaders = [
        combinedHeader,
        ...headers.slice(3, 7),  // Take columns D through G
        ...headers.slice(8)      // Skip H and take the rest
    ];

    // Populate headers
    newHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header || 'N/A';
        th.classList.add('text-center', 'p-1');
        tableHeaders.appendChild(th);
    });

    // Populate rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        
        // Combine columns A, B, and C (indices 0, 1, 2)
        const combinedValue = [row[0], row[1], row[2]].filter(Boolean).join(' ');
        const td = document.createElement('td');
        td.textContent = combinedValue || 'N/A';
        td.classList.add('text-center', 'p-1');
        tr.appendChild(td);

        // Append remaining columns, skipping column H (index 7)
        row.slice(3, 7).forEach(cell => {    // Add columns D through G
            const td = document.createElement('td');
            td.textContent = cell || 'N/A';
            td.classList.add('text-center', 'p-1');
            tr.appendChild(td);
        });
        
        row.slice(8).forEach(cell => {       // Skip H and add remaining columns
            const td = document.createElement('td');
            td.textContent = cell || 'N/A';
            td.classList.add('text-center', 'p-1');
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
}

function clearTable() {
    document.querySelector('#tableHeaders').innerHTML = '';
    document.querySelector('#gradesTable tbody').innerHTML = '';
}
