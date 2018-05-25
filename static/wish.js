const dappAddress = "n1tbYXSTEufRdqtgATZxwQyheCV5PBNSML4";
const netUrl = "https://testnet.nebulas.io";
const NebPay = require("nebpay");
const nebPay = new NebPay();
var intervalQuery;

(function () {
  init();
  if (typeof (webExtensionWallet) === "undefined") {
    $('#extensionPopup').show();
  } else {
    getMyWishes();
  }
})();


function init() {
  $('.navbar-burger').click(function () {
    $(this).toggleClass('is-active');
    $('#' + $(this).data('target')).toggleClass('is-active');
  });

  $('#extensionPopup .delete').click(function () {
    $('#extensionPopup').hide();
  });

  $('.navbar-start .navbar-item').click(function () {
    $('.navbar-item.is-active').removeClass('is-active');
    $(this).addClass('is-active');
    if ($(this).data('name') === 'mine') {
      $('.wishes .tabs li')[0].click();
      $('#wishInput').val('');
      $('#my-wishes').show();
      $('#wish-pool').hide();
    } else {
      $('#my-wishes').hide();
      $('#wish-pool').show();
      initPool();
    }
  })

  $('.wishes .tabs li').click(function () {
    $('#wish-list').html('<div class="fa-3x"><i class="fas fa-spinner fa-spin"></i></div>');
    $('.wishes .tabs .is-active').removeClass('is-active');
    $(this).addClass('is-active');
    if ($(this).data('name') === 'mine') {
      getMyWishes();
    } else {
      getFulfilledWishes();
    }
  });

  $('#wishSubmit').click(function () {
    var content = $('#wishInput').val();
    if (!content) {
      alert('愿望内容不能为空！');
    } else {
      var callArgs = "[\"" + content + "\"]";
      var txhash = nebPay.call(dappAddress, '0', 'make_wish', callArgs, {
        listener: function (resp) {
          intervalQuery = setInterval(function () {
            funcIntervalQuery(txhash);
          }, 15000);
        }
      });
      $('#wishInput').val('');
    }
  });

  $('#renew').click(initPool);

  $('#wish-pool').on('click', '.fulfill-button', function () {
    fulfill($(this).data('id'));
  });
}

function fulfill(id) {
  var callArgs = "[" + id + "]";
  var txhash = nebPay.call(dappAddress, '0', 'fulfill', callArgs, {
    listener: function (resp) {
      console.log("response: " + JSON.stringify(resp));
    }
  });
}

function getMyWishes() {
  nebPay.simulateCall(dappAddress, '0', 'get_my_wish', '', {
    listener: function (resp) {
      var wishes = JSON.parse(resp.result);
      if (!wishes.length) {
        var html = '你还没有愿望，快去许一个吧！';
      } else {
        var html = [];
        for (var i = 0; i < wishes.length; i++) {
          html.push(_createMyWishHtml(wishes[i]));
        }
        html = html.join('');
      }
      $('#wish-list').html(html);
    }
  })
}

function _createMyWishHtml(wish) {
  let content = wish.content;
  let header = wish.fulfiller ? `${wish.fulfiller} 承包了` : '';
  let cls = wish.fulfiller ? 'is-success' : 'is-info';
  let html = `
    <article class="message ${cls}">
    <div class="message-header">
      <p>${header}</p>
    </div>
    <div class="message-body">
      ${content}
    </div>
  </article>`
  return html;
}

function getFulfilledWishes() {
  nebPay.simulateCall(dappAddress, '0', 'get_fulfilled_wish', '', {
    listener: function (resp) {
      var wishes = JSON.parse(resp.result);
      if (!wishes.length) {
        var html = '你还没有承包愿望，快去承包一个吧！';
      } else {
        var html = [];
        for (var i = 0; i < wishes.length; i++) {
          html.push(_createPoolWishHtml(wishes[i]));
        }
        html = html.join('');
      }
      $('#wish-list').html(html)
    }
  });
}

function initPool() {
  let list = $('#pool-list');
  list.html('<div class="fa-3x"><i class="fas fa-spinner fa-spin"></i></div>');
  getRandomWishes();
}

function getRandomWishes() {
  nebPay.simulateCall(dappAddress, '0', 'get_random_wish', '', {
    listener: function (resp) {
      var wishes = JSON.parse(resp.result);
      if (!wishes.length) {
        var html = '还没有人许愿';
      } else {
        var html = [];
        for (var i = 0; i < wishes.length; i++) {
          let wish = wishes[i];
          let cls = wish.fulfiller ? 'is-dark' : '';
          html.push(_createPoolWishHtml(wish, cls));
        }
        html = html.join('');
      }
      $('#pool-list').html(html)
    }
  });
}

function _createPoolWishHtml(wish, cls) {
  let content = wish.content;
  let creator = wish.creator;
  let button = wish.fulfiller ? '' : `<button class="button is-primary fulfill-button" data-id="${wish.id}">承包</button>`;
  let c = cls ? cls : 'is-info';
  let html = `
    <article class="message ${c}">
    <div class="message-header">
      <p>${creator}说</p>
      ${button}
    </div>
    <div class="message-body">
      ${content}
    </div>
  </article>`
  return html;
}

function funcIntervalQuery(txhash) {
  nebPay.queryPayInfo(txhash)
    .then(function (resp) {
      var respObject = JSON.parse(resp)
      if (respObject.code === 0) {
        clearInterval(intervalQuery)
        setTimeout(function () {
          window.location.href = '/';
        }, 3000);
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}