const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/'
const INDEX_URL = BASE_URL + 'api/v1/users/'
const friends = JSON.parse(localStorage.getItem('favoriteList'))||[]
const dataPanel = document.querySelector('#data-panel') // 以變數承裝要渲染匯入朋友清單的節點
const paginator = document.querySelector('#paginator')
const FRIENDS_PER_PAGE = 12
let filteredFriends = []
const friendModalFooter = document.querySelector('#friend-modal-footer')

renderFriendList(getFriendsByPage(1))
renderPaginator(friends.length)

// 動態渲染頁面函式
function renderFriendList(data){
  let rawHtml = ''
  data.forEach(item => {
    rawHtml +=`<div class="d-flex flex-wrap mb-3 col-sm-3">
				<div class="card ml-auto">
					<img class="card-img-top" src="${item.avatar}" alt="Card image cap">
					<div class="card-body text-center">
            <h5 class="card-title">${item.name+' '+item.surname}</h5>
						<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#friend-modal" data-id='${item.id}'>More
						</button>
            <button class="btn btn-danger btn-delete-favorite" data-id='${item.id}'>X</button>
					</div>
				</div>
			</div>`
  })
  dataPanel.innerHTML = rawHtml
}

// 設置監聽器監聽所有More按鈕，取得點擊的More按鈕id傳進renderFriendModal函式
// 監聽所有X按鈕，點擊就會觸發函式removeFromFavorite
dataPanel.addEventListener('click', event => {
  if(event.target.innerText === 'More'){
    renderFriendModal(Number(event.target.dataset.id))
  } else if(event.target.innerText === 'X'){
    removeFromFavorite(Number(event.target.dataset.id))
  }
})
// 動態渲染跳窗函式
function renderFriendModal(id){
  const friendModalImage = document.querySelector('#friend-modal-image')
  const friendModalTitle = document.querySelector('#friend-modal-title')
  const friendModalBirthday = document.querySelector('#friend-modal-birthday')
  const friendModalAge = document.querySelector('#friend-modal-age')
  const friendModalGender = document.querySelector('#friend-modal-gender')
  const friendModalRegion = document.querySelector('#friend-modal-region')
  const friendModalEmail = document.querySelector('#friend-modal-email')
  axios.get(INDEX_URL + id).then(response => {
		const data = response.data
		friendModalTitle.innerText = `${data.name}  ${data.surname}`
		friendModalBirthday.innerText = data.birthday
    friendModalAge.innerText = data.age+'yrs'
		friendModalRegion.innerText = data.region
    friendModalEmail.href = `mailto:${data.email}`
		friendModalImage.innerHTML = `<img src="${data.avatar}" class="card-img-top" alt="avatar" class='img-fuid'>`
    if(data.gender === "female"){
      friendModalGender.classList.remove('fa-male','fa-female')
      friendModalGender.classList.add('fa-female')
    } else {
      friendModalGender.classList.remove('fa-male','fa-female')
      friendModalGender.classList.add('fa-male')
    }
	}).catch(err => {console.log(err)})
}

// 分頁器監聽
paginator.addEventListener('click',function onPaginatorClick(event){
  // 如果點擊目標不是<a></a>，就跳出此函式
  if(event.target.tagName !== 'A') return
  // 將頁碼用變數包裹，並用Number()轉成數字
  const page = Number(event.target.dataset.page)
  // 把頁碼丟進用頁碼取得朋友資料，再傳進渲染頁面函式渲染頁面
  renderFriendList(getFriendsByPage(page))
})
// 用頁碼取得朋友資料
function getFriendsByPage(page){
	const startIndex = (page-1)*FRIENDS_PER_PAGE //起始序號為頁碼減一乘以12
	return friends.slice(startIndex , startIndex+FRIENDS_PER_PAGE)//從第0切到第12，不包含第12
}
// 算出總頁碼，渲染分頁器
function renderPaginator(amount) {
	// 計算總頁數：總部數除12無條件進位，即為總頁數
	const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE)
	let rawHTML = ''
	for(let page = 1 ; page <= numberOfPages ; page++){
		rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>`
	}
	paginator.innerHTML = rawHTML
}

// 移除最愛的函式
function removeFromFavorite(id) {
  if(!friends) return
  const friendIndex = friends.findIndex(friend=>friend.id===id)
  if(friendIndex === -1) return
  friends.splice(friendIndex,1)
  localStorage.setItem('favoriteList',JSON.stringify(friends))
  renderFriendList(friends)
  renderPaginator(friends.length)
}
