/**
 * Supports render.html, a piece of the hydration fixture. See /hydration
 */

'use strict';

(function() {
  var Fixture = null;
  var output = document.getElementById('output');
  var status = document.getElementById('status');
  var hydrate = document.getElementById('hydrate');
  var reload = document.getElementById('reload');
  var renders = 0;
  var failed = false;

  var needsReactDOM = getBooleanQueryParam('needsReactDOM');
  var needsCreateElement = getBooleanQueryParam('needsCreateElement');

  function unmountComponent(node) {
    // ReactDOM was moved into a separate package in 0.14
    if (needsReactDOM) {
      ReactDOM.unmountComponentAtNode(node);
    } else if (React.unmountComponentAtNode) {
      React.unmountComponentAtNode(node);
    } else {
      // Unmounting for React 0.4 and lower
      React.unmountAndReleaseReactRootNode(node);
    }
  }

  function createElement(value) {
    // React.createElement replaced function invocation in 0.12
    if (needsCreateElement) {
      return React.createElement(value);
    } else {
      return value();
    }
  }

  function getQueryParam(key) {
    var pattern = new RegExp(key + '=([^&]+)(&|$)');
    var matches = window.location.search.match(pattern);

    if (matches) {
      return decodeURIComponent(matches[1]);
    }

    handleError(new Error('No key found for' + key));
  }

  function getBooleanQueryParam(key) {
    return getQueryParam(key) === 'true';
  }

  function setStatus(label) {
    status.innerHTML = label;
  }

  function render() {
    setStatus('Hydrating');

    var element = createElement(Fixture);

    // ReactDOM was split out into another package in 0.14
    if (needsReactDOM) {
      // Hydration changed to a separate method in React 16
      if (ReactDOM.hydrate) {
        ReactDOM.hydrate(element, output);
      } else {
        ReactDOM.render(element, output);
      }
    } else if (React.render) {
      // React.renderComponent was renamed in 0.12
      React.render(element, output);
    } else {
      React.renderComponent(element, output);
    }

    setStatus(renders > 0 ? 'Re-rendered (' + renders + 'x)' : 'Hydrated');
    renders += 1;
    hydrate.innerHTML = 'Re-render';
  }

  function handleError(error) {
    console.log(error);
    failed = true;
    setStatus('Javascript Error');
    output.innerHTML = error;
  }

  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.async = true;
      script.src = src;

      script.onload = resolve;
      script.onerror = function(error) {
        reject(new Error('Unable to load ' + src));
      };

      document.body.appendChild(script);
    });
  }

  function reloadFixture(code) {
    renders = 0;
    unmountComponent(output);
    injectFixture(code);
  }

  window.onerror = handleError;

  reload.onclick = function() {
    window.location.reload();
  };

  hydrate.onclick = render;
})();
