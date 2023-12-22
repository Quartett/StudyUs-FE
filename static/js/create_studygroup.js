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
        
        // 생성된 option을 select 요소에 추가
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
                this.classList.remove('selected'); // 선택 해제 스타일을 위한 클래스 제거
            } else {
                // 다른 level이 선택되었거나, 아직 아무것도 선택되지 않은 경우
                
                // 이전에 선택된 level의 선택을 해제합니다.
                if (selectedLevel) {
                    document.querySelector(`.level_detail[data-level="${selectedLevel}"]`).classList.remove('selected');
                }

                // 새로운 level을 선택합니다.
                selectedLevel = levelValue;
                this.classList.add('selected'); // 선택 스타일을 위한 클래스 추가
            }
            console.log(selectedLevel); // 현재 선택된 level 로깅
        });
    });
});

let selectedDay = null; // 선택된 요일을 저장할 변수

document.addEventListener('DOMContentLoaded', () => {
    const weekdaysDetails = document.querySelectorAll('.week_days_detail');

    weekdaysDetails.forEach(weekday => {
        weekday.addEventListener('click', function() {
            const dayValue = this.getAttribute('data-day');

            // 이미 선택된 요일을 클릭한 경우 선택을 해제합니다.
            if (selectedDay === dayValue) {
                selectedDay = null;
                this.classList.remove('selected');
            } else {
                // 이전에 선택된 요일이 있었다면, 그 요일의 선택을 해제합니다.
                if (selectedDay) {
                    const prevSelected = document.querySelector(`.week_days_detail[data-day="${selectedDay}"]`);
                    prevSelected.classList.remove('selected');
                }

                // 새로운 요일을 선택합니다.
                selectedDay = dayValue;
                this.classList.add('selected');
            }
            console.log(selectedDay); // 현재 선택된 요일을 콘솔에 출력합니다.
        });
    });
});

// let selectedDay = []; // 선택된 요일을 저장할 배열
// document.addEventListener('DOMContentLoaded', () => {
//     const weekdaysdetails = document.querySelectorAll('.week_days_detail');
    

//     weekdaysdetails.forEach(weekday => {
//         weekday.addEventListener('click', function() {
//         const dayvalue = this.getAttribute('data-day');
//         const dayindex = selectedDay.indexOf(dayvalue);
        
//         if (dayindex > -1) {
//             // 이미 선택된 요일을 다시 클릭한 경우, 배열에서 제거합니다.
//             selectedDay.splice(dayindex, 1);
//             this.classList.remove('selected'); // 선택 해제 스타일을 위한 클래스 제거
//         } else {
//             // 새로운 요일을 클릭한 경우, 배열에 추가합니다.
//             selectedDay.push(dayvalue);
//             this.classList.add('selected'); // 선택 스타일을 위한 클래스 추가
//         }
//         console.log(selectedDay); // 현재 선택된 모든 요일을 콘솔에 출력합니다.
//         });
//     });
// });

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

                // 새로운 카테고리를 선택합니다.
                selectedCategory = categoryvalue;
                this.classList.add('selected');
            }
            console.log(selectedCategory); // 현재 선택된 카테고리를 콘솔에 출력합니다.
        });
    });
});

const createStudyButton = document.querySelector('.btn-secondary'); // 스터디 생성 버튼 선택

createStudyButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    // 입력된 값들을 변수에 저장
    const title = document.querySelector('.input_title').value;
    const max_member = parseInt(document.querySelector('.max_member').value, 10);
    const StartDay = document.querySelector('.input_start_day').value;
    const EndDay = document.querySelector('.input_end_day').value;
    const content = document.querySelector('.input_content').value;

    // FormData 객체를 생성하고 폼 데이터를 추가합니다.
    const formData = new FormData();
    formData.append('title', title);
    formData.append('level', parseInt(selectedLevel, 10));
    formData.append('max_members', max_member);
    formData.append('category', parseInt(selectedCategory, 10));
    formData.append('study_start_at', StartDay);
    formData.append('study_end_at', EndDay);
    formData.append('week_days', parseInt(selectedDay, 10));
    formData.append('content', content);
    console.log(formData)

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
                    throw new Error('Invalid token');
                }
                return response.json();
            })
            .then((data) => {
            console.log('글작성성공:', data);
            window.location.href = '/index.html';
            })
            .catch((error) => {
            console.error('Error:', error);
            });
        })
    } else {
        alert('입력되지 않은 값이 있습니다.');
    }
});