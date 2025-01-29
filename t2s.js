const defaultText =
  // "Hello Gentlemen, Per Rob's suggestion I have updated the renewal email. I believe we should send out a membership email then a reminder (or two). With that in mind I split Rob's suggestion over two emails so that the second reminder can have new and interesting content. Take a look at the links below and please provide feedback.";
  "No text selected";
const history = [];

document.addEventListener("DOMContentLoaded", () => {
  if (!("speechSynthesis" in window))
    return alert("Speech Synthesis not supported");

  const speech = new SpeechSynthesisUtterance();
  speech.lang = "en-US";

  function throttle(func, delay) {
    let lastCallTime = 0;

    return function (...args) {
      const now = new Date().getTime();

      if (now - lastCallTime >= delay) {
        lastCallTime = now;
        func.apply(this, args);
      }
    };
  }

  const text = document.querySelector("#text");
  let timer;
  text.addEventListener("input", (event) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const value = event?.target?.value;
      console.log({ value });
      // save value
    }, 1000);
  });
  text.value = defaultText;
  let sentencesToRead = [];
  let sentencesIdx = 0;
  let sentencesEnd = 0;
  const t2s = () => {
    if (sentencesToRead.length && sentencesIdx < sentencesEnd) {
      speech.text = sentencesToRead[sentencesIdx].trim();
      sentencesIdx += 1;
      speechSynthesis.speak(speech);
    }
  };
  speech.onend = () => {
    speechSynthesis.cancel();
    t2s();
  };

  const getParaNSentences = () => {
    let start = text.selectionStart;
    const paragraph = text.value.trim();
    text.value = paragraph;
    text.selectionStart = start;
    const sentences = paragraph.split(/[\.\!\?]/).filter((s) => s.length);
    return { paragraph, sentences, cursor: start };
  };

  document.querySelector("#speak").addEventListener("click", () => {
    const { sentences } = getParaNSentences();
    sentencesToRead = sentences;
    sentencesIdx = 0;
    sentencesEnd = sentencesToRead.length;
    t2s();
  });

  document
    .querySelector("#cancel")
    .addEventListener("click", () => speechSynthesis.cancel());

  document.querySelector("#clear").addEventListener("click", () => {
    text.value = "";
    speechSynthesis.cancel();
  });

  document.querySelector("#copy").addEventListener("click", async () => {
    console.log("from");
    text.value = (await navigator.clipboard.readText()).trim();
  });

  document.querySelector("#show").addEventListener("click", async () => {
    const url = chrome.runtime.getURL("retrieve.html");
    chrome.tabs.create({ active: true, url });
  });
});
