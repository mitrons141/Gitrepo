let username = '';
let page = 1;
let perPage = 10; // Default per page
let topic = ''; // Default topic filter

function fetchRepositories() {
  username = document.getElementById('username').value.trim();
  if (username === '') {
    alert('Please enter a valid GitHub username.');
    return;
  }
  page = 1; // Reset page number when a new username is searched
  perPage = document.getElementById('perPage').value; // Update perPage based on user selection
  topic = document.getElementById('topic').value.trim(); // Update topic based on user input
  fetchRepositoriesPage(page);
}

function fetchRepositoriesPage(page) {
  let apiUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;
  if (topic) {
    apiUrl += `&q=${encodeURIComponent(topic)}`; // Add topic as a query parameter if provided
  }

  fetch(apiUrl)
    .then(response => response.json())
    .then(repositories => {
      const repositoriesList = document.getElementById('repositories-list');
      repositoriesList.innerHTML = '';
      repositories.forEach(async repo => {
        const topicsUrl = `https://api.github.com/repos/${username}/${repo.name}/topics`;
        try {
          const topicsResponse = await fetch(topicsUrl);
          if (!topicsResponse.ok) {
            throw new Error('Failed to fetch topics');
          }
          const data = await topicsResponse.json();
          const topics = data.names || [];

          if (!topic || topics.includes(topic)) {
            const repoElement = document.createElement('div');
            repoElement.classList.add('repo');

            // Repository Name
            const repoNameElement = document.createElement('a');
            repoNameElement.href = repo.html_url;
            repoNameElement.textContent = repo.name;
            repoElement.appendChild(repoNameElement);

            // Repository Topics
            if (topics.length > 0) {
              const topicsElement = document.createElement('p');
              topicsElement.textContent = `Topics: ${topics.join(', ')}`;
              repoElement.appendChild(topicsElement);
            }

            repositoriesList.appendChild(repoElement);
          }
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      });

      updatePaginationButtons(page, repositories.length);

      const pagination = document.getElementById('pagination');
      pagination.style.display = 'block'; // Show pagination when repositories are fetched
    })
    .catch(error => {
      console.error('Error fetching repositories:', error);
    });
}

function updatePaginationButtons(page, reposCount) {
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const currentPageSpan = document.getElementById('currentPage');
  
  prevButton.disabled = page === 1;
  nextButton.disabled = reposCount < perPage;

  currentPageSpan.textContent = `Page ${page}`;
}

function prevPage() {
  if (page > 1) {
    page--;
    fetchRepositoriesPage(page);
  }
}

function nextPage() {
  page++;
  fetchRepositoriesPage(page);
}
