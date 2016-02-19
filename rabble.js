window.onload = function () {
  var 
    in_minutes = document.getElementById('in_minutes'),
    in_new_member = document.getElementById('in_new_member'),
    li_new_member = document.getElementById('new_member'),
    btn_start = document.getElementById('btn_start'),
    btn_reset = document.getElementById('btn_reset'),
    ul_gang = document.getElementById('gang_list'),
    div_project = document.getElementById('project'),
    div_timer = document.getElementById('timer'),
    div_cycle = document.getElementById('cycle');
    div_driver = document.getElementById('driver');
    div_navigator = document.getElementById('navigator');
    div_scream = document.getElementById('screamout');

  var set_minutes = parseFloat(in_minutes.value);
  var members = [];
  var running = false;
  var paused = false;
  var notify = false;

  var seconds = 0;
  var cycle = 0;

  var resetSeconds = function () {
    set_minutes = parseFloat(in_minutes.value);
    seconds = Math.floor(set_minutes * 60);
    updateTimer();
  };

  var updateTimer = function () {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
        secs = (secs < 10)? '0' + secs : secs;
    div_timer.textContent = mins + ':' + secs;
  };

  var updatePair = function () {
    var body_txt = '';

    if (members.length >= 2) {
      var nm = members.length;
      var nav = members[cycle % nm];
      var driver = members[(cycle+1) % nm];

      div_driver.textContent = driver.textContent;
      div_navigator.textContent = nav.textContent;
      div_driver.className = '';
      div_navigator.className = '';
      body_txt = 'Driver: '+driver.textContent+', Navigator: '+nav.textContent;

      members.forEach(function (v) {v.className = ''});
      driver.className = 'driver';
      nav.className = 'navigator';
    }

    return body_txt;
  };

  var scream = function () {
    var body_txt = updatePair();
    if (notify) {
      var notification = new Notification('Rotate Pair!', {'body':body_txt});
      // TODO: Onclick continues...
    }
    div_scream.className = 'scream';
    div_scream.textContent = body_txt;
  };

  var updateCycle = function () {
    if (seconds % (set_minutes * 60) === 0) {
      resetSeconds();
      pause('Continue');
      scream();
      cycle++;
    }
    div_cycle.textContent = 'Cycle #' + cycle;
  };

  var update = function () {
    if (running && !paused) {
      updateCycle();
      updateTimer();
      seconds--;
    }
    window.setTimeout(update, 1000);
  };

  var unpause = function () {
    paused = false;
    btn_start.textContent = 'Pause';
    div_scream.className = 'hide';
  };

  var pause = function (txt) {
    paused = true;
    btn_start.textContent = (txt)? txt:'Unpause';
  };

  var start = function () {
    running = true;
    cycle = 0;
    unpause();
    resetSeconds();
  };

  var reset = function () {
    running = false;
    btn_start.textContent = 'Start';
    div_scream.className = 'hide';
    div_driver.className = 'hide';
    div_navigator.className = 'hide';
    resetSeconds();
  };

  btn_start.addEventListener('click', function () {
    if (running) {
      if (paused) {
        unpause(); 
      } else {
        pause();
      }
    } else {
      start();
    }
  });

  btn_reset.addEventListener('click', function () {
    reset();
  });

  in_minutes.addEventListener('change', function () {
    if (!running) {
      resetSeconds();
      updateTimer();
    }
  });

  in_new_member.addEventListener('change', function () {
    var name = in_new_member.value.trim();
    if (name) {
      var li = document.createElement('li');
      li.textContent = name;
      li.setAttribute('data-id', ''+members.length);
      members.push(li);
      in_new_member.value = '';
      ul_gang.insertBefore(li, li_new_member);

      li.addEventListener('dblclick', function (e) {
        var id = parseInt(li.getAttribute('data-id'));
        members.splice(id, 1);
        ul_gang.removeChild(li);
      });
    }
  });

  reset();
  updateTimer();
  update();

  if ("Notification" in window) {
    if (Notification.permission === 'granted') {
      notify = true;
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        notify = permission === 'granted';
      });
    }
  }
}; 
