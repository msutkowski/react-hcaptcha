"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var CaptchaScript = function CaptchaScript(cb, hl, endpoint) {
  // Create script to init hCaptcha
  var script = document.createElement("script");

  window.hcaptchaOnLoad = cb;
  script.src = "https://hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaOnLoad";
  script.async = true;

  if (hl) {
    script.src += "&hl=" + hl;
  }

  if (endpoint) {
    script.src += "&endpoint=" + encodeURIComponent(endpoint);
  }

  return script;
};

var hCaptchaVars = {
  domain: 'hcaptcha.com',
  element_id: 'h-captcha',
  iframe_title: 'hCaptcha human verification' //iframe title reference
};

var HCaptcha = function (_React$Component) {
  _inherits(HCaptcha, _React$Component);

  function HCaptcha(props) {
    _classCallCheck(this, HCaptcha);

    var _this = _possibleConstructorReturn(this, (HCaptcha.__proto__ || Object.getPrototypeOf(HCaptcha)).call(this, props));

    _this.removeFrame = _this.removeFrame.bind(_this);
    _this.onloadScript = _this.onloadScript.bind(_this);
    _this.onerrorCaptcha = _this.onerrorCaptcha.bind(_this);
    _this.onsubmitCaptcha = _this.onsubmitCaptcha.bind(_this);
    _this.closeCaptcha = _this.closeCaptcha.bind(_this);
    _this.resetCaptcha = _this.resetCaptcha.bind(_this);

    // https://hcaptcha.com/docs/languages lists available codes.
    _this.languageOverride = props.languageOverride;
    // custom endpoint
    _this.endpoint = props.endpoint;

    _this._id = null;
    _this._removed = false;
    return _this;
  }

  _createClass(HCaptcha, [{
    key: "onloadScript",
    value: function onloadScript() {
      if ((typeof hcaptcha === "undefined" ? "undefined" : _typeof(hcaptcha)) !== undefined) {
        //Render hCaptcha widget and provide neccessary callbacks - hCaptcha
        this._id = hcaptcha.render(hCaptchaVars.element_id, _extends({}, this.props, {
          "error-callback": this.onerrorCaptcha,
          "expired-callback": this.onerrorCaptcha,
          "callback": this.onsubmitCaptcha
        }));
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      //Once captcha is mounted intialize hCaptcha - hCaptcha
      if (typeof hcaptcha === 'undefined') {
        //Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha element - hCaptcha
        var script = CaptchaScript(this.onloadScript, this.languageOverride, this.endpoint);
        document.getElementById(hCaptchaVars.element_id).appendChild(script);
      } else {
        this.onloadScript();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      //If captcha gets removed for timeout or error check to make sure iframe is also removed - hCaptcha
      if (typeof hcaptcha === 'undefined') return;
      if (this._removed === false) this.removeFrame();

      // Reset any stored variables / timers when unmounting
      hcaptcha.reset(this._id);
    }
  }, {
    key: "onsubmitCaptcha",
    value: function onsubmitCaptcha(event) {
      if (typeof hcaptcha === 'undefined') return;

      var token = hcaptcha.getResponse(this._id); //Get response token from hCaptcha widget - hCaptcha
      this.props.onVerify(token); //Dispatch event to verify user response
    }
  }, {
    key: "resetCaptcha",
    value: function resetCaptcha() {
      // Reset captcha state, removes stored token and unticks checkbox
      hcaptcha.reset(this._id);
    }
  }, {
    key: "closeCaptcha",
    value: function closeCaptcha() {
      this.removeFrame();
      appActions.onCaptchaClose();
    }
  }, {
    key: "onerrorCaptcha",
    value: function onerrorCaptcha(e) {
      if (typeof hcaptcha === 'undefined') return;
      hcaptcha.reset(this._id); // If hCaptcha runs into error, reset captcha - hCaptcha
    }
  }, {
    key: "execute",
    value: function execute() {
      if (typeof hcaptcha === 'undefined') return;
      hcaptcha.execute(this._id);
    }
  }, {
    key: "removeFrame",
    value: function removeFrame() {
      var nodes = document.body.childNodes; //Get top level dom elements - hCaptcha
      var foundFrame = false;

      var i = nodes.length;
      var k = void 0,
          src = void 0,
          title = void 0,
          frames = void 0;

      while (--i > -1 && foundFrame === false) {
        //Look for hCaptcha verification iframe appended at document body - hCaptcha
        frames = nodes[i].getElementsByTagName('iframe');

        if (frames.length > 0) {
          for (k = 0; k < frames.length; k++) {
            src = frames[k].getAttribute("src");
            title = frames[k].getAttribute("title");

            if (src.includes(hCaptchaVars.domain) && title.includes(hCaptchaVars.iframe_title)) foundFrame = nodes[i]; //Compare iframe source and title to find correct iframe appeneded to body - hCaptcha
          }
        }
      }

      if (foundFrame) {
        document.body.removeChild(foundFrame);
        this._removed = true;
      }
    }
  }, {
    key: "render",
    value: function render() {

      return React.createElement(
        "div",
        null,
        React.createElement("div", { id: hCaptchaVars.element_id })
      );
    }
  }]);

  return HCaptcha;
}(React.Component);

module.exports = HCaptcha;