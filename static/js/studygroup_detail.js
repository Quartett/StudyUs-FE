const urlParams = new URLSearchParams(window.location.search);
const pk = urlParams.get('pk');

if (isLogin()){
    checkTokenExpired('studygorup_detail.html', (accessToken) => {
        isMember(pk, accessToken);
    })
}else{
    const button = document.querySelector('.change_button');
    button.textContent = '가입하기';
    button.onclick = function() {
        window.location.href = '/login.html?redirect=studygroup_detail.html?pk=' + pk;
    };
}

function isMember(pk, accessToken){
    fetch(`${baseUrl}/accounts/user/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Unable to fetch user details');
        }
        return response.json();
    })
    .then(userData => {
        const userNickname = userData.nickname;
        fetch(`${baseUrl}/study/${pk}/member/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to fetch member list');
            }
            return response.json();
        })
        .then(members => {
            console.log("닉네임", userNickname);
            const leader = members
                .filter(member => member.role === 1)
                .map(memberWithRoleOne => memberWithRoleOne.user_nickname);
            // 리더의 닉네임과 userNickname이 같은지 비교
            const isLeader = leader.some(leaderNickname => leaderNickname == userNickname);
            console.log('리더인지 아닌지:', isLeader)
            groupeditButton(isLeader);

            console.log('그룹장:', leader);
            const isMember = members.some(member => member.user_nickname == userNickname);
            memberButton(isMember);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function groupeditButton(isLeader) {
    const button = document.querySelector('.edit');
    if (isLeader) {
        button.textContent = '수정';
        console.log('수정');
        button.onclick = function() {
            // window.location.href = '/path/to/chat';
        };
    } else {
        // 버튼이 보이지 않도록 처리
        button.style.display = 'none';
    }
}

function memberButton(isMember) {
    const button = document.querySelector('.change_button');
    if (isMember) {
        button.textContent = '채팅방 입장';
        console.log('채팅방 입장');
        button.onclick = function() {
            // window.location.href = '/path/to/chat';
        };

        const leaveButton = document.createElement('button');
        leaveButton.textContent = '탈퇴하기';
        leaveButton.className = 'leave_button';
        leaveButton.onclick = function() {
            // 탈퇴 처리를 위한 함수 호출
            leaveStudyGroup(pk);
        };
        button.parentNode.insertBefore(leaveButton, button.nextSibling);
    } else {
        button.textContent = '가입하기';
        console.log('가입하기');
        button.onclick = function() {
            joinStudyGroup();
        };
    }
}

function leaveStudyGroup(pk) {
    checkTokenExpired('studygorup_detail.html', (accessToken) => {
        fetch(`${baseUrl}/study/${pk}/member/delete/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to leave study group');
            }
            return response;
        })
        .then(() => {
            // 탈퇴 성공시 페이지 새로고침
            window.location.reload();
        })
    });
}

function joinStudyGroup() {
    if (isLogin()){
        checkTokenExpired('studygorup_detail.html', (accessToken) => {
            const data = {
                "study_group": pk,
                "role": 0
            }
            fetch(`${baseUrl}/study/join/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('가입실패');
                }
                return response;
            })
            .then(() => {
                // 가입 성공시 페이지 새로고침
                window.location.reload();
            })
        });
    }
}

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
            throw new Error('Invalid token');
        }
        return response.json();
    })
    .then((data) => {
        console.log(data);
        document.querySelector('.title').textContent = data.title;
        document.querySelector('.content').textContent = data.content;
        
        displayComments(data.comments);

        displayStudyDates(data.study_start_at, data.study_end_at);
        
        highlightMeetingDays(data.week_days);

        console.log(data.max_members, pk)
        fetchCurrentMemberCount(pk, data.max_members);

        if(data.leader && data.leader.profile_image) {
            console.log("이미지주소",data.leader.profile_image)
            document.querySelector('.profile_image img').src = "http://127.0.0.1:8000" + data.leader.profile_image;
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function displayComments(comments) {
    const container = document.getElementById('comments_container');
    container.innerHTML = ''; // 기존 댓글을 지웁니다.

    comments.forEach(comment => {
        // parent가 null인 경우만 최상위 댓글로 처리
        if (!comment.parent) {
            const commentElement = createCommentElement(comment);
            console.log(commentElement);
            container.appendChild(commentElement);
        }
    });
}

function createCommentElement(comment) {
    const element = document.createElement('div');
    element.classList.add('comment');
    element.setAttribute('data-comment-id', comment.id); // 댓글 ID를 속성으로 저장

    const profileImage = document.createElement('div');
    profileImage.classList.add('commnet_profile_image');
    profileImage.textContent = "프로필 이미지"
    element.appendChild(profileImage);

    const comment_info = document.createElement('div');
    comment_info.classList.add('comment_info');
    element.appendChild(comment_info);

    const author = document.createElement('div');
    author.classList.add('author');
    author.textContent = comment.author_nickname;
    comment_info.appendChild(author);
    
    // 댓글 내용 추가
    const text = document.createElement('div');
    text.classList.add('text');
    text.textContent = comment.text;
    comment_info.appendChild(text);

    // 답글이 있고, parent가 null인 경우만 답글 보기 버튼 추가
    if (!comment.parent && comment.reply && comment.reply.length > 0) {
        const replyButton = document.createElement('button');
        replyButton.textContent = '답글 보기';
        replyButton.onclick = function() {
            toggleReplies(element, comment.reply);
        };
        comment_info.appendChild(replyButton);
    }

    return element;
}

function toggleReplies(commentElement, replies) {
    let repliesContainer = commentElement.querySelector('.replies');
    const comment_info = commentElement.querySelector('.comment_info');
    if (!repliesContainer) {
        // 답글 컨테이너 생성 및 답글 추가
        repliesContainer = document.createElement('div');
        repliesContainer.classList.add('replies');
        replies.forEach(reply => {
            const replyElement = createCommentElement(reply);
            repliesContainer.appendChild(replyElement);
        });
        comment_info.appendChild(repliesContainer);
    } else {
        // 답글 컨테이너 토글
        repliesContainer.style.display = repliesContainer.style.display === 'none' ? 'block' : 'none';
    }
}

function fetchCurrentMemberCount(pk, maxMembers) {
    fetch(`${baseUrl}/study/${pk}/member/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('unable to fetch member list');
        }
        return response.json();
    })
    .then(memberData => {
        const currentMemberCount = memberData.length;
        document.querySelector('.member').textContent = `${currentMemberCount}/${maxMembers}`;
    })
    .catch(error => {
        console.error('Error fetching member', error);
    });
}

function displayStudyDates(startday, endday) {
    const studyDateElement = document.querySelector('.study_date');
    studyDateElement.textContent = `스터디 기간: ${startday} - ${endday}`;
}

function highlightMeetingDays(weekDays) {
    
    const week_days = weekDays.split(',');
    week_days.forEach(day => {
        const dayElement = document.querySelector(`.week_days_detail[data-day="${day}"]`);
        if (dayElement) {
            dayElement.style.backgroundColor = 'yellow';
        }
    });
}