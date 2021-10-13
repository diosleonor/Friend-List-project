const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/'
const INDEX_URL = BASE_URL + 'api/v1/users/'
const friends = []
const dataPanel = document.querySelector('#data-panel') // 以變數承裝要渲染匯入朋友清單的節點
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const FRIENDS_PER_PAGE = 12
let filteredFriends = []
const friendModalFooter = document.querySelector('#friend-modal-footer')

// 串接API取得要匯入的朋友清單，並將之轉化為可以使用的資料格式，並動態渲染到頁面上
axios.get(INDEX_URL).then(response => {
  // 取得資料後把所有資料推進friends陣列中
  friends.push(...response.data.results) 
  // 呼叫渲染分頁器函式，輸入朋友總長度（即個數）渲染分頁器長度
  renderPaginator(friends.length)
  // 呼叫渲染頁面函式，再呼叫用頁碼取得朋友資料取得第一頁的12筆朋友資料回傳渲染到頁面上
  renderFriendList(getFriendsByPage(1)) 
}).catch(err => {console.log(err)})

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
					</div>
				</div>
			</div>`
  })
  dataPanel.innerHTML = rawHtml
}

// 設置監聽器監聽所有More按鈕，取得點擊的More按鈕id傳進renderFriendModal函式
dataPanel.addEventListener('click', event => {
  if(event.target.innerText === 'More'){
    renderFriendModal(Number(event.target.dataset.id))
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
  const like = document.querySelector('#friend-modal-like')
  axios.get(INDEX_URL + id).then(response => {
		const data = response.data
		friendModalTitle.innerText = `${data.name} ${data.surname}`
		friendModalBirthday.innerText = data.birthday
    friendModalAge.innerText = data.age+'yrs'
		friendModalRegion.innerText = data.region
    friendModalEmail.href = `mailto:${data.email}`
		friendModalImage.innerHTML = `<img src="${data.avatar}" class="card-img-top" alt="avatar" class='img-fuid'>`
    like.innerHTML = `<span aria-hidden="true" style="color:red; font-size:180%" data-id='${data.id}'>❤</span>`
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
  // 三元運算子:如果filterFriends是有長度的則選filteredFriends;否則選friends
	const data = filteredFriends.length ? filteredFriends : friends 
	const startIndex = (page-1)*FRIENDS_PER_PAGE //起始序號為頁碼減一乘以12
	return data.slice(startIndex , startIndex+FRIENDS_PER_PAGE)//從第0切到第12，不包含第12
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
  
// Search按鈕監聽
searchForm.addEventListener('submit', function onSearchFormsubmit (event){
  event.preventDefault() // 阻止提交後瀏覽器自動重新整理的預設行為
  // 將searchInput內容去除頭尾空白後轉為小寫存放在keyword中使用
  const keyword = searchInput.value.trim().toLowerCase()
  // 用陣列方法filter過濾出符合條件函式的資料並賦值給filteredFriends
  filteredFriends = friends.filter( friend =>
    friend.name.toLowerCase().includes(keyword)||friend.surname.toLowerCase().includes(keyword)
  )
  if(filteredFriends.length === 0){
    return alert('Cannot find friends with keyword:' + keyword)
  }
  renderPaginator(filteredFriends.length) // 以篩選後的朋友數量渲染分頁器的多寡
  renderFriendList(getFriendsByPage(1)) // 朋友資料要分頁渲染
})

// 愛心監聽並加入local storage
friendModalFooter.addEventListener('click',function heartOnClick(event){
  addToFavorite(Number(event.target.dataset.id))
})
function addToFavorite(id){
  // 準備一個喜愛清單的容器，如果本地儲存空間沒有東西就回傳一個空陣列
  const favoriteList = JSON.parse(localStorage.getItem('favoriteList'))||[]
  // 利用陣列方法find找出一個id符合的朋友賦值為喜歡的朋友
  const favoriteFriend = friends.find((friend) => friend.id === id)
  // 為避免重複加入最愛，先寫一個條件式將喜愛清單用陣列方法some確認有沒有符合的內容
  if (favoriteList.some((friend) => friend.id === id)) {
    return alert('This person has been added into favorite list！')
  }
  // 把喜歡的朋友用陣列方法push存取到喜愛清單中
  favoriteList.push(favoriteFriend)
  // 在本地儲存空間中設定一組鍵值對儲存喜愛清單內容
  localStorage.setItem('favoriteList', JSON.stringify(favoriteList))
}