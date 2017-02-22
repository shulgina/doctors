"use strict";

var testState;
var wsStatus = '';

function TestResults() {
  this.ws = null;
  this.webRTC = null;
  this.video = null;
  this.audio = null;
  this.sound = null;
}

function TestModel() {

  this.socket = null;

  this.stream = null;
  this.streamInUseVideo = false;
  this.streamInUseAudio = false;
  this.audioElement = null;
  this.videoElement = null;
  this.working = false;

  this.askingAccess = false;
  this.problemsText = null;
  this.testingWS = false;
  this.hasWebAccess = false;
  this.wsCheckedCount = 0;

  this.testModuleResults = new TestResults();

  this.setTestState = function() {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + 30);

    var c_value = JSON.stringify(this.testModuleResults) +
      "; expires=" +
      exdate.toUTCString();

    document.cookie = 'testState=' +
      c_value +
      ";  path=/";
  };

  this.getTestState = function() {
    var cname = 'testState=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = $.trim(ca[i]);
      if (c.indexOf(cname) == 0) {
        try {
          return JSON.parse(c.substring(cname.length, c.length));
        } catch (e) {
          return new TestResults();
        }
      }
    }
    return new TestResults();
  };

  this.updateModuleState = function() {
    TestConnection();
    if (this.testModuleResults.video !== null) {
      var testBody = $('#optionsTestCamera');
      if (this.testModuleResults.video) {
        testBody.removeClass('testing')
          .removeClass('error')
          .addClass('ok')
          .find('.title')
          .text('Камера работает');
        testBody.find('.test-state-wrapper')
          .removeAttr('title');
      } else {
        testBody.removeClass('testing')
          .removeClass('ok')
          .addClass('error')
          .find('.title')
          .text('Камера не работает');
        testBody.find('.test-state-wrapper')
          .attr('title', 'Проблемы с камерой');
      }
      testBody = $('#testCamera');
      if (testBody) {
        if (this.testModuleResults.video) {
          testBody.removeClass('testing')
            .removeClass('error')
            .addClass('ok')
            .find('.title')
            .text('Камера работает');
          testBody.find('.test-state-wrapper')
            .removeAttr('title');
        } else {
          testBody.removeClass('testing')
            .removeClass('ok')
            .addClass('error')
            .find('.title')
            .text('Камера не работает');
          testBody.find('.test-state-wrapper')
            .attr('title', 'Проблемы с камерой');
        }
      }
    } else {
      TestCamera(testManager.testModuleResults.audio);
    }
    if (this.testModuleResults.audio !== null) {
      var testBody = $('#optionsTestMicrophone');
      if (this.testModuleResults.audio) {
        testBody.removeClass('testing')
          .removeClass('error')
          .addClass('ok')
          .find('.title')
          .text('Микрофон работает');
        testBody.find('.test-state-wrapper')
          .removeAttr('title');
      } else {
        testBody.removeClass('testing')
          .removeClass('ok')
          .addClass('error')
          .find('.title')
          .text('Микрофон не работает');
        testBody.find('.test-state-wrapper')
          .attr('title', 'Проблемы с микрофоном');
      }
      testBody = $('#testMicrophone');
      if (testBody) {
        if (this.testModuleResults.audio) {
          testBody.removeClass('testing')
            .removeClass('error')
            .addClass('ok')
            .find('.title')
            .text('Микрофон работает');
          testBody.find('.test-state-wrapper')
            .removeAttr('title');
        } else {
          testBody.removeClass('testing')
            .removeClass('ok')
            .addClass('error')
            .find('.title')
            .text('Микрофон не работает');
          testBody.find('.test-state-wrapper')
            .attr('title', 'Проблемы с микрофоном');
        }
      }
    } else {
      TestMicrophone(testManager.testModuleResults.video);
    }
    if (this.testModuleResults.sound !== null) {
      var testBody = $('#optionsTestSpeakers');
      if (this.testModuleResults.sound) {
        testBody.removeClass('testing')
          .removeClass('error')
          .addClass('ok')
          .find('.title')
          .text('Динамики работают');
        testBody.find('.test-state-wrapper')
          .removeAttr('title');
      } else {
        testBody.removeClass('testing')
          .removeClass('ok')
          .addClass('error')
          .find('.title')
          .text('Динамики не работают');
        testBody.find('.test-state-wrapper')
          .attr('title', 'Проблемы с динамиками');
      }
      testBody = $('#testSpeakers');
      if (testBody) {
        if (this.testModuleResults.sound) {
          testBody.removeClass('testing')
            .removeClass('error')
            .addClass('ok')
            .find('.title')
            .text('Динамики работают');
          testBody.find('.test-state-wrapper')
            .removeAttr('title');
        } else {
          testBody.removeClass('testing')
            .removeClass('ok')
            .addClass('error')
            .find('.title')
            .text('Динамики не работают');
          testBody.find('.test-state-wrapper')
            .attr('title', 'Проблемы с динамиками');
        }
      }
    } else {
      TestSpeaker();
    }
  };

  this.clearMicrophone = function() {
    if (this.stream &&
      !this.streamInUseVideo &&
      !this.streamInUseAudio) {
      var ts = this.stream.getTracks();
      ts.forEach(function(item) {
        item.stop();
      });
      this.stream = null;
      $('#tempAudio').remove();
    }
  };

  this.clearCamera = function() {
    if (this.stream &&
      !this.streamInUseVideo &&
      !this.streamInUseAudio) {
      var ts = this.stream.getTracks();
      ts.forEach(function(item) {
        item.stop();
      });
      this.stream = null;
      $('.videoCont').empty();
    }
  };

  this.compatible = {
    websocket: false,
    webRTC: false,
    texts: {
      websocketsNotSupported: 'Вы не сможете создать консультацию, так как ваша система не поддерживает технологию WebSocket.<br> Попробуйте найти решение этой проблемы в разделе &laquo;<a href="/help/" target="_blank">Помощь</a>&raquo; или',
      webRTCNotSupported: 'Вы не сможете воспользоваться видео/аудио связью с доктором, так как ваша система не поддерживает технологию WebRTC.'
    }
  };

  this.updateCompabilityBar = function() {
    if (this.testingWS) {
      setTimeout(function() {
        testManager.updateCompabilityBar();
      }, 100);
    } else {
      this.setTestState();
      if (GetCookie('showCompatibilityBar') !== null)
        return;
      if ($('#compatibilityBar').hasClass('visible'))
        return;
      if (!testManager.compatible.websocket) {
        $('#compatibilityBar').addClass('visible')
          .find('.text')
          .html(testManager.compatible.texts.websocketsNotSupported);
      } else if (!testManager.compatible.webRTC) {
        $('#compatibilityBar').addClass('visible')
          .find('.text')
          .html(testManager.compatible.texts.webRTCNotSupported);
      } else {
        $('#compatibilityBar').removeClass('visible');
      }
    }
  };

  this.loadCameraTesting = function(nextDevice) {
    testManager.askingAccess = false;
    if (typeof nextDevice !== 'undefined' &&
      !nextDevice) {
      TestMicrophone();
    }

    var testBody;

    if ($('#consultationWindow').length &&
      typeof $('#consultationWindow').data()['bs.modal'] != 'undefined' &&
      $('#consultationWindow').data()['bs.modal'].isShown) {
      testBody = $('#optionsTestCamera');
    } else {
      testBody = $('#testCamera');
    }
    animateClosingAllowStreamNotification();

    $('.videoCont video').remove();

    this.streamInUseVideo = true;
    this.videoElement = document.createElement('video');
    this.videoElement.src = window.URL.createObjectURL(this.stream);
    testBody.find('.videoCont')
      .empty()
      .append(this.videoElement);
    this.videoElement.controls = false;
    this.videoElement.volume = 0;
    this.videoElement.play();
  };

  this.loadMicrophoneTesting = function(nextDevice) {
    testManager.askingAccess = false;
    if (typeof nextDevice !== 'undefined' &&
      !nextDevice) {
      TestCamera();
    }

    animateClosingAllowStreamNotification();

    this.streamInUseAudio = true;
    this.audioElement = document.createElement('audio');
    this.audioElement.id = 'tempAudio';
    this.audioElement.src = window.URL.createObjectURL(this.stream);
    this.audioElement.style.display = 'none';
    document.body.appendChild(this.audioElement);
    this.audioElement.controls = true;
    this.audioElement.volume = 0;
    this.audioElement.play();
    var audioContext = new AudioContext();
    var analyser = audioContext.createAnalyser();
    var microphone = audioContext.createMediaStreamSource(this.stream);
    var javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
    javascriptNode.onaudioprocess = function() {
      var array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      var values = 0;

      var length = array.length;
      for (var i = 0; i < length; i++) {
        values += array[i];
      }
      var average = values / (10 * length);
      $('.volume').each(function(index) {
        if (average > index) {
          $(this).removeClass('white')
            .addClass('green');
        } else {
          $(this).removeClass('green')
            .addClass('white');
        }
      });
    };
  };

}

var testManager = new TestModel();

navigator.getMedia = (navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia
);


function getFlashMovie(movieName) {
  var isIE = navigator.appName.indexOf("Microsoft") != -1;
  return (isIE) ? window[movieName] : document[movieName];
}

function TestConnection() {
  SetTestingWSState(true);
  TestWSState();
  TestWebSockets();
}

function SetTestingWSState(testing) {
  if (testing) {
    testManager.testingWS = true;
  } else {
    testManager.testingWS = false;
  }
}

function TestWSState() {

  var testBody = $('#optionsTestConnection');
  testBody.find('.test-state-wrapper')
    .removeAttr('title');
  testBody.removeClass('error')
    .removeClass('ok')
    .addClass('testing')
    .find('.title')
    .text('Проверка совместимости браузера');
  testBody.find('.info')
    .text('Модуль тестирования проверяет совместимость вашего браузера.');

  testBody = $('#testConnection');
  if (testBody) {
    testBody.find('.test-state-wrapper')
      .removeAttr('title');
    testBody.removeClass('error')
      .removeClass('ok')
      .addClass('testing')
      .find('.title')
      .text('Проверка совместимости браузера');
    testBody.find('.info')
      .text('Модуль тестирования проверяет совместимость вашего браузера.');
  }

  if (typeof WebSocket === 'undefined') {
    testManager.testModuleResults.ws = false;
    testManager.compatible.websocket = false;
    SetTestingWSState(false);
    return;
  }

  testManager.wsCheckedCount = 0;

  testManager.hasWebAccess = false;
  $.ajax({
    url: '/mobile/user/online_status/',
    dataType: 'json',
    success: function(data) {
      testManager.hasWebAccess = true;
    }
  });

  SetTestingWSState(true);

  testManager.socket = new WebSocket(webSocketHost);

  testManager.socket.onopen = function() {
    testManager.testModuleResults.ws = true;
    testManager.compatible.websocket = true;
    SetTestingWSState(false);
  };
  testManager.socket.onclose = function() {
    testManager.testModuleResults.ws = false;
    testManager.compatible.websocket = false;
    SetTestingWSState(false);
    testManager.socket = null;
  }

}

function TestMediaIOState() {
  var webRTCCompatible = !("undefined" == typeof MediaStreamTrack ||
    !MediaStreamTrack);
  return webRTCCompatible;
}

function TestWebSockets() {
  ++testManager.wsCheckedCount;
  var connectionTestBodyOptions = $('#optionsTestConnection');
  var connectionTestBody = $('#testConnection');

  if (!WebSocketLocal.Socket) {
    WebSocketLocal.Connect();
  }

  setTimeout(function() {
    var checkingState = 'ok';

    var mediaIOTestState = TestMediaIOState();

    if (!mediaIOTestState) {
      checkingState = 'webRTCError';
    }

    if (typeof WebSocketLocal.Socket === 'undefined' ||
      WebSocketLocal.Socket === null) {
      connectionTestBodyOptions.removeClass('testing')
        .removeClass('ok')
        .addClass('error')
        .find('.title')
        .text('Браузер не совместим');
      connectionTestBodyOptions.find('.test-state-wrapper')
        .attr('title', 'Вебсокеты не поддерживаются, либо нет выхода в интернет');
      connectionTestBodyOptions.find('.info')
        .text('Модуль тестирования ожидает отклика сервера (задержка говорит о проблемах со связью)');
      if (connectionTestBody) {
        connectionTestBody.removeClass('testing')
          .removeClass('ok')
          .addClass('error')
          .find('.title')
          .text('Браузер не совместим');
        connectionTestBody.find('.test-state-wrapper')
          .attr('title', 'Вебсокеты не поддерживаются, либо нет выхода в интернет');
        connectionTestBody.find('.info')
          .text('Модуль тестирования ожидает отклика сервера (задержка говорит о проблемах со связью)');
      }
      testManager.testModuleResults.ws = false;
      testManager.testModuleResults.webRTC = false;
      SetTestingWSState(false);
      testManager.updateCompabilityBar();
      return;
    }

    if (WebSocketLocal.Socket.readyState != 1 ||
      !testManager.hasWebAccess) {
      checkingState = 'wsError';
    }

    if (testManager.wsCheckedCount > 6) {
      connectionTestBodyOptions.removeClass('testing')
        .removeClass('ok')
        .addClass('error')
        .find('.title')
        .text('Браузер не совместим');
      connectionTestBodyOptions.find('.test-state-wrapper')
        .attr('title', 'Вебсокеты не поддерживаются, либо нет выхода в интернет');
      connectionTestBodyOptions.find('.info')
        .text('Модуль тестирования ожидает отклика сервера (задержка говорит о проблемах со связью)');
      if (connectionTestBody) {
        connectionTestBody.removeClass('testing')
          .removeClass('ok')
          .addClass('error')
          .find('.title')
          .text('Браузер не совместим');
        connectionTestBody.find('.test-state-wrapper')
          .attr('title', 'Вебсокеты не поддерживаются, либо нет выхода в интернет');
        connectionTestBody.find('.info')
          .text('Модуль тестирования ожидает отклика сервера (задержка говорит о проблемах со связью)');
      }
      testManager.updateCompabilityBar();
    }

    switch (checkingState) {
      case 'webRTCError':
        connectionTestBodyOptions.removeClass('testing')
          .removeClass('ok')
          .addClass('error')
          .find('.title')
          .text('Браузер не совместим');
        connectionTestBodyOptions.find('.test-state-wrapper')
          .attr('title', 'Видеосвязь не поддерживается');
        connectionTestBodyOptions.find('.info')
          .text('Модуль тестирования выявил, что браузер не поддерживает видеосвязи.');
        if (connectionTestBody) {
          connectionTestBody.removeClass('testing')
            .removeClass('ok')
            .addClass('error')
            .find('.title')
            .text('Браузер не совместим');
          connectionTestBody.find('.test-state-wrapper')
            .attr('title', 'Видеосвязь не поддерживается');
          connectionTestBody.find('.info')
            .text('Модуль тестирования выявил, что браузер не поддерживает видеосвязи.');
        }
        testManager.testModuleResults.webRTC = false;
        testManager.compatible.webRTC = false;
        testManager.updateCompabilityBar();
        break;
      case 'wsError':
        TestWebSockets();
        break;

      default:
        connectionTestBodyOptions.removeClass('testing')
          .removeClass('error')
          .addClass('ok')
          .find('.title')
          .text('Браузер совместим');
        connectionTestBodyOptions.find('.test-state-wrapper')
          .removeAttr('title');
        connectionTestBodyOptions.find('.info')
          .text('Модуль тестирования не выявил проблем с интернет-браузером');
        if (connectionTestBody) {
          connectionTestBody.removeClass('testing')
            .removeClass('error')
            .addClass('ok')
            .find('.title')
            .text('Браузер совместим');
          connectionTestBody.find('.test-state-wrapper')
            .removeAttr('title');
          connectionTestBody.find('.info')
            .text('Модуль тестирования не выявил проблем с интернет-браузером');
        }
        testManager.testModuleResults.ws = true;
        testManager.testModuleResults.webRTC = true;
        testManager.compatible.websocket = true;
        testManager.compatible.webRTC = true;
        SetTestingWSState(false);
        testManager.updateCompabilityBar();
    }
    testManager.setTestState();
  }, 500);
}

function TestCamera(nextDevice) {
  if (testManager.askingAccess) {
    return;
  }

  var testBody;

  if ($('#consultationWindow').length &&
    typeof $('#consultationWindow').data()['bs.modal'] != 'undefined' &&
    $('#consultationWindow').data()['bs.modal'].isShown) {
    testBody = $('#optionsTestCamera');
  } else {
    testBody = $('#testCamera');
  }
  if (testBody) {
    testBody.find('.test-state-wrapper')
      .removeAttr('title');
    testBody.removeClass('error')
      .removeClass('ok')
      .addClass('testing')
      .find('.title')
      .text('Проверка веб-камеры');

    if (testManager.stream) {
      testManager.loadCameraTesting(nextDevice);
    } else {
      askingToAllow = true;
      setAchtungText('Требуется доступ к камере и микрофону.');
      setTimeout(function() {
        if (askingToAllow) {
          animateAllowStreamNotification(true);
        }
      }, 3000);

      var constraints = {
        video: true,
        audio: true
      };
      if (typeof navigator.getMedia != 'undefined') {
        testManager.askingAccess = true;
        navigator.getMedia(constraints, function(stream) {

          testManager.stream = stream;
          testManager.loadCameraTesting(nextDevice);

        }, function(e) {
          testManager.askingAccess = false;
          if (typeof nextDevice !== 'undefined') {
            TestMicrophone();
          }
          setAchtungText('Блокирован доступ к камере или микрофону. <a href="/help/39/">Как включить?</a>');
          animateDisabledDeviceNotification(true);
        });
      }

    }
    testManager.working = false;
  }
}

function TestMicrophone(nextDevice) {
  if (testManager.askingAccess) {
    return;
  }

  var testBody;

  if ($('#consultationWindow').length &&
    typeof $('#consultationWindow').data()['bs.modal'] != 'undefined' &&
    $('#consultationWindow').data()['bs.modal'].isShown) {
    testBody = $('#optionsTestMicrophone');
  } else {
    testBody = $('#testMicrophone');
  }
  if (testBody) {
    testBody.find('.test-state-wrapper')
      .removeAttr('title');
    testBody.removeClass('error')
      .removeClass('ok')
      .addClass('testing')
      .find('.title')
      .text('Проверка микрофона');

    var html5AudioHTML = '' +
      '<i></i>' +
      '<div id="indicator">' +
      '<div class="volume-cont">' +
      '<div class="volume" id="1"></div>' +
      '<div class="volume" id="2"></div>' +
      '<div class="volume" id="3"></div>' +
      '<div class="volume" id="4"></div>' +
      '<div class="volume" id="5"></div>' +
      '<div class="volume" id="6"></div>' +
      '<div class="volume" id="7"></div>' +
      '<div class="volume" id="8"></div>' +
      '<div class="volume" id="9"></div>' +
      '<div class="volume last" id="10"></div>' +
      '</div>' +
      '</div>' +
      '';
    testBody.find('.audioCont')
      .empty()
      .append(html5AudioHTML);


    if (testManager.stream) {
      testManager.loadMicrophoneTesting(nextDevice);
    } else {
      askingToAllow = true;
      setAchtungText('Требуется доступ к камере и микрофону.');
      setTimeout(function() {
        if (askingToAllow) {
          animateAllowStreamNotification(true);
        }
      }, 3000);


      var constraints = {
        video: true,
        audio: true
      };
      if (typeof navigator.getMedia != 'undefined') {
        testManager.askingAccess = true;
        navigator.getMedia(constraints, function(stream) {

          testManager.stream = stream;
          testManager.loadMicrophoneTesting(nextDevice);

        }, function(e) {
          testManager.askingAccess = false;
          if (typeof nextDevice !== 'undefined') {
            TestCamera();
          }
          setAchtungText('Блокирован доступ к камере или микрофону. <a href="/help/39/">Как включить?</a>');
          animateDisabledDeviceNotification(true);
        });
      }

    }

  }

}

function TestSpeaker() {

  var testBody;
  if ($('#consultationWindow').length &&
    typeof $('#consultationWindow').data()['bs.modal'] != 'undefined' &&
    $('#consultationWindow').data()['bs.modal'].isShown) {
    testBody = $('#optionsTestSpeakers');
  } else {
    testBody = $('#testSpeakers');
  }

  if (testBody) {
    testBody.find('.test-state-wrapper')
      .removeAttr('title');
    testBody.removeClass('error')
      .removeClass('ok')
      .addClass('testing')
      .find('.title')
      .text('Проверка динамиков');
  }

}
$(document).ready(function() {
  testManager.testModuleResults = testManager.getTestState();

  if ($('#testConnection').length > 0) {
    testManager.updateModuleState();
  }

  $('.confirm').click(function(e) {
    e.preventDefault();
    switch ($(this).parents('.test-block')
      .data('step')) {
      case 'camera':
        testManager.askingAccess = false;
        testManager.streamInUseVideo = false;
        testManager.testModuleResults.video = true;
        testManager.clearCamera();
        var testBody = $('#testCamera');
        testBody.find('.test-state-wrapper')
          .removeAttr('title');
        testBody.removeClass('unknown')
          .removeClass('error')
          .removeClass('testing')
          .addClass('ok')
          .find('.title')
          .text('Веб-камера работает');
        testBody = $('#optionsTestCamera');
        testBody.find('.test-state-wrapper')
          .removeAttr('title');
        testBody.removeClass('unknown')
          .removeClass('error')
          .removeClass('testing')
          .addClass('ok')
          .find('.title')
          .text('Веб-камера работает');
        break;
      case 'microphone':
        testManager.askingAccess = false;
        testManager.streamInUseAudio = false;
        testManager.testModuleResults.audio = true;
        testManager.clearMicrophone();
        var testBody = $('#testMicrophone');
        testBody.find('.test-state-wrapper')
          .removeAttr('title');
        testBody.removeClass('unknown')
          .removeClass('error')
          .removeClass('testing')
          .addClass('ok')
          .find('.title')
          .text('Микрофон работает');
        testBody = $('#optionsTestMicrophone');
        testBody.find('.test-state-wrapper')
          .removeAttr('title');
        testBody.removeClass('unknown')
          .removeClass('error')
          .removeClass('testing')
          .addClass('ok')
          .find('.title')
          .text('Микрофон работает');
        break;
      case 'speaker':
        testManager.testModuleResults.sound = true;
        var testBody = $('#testSpeakers');
        testBody.find('.test-state-wrapper')
          .removeAttr('title');
        testBody.removeClass('unknown')
          .removeClass('error')
          .removeClass('testing')
          .addClass('ok')
          .find('.title')
          .text('Динамики работают');
        testBody = $('#optionsTestSpeakers');
        testBody.find('.test-state-wrapper')
          .removeAttr('title');
        testBody.removeClass('unknown')
          .removeClass('error')
          .removeClass('testing')
          .addClass('ok')
          .find('.title')
          .text('Динамики работают');
        break;
    }
    testManager.setTestState();
  });

  $('.disclaim').click(function(e) {
    e.preventDefault();
    switch ($(this).parents('.test-block').data('step')) {
      case 'camera':
        testManager.askingAccess = false;
        testManager.streamInUseVideo = false;
        testManager.testModuleResults.video = false;
        testManager.clearCamera();
        var testBody = $('#testCamera');
        testBody.find('.test-state-wrapper')
          .attr('title', 'Проблема с камерой');
        testBody.removeClass('unknown')
          .removeClass('ok')
          .removeClass('testing')
          .addClass('error')
          .find('.title')
          .text('Веб-камера не работает');
        testBody = $('#optionsTestCamera');
        testBody.find('.test-state-wrapper')
          .attr('title', 'Проблема с камерой');
        testBody.removeClass('unknown')
          .removeClass('ok')
          .removeClass('testing')
          .addClass('error')
          .find('.title')
          .text('Веб-камера не работает');
        break;
      case 'microphone':
        testManager.askingAccess = false;
        testManager.streamInUseAudio = false;
        testManager.testModuleResults.audio = false;
        testManager.clearMicrophone();
        var testBody = $('#testMicrophone');
        testBody.find('.test-state-wrapper')
          .attr('title', 'Проблема с микрофоном');
        testBody.removeClass('unknown')
          .removeClass('ok')
          .removeClass('testing')
          .addClass('error')
          .find('.title')
          .text('Микрофон не работает');
        testBody = $('#optionsTestMicrophone');
        testBody.find('.test-state-wrapper')
          .attr('title', 'Проблема с микрофоном');
        testBody.removeClass('unknown')
          .removeClass('ok')
          .removeClass('testing')
          .addClass('error')
          .find('.title')
          .text('Микрофон не работает');
        break;
      case 'speaker':
        testManager.testModuleResults.sound = false;
        var testBody = $('#testSpeakers');
        testBody.find('.test-state-wrapper')
          .attr('title', 'Проблема с динамиками');
        testBody.removeClass('unknown')
          .removeClass('ok')
          .removeClass('testing')
          .addClass('error')
          .find('.title')
          .text('Динамики не работают');
        testBody = $('#optionsTestSpeakers');
        testBody.find('.test-state-wrapper')
          .attr('title', 'Проблема с динамиками');
        testBody.removeClass('unknown')
          .removeClass('ok')
          .removeClass('testing')
          .addClass('error')
          .find('.title')
          .text('Динамики не работают');
        break;
    }
    testManager.setTestState();
  });

  $('.test-relaunch, .test-launch').click(function(e) {
    e.preventDefault();
    switch ($(this).parents('.test-block:first').data('step')) {
      case 'connection':
        TestConnection();
        break;
      case 'camera':
        TestCamera();
        break;
      case 'microphone':
        TestMicrophone();
        break;
      case 'speaker':
        TestSpeaker();
        break;
    }
    testManager.setTestState();
  });

  if (typeof Audio === 'undefined') {
    return;
  }

  var play = $('.play-button');
  var song = new Audio('/sounds/default/ringtone.wav');

  song.addEventListener("ended", function() {
    doStop();
    $('.play-button').removeClass('play')
      .addClass('stop');
  });

  song.src = '/sounds/default/ringtone.wav';
  play.click(function(e) {
    e.preventDefault();
    if ($(this).hasClass('stop')) {
      doPlay();
      $(this).removeClass('stop')
        .addClass('play');
    } else {

      doStop();
      $(this).removeClass('play')
        .addClass('stop');
    }
  });

  function doPlay() {
    song.play();
    $('.seek-block').attr('max', song.duration);
  }

  function doStop() {
    song.pause();
    song.currentTime = 0;
  }

  $(".seek-block").bind("change", function() {
    song.currentTime = $(this).val();
    $(".seek-block").attr("max", song.duration);
  });

  song.addEventListener('timeupdate', function() {
    var curtime = parseInt(song.currentTime, 10);
    $(".seek-block").attr("value", curtime);
  });
  song.addEventListener('ended', function() {
    $(this).removeClass('play')
      .addClass('stop');
  });
});
