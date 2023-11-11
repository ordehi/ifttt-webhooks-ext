let paramCount = 1;

function setInputType(inputType) {
  let inputTypeSelect = document.getElementById('inputType');
  let jsonInputDiv = document.getElementById('jsonInputDiv');
  let paramsDiv = document.getElementById('paramsDiv');

  jsonInputDiv.style.display = inputType === 'json' ? 'block' : 'none';
  paramsDiv.style.display = inputType === 'params' ? 'block' : 'none';

  inputTypeSelect.value = inputType;
}

function saveState() {
  let url = document.getElementById('urlInput').value;
  let jsonValue = document.getElementById('jsonInput').value;
  let params = collectParams(paramCount);
  let inputType = document.getElementById('inputType').value;

  chrome.storage.local.set({ url, jsonValue, params, inputType });
}

function collectParams(paramCount) {
  let params = {};
  for (let i = 1; i <= paramCount; i++) {
    let paramName = document.getElementById('paramName' + i);
    let paramValue = document.getElementById('paramValue' + i);
    if (paramName && paramName.value && paramValue && paramValue.value) {
      params[paramName.value] = paramValue.value;
    }
  }
  return params;
}

function addParameter(id, name = '', value = '', paramsDiv) {
  let paramDiv = document.createElement('div');
  paramDiv.id = 'paramDiv' + id;

  let paramName = document.createElement('input');
  paramName.type = 'text';
  paramName.id = 'paramName' + id;
  paramName.value = name;
  paramName.placeholder = 'Parameter Name';
  paramDiv.appendChild(paramName);

  let paramValue = document.createElement('input');
  paramValue.type = 'text';
  paramValue.id = 'paramValue' + id;
  paramValue.value = value;
  paramValue.placeholder = 'Parameter Value';
  paramDiv.appendChild(paramValue);

  let removeBtn = document.createElement('button');
  removeBtn.textContent = 'X';
  removeBtn.addEventListener('click', function () {
    paramDiv.remove();
  });
  paramDiv.appendChild(removeBtn);

  paramsDiv.appendChild(paramDiv);
}

// Save state when popup is closed
window.addEventListener('unload', function () {
  let url = document.getElementById('urlInput').value;
  let jsonValue = document.getElementById('jsonInput').value;
  let inputType = document.getElementById('inputType').value;
  let params = collectParams(paramCount);

  let storageData = {};

  if (url) {
    storageData.url = url;
  }

  if (jsonValue) {
    storageData.jsonValue = jsonValue;
  }

  if (Object.keys(params).length > 0) {
    storageData.params = params;
  }

  storageData.inputType = inputType;
  chrome.storage.local.set(storageData);
});

document.addEventListener('DOMContentLoaded', function () {
  let appForm = document.getElementById('appForm');
  let paramsDiv = document.getElementById('paramsDiv');
  let urlInput = document.getElementById('urlInput');
  let jsonInput = document.getElementById('jsonInput');
  let inputTypeSelect = document.getElementById('inputType');

  appForm.addEventListener('input', saveState);

  chrome.storage.local.get(
    ['url', 'jsonValue', 'params', 'inputType'],
    function (result) {
      if (result.url) {
        urlInput.value = result.url;
      }

      if (result.jsonValue) {
        jsonInput.value = result.jsonValue;
      }

      if (result.params) {
        Object.keys(result.params).forEach((key, index) => {
          paramCount = index + 1; // Update paramCount
          addParameter(paramCount, key, result.params[key], paramsDiv);
        });
      }

      if (result.inputType) {
        setInputType(result.inputType);
      }
    }
  );

  inputTypeSelect.addEventListener('change', function () {
    let inputType = this.value;
    setInputType(inputType);
  });

  document.getElementById('addParamBtn').addEventListener('click', function () {
    paramCount++;
    let paramDiv = document.createElement('div');
    paramDiv.id = 'paramDiv' + paramCount;

    let paramName = document.createElement('input');
    paramName.type = 'text';
    paramName.id = 'paramName' + paramCount;
    paramName.placeholder = 'Parameter Name';
    paramDiv.appendChild(paramName);

    let paramValue = document.createElement('input');
    paramValue.type = 'text';
    paramValue.id = 'paramValue' + paramCount;
    paramValue.placeholder = 'Parameter Value';
    paramDiv.appendChild(paramValue);

    let removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.addEventListener('click', function () {
      paramDiv.remove();
    });
    paramDiv.appendChild(removeBtn);

    paramsDiv.appendChild(paramDiv);
  });

  appForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    let url = urlInput.value;
    let jsonValue = jsonInput.value;
    let errorDisplay = document.getElementById('errorDisplay');
    let responseDisplay = document.getElementById('responseDisplay');
    let params = collectParams(paramCount);
    let inputType = inputTypeSelect.value;

    let errorMessages = [];
    if (!url) {
      errorMessages.push('URL');
    }

    let data;
    if (inputType === 'json') {
      if (!jsonValue) {
        errorMessages.push('JSON');
      } else {
        try {
          data = JSON.parse(jsonValue);
        } catch (error) {
          errorDisplay.textContent = 'Invalid JSON input: ' + error.toString();
          errorDisplay.classList.add('show');
          console.error('Error: ', error);
          return;
        }
      }
    } else if (inputType === 'params') {
      if (Object.keys(params).length === 0) {
        errorMessages.push('params');
      } else {
        data = params;
      }
    }

    if (errorMessages.length > 0) {
      errorDisplay.textContent =
        'Error: Please input the following: ' + errorMessages.join(', ') + '.';
      errorDisplay.classList.add('show');
      return;
    }

    try {
      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('HTTP error ' + response.status);
      }

      if (response.status === 200) {
        appForm.reset();

        chrome.storage.local.clear(function () {
          let error = chrome.runtime.lastError;
          if (error) {
            console.error(error);
          }
        });
      }

      let responseData = await response.text();

      errorDisplay.textContent = '';
      errorDisplay.classList.remove('show');

      responseDisplay.textContent = responseData;
      responseDisplay.classList.add('show');
    } catch (error) {
      console.error('Error:', error);

      responseDisplay.textContent = '';
      responseDisplay.classList.remove('show');

      errorDisplay.textContent = 'Error: ' + error.toString();
      errorDisplay.classList.add('show');
    }
  });
});
