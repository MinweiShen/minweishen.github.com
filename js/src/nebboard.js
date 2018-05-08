
(function () {
  var chain = "https://testnet.nebulas.io";
  var from = "n1KcViXzMGiUEVXt9cnnRnE9s5iB3rX8gjt";
  var contractAddress = "n1fBX91J9SLH3QMg62Eh1SdXEFcK4r1Szxc";
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
  var myboards = null;
  neb.api.call(from, contractAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
    myboards = JSON.parse(resp.result);
    console.log(myboards);
    var post_body = $('.post-body');
    result = [];
    for (var i = myboards.length - 1; i >=0; i--) {
        result.push(
        '<div class="my-neb-board">',
        '<div class="board-time">', myboards[i].updated_at, '</div>',
        '<div class="content">',myboards[i].content,'</div>',
        '</div>')
    };
    post_body.append($(result.join('')));
  }).catch(function (err) {
    console.log("error:" + err.message)
  })
})();
