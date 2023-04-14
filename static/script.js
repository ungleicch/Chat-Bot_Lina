document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const imageUrls = document.getElementById("image-urls");
    // const videoUrls = document.getElementById("video-urls");
    const chatOutput = document.getElementById("chat-output");
    const backgroundImageUrl = document.getElementById("image-urls").getAttribute("data-background");
    setBackgroundImageAndResize(chatOutput, backgroundImageUrl);


    chatForm.addEventListener("submit", async (event) => {
        event.preventDefault();
    
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;
    
        chatInput.value = "";
        addMessage("User", userMessage, imageUrls.getAttribute("data-user"));
    
        const response = await fetch("/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message_s: userMessage }),
        });
        const data = await response.json();
    
        if (data.image) {
            addImage("Lina", data.image, imageUrls.getAttribute("data-bot"));
        } else if (data.video) {
            addVideo("Lina", data.video, imageUrls.getAttribute("data-bot"));
        } else {
            addMessage("Lina", data.answer, imageUrls.getAttribute("data-bot"));
        }
    });
    

    function addMessage(name, message, imageUrl) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("chat-message");

        messageElement.innerHTML = `
            <img src="${imageUrl}" alt="${name}" class="profile-image">
            <span>${name}:</span>
            <div>${message}</div>
        `;
        chatOutput.appendChild(messageElement);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }

    function addImage(name, imageUrl, profileImageUrl) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("chat-message");

        messageElement.innerHTML = `
            <img src="${profileImageUrl}" alt="${name}" class="profile-image">
            <span>${name}:</span>
            <div><img src="${imageUrl}" alt="Image" class="chat-image"></div>
        `;
        chatOutput.appendChild(messageElement);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }

    function addVideo(name, videoUrl, profileImageUrl) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("chat-message");
    
        messageElement.innerHTML = `
            <img src="${profileImageUrl}" alt="${name}" class="profile-image">
            <span>${name}:</span>
            <div>
                <video src="${videoUrl}" width="320" height="240" controls class="chat-video"></video>
            </div>
        `;
        chatOutput.appendChild(messageElement);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }
    

    async function loadSuggestedPhrases() {
        const response = await fetch("/suggested_phrases");
        const phrases = await response.json();
        const suggestedPhrasesContainer = document.getElementById("suggested-phrases");

        for (const phrase of phrases) {
            const phraseElement = document.createElement("div");
            phraseElement.classList.add("suggested-phrase");
            phraseElement.textContent = phrase;
            suggestedPhrasesContainer.appendChild(phraseElement);

            phraseElement.addEventListener("click", () => {
                chatInput.value = phrase;
            });
        }
    }
    async function setBackgroundImageAndResize(chatOutput, imageUrl) {
        const img = new Image();
        img.src = imageUrl;
      
        img.onload = () => {
          chatOutput.style.width = `${img.width}px`;
          chatOutput.style.height = `${img.height}px`;
          chatOutput.style.backgroundImage = `url(${imageUrl})`;
        };
      }
      

    loadSuggestedPhrases();
});

