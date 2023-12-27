function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/index.html';
}

window.addEventListener('load', function() {
    const allElements = document.getElementsByTagName('*');
    Array.prototype.forEach.call(allElements, function(el) {
        const includePath = el.dataset.includePath;
        if (includePath) {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    el.outerHTML = this.responseText;

                    const navbarMenu = document.getElementById('navbarMenu');
                    const accessToken = localStorage.getItem('access_token');
                    const refreshToken = localStorage.getItem('refresh_token');
                    
                    if(accessToken && refreshToken) {
                        navbarMenu.innerHTML += `
                            <a class="navbar-brand" href="/subject.html">
                            <img src="./static/img/memory_card.svg" width="40" height="40">
                            </a>
                            <a class="navbar-brand" href="/chat.html">
                                <img src="./static/img/chat.svg" width="40" height="40">
                            </a>
                            <li class="nav-item dropdown d-flex align-self-center">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src="./static/img/profile.svg" width="40" height="40">
                                </a>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item" href="/profile.html">프로필 설정</a></li>
                                    <li><button class="dropdown-item" onclick="logout()">로그아웃</button></li>
                                </ul>
                                </li>
                        `
                    } else {
                        navbarMenu.innerHTML += `
                            <a href="/login.html" class="btn btn-primary align-self-center" style="background-color: #84C19C; border-color: #84C19C;">
                                시작하기
                            </a>        
                        `
                    }
                    
                    
                }
            };
            xhttp.open('GET', includePath, true);
            xhttp.send();
        }
    });
});
