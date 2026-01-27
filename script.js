const movieSearchBox = document.getElementById("movie-search-box");
const searchList = document.getElementById("search-list");
const resultGrid = document.getElementById("result-grid");

/* =========================
   RECENTLY WATCHED LOGIC
========================= */

const RECENT_KEY = "recentlyWatched";

function addToRecentlyWatched(movie) {
  let watched = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];

  // remove duplicates
  watched = watched.filter((item) => item.imdbID !== movie.imdbID);

  // add to front
  watched.unshift({
    imdbID: movie.imdbID,
    Title: movie.Title,
    Poster: movie.Poster,
    Year: movie.Year,
  });

  // limit size
  watched = watched.slice(0, 8);

  localStorage.setItem(RECENT_KEY, JSON.stringify(watched));
}

function renderRecentlyWatched() {
  const container = document.getElementById("recently-watched-list");
  if (!container) return;

  const watched = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  container.innerHTML = "";

  if (watched.length === 0) return;

  watched.forEach((movie) => {
    const img = document.createElement("img");
    img.src = movie.Poster !== "N/A" ? movie.Poster : "image_not_found.png";
    img.alt = movie.Title;
    img.classList.add("movie-poster");

    img.addEventListener("click", async () => {
      const res = await fetch(
        `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=fc1fef96`,
      );
      const details = await res.json();
      displayMovieDetails(details);
    });

    container.appendChild(img);
  });
}

/* =========================
   SEARCH + API LOGIC
========================= */

async function loadMovies(searchTerm) {
  const URL = `https://www.omdbapi.com/?s=${searchTerm}&page=1&apikey=fc1fef96`;
  const res = await fetch(URL);
  const data = await res.json();

  if (data.Response === "True") {
    displayMovieList(data.Search);
  } else {
    searchList.innerHTML = "";
  }
}

function findMovies() {
  const searchTerm = movieSearchBox.value.trim();

  if (searchTerm.length === 0) {
    searchList.classList.add("hide-search-list");
    return;
  }

  searchList.classList.remove("hide-search-list");
  searchList.innerHTML = getShimmerSearchList();
  loadMovies(searchTerm);
}

function getShimmerSearchList() {
  return `
    ${[1, 2, 3, 4]
      .map(
        () => `
      <div class="shimmer-item">
        <div class="shimmer shimmer-thumbnail"></div>
        <div class="shimmer-text">
          <div class="shimmer shimmer-line"></div>
          <div class="shimmer shimmer-line short"></div>
        </div>
      </div>
    `,
      )
      .join("")}
  `;
}

function displayMovieList(movies) {
  searchList.innerHTML = "";

  movies.forEach((movie) => {
    const movieItem = document.createElement("div");
    movieItem.classList.add("search-list-item");
    movieItem.dataset.id = movie.imdbID;

    const poster =
      movie.Poster !== "N/A" ? movie.Poster : "image_not_found.png";

    movieItem.innerHTML = `
      <div class="search-item-thumbnail">
        <img src="${poster}">
      </div>
      <div class="search-item-info">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
      </div>
    `;

    movieItem.addEventListener("click", () =>
      fetchAndDisplayMovie(movie.imdbID),
    );

    searchList.appendChild(movieItem);
  });
}

/* =========================
   MOVIE DETAILS
========================= */

async function fetchAndDisplayMovie(imdbID) {
  searchList.classList.add("hide-search-list");
  movieSearchBox.value = "";

  const res = await fetch(
    `https://www.omdbapi.com/?i=${imdbID}&apikey=fc1fef96`,
  );
  const movieDetails = await res.json();

  addToRecentlyWatched(movieDetails);
  displayMovieDetails(movieDetails);
  renderRecentlyWatched();
}

function displayMovieDetails(details) {
  resultGrid.innerHTML = `
    <div class="movie-poster">
      <img src="${
        details.Poster !== "N/A" ? details.Poster : "image_not_found.png"
      }" alt="movie poster">
    </div>

    <div class="movie-info">
      <h3 class="movie-title">${details.Title}</h3>

      <ul class="movie-misc-info">
        <li class="year">Year: ${details.Year}</li>
        <li class="rated">Rated: ${details.Rated}</li>
        <li class="released">Released: ${details.Released}</li>
      </ul>

      <p><b>Genre:</b> ${details.Genre}</p>
      <p><b>Writer:</b> ${details.Writer}</p>
      <p><b>Actors:</b> ${details.Actors}</p>
      <p><b>Plot:</b> ${details.Plot}</p>
      <p><b>Language:</b> ${details.Language}</p>
      <p><b>Awards:</b> ${details.Awards}</p>
    </div>
  `;
  resultGrid.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =========================
   GLOBAL EVENTS
========================= */
movieSearchBox.addEventListener("input", findMovies);

window.addEventListener("click", (e) => {
  if (!movieSearchBox.contains(e.target) && !searchList.contains(e.target)) {
    searchList.classList.add("hide-search-list");
  }
});

document.addEventListener("DOMContentLoaded", renderRecentlyWatched);
