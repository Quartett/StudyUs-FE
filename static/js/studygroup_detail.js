const urlParams = new URLSearchParams(window.location.search);
const pk = urlParams.get('pk');

if (isLogin()){
    checkTokenExpired('studygorup_detail.html', (accessToken) => {
        isMember(pk, accessToken);
    })
}else{
    const button = document.querySelector('#change_button');
    button.textContent = '가입하기';
    button.onclick = function() {
        window.location.href = '/login.html?redirect=studygroup_detail.html?pk=' + pk;
    };

    const button2 = document.querySelector('#leave_button');
    button2.style.display = 'none';
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
            throw new Error(response.status);
        }
        return response.json();
    })
    .then(userData => {
        const user_nickname = userData.nickname;
        fetch(`${baseUrl}/study/${pk}/member/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .then(members => {
            console.log("닉네임", user_nickname);
            const leader = members
                .filter(member => member.role === 1)
                .map(memberWithRoleOne => memberWithRoleOne.user_nickname);
            // 리더의 닉네임과 userNickname이 같은지 비교
            const isLeader = leader.some(leaderNickname => leaderNickname == user_nickname);
            console.log('리더인지 아닌지:', isLeader)
            groupeditButton(isLeader);

            console.log('그룹장:', leader);
            const isMember = members.some(member => member.user_nickname == user_nickname);
            memberButton(isMember);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function groupeditButton(isLeader) {
    // 그룹장이라면 수정, 삭제 버튼이 보이도록 처리
    // 수정에 대한 이벤트 작성필요
    const editbutton = document.querySelector('#edit');
    const deletebutton = document.querySelector('#delete');
    if (isLeader) {
        editbutton.onclick = function() {
            checkTokenExpired('studygorup_detail.html', (accessToken) => {
                window.location.href = `/studygroup_edit.html?pk=${pk}`;
            });
        };
        deletebutton.onclick = function() {
            checkTokenExpired('studygorup_detail.html', (accessToken) => {
                fetch(`${baseUrl}/study/${pk}/delete/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.status);
                    }
                    return response;
                })
                .then(() => {
                    // 삭제 성공시 페이지 이동
                    window.location.href = '/index.html';
                }
                )
            });
        };
    } else {
        // 버튼이 보이지 않도록 처리
        editbutton.style.display = 'none';
        deletebutton.style.display = 'none';
    }
}

function memberButton(isMember) {
    const button = document.querySelector('#change_button');
    if (isMember) {
        button.textContent = '채팅방 입장';
        console.log('채팅방 입장');
        button.onclick = function() {
            // 채팅방 페이지 작성되면 채팅방으로 이동 필요
            window.location.href = '/chat.html?id=' + pk + '&group=' + pk;
        };

        const leaveButton = document.querySelector('#leave_button');
        leaveButton.textContent = '탈퇴하기';
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
        const button2 = document.querySelector('#leave_button');
        button2.style.display = 'none';
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
                throw new Error(response.status);
            }
            return response;
        })
        .then(() => {
            // 탈퇴 성공시 페이지 새로고침
            window.location.reload();
        })
        .catch((err) => {
            alert("그룹 탈퇴 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
        }); 
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
                    throw new Error(response.status);
                }
                return response;
            })
            .then(() => {
                // 가입 성공시 페이지 새로고침
                window.location.reload();
            })
            .catch((err) => {
                alert("그룹 참가 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
            }); 
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
            throw new Error(response.status);
        }
        return response.json();
    })
    .then((data) => {
        console.log(data);
        document.querySelector('.input_title').textContent = data.title;
        document.querySelector('.input_content').textContent = data.content;
        
        displayComments(data.comments);

        displayStudyDates(data.study_start_at, data.study_end_at);

        category_level(data.category, data.level)
        
        highlightMeetingDays(data.week_days);

        console.log(data.max_members, pk)
        fetchCurrentMemberCount(pk, data.max_members);

        if(data.thumbnail) {
            document.querySelector('.thumbnail img').src = data.thumbnail;
        } else {
            document.querySelector('.thumbnail img').src = "http://127.0.0.1:8000/media/study_images/default_study_thumbnail.png";
        }

        if(data.leader && data.leader.profile_image) {
            document.querySelector('.leader_profile_image img').src = "http://127.0.0.1:8000" + data.leader.profile_image;
        }
    })
    .catch((err) => {
        alert("글 정보를 받아오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
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
    const commentid = comment.id;

    const commnet_profile_image = document.createElement('div');
    commnet_profile_image.classList.add('commnet_profile_image');
    if(comment.profile_image) {
        console.log(comment.profile_image);
        commnet_profile_image.innerHTML = `<img src="http://127.0.0.1:8000${comment.profile_image}" class="profile-img">`;
    } else {
        commnet_profile_image.innerHTML = `<img src="http://127.0.0.1:8000/media/profile_images/default_profile_image.png" class="profile-img">`;
    }
    element.appendChild(commnet_profile_image);
    
    const comment_element = document.createElement('div');
    comment_element.classList.add('comment_element');
    element.appendChild(comment_element);

    const header = document.createElement('div');
    header.classList.add('header');
    comment_element.appendChild(header);

    const comment_info = document.createElement('div');
    comment_info.classList.add('comment_info');
    comment_element.appendChild(comment_info);

    const toolbar = document.createElement('div');
    toolbar.classList.add('toolbar');
    comment_element.appendChild(toolbar);

    const author = document.createElement('div');
    author.classList.add('author');
    author.textContent = comment.author_nickname;
    header.appendChild(author);

    // 댓글 내용 추가
    const text = document.createElement('div');
    text.classList.add('text');
    text.textContent = comment.text;
    comment_info.appendChild(text);

    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('edit_input', 'hidden');
    comment_info.appendChild(input);

    const editButton = document.createElement('button');
    editButton.classList.add('edit_button', 'btn', 'btn-success', 'm-2');
    editButton.textContent = '수정';
    
    const toggleEdit = function(isEditing) {
        if (isEditing) {
            // '수정' 상태로 전환
            input.value = text.textContent;
            if (text.parentNode === comment_info) {
                comment_info.replaceChild(input, text);
            }
            input.classList.remove('hidden');
            editButton.textContent = '저장';
        } else {
            // '저장' 후 '수정' 상태로 되돌림
            if (input.parentNode === comment_info) {
                comment_info.replaceChild(text, input);
            }
            input.classList.add('hidden');
            editButton.textContent = '수정';
        }
    };

    editButton.onclick = function() {
        if (editButton.textContent === '수정') {
            checkTokenExpired('studygroup_detail.html', (accessToken) => {
                toggleEdit(true);
            });
        } else if (editButton.textContent === '저장') {
            const updatedText = input.value;
            checkTokenExpired('studygroup_detail.html', (accessToken) => {
                saveEditedComment(commentid, updatedText, accessToken, function() {
                    // 성공적으로 수정한 후에는 '수정' 상태로 되돌림
                    text.textContent = updatedText;
                    toggleEdit(false); // 상태를 '수정'으로 전환합니다.
                });
            });
        }
    };
    
    toolbar.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete_button', 'btn', 'btn-outline-danger', 'm-2');
    deleteButton.textContent = '삭제';
    deleteButton.onclick = function() {
        checkTokenExpired('studygorup_detail.html', (accessToken) => {
            deleteComment(commentid, accessToken);
        })
    };
    toolbar.appendChild(deleteButton);

    // 답글 달기 버튼 추가
    const replyButton = document.createElement('button');
    replyButton.classList.add('reply_button', 'btn', 'btn-light');
    replyButton.textContent = '답글 달기';
    replyButton.onclick = function() {
        checkTokenExpired('studygorup_detail.html', (accessToken) => {
            let replyContainer = document.querySelector('.reply_input_container');

            if (replyContainer) {
                replyContainer.style.display = replyContainer.style.display === 'none' ? 'block' : 'none';
                replyContainer.querySelector('.comment_input').focus();
                return;
            }
            replyContainer = document.createElement('div');
            replyContainer.classList.add('reply_input_container');
            replyContainer.dataset.parentId = comment.id;

            const replyInput = document.createElement('div');
            replyInput.classList.add('comment_input');
            replyInput.contentEditable = 'true';
            replyInput.textContent = '댓글 추가...';

            const submitButton = document.createElement('button');
            submitButton.id = 'comment_submit';
            submitButton.classList.add('btn', 'btn-primary', 'm-2');
            submitButton.textContent = '등록';
            submitButton.type = 'button';

            replyContainer.appendChild(replyInput);
            replyContainer.appendChild(submitButton);

            document.querySelector('.comment_section').appendChild(replyContainer);

            replyInput.focus();

            comment_element.appendChild(replyContainer);

            submitButton.addEventListener('click', function() {
                const topParentPk = replyContainer.dataset.parentId;
                const text = replyInput.textContent;
                const data = {
                    "text": text,
                    "study_group": pk,
                    "parent": topParentPk
                };

                fetch(`${baseUrl}/study/comments/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    // 댓글이 성공적으로 생성된 후 댓글 목록을 fetch하여 다시 렌더링
                    getStudyGroupInfo();
                })
                .catch((err) => {
                    alert("댓글 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
                });
                
                replyContainer.style.display = 'none';
            });
        });
    };
    toolbar.appendChild(replyButton);


    // 답글이 있고, parent가 null인 경우만 답글 보기 버튼 추가
    if (!comment.parent && comment.reply && comment.reply.length > 0) {
        const show_replyButton = document.createElement('button');
        show_replyButton.classList.add('show_reply_button', 'btn', 'btn-light');
        show_replyButton.textContent = '답글 보기';
        show_replyButton.onclick = function() {
            toggleReplies(element, comment.reply);
        };
        toolbar.appendChild(show_replyButton);
    }

    return element;
}

//  댓글 생성
document.getElementById('comment_submit').addEventListener('click', function() {
    checkTokenExpired('studygorup_detail.html', (accessToken) => {
        const text = document.getElementsByClassName('comment_input')[0].textContent;
        console.log(text)
        const data = {
            "text": text,
            "study_group": pk
        }
        console.log(data);
        fetch(`${baseUrl}/study/comments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .then(data => {
            // 댓글이 성공적으로 생성된 후 댓글 목록을 fetch하여 다시 렌더링
            getStudyGroupInfo();
        })
        .catch((err) => {
            alert("댓글 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
        }); 
    }
    )}
);

function saveEditedComment(commentid, updatedText, accessToken, callback) {
    const data = {
        "text": updatedText,
        "study_group": pk
    }
    console.log("수정data",data);
    fetch(`${baseUrl}/study/comments/${commentid}/update/`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response
    })
    .then(data => {
        // 수정이 성공적으로 완료된 후의 콜백 함수 호출
        if(callback && typeof callback === 'function') {
            console.log("수정완료")
            callback();
        }
    })
    .catch((err) => {
        alert("댓글 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
    }); 
}

function deleteComment(commentid, accessToken) {
    fetch(`${baseUrl}/study/comments/${commentid}/delete/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response;
    })
    .then(() => {
        // 삭제가 성공적으로 완료된 후 댓글 목록을 fetch하여 다시 렌더링
        getStudyGroupInfo();
    })
    .catch((err) => {
        alert("댓글 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
    }); 
}

function toggleReplies(commentElement, replies) {
    let repliesContainer = commentElement.querySelector('.replies');
    const toolbar = commentElement.querySelector('.toolbar');
    if (!repliesContainer) {
        // 답글 컨테이너가 존재하지 않으면 생성합니다.
        repliesContainer = document.createElement('div');
        repliesContainer.classList.add('replies');
        commentElement.appendChild(repliesContainer);
    } else {
        // 답글 컨테이너가 이미 존재하면 표시 상태를 토글합니다.
        repliesContainer.style.display = repliesContainer.style.display === 'none' ? 'block' : 'none';
        return;  // 여기서 함수를 종료합니다.
    }

    // 모든 답글(그리고 답글의 답글)을 재귀적으로 렌더링합니다.
    const renderReplies = (replies, container) => {
        replies.forEach(reply => {
            const replyElement = createCommentElement(reply);
            container.appendChild(replyElement);

            // 답글에 또 다른 답글이 있는 경우, 재귀적으로 처리합니다.
            if (reply.reply && reply.reply.length > 0) {
                const childRepliesContainer = document.createElement('div');
                childRepliesContainer.classList.add('replies');
                replyElement.appendChild(childRepliesContainer);
                renderReplies(reply.reply, childRepliesContainer);
            }
        });
    };

    renderReplies(replies, repliesContainer);
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
            throw new Error(response.status);
        }
        return response.json();
    })
    .then(memberData => {
        const currentMemberCount = memberData.length;
        document.querySelector('.max_member').textContent = `${currentMemberCount}/${maxMembers}`;
    })
    .catch((err) => {
        alert(" 현재인원 정보 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
    }); 
}

function displayStudyDates(startday, endday) {
    const studyDateElement = document.querySelector('.start_day');
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

function category_level(category, level) {
    const categories = document.querySelectorAll('.category_detail');
    const levels = document.querySelectorAll('.level_detail');

    levels.forEach(levelElement => {
        const levelNumber = levelElement.getAttribute('data-level');

        if (levelNumber == level) {
            levelElement.classList.add('selected');
        } else {
            levelElement.style.display = 'none';
        }
    });

    categories.forEach(categoryElement => {
        const categoryNumber = categoryElement.getAttribute('data-category');

        if (categoryNumber == category) {
            categoryElement.classList.add('selected');
        } else {
            categoryElement.style.display = 'none';
        }
    });
}
