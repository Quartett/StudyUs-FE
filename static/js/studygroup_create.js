if (!isLogin()) {
    window.location.href = '/login.html?redirect=' + '/studygroup_create.html';
}

let selectedImageFile = null;

document.getElementById('imageinput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        selectedImageFile = file;

        const reader = new FileReader();
        reader.onload = function(e) {
            const thumbnailImg = document.getElementById('thumbnailimg');
            thumbnailImg.src = e.target.result;
            thumbnailImg.style.display = 'block';
            document.getElementById('imageinput').style.display = 'none';
        };
        reader.readAsDataURL(file);
    } else {
        selectedImageFile = null;
        document.getElementById('thumbnailimg').style.display = 'none';
        document.getElementById('imageinput').style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.querySelector('.max_member');

    for (let i = 1; i <= 20; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i+"명";
        
        selectElement.appendChild(option);
    }
});

let selectedLevel = null; 

document.addEventListener('DOMContentLoaded', () => {
    const leveldetails = document.querySelectorAll('.level_detail');

    leveldetails.forEach(level => {
        level.addEventListener('click', function() {
            const levelValue = this.getAttribute('data-level');
            
            if (selectedLevel === levelValue) {
                selectedLevel = null;
                this.classList.remove('selected');
            } else {
                if (selectedLevel) {
                    document.querySelector(`.level_detail[data-level="${selectedLevel}"]`).classList.remove('selected');
                }
                selectedLevel = levelValue;
                this.classList.add('selected');
            }
        });
    });
});

let selectedDay = [];
document.addEventListener('DOMContentLoaded', () => {
    const weekdaysdetails = document.querySelectorAll('.week_days_detail');
    

    weekdaysdetails.forEach(weekday => {
        weekday.addEventListener('click', function() {
        const dayvalue = this.getAttribute('data-day');
        const dayindex = selectedDay.indexOf(dayvalue);
        
        if (dayindex > -1) {
            selectedDay.splice(dayindex, 1);
            this.classList.remove('selected');
        } else {
            selectedDay.push(dayvalue);
            this.classList.add('selected');
        }
        });
    });
});

let selectedCategory = null;
document.addEventListener('DOMContentLoaded', () => {
    const categorydetails = document.querySelectorAll('.category_detail');

    categorydetails.forEach(category => {
        category.addEventListener('click', function() {
            const categoryvalue = this.getAttribute('data-category');

            if (selectedCategory === categoryvalue) {
                selectedCategory = null;
                this.classList.remove('selected');
            } else {
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

const createStudyButton = document.querySelector('#createbtn')

createStudyButton.addEventListener('click', function(e) {
    e.preventDefault();
    
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

    if (missingFieldsMsg) {
        missingFieldsMsg = missingFieldsMsg.slice(0, -2);
        alert(missingFieldsMsg + '에 값을 입력해주세요.');
        return;
    }

    if (StartDay && EndDay && new Date(StartDay) > new Date(EndDay)) {
        alert("시작일이 종료일보다 늦을 수 없습니다.");
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('level', parseInt(selectedLevel, 10));
    formData.append('max_members', max_member);
    formData.append('category', parseInt(selectedCategory, 10));
    formData.append('study_start_at', StartDay);
    formData.append('study_end_at', EndDay);
    formData.append('week_days', selectedDay);
    formData.append('content', content);

    if (selectedImageFile) {
        formData.append('thumbnail', selectedImageFile);
    }
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
            window.location.href = '/index.html';
            })
            .catch((err) => {
            alert('글 작성 중 에러 발생했습니다. 잠시 후 다시 시도해주세요');
            });
        })
    } else {
        alert('입력되지 않은 값이 있습니다.');
    }
});