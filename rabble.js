window.onload = function () {
  var rabble = this;

  function isRunning() { 
    return ('running' in rabble)? rabble.running : false;
  }

  function setRunning(bool) { 
    rabble.running = bool;
  }

  function updateTimer(seconds) {
    var div_timer = document.getElementById('timer');
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    secs = (secs < 10)? '0'+secs : secs;
    div_timer.textContent = mins + ':' + secs;
  }

  function updateCycle(cycle) {
    document.getElementById('cycle').textContent = 'Cycle #' + cycle;
  }

  function updateStartButton(text, action) {
    var btn_start = document.getElementById('btn_start');
    if (btn_start.clickListener) {
      btn_start.removeEventListener('click', btn_start.clickListener);
    }
    btn_start.addEventListener('click', action);
    btn_start.clickListener = action;
    btn_start.textContent = text;
  }

  function screamBreak() {
    var div_scream = document.getElementById('screamout');
    div_scream.classList.remove('hide');
    div_scream.classList.add('break');
    div_scream.textContent = 'Take a break, mobbers. You\'ve earned it.';
  }

  function screamNext(next_driver) {
    var div_scream = document.getElementById('screamout');
    div_scream.classList.remove('hide');
    div_scream.classList.add('scream');
    div_scream.textContent = 'ROTATE! '+next_driver+', you\'re up.';
  }

  function hideScream() {
    document.getElementById('screamout').classList.remove('break', 'scream');
    document.getElementById('screamout').classList.add('hide');
  }

  function nextDriver() {
    var ul_members = document.getElementById('members');
    if (ul_members.childNodes.length == 0) {
      return 'Mobber';
    }
    var current_el = document.getElementById('current-driver');
    var next_el;
    if (current_el) {
      next_el = current_el.nextSibling || ul_members.firstChild;
      current_el.removeAttribute('id');
    } else {
      next_el = ul_members.firstChild;
    }
    next_el.setAttribute('id', 'current-driver');
    return next_el.textContent;
  }

  function getSetSeconds() {
    var set_minutes = parseFloat(document.getElementById('in_minutes').value) || 10.0;
    return Math.floor(set_minutes * 60);
  };

  function getBreakCycles() {
    return parseInt(document.getElementById('in_break').value) || 6;
  };

  function init() {
    var current_driver = document.getElementById('current-driver');
    if (current_driver) current_driver.removeAttribute('id');
    rabble.seconds = 0;
    rabble.cycle = 0;
    setRunning(false);
    hideScream();
    updateStartButton('Start', start);
    updateTimer(0);
    updateCycle(0);
  }

  function notify(title, text) {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    var n = new Notification(title, {body: text});
    n.addEventListener('click', function () {
      if (!isRunning()) document.getElementById('btn_start').click();
    });
  }

  function attach() {
    var btn_reset = document.getElementById('btn_reset');
    var btn_skip = document.getElementById('btn_skip');
    var new_member = document.getElementById('new-member');

    new_member.addEventListener('change', 
      function (e) {
        var name = e.target.value.trim()
        if (name) addMember(name);
        e.target.value = '';
      });

    btn_reset.addEventListener('click', stop);
    btn_skip.addEventListener('click', skip);

    document.body.addEventListener('keyup', function(e) {
      if (e.target === document.body) {
        switch (e.keyCode) {
          case 32: // space
            e.preventDefault();
            document.getElementById('btn_start').click();
            break;
          case 8: // backspace
            e.preventDefault();
            document.getElementById('btn_reset').click();
            break;
          case 75: // k
            e.preventDefault();
            document.getElementById('btn_skip').click();
            break;
        }
      }
    });
  }

  function unpause() {
    setRunning(true);
    updateStartButton('Pause', pause);
  }

  function pause() {
    setRunning(false);
    updateStartButton('Unpause', unpause);
  }

  function stop() {
    init();
  }

  function start() {
    nextCycle();
  }

  function skip() {
    if (isRunning()) {
      rabble.skip = true;
    }
  }

  function breakTime() {
    setRunning(false);
    screamBreak();
    notify('Break Time!', '');
    updateStartButton('Back to Work', function () {
      hideScream();
      unpause();
    });
  }

  function nextCycle() {
    var driver = nextDriver();
    setRunning(false);
    screamNext(driver);
    notify('Rotate Pair!', 'Next Driver: '+driver);
    updateStartButton('I\'m Ready', function () {
      hideScream();
      unpause();
    });
  }

  function update() {
    if (isRunning()) {
      if (rabble.seconds > getSetSeconds() || rabble.skip) {
        rabble.cycle += 1;
        rabble.seconds = 0;
        rabble.skip = false;

        updateCycle(rabble.cycle);

        if (rabble.cycle > 0 && rabble.cycle % getBreakCycles() == 0) {
          breakTime();
        } else {
          nextCycle();
        }
      }

      rabble.seconds += 1;
      updateTimer(rabble.seconds);
    }

    window.setTimeout(update, 1000);
  }

  function memberSwap(e) {
    var prev = false;

    if (e.type === 'click')
      prev = e.altKey;
    else if (e.type === 'wheel')
      prev = e.deltaY < 0;
    else
      return

    if (prev)
      memberSwapPrev(e.target);
    else
      memberSwapNext(e.target);
  }

  function memberSwapPrev(el) {
    if (el.previousSibling)
      el.parentNode.insertBefore(el, el.previousSibling);
  }

  function memberSwapNext(el) {
    if (el.nextSibling)
      el.parentNode.insertBefore(el.nextSibling, el);
  }

  function addMember(name) {
    var ul_members = document.getElementById('members');
    var new_li = document.createElement('li');
    new_li.textContent = name;
    ul_members.appendChild(new_li);
    new_li.addEventListener('wheel', memberSwap);
    new_li.addEventListener('click', memberSwap);
    new_li.addEventListener('dblclick', function () {
      removeMember(new_li);
    });
  }

  function removeMember(target) {
    var ul_members = target.parentNode;
    ul_members.removeChild(target);
  }

  attach();
  init();
  update();
}
