let selectedImageFile = null; // 선택된 이미지 파일

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

let selectedLevel = null; 

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

let selectedDay = []; // 선택된 요일을 저장할 배열
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

let selectedCategory = null; // 선택된 카테고리를 저장할 변수
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

const createStudyButton = document.querySelector('#createbtn') // 스터디 생성 버튼 선택

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
            fetch(`${baseUrl}/study/create/`, {
                method: 'POST',
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
            console.log('글작성성공:', data);
            window.location.href = '/index.html';
            })
            .catch((err) => {
            console.error('글 작성 중 에러 발생했습니다. 잠시 후 다시 시도해주세요');
            });
        })
    } else {
        alert('입력되지 않은 값이 있습니다.');
    }
});