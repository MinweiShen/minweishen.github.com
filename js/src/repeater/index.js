'use strict';
(function() {
  let operator = document.querySelector('#operator'),
      clip = document.querySelector('#clip'),
      canvas = document.querySelector('#canvas');
  let repeater = new Repeater(operator, clip, canvas, 80);
  if (repeater) repeater.init();

  document.querySelector('.visualizer')
    .addEventListener(
      'click',
      function(){
        document.querySelector('#clip').play();
    })
    .addEventListener(
      'touchstart',
      function(){
        document.querySelector('#clip').play();
    });
})();