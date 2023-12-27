document.addEventListener('DOMContentLoaded', function() {
    fetchStudyList();
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search') || null;
    if (search != null) {
        const searchInput = document.getElementById('searchInput');
        searchInput.value = search;
    }
});

function fetchStudyList() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 0;
    const search = urlParams.get('search') || null;

    let url = ''
    if (search != null) {
        url = `${baseUrl}/study/?search=${search}&category=${category}`;
    } else {
        url = `${baseUrl}/study/?category=${category}`;
    }
    
    fetch(url, {
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
            if (category == 0) {
                data.forEach(study => {
                    const listItem = document.createElement('div');
                        listItem.innerHTML = `
                            <a href="studygroup_detail.html?pk=${study.id}" id="studyContentCard">
                                <div class="card shadow-sm gap-4 h-100 text-start">
                                    <img src="${study.thumbnail}" class="card-img-top" width="100%" height="200">
                                    <div class="card-body">
                                        <h5 class="card-title">${study.title}</h5>
                                        <p class="card-text">${study.content}</p>
                                    </div>
                                    <div class="card-footer">
                                        <button class="btn btn-secondary rounded-pill px-3" type="button" disabled>${study.category_name}</button>
                                        <button class="btn btn-secondary rounded-pill px-3" type="button" disabled>${getLevel(study.level)}</button>
                                    </div>
                                </div>
                            </a>
                        `;
                        studyListContainer.appendChild(listItem);
                    
                });
            } else {
                data = data.filter(study => study.category == category);
                data.forEach(study => {
                    const listItem = document.createElement('div');
                        listItem.innerHTML = `
                            <a href="studygroup_detail.html?pk=${study.id}" id="studyContentCard">
                                <div class="card shadow-sm gap-4 h-100 text-start">
                                    <img src="${study.thumbnail}" class="card-img-top" width="100%" height="200">
                                    <div class="card-body">
                                        <h5 class="card-title">${study.title}</h5>
                                        <p class="card-text">${study.content}</p>
                                    </div>
                                    <div class="card-footer">
                                        <button class="btn btn-secondary rounded-pill px-3" type="button" disabled>${study.category_name}</button>
                                        <button class="btn btn-secondary rounded-pill px-3" type="button" disabled>${getLevel(study.level)}</button>
                                    </div>
                                </div>
                            </a>
                        `;
                        studyListContainer.appendChild(listItem);
                    
                });
            }
        })
        .catch(error => console.error('Error fetching study list:', error));
}

function searchByCategory(category) {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search') || null;

    if (search != null) {
        window.location.href = `/index.html?search=${search}&category=${category}`
    } else {
        window.location.href = `/index.html?category=${category}`;
    }
}

function getLevel(level) {
    if (level==1) {
        return "초급";
    } else if (level==2) {
        return "중급";
    } else {
        return "고급";
    }
}