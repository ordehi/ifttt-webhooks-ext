document.addEventListener('DOMContentLoaded', function () {
  let paramsDiv = document.getElementById('paramsDiv');
  let paramCount = 1;

  document.getElementById('inputType').addEventListener('change', function () {
    let inputType = this.value;
    document.getElementById('jsonInputDiv').style.display =
      inputType === 'json' ? 'block' : 'none';
    document.getElementById('paramsDiv').style.display =
      inputType === 'params' ? 'block' : 'none';
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

  document
    .getElementById('submitBtn')
    .addEventListener('click', async function () {
      let url = document.getElementById('urlInput').value;
      let jsonInput = document.getElementById('jsonInput').value;
      let errorDisplay = document.getElementById('errorDisplay');
      let responseDisplay = document.getElementById('responseDisplay');
      let params = {};

      for (let i = 1; i <= paramCount; i++) {
        let paramName = document.getElementById('paramName' + i);
        let paramValue = document.getElementById('paramValue' + i);
        if (paramName && paramName.value && paramValue && paramValue.value) {
          params[paramName.value] = paramValue.value;
        }
      }

      let data;
      try {
        data = jsonInput ? JSON.parse(jsonInput) : params;
      } catch (error) {
        errorDisplay.textContent = 'Invalid JSON input: ' + error.toString();
        errorDisplay.classList.add('show');
        console.error('Error: ', error);
        return;
      }

      try {
        if (!url) {
          console.log(data);
          responseDisplay.textContent = JSON.stringify(data, null, 2);
          return;
        }

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

        let responseData = await response.json();
        responseDisplay.textContent = JSON.stringify(responseData, null, 2);
      } catch (error) {
        console.error('Error:', error);
        errorDisplay.textContent = 'Error: ' + error.toString();
        errorDisplay.classList.add('show');
      }
    });
});
