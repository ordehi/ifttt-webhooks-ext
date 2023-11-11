document.getElementById('submitBtn').addEventListener('click', function () {
  const url = document.getElementById('urlInput').value;
  if (url) {
    // Call the API and handle the response
    callAPI(url);
  } else {
    displayError('Please enter a URL.');
  }
});

function callAPI(url) {
  // Implement the API calling logic here
  // Use fetch API or XMLHttpRequest to call the IFTTT Webhook
}

function displayResponse(response) {
  const displayArea = document.getElementById('responseDisplay');
  displayArea.innerText = response;
  displayArea.style.display = 'block';
}

function displayError(error) {
  const errorArea = document.getElementById('errorDisplay');
  errorArea.innerText = error;
  errorArea.style.display = 'block';
}
