
(function () {
  var chain = "https://mainnet.nebulas.io";
  var from = "n1VB5MiuSPdYwkxbVchEYci4t4fTNxiVPLg";
  var contractAddress = "n1mWJ6YVrNTEW7nuATnJsLScDr9NQ2eJKWE";
  var nebulas = require('nebulas');
  var neb = new nebulas.Neb();
  neb.setRequest(new nebulas.HttpRequest(chain));
  var value = "0";
  var nonce = "0";
  var gas_price = "1000000";
  var gas_limit = "2000000";
  var callFunction = "get_all_notes";
  var contract = {
    "function": callFunction,
    "args": ""
  }
  window.myboards = null;
  neb.api.call(from, contractAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
    myboards = JSON.parse(resp.result);
    var post_body = $('.post-body');
    result = [];
    var array = Object.keys(myboards);
    for (var i = array.length-1; i >=0; i--) {
        var key = array[i];
        result.push(
        '<div class="my-neb-board">',
        '<div class="board-time">', myboards[key].updated_at, '</div>',
        '<div class="content">',myboards[key].content,'</div>',
        '</div>')
    };
    post_body.append($(result.join('')));
  }).catch(function (err) {
    console.log("error:" + err.message)
  })
})();
