const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits', // 還沒翻牌
  SecondCardAwaits: 'SecondCardAwaits', // 翻一張牌後，等待第二張翻
  CardsMatchFailed: 'CardsMatchFailed', // 兩張牌配對錯誤
  CardsMatched: 'CardsMatched', // 兩張牌配對成功
  GameFinished: 'GameFinished', // 遊戲結束
}

const Symbols = [
  // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png',
  // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png',
  // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png',
  // 梅花
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'
]

// 外掛函式庫 (公用函式庫)
const utility = {
  // 隨機排列演算法
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())

    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

// MVC 架構：創造出命名空間(namespace)，有 model、view、controller 

const view = {
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  getCardElement(index) {
    return `
    <div class="card back" data-index='${index}'>
    </div>`
  },

  getCardContent(index) {
    // this：此物件 (view)
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>`
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        // return 正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // return 背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')

      // animationend (動畫結束事件)，動畫跑完一輪，就把 .wrong 這個 class 拿掉
      // {once: true} 是要求事件執行一次之後，就要卸載這個監聽器，避免太多負擔
      card.addEventListener('animationend', event => {
        event.target.classList.remove('wrong'), { once: true }
      })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Complete !</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedTimes} times</p>`

    const header = document.querySelector('#header')
    // div 插入在 header 之前
    header.before(div)
  }
}

const model = {
  // 暫存牌
  revealedCards: [],
  
  // 判斷兩個暫存牌數字是否相同，return true or false
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  triedTimes: 0,
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  // 生成初始畫面
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 點擊卡片後做的事
  dispatchCardAction(card) {
    // 不是牌背狀態的卡片，離開函式
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      // 點擊第一張牌後
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card) // card變數是一個物件(object)，copy by reference
        this.currentState = GAME_STATE.SecondCardAwaits
        // 離開 switch
        break
      // 點擊第二張牌後
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)

        // 配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []

          if (model.score === 260) {
            view.showGameFinished()
            this.currentState = GAME_STATE.GameFinished
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
    }
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    // 把 resetCards 當成參數傳給 setTimeout 時，this 的對象變成了 setTimeout (指向瀏覽器)，因此要改用 controller
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}

// 渲染初始畫面 (卡牌背面)
controller.generateCards()


// 事件：點擊時翻牌
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})
