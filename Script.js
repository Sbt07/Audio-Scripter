const recordBtn = document.querySelector(".record"),
  result = document.querySelector(".result"),
  copyBtn = document.querySelector(".copy"),
  inputLanguage = document.querySelector("#language"),
  clearBtn = document.querySelector(".clear");

let SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition,
  recognition,
  recording = false,
  timeout;

function populateLanguages() {
  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.code;
    option.innerHTML = lang.name;
    inputLanguage.appendChild(option);
  });
}

populateLanguages();

function speechToText() {
  try {
    recognition = new SpeechRecognition();
    recognition.lang = inputLanguage.value;
    recognition.interimResults = true;
    recordBtn.classList.add("recording");
    recordBtn.querySelector("p").innerHTML = "Listening...";
    recognition.start();
    clearTimeout(timeout); // Clear any previous timeout
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      // detect when interim results
      if (event.results[0].isFinal) {
        result.innerHTML += " " + speechResult;
        result.querySelector("p").remove();
      } else {
        // create p with class interim if not already there
        if (!document.querySelector(".interim")) {
          const interim = document.createElement("p");
          interim.classList.add("interim");
          result.appendChild(interim);
        }
        // update the interim p with the speech result
        document.querySelector(".interim").innerHTML = " " + speechResult;
      }
      copyBtn.disabled = false;
      resetTimeout();
    };
    recognition.onspeechend = () => {
      resetTimeout();
    };
    recognition.onerror = (event) => {
      stopRecording();
      if (event.error === "no-speech") {
        alert("No speech was detected. Stopping...");
      } else if (event.error === "audio-capture") {
        alert("No microphone was found. Ensure that a microphone is installed.");
      } else if (event.error === "not-allowed") {
        alert("Permission to use microphone is blocked.");
      } else if (event.error === "aborted") {
        alert("Listening Stopped.");
      } else {
        alert("Error occurred in recognition: " + event.error);
      }
    };
  } catch (error) {
    recording = false;
    console.log(error);
  }
}

recordBtn.addEventListener("click", () => {
  if (!recording) {
    speechToText();
    recording = true;
  } else {
    stopRecording();
  }
});

function stopRecording() {
  clearTimeout(timeout); // Clear any existing timeout
  recognition.stop();
  recordBtn.querySelector("p").innerHTML = "Start Listening";
  recordBtn.classList.remove("recording");
  recording = false;
}

function resetTimeout() {
  clearTimeout(timeout); // Clear existing timeout
  timeout = setTimeout(() => {
    // This function will be called after a period of no speech input
    stopRecording(); // Stop recording after the timeout
  }, 3000); // Adjust the timeout duration as needed (e.g., 3 seconds)
}

function copyToClipboard() {
  const text = result.innerText;
  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = text;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextarea);
  alert("Text copied to clipboard!");
}

copyBtn.addEventListener("click", copyToClipboard);

clearBtn.addEventListener("click", () => {
  result.innerHTML = "";
  copyBtn.disabled = true;
});
