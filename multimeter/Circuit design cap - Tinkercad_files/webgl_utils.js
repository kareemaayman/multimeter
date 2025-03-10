/**
 * @preserve Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         WebGLUtils.requestAnimationFrame(canvas, render);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 *
 * To get an animationTime call
 *
 *       timeInMilliSeconds = WebGLUtils.animationFrame();
 */

WebGLUtils = function() {

var requestAnimationFrameImpl_;
var getAnimationTimeImpl_;

/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {Element} canvas. The canvas element to create a
 *     context from.
 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
 *     creation attributes you want to pass in.
 * @param {function(string)} opt_onError An function to call
 *     if there is an error during creation.
 * @return {WebGLRenderingContext} The created context.
 */
var setupWebGL = function(canvas, opt_attribs, opt_onError) {
	
  opt_onError = opt_onError || function() {};

  if (canvas.addEventListener) {
    canvas.addEventListener("webglcontextcreationerror", function(event) {
          opt_onError(event.statusMessage);
        }, false);
  }
	
  var context = create3DContext(canvas, opt_attribs);
  if (!context) {
     opt_onError("");
  }
  return context;
};

/**
 * Creates a webgl context.
 * @param {!Canvas} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLContext} The created context.
 */
var create3DContext = function(canvas, opt_attribs) {
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  return context;
}

/**
 * Returns the animationTime in a cross browser way.
 * @return {number} The current animationTime
 */
var animationTime = function() {
  if (!getAnimationTimeImpl_) {
    getAnimationTimeImpl_ = function() {
      var attribNames = [
        "animationTime",
        "webkitAnimationTime",
        "mozAnimationTime",
        "oAnimationTime",
        "msAnimationTime"
      ];
      for (var ii = 0; ii < attribNames.length; ++ii) {
        var name = attribNames[ii];
        if (window[name]) {
          return function() {
            return window[name];
          };
        }
      }
      return function() {
        return (new Date()).getTime();
      }
    }();
  }
  return getAnimationTimeImpl_();
};

/**
 * Provides requestAnimationFrame in a cross browser
 * way.
 *
 * @param {!Element} element Element to request an animation frame for.
 * @param {function(number): void} callback. Callback that
 *     will be called when a frame is ready.
 */
var requestAnimationFrame = function(element, callback) {
  if (!requestAnimationFrameImpl_) {
    requestAnimationFrameImpl_ = function() {
      var functionNames = [
        "requestAnimationFrame",
        "webkitRequestAnimationFrame",
        "mozRequestAnimationFrame",
        "oRequestAnimationFrame",
        "msRequestAnimationFrame"
      ];
      for (var jj = 0; jj < functionNames.length; ++jj) {
        var functionName = functionNames[jj];
        if (window[functionName]) {
          return function (name) {
            return function(element, callback) {
              window[name].call(window, callback, element);
            };
          }(functionName);
        }
      }
      return function(element, callback) {
           window.setTimeout(callback, 1000 / 70);
        };
    }();
  }

  requestAnimationFrameImpl_(element, callback)
};

return {
  animationTime: animationTime,
  create3DContext: create3DContext,
  requestAnimationFrame: requestAnimationFrame,
  setupWebGL: setupWebGL
};
}();

