document.addEventListener('DOMContentLoaded', function () {
  let paramsDiv = document.getElementById('params');
  let paramCount = 1;

  function addRemoveButton(input) {
    let removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', function () {
      input.remove();
      removeBtn.remove();
      paramCount--;
    });
    paramsDiv.appendChild(removeBtn);
  }

  document.getElementById('addParamBtn').addEventListener('click', function () {
    paramCount++;
    let paramDiv = document.createElement('div');
    paramDiv.id = 'paramDiv' + paramCount;

    let newParam = document.createElement('input');
    newParam.type = 'text';
    newParam.id = 'param' + paramCount;
    newParam.name = 'param' + paramCount;
    paramDiv.appendChild(newParam);

    let removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.addEventListener('click', function () {
      paramDiv.remove();
    });
    paramDiv.appendChild(removeBtn);

    paramsDiv.appendChild(paramDiv);
  });

  document.getElementById('submitBtn').addEventListener('click', function () {
    let url = document.getElementById('urlInput').value;
    let jsonInput = document.getElementById('jsonInput').value;
    let params = {};

    for (let i = 1; i <= paramCount; i++) {
      let param = document.getElementById('param' + i);
      if (param && param.value) {
        params['param' + i] = param.value;
      }
    }

    let data = jsonInput ? JSON.parse(jsonInput) : params;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById('responseDisplay').textContent = JSON.stringify(
          data,
          null,
          2
        );
      })
      .catch((error) => {
        console.error('Error:', error);
        document.getElementById('errorDisplay').textContent = error.toString();
      });
  });
});
