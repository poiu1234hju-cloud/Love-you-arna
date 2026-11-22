
// ===============================
// BACKGROUND MUSIC
// ===============================

const music = document.getElementById("music");
const musicButton = document.getElementById("musicButton");

async function toggleMusic() {
  try {
    if (music.paused) {
      await music.play();
      musicButton.textContent = "Ⅱ Pause Tum Se Hi";
    } else {
      music.pause();
      musicButton.textContent = "▶ Play Tum Se Hi";
    }
  } catch (error) {
    musicButton.textContent = "Tap to play music";
  }
}

// ===============================
// PAGE TRANSITIONS
// ===============================

function goToPage(number) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById("page" + number).classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ===============================
// FUNCTIONAL GUITAR
// ===============================

const guitar = document.getElementById("guitar");
const strings = [...document.querySelectorAll(".string")];

const notes = [
  82.41, 110, 146.83,
  196, 246.94, 329.63
];

let audioContext;
let previousY = null;
let isDragging = false;
let playedStrings = new Set();
let guitarCompleted = false;

function initializeAudio() {
  if (!audioContext) {
    audioContext = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playString(index) {
  initializeAudio();

  const oscillator = audioContext.createOscillator();
  const harmonic = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const harmonicGain = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.value = notes[index];

  harmonic.type = "sine";
  harmonic.frequency.value = notes[index] * 2;

  const now = audioContext.currentTime;

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

  harmonicGain.gain.setValueAtTime(0.035, now);
  harmonicGain.gain.exponentialRampToValueAtTime(
    0.001, now + 0.8
  );

  oscillator.connect(gain);
  harmonic.connect(harmonicGain);

  gain.connect(audioContext.destination);
  harmonicGain.connect(audioContext.destination);

  oscillator.start(now);
  harmonic.start(now);

  oscillator.stop(now + 1.5);
  harmonic.stop(now + 0.9);

  strings[index].classList.add("playing");

  setTimeout(() => {
    strings[index].classList.remove("playing");
  }, 250);
}

function detectStrings(oldY, newY) {
  const rect = guitar.getBoundingClientRect();

  strings.forEach((string, index) => {
    const lineY =
      rect.top + 65 + index * 24;

    const crossed =
      (oldY <= lineY && newY >= lineY) ||
      (oldY >= lineY && newY <= lineY);

    if (crossed && !playedStrings.has(index)) {
      playedStrings.add(index);
      playString(index);
    }
  });
}

guitar.addEventListener("pointerdown", event => {
  initializeAudio();

  isDragging = true;
  previousY = event.clientY;
  playedStrings.clear();

  guitar.setPointerCapture(event.pointerId);

  document.getElementById("guitarStatus").textContent =
    "Beautiful melody! Keep playing 🎶";
});

guitar.addEventListener("pointermove", event => {
  if (!isDragging) return;

  detectStrings(previousY, event.clientY);
  previousY = event.clientY;
});

guitar.addEventListener("pointerup", () => {
  if (!isDragging) return;

  isDragging = false;

  if (playedStrings.size >= 2 && !guitarCompleted) {
    guitarCompleted = true;

    document.getElementById("guitarStatus").textContent =
      "That melody was beautiful ❤️";

    setTimeout(() => goToPage(2), 1200);
  } else if (!guitarCompleted) {
    document.getElementById("guitarStatus").textContent =
      "Swipe across at least two strings to continue 🎸";
  }
});

guitar.addEventListener("pointercancel", () => {
  isDragging = false;
});

// ===============================
// PHOTO UPLOAD AND GALLERY
// ===============================

const photoInput = document.getElementById("photoInput");
const gallery = document.getElementById("gallery");

photoInput.addEventListener("change", event => {
  const files = [...event.target.files];

  if (!files.length) return;

  gallery.querySelector(".empty")?.remove();

  files.forEach(file => {
    if (!file.type.startsWith("image/")) return;

    const image = document.createElement("img");
    image.alt = "A special memory";

    const imageURL = URL.createObjectURL(file);
    image.src = imageURL;

    image.addEventListener("load", () => {
      URL.revokeObjectURL(imageURL);
    });

    gallery.appendChild(image);
  });

  photoInput.value = "";
});

// ===============================
// PLAYFUL NEED-TIME BUTTON
// ===============================

const timeButton = document.getElementById("timeButton");
const choiceZone = document.getElementById("choiceZone");

let buttonMoved = false;

function showAnswer(choice) {
  const message = document.getElementById("finalMessage");

  if (choice === "yes") {
    message.textContent =
      "You just made me the happiest person! ❤️ Let's create our own beautiful story together.";
  }

  if (choice === "time") {
    message.textContent =
      "Of course. Take all the time you need. I'll respect your feelings, always. 🌷";
  }

  timeButton.disabled = true;

  if (choice === "yes") {
    document.querySelector(".yes-button").disabled = true;
  }
}

timeButton.addEventListener("click", event => {
  if (!buttonMoved) {
    event.stopPropagation();

    buttonMoved = true;

    const zone = choiceZone.getBoundingClientRect();

    const maxLeft = zone.width - timeButton.offsetWidth;
    const maxTop = zone.height - timeButton.offsetHeight;

    const newLeft = Math.random() * Math.max(0, maxLeft);
    const newTop = Math.random() * Math.max(0, maxTop);

    timeButton.style.left = newLeft + "px";
    timeButton.style.top = newTop + "px";

    document.getElementById("finalMessage").textContent =
      "Hehe! One little surprise 😄 You can still choose honestly.";

  } else {
    showAnswer("time");
  }
});
