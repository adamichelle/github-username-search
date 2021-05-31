(function() {
    const navMenuToggler = document.getElementById('navMenuToggler')
    navMenuToggler.addEventListener('click', toggleNavigationMenu);

    const searchResultElement = document.getElementById('searchResult');
    const noResultElement = document.getElementById('noResult');

    searchResultElement.style.display = "none";
    noResultElement.style.display = "none"

    const params = new URLSearchParams(document.location.search);
    const username = params.get('username');
    const url = `https://github-username-search.glitch.me/github-user-info`;
    const query = `
        query($number_of_repos:Int!, $repository_owner_name:String!) {
            user (login: $repository_owner_name) {
                avatarUrl
                bio
                bioHTML
                company
                companyHTML
                email
                followers {
                    totalCount 
                }
                following {
                    totalCount 
                }
                id
                location
                name
                starredRepositories {
                    totalCount 
                }
                status {
                    emojiHTML
                    message
                }
                url
                websiteUrl
                repositories (last: $number_of_repos, privacy: PUBLIC) {
                    nodes {
                        name
                        description
                        descriptionHTML
                        forkCount
                        homepageUrl
                        languages (first: 5) {
                            nodes {
                                color
                                name
                            }
                        }
                        primaryLanguage {
                            color
                            name
                        }
                        stargazerCount
                        updatedAt
                        url
                    }
                }
            }
        }
    `
    const variables = {
        "repository_owner_name": username,
        "number_of_repos": 3
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            query: query,
            variables: variables
        })
    })
    .then(res => res.json())
    .then(response => {
        const { user } = response.data;
        if(user) {
            searchResultElement.style.display = "block"
            renderUserInformation(user, username)
        }
        else {
            noResultElement.style.display = "block"
        }
    })
    .catch(err => {
        noResultElement.style.display = "block"
        noResultElement.textContent = err.message
    })
 })();

 function renderUserInformation(user, username) {
    const { 
        avatarUrl, 
        bio, 
        bioHTML, 
        company, 
        companyHTML, 
        email,
        followers,
        following,
        location,
        name,
        starredRepositories,
        status,
        url,
        websiteUrl,
        repositories
    } = user

    const totalFollowerCount = followers.totalCount;
    const totalFollowingCount = following.totalCount;
    const totalStarredRepositories = starredRepositories.totalCount;
    const arrayOfRepositories = repositories.nodes;

    const avatarElement = document.querySelector('.gus-c-avatar img');
    avatarElement.setAttribute('src', avatarUrl)

    const navAvatarElement = document.querySelector('.gus-c-nav__nav-avatar img');
    navAvatarElement.setAttribute('src', avatarUrl)

    if(status) {
        const { emojiHTML, message } = status;
        const statusEmojiElement = document.querySelector('.gus-c-status__emoji');
        const statusMessageElement = document.querySelector('.gus-c-status__message');

        statusEmojiElement.innerHTML = emojiHTML;
        statusMessageElement.textContent = message;
    }

    const nameElement = document.querySelector('.gus-c-name-info h1');
    nameElement.textContent = name;

    const usernameElement = document.querySelector('.gus-c-name-info p');
    usernameElement.textContent = username;

    const bioElement = document.querySelector('.gus-c-user-info__bio');
    bioElement.innerHTML = bioHTML;

    const followersCountElement = document.querySelector('.gus-c-user-info__connections-followers');
    followersCountElement.textContent = totalFollowerCount;

    const followingCountElement = document.querySelector('.gus-c-user-info__connections-following');
    followingCountElement.textContent = totalFollowingCount;
    
    const starCountElement = document.querySelector('.gus-c-user-info__connections-stars');
    starCountElement.textContent = totalStarredRepositories;

    const locationElement = document.querySelector('.gus-c-user-info__location');
    if(location) {
        locationElement.append(location);
    }
    else {
        locationElement.style.display = "none"
    }

    const emailElement = document.querySelector('.gus-c-user-info__email');
    if(email) {
        emailElement.append(email);
    }
    else {
        emailElement.style.display = "none"
    }

    const websiteUrlElement = document.querySelector('.gus-c-user-info__website');
    if(websiteUrl) {
        websiteUrlElement.append(websiteUrl);
    }
    else {
        websiteUrlElement.style.display = "none"
    }

    const repositoryCountBadge = document.querySelector('.gus-c-nav-tab__badge');
    repositoryCountBadge.textContent = arrayOfRepositories.length;

    const repositoryListElement = document.querySelector('.gus-c-repositories__list')

    if(arrayOfRepositories.length > 0) {
        arrayOfRepositories.forEach(function (repository) {
            let date = new Date(repository.updatedAt)
            
            const repositoryElement = `
                <div class="gus-c-repository">
                    <h2 class="gus-c-repository__name"><a href="${repository.url}" class="gus-c-repository__link">${repository.name}</a></h2>
                    <div class="gus-h-flex">
                        <div class="gus-c-repository__description">${repository.description ? repository.description : ""}</div>
                        <div class="gus-c-repository__star">
                            <button class="gus-c-btn"><i class="fas fa-star"></i> Star</button>
                        </div>
                    </div>
                    <div class="gus-c-repository__details">
                        ${repository.primaryLanguage ? `<span class="gus-c-repository__language" style="margin-right: 2rem"><span style="color: ${repository.primaryLanguage.color}"><i class="fas fa-circle"></i></span> ${repository.primaryLanguage.name}</span>` : ''}
                        ${repository.forkCount == 0 ? '' : `<span class="gus-c-repository__stars" style="margin-right: 2rem"><i class="fas fa-star"></i> ${repository.forkCount}</span>`}
                        ${repository.stargazerCount == 0 ? '' : `<span class="gus-c-repository__forks" style="margin-right: 2rem"><i class="fas fa-code-branch"></i> ${repository.stargazerCount}</span>`}
                        <span class="gus-c-repository__update-info">Updated on ${date.toDateString()}</span>
                    </div>
                </div>
            `
            repositoryListElement.insertAdjacentHTML('beforeend', repositoryElement)
        })
    }
}

function toggleNavigationMenu() {
    const navMenuElement = document.querySelector('.gus-c-nav__nav-menu')
    navMenuElement.classList.toggle('gus-h-flex')
}