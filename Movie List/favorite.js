const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')

// 放入 Movie list
function renderMovieList(data) {
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
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

renderMovieList(movies)

//

// More 點擊後出現的 modal ，x 點擊後將電影從收藏中移除
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


function removeFromFavorite(id) {
  // 錯誤處理 (如果 movies 變數是 falsy 或 movies 是空陣列，停止函式)
  if (!movies || !movies.length) return

  const removeMovieIndex = movies.findIndex(movie => movie.id === id)
  // 錯誤處理 (如果沒有找到要移除電影的 index，停止函式)
  if (removeMovieIndex === -1) return

  // 從 movies 中移除
  movies.splice(removeMovieIndex, 1)
  // 更新顯示的電影
  renderMovieList(movies)
  // 修改後的 movies 存入 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
}



dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})
//





