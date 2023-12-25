const urlParams = new URLSearchParams(window.location.search);
const pk = urlParams.get('pk');

let selectedDay = []; // 선택된 요일을 저장할 배열
let selectedImageFile = null; // 선택된 이미지 파일
let selectedLevel = null; // 선택된 레벨을 저장할 변수
let selectedCategory = null; // 선택된 카테고리를 저장할 변수

getStudyGroupInfo();

function getStudyGroupInfo(){

    // pk가 없다면 함수를 종료합니다.
    if (!pk) {
        console.error('pk를 입력해주세요');
        return;
    }
    
    fetch(`${baseUrl}/study/${pk}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response.json();
    })
    .then((data) => {
        document.querySelector('.input_title').value = data.title;
        document.getElementById('thumbnailimg').src = data.thumbnail;
        document.querySelector('.input_content').value = data.content;
        document.querySelector('.max_member').value = data.max_members;
        document.querySelector('.input_start_day').value = data.study_start_at;
        document.querySelector('.input_end_day').value = data.study_end_at;

        if (data.category) {
            selectedCategory = data.category;
            document.querySelector(`.category_detail[data-category="${selectedCategory}"]`).classList.add('selected');
        }

        if (data.level) {
            selectedLevel = data.level;
            document.querySelector(`.level_detail[data-level="${selectedLevel}"]`).classList.add('selected');
        }

        if (data.week_days) {
            selectedDay = data.week_days.split(',');

            selectedDay.forEach(day => {
                document.querySelector(`.week_days_detail[data-day="${day}"]`).classList.add('selected');
            });
        }

        console.log(data);
    })
    .catch((err) => {
        alert("글 정보를 받아오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
    }); 
}


document.getElementById('imageinput').addEventListener('change', function(event) {
    const file = event.target.files[0]; // 사용자가 선택한 파일 가져오기
    selectedImageFile = file;

    const reader = new FileReader();
    
    reader.onload = function(e) {
        // 파일 읽기가 완료되면 실행
        document.getElementById('thumbnailimg').src = e.target.result;
    };
    
    reader.readAsDataURL(file); // 파일을 읽어 데이터 URL로 변환
});

document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.querySelector('.max_member');

    for (let i = 1; i <= 20; i++) {
        // 새로운 option 요소를 생성
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i+"명";
        
        selectElement.appendChild(option);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const leveldetails = document.querySelectorAll('.level_detail');
    // 현재 선택된 level을 저장할 변수

    leveldetails.forEach(level => {
        level.addEventListener('click', function() {
            const levelValue = this.getAttribute('data-level');
            
            if (selectedLevel === levelValue) {
                // 이미 선택된 level을 다시 클릭한 경우, 선택 해제합니다.
                selectedLevel = null;
                this.classList.remove('selected');
            } else {
                // 다른 level이 선택되었거나, 아직 아무것도 선택되지 않은 경우
                
                // 이전에 선택된 level의 선택을 해제합니다.
                if (selectedLevel) {
                    document.querySelector(`.level_detail[data-level="${selectedLevel}"]`).classList.remove('selected');
                }

                // 새로운 level을 선택합니다.
                selectedLevel = levelValue;
                this.classList.add('selected');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const weekdaysdetails = document.querySelectorAll('.week_days_detail');
    

    weekdaysdetails.forEach(weekday => {
        weekday.addEventListener('click', function() {
        const dayvalue = this.getAttribute('data-day');
        const dayindex = selectedDay.indexOf(dayvalue);
        
        if (dayindex > -1) {
            // 이미 선택된 요일을 다시 클릭한 경우, 배열에서 제거합니다.
            selectedDay.splice(dayindex, 1);
            this.classList.remove('selected');
        } else {
            // 새로운 요일을 클릭한 경우, 배열에 추가합니다.
            selectedDay.push(dayvalue);
            this.classList.add('selected');
        }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const categorydetails = document.querySelectorAll('.category_detail');

    categorydetails.forEach(category => {
        category.addEventListener('click', function() {
            const categoryvalue = this.getAttribute('data-category');

            // 이미 선택된 카테고리를 클릭한 경우 선택을 해제합니다.
            if (selectedCategory === categoryvalue) {
                selectedCategory = null;
                this.classList.remove('selected');
            } else {
                // 이전에 선택된 카테고리가 있었다면, 그 카테고리의 선택을 해제합니다.
                if (selectedCategory) {
                    const prevSelected = document.querySelector(`.category_detail[data-category="${selectedCategory}"]`);
                    prevSelected.classList.remove('selected');
                }
                
                selectedCategory = categoryvalue;
                this.classList.add('selected');
            }
        });
    });
});

const createStudyButton = document.querySelector('#createbtn') // 저장 버튼 선택

createStudyButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    // 입력된 값들을 변수에 저장
    const title = document.querySelector('.input_title').value;
    const max_member = parseInt(document.querySelector('.max_member').value, 10);
    const StartDay = document.querySelector('.input_start_day').value;
    const EndDay = document.querySelector('.input_end_day').value;
    const content = document.querySelector('.input_content').value;

    let missingFieldsMsg = '';

    if (!title) missingFieldsMsg += '제목, ';
    if (isNaN(max_member)) missingFieldsMsg += '최대 인원수, ';
    if (!StartDay) missingFieldsMsg += '시작일, ';
    if (!EndDay) missingFieldsMsg += '종료일, ';
    if (!content) missingFieldsMsg += '내용, ';
    if (isNaN(parseInt(selectedLevel, 10))) missingFieldsMsg += '레벨, ';
    if (isNaN(parseInt(selectedCategory, 10))) missingFieldsMsg += '카테고리, ';
    if (!selectedDay) missingFieldsMsg += '요일, ';

    // 누락된 필드가 있는지 확인합니다.
    if (missingFieldsMsg) {
        console.log(missingFieldsMsg)
        missingFieldsMsg = missingFieldsMsg.slice(0, -2);
        alert(missingFieldsMsg + '에 값을 입력해주세요.');
        return; // 필수 필드가 하나라도 빈 경우 함수를 종료합니다.
    }

    // FormData 객체를 생성하고 폼 데이터를 추가합니다.
    const formData = new FormData();
    formData.append('title', title);
    formData.append('level', parseInt(selectedLevel, 10));
    formData.append('max_members', max_member);
    formData.append('category', parseInt(selectedCategory, 10));
    formData.append('study_start_at', StartDay);
    formData.append('study_end_at', EndDay);
    formData.append('week_days', selectedDay);
    formData.append('content', content);

    // 이미지 파일이 선택되었다면 FormData에 추가합니다.
    if (selectedImageFile) {
        formData.append('thumbnail', selectedImageFile);
    }

      // Fetch API를 사용하여 서버에 POST 요청
    if (formData) {
        checkTokenExpired('create_studygroup.html', (accessToken) => {
            fetch(`${baseUrl}/study/${pk}/update/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.status);
                }
                return response.json();
            })
            .then((data) => {
            console.log('글수정성공:', data);
            window.location.href = '/studygroup_detail.html?pk='+pk;
            })
            .catch((err) => {
            console.error('글 수정 중 에러 발생했습니다. 잠시 후 다시 시도해주세요');
            });
        })
    } else {
        alert('입력되지 않은 값이 있습니다.');
    }
});

// 멤버관리 버튼 선택
const memberManageButton = document.querySelector('#editmember')

memberManageButton.addEventListener('click', function(e) {
    checkTokenExpired('studygroup_edit.html', (accessToken) => {
        fetchMembers(accessToken);
    });
});

const memberListContainer = document.querySelector('#member_list');

function fetchMembers(accessToken) {
    fetch(`${baseUrl}/study/${pk}/member/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response.json();
    })
    .then((data) => {
        const memberListContainer = document.querySelector('#member_list');
        memberListContainer.innerHTML = ''; // 기존 목록 초기화
        data.forEach(member => {
            const memberItem = document.createElement('div');
            const role = member.role === 1 ? '그룹장' : '그룹원';
            const checked = member.role === 1 ? 'checked' : '';

            memberItem.innerHTML = `
                <label>
                    <input type="checkbox" class="member-checkbox" data-user-id="${member.user}" ${checked}>
                    ${member.user_nickname} - ${role}
                </label>
            `;
            memberListContainer.appendChild(memberItem);
        });
    })
    .catch((err) => {
        alert("멤버 정보를 받아오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
    }); 
}

// 체크박스의 선택을 관리합니다.
memberListContainer.addEventListener('change', function(e) {
    if (e.target.classList.contains('member-checkbox')) {
        document.querySelectorAll('.member-checkbox').forEach((cb) => {
            cb.checked = false;
        });
        e.target.checked = true;
    }
});

// 저장하기 버튼을 클릭했을 때 선택된 멤버를 업데이트합니다.
document.querySelector('#savemember_role').addEventListener('click', function() {
    checkTokenExpired('studygroup_edit.html', (accessToken) => {
        const selectedCheckbox = document.querySelector('.member-checkbox:checked');
        if (selectedCheckbox) {
            const selectedUserId = selectedCheckbox.getAttribute('data-user-id');
            const selectedUserRole = selectedCheckbox.closest('label').textContent.includes('그룹장') ? 1 : 0;
            if (selectedUserRole === 1) {
                alert('이미 그룹장인 유저입니다');
            } else {
                updateGroupLeader(selectedUserId, accessToken);
            }
        } else {
            alert('그룹장을 선택해주세요.');
        }
    });
});

function updateGroupLeader(selectedUserId, accessToken) {
    const data = {
        user: selectedUserId
    };

    fetch(`${baseUrl}/study/${pk}/member/update/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response.json();
    })
    .then((updatedData) => {
        console.log('그룹장이 업데이트되었습니다:', updatedData);
        alert('그룹장이 성공적으로 업데이트되었습니다.');
        window.location.href = `studygroup_detail.html?pk=${pk}`;
    })
    .catch((error) => {
        alert('그룹장 업데이트 중 오류가 발생했습니다.');
    });
}