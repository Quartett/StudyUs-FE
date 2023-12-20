const baseUrl = 'http://127.0.0.1:8000';

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
    const accessToken = accountManager.getAccessToken();
    const refreshToken = accountManager.getRefreshToken();

    if (accessToken && refreshToken) {
        return true;
    } else {
        return false;
    }
}

async function checkTokenExpired(redirect, callback) {
    const accessToken = accountManager.getAccessToken();
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
            if (error.message === 401) {
                this.refreshToken(redirect, (accessToken) => {
                    callback(accessToken);
                });
            }
        }            
    } else {
        alert('로그인된 상태가 아닙니다. 로그인 해주세요');
        window.location.href = '/login?redirect=' + redirect;
    }
}

async function refreshToken(redirect, callback) {
    const refreshToken = accountManager.getRefreshToken();
    if (refreshToken) {
        const url = `${baseUrl}/accounts/token/refresh/`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'token': refreshToken
                })
            });
            
            if (!res.ok) {
                throw new Error(res.status);
            }
            
            const json = await res.json();
            localStorage.setItem('access_token', json.access);
            localStorage.setItem('refresh_token', json.refresh);
            callback(json.access);
        } catch (error) {
            if (error.message === 401) {
                alert('세션이 만료되었습니다. 재로그인해주세요');
                this.removeToken();
                window.location.href = '/login?redirect=' + redirect;
            }
        }
    } else {
        alert('로그인된 상태가 아닙니다. 로그인 해주세요');
        window.location.href = '/login?redirect=' + redirect;
    }
}
