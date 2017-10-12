/**
 * UI module
 *
 * Adds listeners to DOM elements, and helpers for updating their state
 */

define(function() {

  function addClass(el, className) {
    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  }

  function removeClass(el, className) {
    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }

  function disableButtons() {
    setRunButton(false);
    addClass(document.getElementById("add-variable"), "disabled");
    addClass(document.getElementById("remove-variable"), "disabled");
    document.getElementById("sample_size").setAttribute("disabled", "disabled");
    document.getElementById("repeat").setAttribute("disabled", "disabled");
    removeClass(document.getElementById("stop"), "disabled");
  }

  function enableButtons() {
    setRunButton(true);
    removeClass(document.getElementById("add-variable"), "disabled");
    removeClass(document.getElementById("remove-variable"), "disabled");
    document.getElementById("sample_size").removeAttribute("disabled");
    document.getElementById("repeat").removeAttribute("disabled");
    addClass(document.getElementById("stop"), "disabled");
  }

  function disable(className) {
    addClass(document.getElementById(className), "disabled");
  }

  function enable(className) {
    removeClass(document.getElementById(className), "disabled");
  }

  function setRunButton(showRun) {
    if (showRun) {
      document.getElementById("run").innerHTML = "START";
    } else {
      document.getElementById("run").innerHTML = "PAUSE";
    }
  }

  // Shows the element if no boolean is passed as the second argument.
  // If a bool is passed, this will either show or hide.
  function show(el, show) {
    if (show === undefined) {
      show = true;
    }
    if (show) {
      removeClass(el, "hidden");
    } else {
      addClass(el, "hidden");
    }
  }

  function hide(el) {
    addClass(el, "hidden");
  }

  function renderVariableControls(device) {
    if (device !== "collector") {
      show(document.getElementById("add-variable"));
      show(document.getElementById("remove-variable"));
      hide(document.getElementById("select-collection"));
      hide(document.getElementById("refresh-list"));
    } else {
      hide(document.getElementById("add-variable"));
      hide(document.getElementById("remove-variable"));
      show(document.getElementById("select-collection"));
      show(document.getElementById("refresh-list"));
    }
  }

  function populateContextsList(caseVariables, view, codapCom) {
    return function (collections) {
      var sel = document.getElementById("select-collection");
      sel.innerHTML = "";
      collections.forEach(function (col) {
        if (col.name !== 'Sampler')
          sel.innerHTML += '<option value="' + col.name + '">' + col.name + "</option>";
      });

      if (!sel.innerHTML) {
        sel.innerHTML += "<option>No collections</option>";
        sel.setAttribute("disabled", "disabled");
        return;
      } else {
        sel.removeAttribute("disabled");
      }

      function setVariablesAndRender(vars) {
        // push into existing array, as `variables` is pointing at this
        caseVariables.push.apply(caseVariables, vars);
        view.render();
      }

      if (sel.childNodes.length === 1) {
        codapCom.setCasesFromContext(sel.childNodes[0].value, caseVariables)
          .then(setVariablesAndRender);
      } else {
        sel.innerHTML = "<option>Select a collection</option>" + sel.innerHTML;
        sel.onchange = function(evt) {
          if(evt.target.value) {
            codapCom.setCasesFromContext(evt.target.value).then(setVariablesAndRender);
          }
        };
      }
    };
  }

  function toggleDevice(oldDevice, newDevice) {
    removeClass(document.getElementById(oldDevice), "active");
    addClass(document.getElementById(newDevice), "active");
  }

  function viewSampler() {
    addClass(document.getElementById("tab-sampler"), "active");
    removeClass(document.getElementById("tab-options"), "active");
    show(document.getElementById("sampler"));
    hide(document.getElementById("options"));
  }

  function viewOptions() {
    removeClass(document.getElementById("tab-sampler"), "active");
    addClass(document.getElementById("tab-options"), "active");
    hide(document.getElementById("sampler"));
    show(document.getElementById("options"));
  }

  function appendUIHandlers(addVariable, removeVariable, runButtonPressed, stopButtonPressed,
            resetButtonPressed, switchState, refreshCaseList, setSampleSize, setNumRuns, setSpeed,
            speedText, setVariableName, setHidden) {
    document.getElementById("add-variable").onclick = addVariable;
    document.getElementById("remove-variable").onclick = removeVariable;
    document.getElementById("run").onclick = runButtonPressed;
    document.getElementById("stop").onclick = stopButtonPressed;
    document.getElementById("reset").onclick = resetButtonPressed;
    document.getElementById("mixer").onclick = switchState;
    document.getElementById("spinner").onclick = switchState;
    document.getElementById("collector").onclick = switchState;
    document.getElementById("refresh-list").onclick = refreshCaseList;
    document.getElementById("sample_size").addEventListener('input', function (evt) {
      setSampleSize(this.value * 1);
    });
    document.getElementById("repeat").addEventListener('input', function (evt) {
      setNumRuns(this.value * 1);
    });
    document.getElementById("speed").addEventListener('input', function (evt) {
      var val = (this.value * 1),
          speed = val || 0.5;
      document.getElementById("speed-text").innerHTML = speedText[val];
      setSpeed(speed);
    });
    document.getElementById("variable-name-change").onblur = setVariableName;
    document.getElementById("variable-name-change").onkeypress = function(e) {
      if (e.keyCode === 13) {
        setVariableName();
        return false;
      }
    };
    document.getElementById("tab-sampler").onclick = viewSampler;
    document.getElementById("tab-options").onclick = viewOptions;

    document.getElementById("hideModel").onclick = function(evt) {
      var hidden = evt.currentTarget.checked;
      setHidden(hidden);
      show(document.getElementById("model-cover"), hidden);
    };
  }

  // Sets up the UI elements based on the loaded state of the model
  function render(hidden) {
    show(document.getElementById("model-cover"), hidden);
    document.getElementById("hideModel").checked = hidden;
  }

  return {
    appendUIHandlers: appendUIHandlers,
    enableButtons: enableButtons,
    disableButtons: disableButtons,
    enable: enable,
    disable: disable,
    setRunButton: setRunButton,
    toggleDevice: toggleDevice,
    renderVariableControls: renderVariableControls,
    populateContextsList: populateContextsList,
    render: render
  };
});
