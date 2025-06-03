let books = [];
let currentPage = 1;
const resultsPerPage = 6;

// Search books using Google Books API
async function searchBooks(query = null) {
  const input = document.getElementById('searchInput');
  const searchTerm = query || input.value.trim();
  const resultsDiv = document.getElementById('results');
  const spinner = document.getElementById('spinner');

  if (!searchTerm) {
    alert('Please enter a search term.');
    return;
  }

  spinner.classList.remove('hidden');
  resultsDiv.innerHTML = '';
  books = [];
  currentPage = 1;

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=30`);
    const data = await res.json();
    books = data.items || [];

    updateSearchHistory(searchTerm);
    displayBooks();
  } catch (err) {
    resultsDiv.innerHTML = '<p>Error fetching data.</p>';
  } finally {
    spinner.classList.add('hidden');
  }
}

// Show current page of books
function displayBooks() {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  const start = (currentPage - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const currentBooks = books.slice(start, end);

  currentBooks.forEach(book => {
    const info = book.volumeInfo;
    const img = info.imageLinks?.thumbnail || 'https://via.placeholder.com/150x220?text=No+Cover';
    const title = info.title || 'No Title';
    const authors = info.authors ? info.authors.join(', ') : 'Unknown Author';
    const description = info.description ? info.description.slice(0, 100) + '...' : 'No description';

    const bookCard = document.createElement('div');
    bookCard.className = 'book';
    bookCard.innerHTML = `
      <img src="${img}" alt="Book Cover">
      <h3>${title}</h3>
      <p><strong>By:</strong> ${authors}</p>
      <p>${description}</p>
    `;
    resultsDiv.appendChild(bookCard);
  });

  document.getElementById('pageNumber').textContent = `Page ${currentPage}`;
}

// Change pagination page
function changePage(direction) {
  const totalPages = Math.ceil(books.length / resultsPerPage);
  currentPage += direction;

  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  displayBooks();
}

// Save and display search history
function updateSearchHistory(searchTerm) {
  let history = JSON.parse(localStorage.getItem('bookSearchHistory')) || [];
  if (!history.includes(searchTerm)) {
    history.unshift(searchTerm);
    if (history.length > 5) history.pop(); // max 5 items
    localStorage.setItem('bookSearchHistory', JSON.stringify(history));
  }
  renderSearchHistory();
}

function renderSearchHistory() {
  const historyList = document.getElementById('history-list');
  const history = JSON.parse(localStorage.getItem('bookSearchHistory')) || [];
  historyList.innerHTML = '';
  history.forEach(term => {
    const li = document.createElement('li');
    li.textContent = term;
    li.onclick = () => searchBooks(term);
    historyList.appendChild(li);
  });
}

// Load history on page load
renderSearchHistory();
