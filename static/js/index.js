document.addEventListener('DOMContentLoaded', function() {
    // 페이지 로드 시 서버에서 스터디 목록을 가져오는 함수 호출
    fetchStudyList();
    // fetchctegorylist();
});

// 서버에서 스터디 목록을 가져와 화면에 표시하는 함수
function fetchStudyList() {
    // TODO: 서버에서 스터디 목록을 가져오는 API 엔드포인트를 사용하여 데이터를 받아오세요.
    // 예시로 fetch 함수 사용 (실제로는 서버의 API 호출 방식에 따라 적절히 변경 필요)
    fetch(`${baseUrl}/study/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((response) => {
            // 응답이 성공인지 확인
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // JSON 형식으로 변환하여 반환
            return response.json();
        })
        .then(data => {
            // 서버에서 받아온 스터디 목록 데이터를 사용하여 동적으로 목록 생성
            const studyListContainer = document.getElementById('studyList');

            data.forEach(study => {
                const listItem = document.createElement('div');
                listItem.innerHTML = `
                <a href="studygroup_detail.html?pk=${study.id}">
                    <div class="card shadow-sm">
                        <div>
                            ${study.title}
                        </div>
                        <img class="bd-placeholder-img card-img-top study_img" width="100%" height="200" src="${study.thumbnail}" aria-label="Placeholder: Thumbnail"></>
                        <div class="card-body">
                            <div>
                                ${study.content}
                            </div>
                        </div>
                    </div>
                </a>
                `;
                studyListContainer.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching study list:', error));
}

function search() {
const searchInput = document.getElementById('searchInput').value;
const category = '';  // TODO: 사용자가 선택한 카테고리 값 가져오기

// 사용자가 카테고리를 선택한 경우
if (category) {
    searchByCategory(searchInput, category);
} else {
    // 사용자가 카테고리를 선택하지 않은 경우
    // 기존의 검색 방식을 사용
    fetch(`${baseUrl}/study/?search=${searchInput}`)
        .then(response => response.json())
        .then(data => {
            updateStudyList(data);
        })
        .catch(error => console.error('Error searching:', error));
}
}

function searchByCategory(searchInput, category) {
// URL 생성
const searchUrl = `${baseUrl}/study/?search=${searchInput}&category=${category}`;

// 검색
fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
        // 검색 결과를 사용하여 화면 업데이트
        updateStudyList(data);
    })
    .catch(error => console.error('Error searching by category:', error));
}

function updateStudyList(data) {
// 검색 결과를 사용하여 화면 업데이트
const studyListContainer = document.getElementById('studyList');
studyListContainer.innerHTML = '';  // 이전 목록 초기화

data.forEach(study => {
    const listItem = document.createElement('div');
    listItem.innerHTML = `
        <a href="studygroup_detail.html?pk=${study.id}">
            <div class="card shadow-sm">
                <div>
                    ${study.title}
                </div>
                <img class="bd-placeholder-img card-img-top study_img" width="100%" height="200" src="${study.thumbnail}" aria-label="Placeholder: Thumbnail"></>
                <div class="card-body">
                    <div>
                        ${study.content}
                    </div>
                </div>
            </div>
        </a>
    `;
    studyListContainer.appendChild(listItem);
});
}