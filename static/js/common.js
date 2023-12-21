const baseUrl = 'http://13.115.106.99';

function getAccessToken() {
    return localStorage.getItem('access_token');
}

function setAccessToken(token) {
    localStorage.setItem('access_token', token);
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token');
}

function setRefreshToken(token) {
    localStorage.setItem('refresh_token', token);
}

function removeToken() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

function isLogin() {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (accessToken && refreshToken) {
        return true;
    } else {
        return false;
    }
}

async function checkTokenExpired(redirect, callback) {
    const accessToken = getAccessToken();
    console.log("checkTokenExpired() 실행됨 :: ")
    if (accessToken) {
        const url = `${baseUrl}/accounts/token/verify/`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'token': accessToken
                })
            });

            if (!res.ok) {
                throw new Error(res.status);
            }
            callback(accessToken);
        } catch (error) {
            if (error.message == 401) {
                refreshToken(redirect, (accessToken) => {
                    callback(accessToken);
                });
            }
        }            
    } else {
        alert('로그인된 상태가 아닙니다. 로그인 해주세요');
        window.location.href = '/login.html?redirect=' + redirect;
    }
}

async function refreshToken(redirect, callback) {
    const refreshToken = getRefreshToken();
    console.log("refreshToken() 실행됨 :: ")
    if (refreshToken) {
        const url = `${baseUrl}/accounts/token/refresh/`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'refresh': refreshToken
                })
            });
            
            if (!res.ok) {
                throw new Error(res.status);
            }
            
            const json = await res.json();
            localStorage.setItem('access_token', json.access);
            callback(json.access);
        } catch (error) {
            if (error.message === 401) {
                alert('세션이 만료되었습니다. 재로그인해주세요');
                removeToken();
                window.location.href = '/login.html?redirect=' + redirect;
            }
        }
    } else {
        alert('로그인된 상태가 아닙니다. 로그인 해주세요');
        window.location.href = '/login.html?redirect=' + redirect;
    }
}
