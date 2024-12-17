document.getElementById('searchStudent').addEventListener('click', searchStudentGrade);

const availableImages = {
    fruits: [
        { path: '/verification/verification/apple.jpg', name: 'apple' },
        { path: '/verification/verification/banana.png', name: 'banana' },
        { path: '/verification/verification/orange.jpg', name: 'orange' },
        { path: '/verification/verification/grapes.jpg', name: 'grapes' },
        { path: '/verification/verification/watermelon.jpg', name: 'watermelon' },
        { path: '/verification/verification/manggo.jpg', name: 'mango' },
        { path: '/verification/verification/strawberry.jpg', name: 'strawberry' },
        { path: '/verification/verification/pineapple.jpg', name: 'pineapple' },
        { path: '/verification/verification/kiwi.jpg', name: 'kiwi' }
    ]
};

let selectedIndices = new Set();

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateRandomVerificationSet() {
    // Randomly select which fruit will be the correct answer
    const allFruits = [...availableImages.fruits];
    shuffleArray(allFruits);
    
    const targetFruit = allFruits[0];
    const otherFruits = allFruits.slice(1);
    
    // Create array with 5 correct images and 4 random different images
    const images = [
        ...Array(5).fill(targetFruit.path), // 5 correct images
        ...otherFruits.slice(0, 4).map(fruit => fruit.path) // 4 different images
    ];
    
    // Shuffle the images
    shuffleArray(images);
    
    // Find the indices of the correct images after shuffling
    const correctIndices = images.reduce((indices, path, index) => {
        if (path === targetFruit.path) {
            indices.push(index);
        }
        return indices;
    }, []);

    return {
        images: images,
        question: `Select all ${targetFruit.name} images (all 5 ${targetFruit.name}s must be selected)`,
        correctIndices: correctIndices
    };
}

function showVerificationBox(onSuccess) {
    const verificationSet = generateRandomVerificationSet();
    const verificationBox = document.createElement('div');
    verificationBox.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 scale-in';
    
    const content = document.createElement('div');
    content.className = 'bg-white rounded-lg p-6 shadow-xl max-w-2xl w-full mx-4 transform transition-all duration-300';
    content.innerHTML = `
        <div class="text-center">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Human Verification</h3>
            <p class="text-gray-600 mb-4">${verificationSet.question}</p>
            <p id="selectionProgress" class="text-sm text-gray-500 mb-4">Selected: 0/5 correct images</p>
            <div class="grid grid-cols-3 gap-4 mb-4">
                ${verificationSet.images.map((img, index) => `
                    <button class="verification-image-btn p-2 border rounded hover:border-blue-500 transition-all duration-300" data-index="${index}">
                        <img src="${img}" alt="Verification image" class="w-full h-32 object-cover rounded">
                    </button>
                `).join('')}
            </div>
            <div class="flex justify-center space-x-4">
                <button id="verifySelections" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transform transition-all duration-300 hover:scale-105">
                    Verify Selections
                </button>
                <button id="cancelVerification" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transform transition-all duration-300 hover:scale-105">
                    Cancel
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(verificationBox);
    verificationBox.appendChild(content);

    const imageButtons = content.querySelectorAll('.verification-image-btn');
    const verifyButton = content.querySelector('#verifySelections');
    const cancelButton = content.querySelector('#cancelVerification');
    const progressText = content.querySelector('#selectionProgress');

    // Function to update progress display
    function updateProgress() {
        const selectedImages = Array.from(selectedIndices).map(index => 
            verificationSet.images[index]
        );
        const correctCount = selectedImages.filter(img => 
            verificationSet.correctIndices.includes(verificationSet.images.indexOf(img))
        ).length;
        const wrongCount = selectedImages.length - correctCount;

        let message = `Selected: ${correctCount}/5 correct images`;
        if (wrongCount > 0) {
            message += ` (and ${wrongCount} incorrect)`;
        }
        progressText.textContent = message;
    }

    // Handle image selection
    imageButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const index = parseInt(button.dataset.index);
            if (selectedIndices.has(index)) {
                selectedIndices.delete(index);
                button.classList.remove('border-blue-500', 'border-2');
            } else {
                selectedIndices.add(index);
                button.classList.add('border-blue-500', 'border-2');
            }
            updateProgress();
        });
    });

    // Handle verification
    verifyButton.addEventListener('click', async () => {
        const selectedOriginalIndices = Array.from(selectedIndices).map(index => 
            verificationSet.images[index]
        );

        // Count correct and wrong selections
        const correctCount = selectedOriginalIndices.filter(img => 
            verificationSet.correctIndices.includes(verificationSet.images.indexOf(img))
        ).length;
        const wrongCount = selectedOriginalIndices.length - correctCount;

        // Only proceed if exactly 5 correct selections and no wrong ones
        if (correctCount === 5 && wrongCount === 0) {
            selectedIndices.clear();
            document.body.removeChild(verificationBox);
            onSuccess(); // Immediately proceed to fetch and display
            return;
        }

        // If we get here, verification failed - show appropriate message and restart
        let message = '';
        if (correctCount < 5) {
            message = `You need to select more images. You have selected ${correctCount}/5 correct images.`;
        } else if (correctCount === 5 && wrongCount > 0) {
            message = `You have selected all 5 correct images but also ${wrongCount} incorrect ones. Only select the correct images.`;
        } else if (correctCount > 5) {
            message = `You have selected too many images. Only select 5 correct images.`;
        }
        
        // Show error message and restart verification
        alert(message + ' Try again.');
        selectedIndices.clear();
        document.body.removeChild(verificationBox);
        clearTable();
        showVerificationBox(onSuccess);
    });

    cancelButton.addEventListener('click', () => {
        selectedIndices.clear();
        verificationBox.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(verificationBox);
            clearTable();
        }, 300);
    });

    setTimeout(() => {
        verificationBox.style.opacity = '1';
    }, 10);
}

async function searchStudentGrade() {
    const studentNumber = document.getElementById('studentNumber').value.trim();

    if (!studentNumber) {
        alert('Please enter a student number');
        return;
    }

    // Show verification and automatically fetch/display on success
    showVerificationBox(async () => {
        await fetchAndDisplayGrades(studentNumber);
    });
}

async function fetchAndDisplayGrades(studentNumber) {
    // Create and show loading animation
    const loadingBox = document.createElement('div');
    loadingBox.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50';
    loadingBox.innerHTML = `
        <div class="bg-white rounded-lg p-8 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading your grades...</p>
        </div>
    `;
    document.body.appendChild(loadingBox);

    try {
        const url = 'https://sheets.googleapis.com/v4/spreadsheets/1PGa6-8DBEj7BtfeURESjLsFBoFsXau90iKTrChAex8k/values/Sheet1!A:K?key=AIzaSyBX9O3SFSLCuXiCigzNYXEVaJmNfSHC1IE';
        
        // Fetch data
        const response = await fetch(url);
        const data = await response.json();

        // Artificial delay of 0.5 seconds
        await new Promise(resolve => setTimeout(resolve, 500));

        if (data.values && data.values.length > 1) {
            const headers = data.values[0];
            const filteredData = data.values.filter(row => row[6] === studentNumber);

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
    } finally {
        // Remove loading animation
        document.body.removeChild(loadingBox);
    }
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
