document.addEventListener('DOMContentLoaded', function() {
    fetchStudyList();
});

function getParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 서버에서 스터디 목록을 가져와 화면에 표시하는 함수
function fetchStudyList() {
    const urlParams = new URLSearchParams(window.location.search);
    let category = urlParams.get('category');

    if (category === null) {
        category = '0'
    }
    
    fetch(`${baseUrl}/study/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const studyListContainer = document.getElementById('studyList');

            data.forEach(study => {
                if (category === '0' || category === study.category.toString()) {
                const listItem = document.createElement('div');
                    listItem.innerHTML = `
                        <a href="studygroup_detail.html?pk=${study.id}" id="studyContentCard">
                            <div class="card shadow-sm gap-4 h-100 text-start">
                                <img src="${study.thumbnail}" class="card-img-top" width="100%" height="200">
                                <div class="card-body">
                                    <h5 class="card-title">${study.title}</h5>
                                    <p class="card-text">${study.content}</p>
                                    
                                </div>
                            </div>
                        </a>
                    `;
                    studyListContainer.appendChild(listItem);
                }
            });
        })
        .catch(error => console.error('Error fetching study list:', error));
}

// 검색
function search() {
    const searchInput = document.getElementById('searchInput').value;
    const urlParams = new URLSearchParams(window.location.search);
    let category = urlParams.get('category');
    if (category === null) {
        category = '0';
    }

    const searchUrl = `${baseUrl}/study/?search=${searchInput}&category=${category}`;

    fetch(searchUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateStudyList(data);
        })
        .catch(error => console.error('Error searching:', error));
}

// 카테고리 버튼 검색
function searchByCategory(category) {
    console.log('Selected Category:', category);
    const searchUrl = `${baseUrl}/study/?search=category=${category}`;
    window.location.href = `/index.html?category=${category}`;

    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            updateStudyList(data);
        })
        .catch(error => console.error('Error searching by category:', error));
}

// 업데이트
function updateStudyList(data) {
    const urlParams = new URLSearchParams(window.location.search);
    let category = urlParams.get('category');
    if (category === null) {
        category = '0'
    }
    const studyListContainer = document.getElementById('studyList');
    studyListContainer.innerHTML = '';  // 이전 목록 초기화

    data.forEach(study => {
        if (category === '0' || category === study.category.toString()) {
            const listItem = document.createElement('div');
            listItem.innerHTML = `
                <a href="studygroup_detail.html?pk=${study.id}" id="studyContentCard">
                    <div class="card shadow-sm gap-4 h-100 text-start">
                        <img src="${study.thumbnail}" class="card-img-top" width="100%" height="200">
                        <div class="card-body">
                            <h5 class="card-title">${study.title}</h5>
                            <p class="card-text">${study.content}</p>
                            
                        </div>
                    </div>
                </a>
            `;
            studyListContainer.appendChild(listItem);
        }
    });
}