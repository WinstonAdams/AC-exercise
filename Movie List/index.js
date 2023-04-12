const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
let filteredMovies = []
// 一頁顯示 12 部電影
const MOVIES_PER_PAGE = 12
// page 移到全域變數，可以在 paginator.addEventListener 與 changeMode.addEventListener 使用
let page = 1

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-mode')

// 顯示 Movie card
function renderMovieCard(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>`
  })

  dataPanel.innerHTML = ''
  dataPanel.innerHTML = rawHTML
}
//

// 顯示 Movie list
function renderMovieList(data) {
  let rawHTML = '<ul class="movie-list">'
  data.forEach((item) => {
    rawHTML += `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <span>${item.title}</span>
      <span>
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
          data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </span>
    </li>
    `
  })
  rawHTML += '</ul>'

  dataPanel.innerHTML = ''
  dataPanel.innerHTML = rawHTML
}
//

// 點擊後，顯示不同的模式
changeMode.addEventListener('click', (event) => {
  if (event.target.matches('.btn-card-mode')) {
    renderMovieCard(getMoviesByPage(page))
  } else if (event.target.matches('.btn-list-mode')) {
    renderMovieList(getMoviesByPage(page))
  }
})
//

// More 點擊後出現的 modal，+ 點擊後收藏電影
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalData = document.querySelector('#movie-modal-data')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
      modalData.innerText = 'Release data : ' + data.release_date
      modalDescription.innerText = data.description
    })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  // 若此電影已經在 list 中，跳出對話視窗，並離開函式
  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})
//

// Search
// submit 用在 <form> 提交表單資料時
searchForm.addEventListener('submit', function searchFormSubmit(event) {
  // 移除預設行為 (預設為重新導向目前頁面)
  event.preventDefault()

  const keyword = searchInput.value.trim().toLowerCase()


  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword : ' + keyword)
  }


  renderPaginator(filteredMovies.length)

  // 避免在重新搜尋前，按下分頁後 page 會記錄成分頁的數字，重新搜尋後，切換模式後，使用之前按下分頁時紀錄的數字
  page = 1
  const movieList = document.querySelector('.movie-list')
  if (movieList) {
    renderMovieList(getMoviesByPage(1))
  } else {
    renderMovieCard(getMoviesByPage(1))
  }
})
//


// 第幾頁顯示的電影 list
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startPage = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startPage, startPage + MOVIES_PER_PAGE)
}
//

// 製作分頁
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}
//


// 分頁點擊後，出現該頁的電影
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 如果不是點擊到超連結，停止函式
  if (event.target.tagName !== 'A') return

  page = Number(event.target.dataset.page)

  const movieList = document.querySelector('.movie-list')
  // 如果 movieList 存在則執行 renderMovieList(getMoviesByPage(page))
  if (movieList) {
    renderMovieList(getMoviesByPage(page))
  } else {
    renderMovieCard(getMoviesByPage(page))
  }
})
//


axios
  .get(INDEX_URL)
  .then((response) => {
    // 使用 push 修改陣列內容，屬於「copied by reference」，不會觸發 const 限制
    // response.data.results 是一個 array
    movies.push(...response.data.results)
    // 一開始顯示第一頁的電影
    renderMovieCard(getMoviesByPage(1))
    // 顯示分頁
    renderPaginator(movies.length)
  })
  .catch((err) => console.log(err))


