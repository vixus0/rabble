window.onload = function () {
  var
    in_minutes = document.getElementById('in_minutes'),
    in_new_member = document.getElementById('in_new_member'),
    btn_start = document.getElementById('btn_start'),
    btn_reset = document.getElementById('btn_reset'),
    ul_gang = document.getElementById('gang_list'),
    div_project = document.getElementById('project'),
    div_timer = document.getElementById('timer'),
    div_cycle = document.getElementById('cycle');
    div_scream = document.getElementById('screamout');

  var set_minutes = parseFloat(in_minutes.value);
  var members = [];
  var running = false;
  var paused = false;
  var notify = false;

  var driver, navigator;

  var seconds = 0;
  var cycle = 0;

  var memberId = function(el) {
    return parseInt(el.getAttribute('id').replace('member-',''));
  };

  var memberEl = function(id) {
    return document.getElementById('member-'+id);
  }

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
    console.log(members);
    if (members.length >= 2) {
      var nm = members.length;
      var navigator_id = cycle % nm;
      var driver_id = (cycle+1) % nm;
      navigator = members[navigator_id];
      driver = members[driver_id];
      members.forEach(function (v,i) { memberEl(i).classList.remove('driver', 'navigator') });
      memberEl(driver_id).classList.add('driver');
      memberEl(navigator_id).classList.add('navigator');
    }
  };

  var scream = function () {
    var body_txt = 'Get more mobbers';
    if (members.length >= 2) {
      body_txt = 'Driver: '+driver+', Navigator: '+navigator;
    }
    div_scream.classList.add('scream');
    div_scream.classList.remove('hide');
    div_scream.textContent = body_txt;

    if (notify) {
      var notification = new Notification('Rotate Pair!', {'body':body_txt});
    }
  };

  var updateCycle = function () {
    if (seconds % (set_minutes * 60) === 0) {
      resetSeconds();
      pause('Continue');
      updatePair();
      scream();
      cycle++;
    }
    div_cycle.textContent = 'Cycle #' + cycle;
  };

  var updateList = function () {
    while (ul_gang.firstChild) ul_gang.removeChild(ul_gang.firstChild);

    members.forEach(function (name, id) {
      var li = document.createElement('li');
      li.textContent = name;
      li.classList.add('member_item');
      li.setAttribute('draggable', 'true');
      li.setAttribute('id', 'member-'+id);

      // Double click - delete
      li.addEventListener('dblclick', function () {
        var el_id = memberId(li);
        members.splice(el_id, 1);
        updateList();
      });

      ul_gang.appendChild(li);
    });
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
    div_scream.classList.add('hide');
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
    div_scream.classList.add('hide');
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
      in_new_member.value = '';
      members.push(name);
      updateList();
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

  var dragged;

  document.addEventListener('dragstart', function (e) {
    dragged = e.target;
    if (dragged.classList.contains('member_item')) {
      name = members[memberId(dragged)];
      e.dataTransfer.setData('text/plain', name);
      e.dataTransfer.setDragImage(dragged, 0, 0);
      dragged.style.opacity = 0.5;
    }
  });

  document.addEventListener('dragend', function (e) {
    dragged = e.target;
    if (dragged.classList.contains('member_item')) {
      dragged.style.opacity = '';
    }
  });

  document.addEventListener('dragover', function (e) {
    e.preventDefault();
  });

  document.addEventListener('dragenter', function (e) {
    var target = e.target;
    if (target.classList.contains('member_item') && target != dragged) {
      target.style.marginBottom = '30px';
    }
  });

  document.addEventListener('dragleave', function (e) {
    var target = e.target;
    if (target.classList.contains('member_item') && target != dragged) {
      target.style.marginBottom = '';
    }
  });

  document.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var target = e.target;
    if (target.classList.contains('member_item') && target != dragged) {
      var name = e.dataTransfer.getData('text/plain');
      var dragged_id = memberId(dragged);
      var target_id = memberId(target);
      if (dragged_id > target_id) {
        members.splice(dragged_id, 1);
        members.splice(target_id+1, 0, name);
      } else {
        members.splice(target_id+1, 0, name);
        members.splice(dragged_id, 1);
      }
      target.style.marginBottom = '';
      updateList();
    }
  });
};
