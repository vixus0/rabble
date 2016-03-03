window.onload = function () {
  function isRunning() { 
    return ('RABBLE_RUN' in window)? window.RABBLE_RUN : false;
  }

  function setRunning(bool) { 
    window.RABBLE_RUN = bool;
  }

  function updateTimer(seconds) {
    var div_timer = document.getElementById('timer');
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    div_timer.textContent = mins + ':' + (secs < 10)? '0' + secs : secs;
  }

  function updateCycle(cycle) {
    document.getElementById('cycle').textContent = 'Cycle #' + cycle;
  }

  function updateStartButton(text, action) {
    var btn_start = document.getElementById('btn_start');
    btn_start.textContent = text;
    btn_start.removeEventListener('click');
    btn_start.addEventListener('click', action);
  }

  function memberId(el) {
    return parseInt(el.getAttribute('id').replace('member-',''));
  }

  function memberEl(id) {
    return document.getElementById('member-'+id);
  }

  function getSetSeconds() {
    var set_minutes = parseFloat(document.getElementById('in_minutes').value) || 10.0;
    return Math.floor(set_minutes * 60);
  };

  function getBreakCycles() {
    return parseInt(document.getElementById('in_break').value) || 6;
  };

  function init() {
    var btn_start = document.getElementById('btn_start');
    updateStartButton('Start', start);
  }

  function unpause() {
     
  }

  function pause() {
    setRunning(false);
  }

  function stop() {
    setRunning(false);
  }

  function start() {
    setRunning(true);
    update(0, 0);
  }

  function update(current_cycle, elapsed_seconds) {
    var cycle_seconds = getSetSeconds();
    var break_cycles = getBreakCycles();

    if (elapsed_seconds > cycle_seconds) {
      current_cycle += 1;
      elapsed_seconds = 0;

      if (current_cycle % break_cycles == 0) {
        breakTime();
      } else {
        nextCycle();
      }
    }

    if (isRunning()) {
      elapsed_seconds += 1;
    }

    window.setTimeout(update, 1000, current_cycle, elapsed_seconds);
  }

  var
    in_break = document.getElementById('in_break'),
    in_new_member = document.getElementById('in_new_member'),
    btn_reset = document.getElementById('btn_reset'),
    ul_gang = document.getElementById('gang_list'),
    div_scream = document.getElementById('screamout'),

    set_minutes = parseFloat(in_minutes.value),
    set_break = parseInt(in_break.value),
    members = [],
    running = false,
    paused = false,
    notify = false,
    seconds = 0,
    cycle = 0
    driver, 
    navigator
    ;

  var updatePair = function () {
    if (members.length >= 2) {
      var nm = members.length;
      var driver_id = cycle % nm;
      driver = members[driver_id];
      members.forEach(function (v,i) { memberEl(i).classList.remove('driver', 'navigator') });
      memberEl(driver_id).classList.add('driver');
      // navigator = members[navigator_id];
      // memberEl(navigator_id).classList.add('navigator');
    }
  };

  var scream = function () {
    var scream_title;
    div_scream.classList.remove('hide', 'break', 'scream');
    if (cycle > 0 && cycle % set_break == 0) {
      div_scream.classList.add('break');
      scream_title = 'Why not take a break?';
    } else {
      div_scream.classList.add('scream');
      scream_title = 'Rotate!';
    }

    var scream_body;
    if (members.length >= 2) {
      scream_body = 'Driver: '+driver+', Navigator: '+navigator;
    } else {
      scream_body = 'Get more mobbers!';
    }

    div_scream.innerHTML = scream_title + '<br><br>' + scream_body;

    if (notify) {
      var notification = new Notification(scream_title, {'body':scream_body});
      notification.addEventListener('click', function () {
        hitStart();
      })
    }
  }

  var updateList = function () {
    while (ul_gang.firstChild) ul_gang.removeChild(ul_gang.firstChild)

    members.forEach(function (name, id) {
      var li = document.createElement('li')
      li.textContent = name
      li.classList.add('member_item')
      li.setAttribute('draggable', 'true')
      li.setAttribute('id', 'member-'+id)

      // Double click - delete
      li.addEventListener('dblclick', function () {
        var el_id = memberId(li)
        members.splice(el_id, 1)
        updateList()
      })

      ul_gang.appendChild(li)
    })
  }

  var update = function () {
    if (running && !paused) {
      if (seconds % (set_minutes * 60) === 0) {
        resetSeconds()
        pause('Continue')
        updatePair()
        scream()
        cycle++
      }
      updateTimer(seconds)
      seconds--
    }
    window.setTimeout(update, 1000)
  }

  var unpause = function () {
    paused = false
    btn_start.textContent = 'Pause'
    div_scream.classList.add('hide')
  }

  var pause = function (txt) {
    paused = true
    btn_start.textContent = (txt)? txt:'Unpause'
  }

  var start = function () {
    running = true
    cycle = 0
    unpause()
    resetSeconds()
  }

  var reset = function () {
    running = false
    btn_start.textContent = 'Start'
    div_scream.classList.add('hide')
    resetSeconds()
  }

  var hitStart = function () {
    if (running) {
      if (paused) {
        unpause()
      } else {
        pause()
      }
    } else {
      start()
    }
  }

  btn_start.addEventListener('click', hitStart)

  btn_reset.addEventListener('click', function () {
    reset()
  })

  in_minutes.addEventListener('change', function () {
    if (!running) {
      resetSeconds()
      updateTimer(seconds)
    }
  })

  in_break.addEventListener('change', function () {
    if (!running) {
      set_break = parseInt(in_break.value)
    }
  })

  in_new_member.addEventListener('change', function () {
    var name = in_new_member.value.trim()
    if (name) {
      in_new_member.value = ''
      members.push(name)
      updateList()
    }
  })

  reset()
  updateTimer(seconds)
  update()

  if ('Notification' in window) {
    Notification.requestPermission()
      .then(function(){notify = true})
      .catch(function(){notify = false})
  }

  var dragged

  document.body.addEventListener('keyup', function (e) {
    if (e.keyCode === 32) {
      e.preventDefault()
      hitStart()
    }
  })

  document.addEventListener('dragstart', function (e) {
    dragged = e.target
    if (dragged.classList.contains('member_item')) {
      name = members[memberId(dragged)]
      e.dataTransfer.setData('text/plain', name)
      e.dataTransfer.setDragImage(dragged, 0, 0)
      dragged.style.opacity = 0.5
    }
  })

  document.addEventListener('dragend', function (e) {
    dragged = e.target
    if (dragged.classList.contains('member_item')) {
      dragged.style.opacity = ''
    }
  })

  document.addEventListener('dragover', function (e) {
    var target = e.target
    if (target.classList.contains('member_item') && target != dragged) {
      e.preventDefault()
    }
  })

  document.addEventListener('dragenter', function (e) {
    var target = e.target
    if (target.classList.contains('member_item') && target != dragged) {
      e.preventDefault()
      target.style.marginBottom = '30px'
    }
  })

  document.addEventListener('dragleave', function (e) {
    var target = e.target
    if (target.classList.contains('member_item') && target != dragged) {
      target.style.marginBottom = ''
    }
  })

  document.addEventListener('drop', function (e) {
    e.preventDefault()
    var target = e.target
    if (target.classList.contains('member_item') && target != dragged) {
      var name = e.dataTransfer.getData('text/plain')
      var dragged_id = memberId(dragged)
      var target_id = memberId(target)
      if (dragged_id > target_id) {
        members.splice(dragged_id, 1)
        members.splice(target_id+1, 0, name)
      } else {
        members.splice(target_id+1, 0, name)
        members.splice(dragged_id, 1)
      }
      target.style.marginBottom = ''
      updateList()
      updateCycle()
    }
  })
}
