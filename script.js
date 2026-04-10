const API = "https://api.github.com/users/";

function toggleMode() {
    const single = document.getElementById("singleMode");
    const battle = document.getElementById("battleMode");

    if (single.style.display === "none") {
        single.style.display = "block";
        battle.style.display = "none";
    } else {
        single.style.display = "none";
        battle.style.display = "block";
    }
}

function showLoading() {
    document.getElementById("loading").innerText = "Loading...";
    document.getElementById("result").innerHTML = ""; 
}

function hideLoading() {
    document.getElementById("loading").innerText = "";
}

function showError(msg) {
    hideLoading();
    document.getElementById("result").innerHTML = `<p>${msg}</p>`;
}

async function searchUser() {
    const username = document.getElementById("username").value.trim();

    if (!username) return alert("Enter username");

    showLoading();

    try {
        const res = await fetch(API + username);

        if (res.status !== 200) {
            throw new Error("User not found");
        }

        const user = await res.json();

        if (!user.login || user.login.toLowerCase() !== username.toLowerCase()) {
            throw new Error("User mismatch");
        }

        const repos = await fetchRepos(user.repos_url);

        hideLoading();
        displayUser(user, repos);

    } catch (err) {
        showError("User not found ❌");
    }
}

async function fetchRepos(url) {
    const res = await fetch(url);
    return res.json();
}

function displayUser(user, repos, extraClass = "") {
    const result = document.getElementById("result");

    const repoList = repos
        .slice(0, 5)
        .map(repo => `
            <li>
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
            </li>
        `).join("");

    const date = new Date(user.created_at).toDateString();

    result.innerHTML = `
        <div class="card ${extraClass}">
            <img src="${user.avatar_url}">
            <h2>${user.name || user.login}</h2>
            <p>${user.bio || "No bio"}</p>
            <p>📅 Joined: ${date}</p>
            <p>👥 Followers: ${user.followers}</p>
            <h3>Top Repos</h3>
            <ul>${repoList}</ul>
        </div>
    `;
}

async function battle() {
    const u1 = document.getElementById("user1").value.trim();
    const u2 = document.getElementById("user2").value.trim();

    if (!u1 || !u2) return alert("Enter both usernames");

    showLoading();

    try {
        const [res1, res2] = await Promise.all([
            fetch(API + u1),
            fetch(API + u2)
        ]);

        if (res1.status !== 200 || res2.status !== 200) {
            throw new Error("User not found");
        }

        const user1 = await res1.json();
        const user2 = await res2.json();

        if (
            user1.login.toLowerCase() !== u1.toLowerCase() ||
            user2.login.toLowerCase() !== u2.toLowerCase()
        ) {
            throw new Error("User mismatch");
        }

        const [repos1, repos2] = await Promise.all([
            fetchRepos(user1.repos_url),
            fetchRepos(user2.repos_url)
        ]);

        const stars1 = getStars(repos1);
        const stars2 = getStars(repos2);

        hideLoading();

        const result = document.getElementById("result");

        if (stars1 > stars2) {
            result.innerHTML =
                getCard(user1, repos1, "winner") +
                getCard(user2, repos2, "loser");
        } else {
            result.innerHTML =
                getCard(user2, repos2, "winner") +
                getCard(user1, repos1, "loser");
        }

    } catch (err) {
        showError("User not found ❌");
    }
}

function getCard(user, repos, extraClass) {
    const repoList = repos
        .slice(0, 5)
        .map(repo => `
            <li>
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
            </li>
        `).join("");

    const date = new Date(user.created_at).toDateString();

    return `
        <div class="card ${extraClass}">
            <img src="${user.avatar_url}">
            <h2>${user.name || user.login}</h2>
            <p>${user.bio || "No bio"}</p>
            <p>📅 Joined: ${date}</p>
            <p>👥 Followers: ${user.followers}</p>
            <h3>Top Repos</h3>
            <ul>${repoList}</ul>
        </div>
    `;
}

function getStars(repos) {
    return repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
}