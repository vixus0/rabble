window.onload = function () {
  let rabble = this;
  let switchSound;
  let breakSound;

  function getStorageType() {
    return ('localStorage' in window)? 'localStorage' : 'sessionStorage';
  }

  function isRunning() {
    return ('running' in rabble)? rabble.running : false;
  }

  function setRunning(bool) {
    rabble.running = bool;
  }

  function updateProgress(secs, class_name) {
    let progress = document.getElementById('progress');
    let bar = progress.firstChild;

    progress.className = '';

    if (class_name) {
      progress.classList.add(class_name);
    }

    if (bar) {
      bar.style.setProperty('animation', secs+'s linear progress');
      bar.style.setProperty('animation-play-state', 'running');
    }
  }
  
  function Sound(src) {
    this.sound = document.createElement("audio"); 
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    setTimeout(this.play = function () {
      this.sound.play();
    }, 5000);
    this.stop = function () {
      this.sound.pause(); 
    }
  }

  function pauseProgress() {
    let progress = document.getElementById('progress');
    let bar = progress.firstChild;
    bar.style.setProperty('animation-play-state', 'paused');
    progress.classList.remove('cycle');
  }

  function resetProgress() {
    let progress = document.getElementById('progress');
    let bar = progress.firstChild;
    let clone = bar.cloneNode(false);
    clone.style.removeProperty('animation');
    progress.className = '';
    progress.replaceChild(clone, bar);
  }

  function updateTimer(seconds) {
    let div_timer = document.getElementById('messages');
    let cycle_time = getSetSeconds();
    let remain = cycle_time - seconds;
    let mins = Math.floor(remain / 60);
    let secs = remain % 60;
    secs = (secs < 10)? '0'+secs : secs;
    div_timer.textContent = mins + ':' + secs;
  }

  function updateCycle(cycle) {
  }

  function updateStartButton(text, action) {
    let btn_start = document.getElementById('btn_start');
    if (btn_start.clickListener) {
      btn_start.removeEventListener('click', btn_start.clickListener);
    }
    btn_start.addEventListener('click', action);
    btn_start.clickListener = action;
    btn_start.textContent = text;
  }

  function screamBreak() {
    breakSound.play();
    let div_scream = document.getElementById('messages');
    div_scream.classList.remove('hide');
    div_scream.classList.add('break');
    div_scream.textContent = 'Take a break, mobbers. You\'ve earned it.';
  }

  function screamNext(next_driver, next_navigator) {
    switchSound.play();
    let div_scream = document.getElementById('messages');
    let content = 'ROTATE!<br>'+next_driver+', you\'re up.<br>';
    if (next_navigator) {
      content += ' '+next_navigator+', boss them around.'
    }
    div_scream.classList.add('countdown');
    div_scream.innerHTML = content;
  }

  function hideScream() {
    document.getElementById('messages').classList.remove('break', 'countdown');
    document.getElementById('messages').classList.add('hide');
  }

  function nextDriver() {
    let ul_members = document.getElementById('members');
    let current_el = document.getElementById('current-driver');
    let next_el;
    if (ul_members.childNodes.length === 0) {
      return 'Mobber';
    }
    if (current_el) {
      next_el = current_el.nextSibling || ul_members.firstChild;
      current_el.removeAttribute('id');
    } else {
      next_el = ul_members.firstChild;
    }
    next_el.setAttribute('id', 'current-driver');
    return next_el.textContent;
  }

  function nextNavigator() {
    let ul_members = document.getElementById('members');
    let driver = document.getElementById('current-driver');
    let new_navigator = null;
    if (ul_members.childNodes.length > 1) {
      let navigator = driver.nextSibling || ul_members.firstChild;
      navigator.setAttribute('id', 'current-navigator');
      new_navigator = navigator.textContent;
    }
    return new_navigator;
  }

  function getSetSeconds() {
    let set_minutes = parseFloat(document.getElementById('in_minutes').value) || 8.0;
    return Math.floor(set_minutes * 60);
  }

  function getBreakCycles() {
    return parseInt(document.getElementById('in_break').value) || 6;
  }

  function getCountdownSecs() {
    return parseInt(document.getElementById('in_countdown').value) || 10;
  }

  function init() {
    let current_driver = document.getElementById('current-driver');
    let current_navigator = document.getElementById('current-navigator');
    if (current_driver) current_driver.removeAttribute('id');
    if (current_navigator) current_navigator.removeAttribute('id');
    rabble.seconds = 0;
    rabble.cycle = 0;
    setRunning(false);
    hideScream();
    updateStartButton('Start', start);
    updateTimer(0);
    updateCycle(0);
    resetProgress();
    window.clearTimeout(rabble.countdown);
  }

  function notify(title, text) {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    let n = new Notification(title, {body: text});
    n.addEventListener('click', function () {
      if (!isRunning()) document.getElementById('btn_start').click();
    });
  }

  function saveMobbers() {
    let ul_members = document.getElementById('members'),
        node = ul_members.firstChild,
        i = 0;
    let storageType = getStorageType();
    while (node) {
      window[storageType].setItem('mobber'+i, node.textContent);
      node = node.nextSibling;
      i++;
    }
    window[storageType].setItem('mobcount', i);
  }

  function loadMobbers() {
    let storageType = getStorageType();
    let count = window[storageType].getItem('mobcount');
    if (count !== null) {
      for (let i=0; i<count; i++) {
        name = window[storageType].getItem('mobber'+i);
        addMember(name);
      }
    }
  }

  function attach() {
    let btn_reset = document.getElementById('btn_reset');
    let btn_skip = document.getElementById('btn_skip');
    let new_member = document.getElementById('new-member');
    switchSound = new Sound("sounds/clockAlarm.wav");
    breakSound = new Sound("sounds/breakAlarm.wav");
                           
    new_member.addEventListener('change',
      function (e) {
        let name = e.target.value.trim()
        if (name) addMember(name);
        e.target.value = '';
      });

    btn_reset.addEventListener('click', stop);
    btn_skip.addEventListener('click', skip);

    document.body.addEventListener('keyup', function(e) {
      if (e.target === document.body) {
        let key = e.key || e.code;
        e.preventDefault();
        switch (key) {
          case 'Space':
          case ' ':
            document.getElementById('btn_start').click();
            break;
          case 'KeyR':
          case 'r':
            document.getElementById('btn_reset').click();
            break;
          case 'KeyK':
          case 'k':
            document.getElementById('btn_skip').click();
            break;
          case 'KeyS':
          case 's':
            saveMobbers();
            break;
          case 'KeyL':
          case 'l':
            loadMobbers();
            break;
          case 'KeyH':
          case 'h':
            document.getElementById('help').classList.toggle('hide');
            break;
        }
      }
    });
  }

  function unpause() {
    hideScream();
    setRunning(true);
    updateStartButton('Pause', pause);
    updateProgress(getSetSeconds(), 'cycle');
    window.clearTimeout(rabble.countdown);
  }

  function pause() {
    setRunning(false);
    updateStartButton('Unpause', unpause);
    pauseProgress();
  }

  function stop() {
    init();
  }

  function start() {
    saveMobbers();
    nextCycle();
  }

  function skip() {
    rabble.skip = true;
    unpause();
  }

  function breakTime() {
    setRunning(false);
    screamBreak();
    notify('Break Time!', '');
    updateStartButton('Back to Work', function () {
      hideScream();
      nextCycle();
    });
  }

  function nextCycle() {
    let driver = nextDriver();
    let navigator = nextNavigator();
    let content = 'Driver: '+driver;
    let countdown = getCountdownSecs();
    if (navigator) content += ', Navigator: '+navigator;
    setRunning(false);
    screamNext(driver, navigator);
    notify('Rotate Pair!', content);
    updateStartButton('I\'m Ready', function () {
      switchSound.stop();
      unpause();
    });
    nextCycleCountdown(countdown);
    resetProgress();
    updateProgress(countdown, 'countdown');
  }

  function nextCycleCountdown(secs) {
     secs -= 1;
     if (secs === 0) {
       resetProgress();
       unpause();
     } else {
       rabble.countdown = window.setTimeout(nextCycleCountdown, 1000, secs);
     }
  }

  function update() {
    if (isRunning()) {
      updateTimer(rabble.seconds);

      if (rabble.seconds > getSetSeconds() || rabble.skip) {
        rabble.cycle += 1;
        rabble.seconds = 0;
        rabble.skip = false;

        updateCycle(rabble.cycle);

        if (rabble.cycle > 0 && rabble.cycle % getBreakCycles() === 0) {
          breakTime();
        } else {
          nextCycle();
        }
      }

      rabble.seconds += 1;
    }

    window.setTimeout(update, 1000);
  }

  function memberSwap(e) {
    let prev = false;

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
    let ul_members = document.getElementById('members');
    let new_li = document.createElement('li');
    new_li.textContent = name;
    ul_members.appendChild(new_li);
    new_li.addEventListener('wheel', memberSwap);
    new_li.addEventListener('click', memberSwap);
    new_li.addEventListener('dblclick', function () {
      removeMember(new_li);
    });
  }

  function removeMember(target) {
    let ul_members = target.parentNode;
    ul_members.removeChild(target);
  }

  attach();
  init();
  update();
}
