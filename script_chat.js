const frBtn = document.getElementById("fr-btn");
const enBtn = document.getElementById("en-btn");

const title = document.querySelector(".title");
const users = document.querySelectorAll(".user");

const receiver_Image = document.querySelector("[data-receiver]");
const receiver_Name = document.querySelector(".username_receiver");

const submit_btn = document.getElementById("send_button");
const text_input = document.querySelector(".text_input");
const footerText = document.querySelector(".footer-bottom");

frBtn.addEventListener("click", () => {
    title.textContent = "Tes Links";
    submit_btn.textContent = "Envoyer";
    text_input.placeholder = "Tapez votre message ici...";

    document.querySelectorAll("nav a")[0].textContent = "Accueil";
    document.querySelectorAll("nav a")[1].textContent = "Utilisateur";
    document.querySelectorAll("nav a")[2].textContent = "Prix";
    document.querySelectorAll("nav a")[3].textContent = "À propos";

    footerText.textContent = "© 2025 Links. Tous droits réservés.";
});

enBtn.addEventListener("click", () => {
    title.textContent = "Your Links";
    submit_btn.textContent = "Send";
    text_input.placeholder = "Type your message here...";

    document.querySelectorAll("nav a")[0].textContent = "Home";
    document.querySelectorAll("nav a")[1].textContent = "User";
    document.querySelectorAll("nav a")[2].textContent = "Pricing";
    document.querySelectorAll("nav a")[3].textContent = "About";

    footerText.textContent = "© 2025 MySite. All rights reserved.";
});

users.forEach(user => {
    user.addEventListener("click", () => {
        const img = user.querySelector(".user-profile-picture").src;
        const name = user.querySelector(".username").textContent;

        receiver_Image.src = img;
        receiver_Name.textContent = name;
    });
});

const text_input_container = document.getElementById("text_input_container");
text_input_container.style.display = "flex";
text_input_container.style.justifyContent = "center";
text_input_container.style.alignItems = "center";
text_input_container.style.flexDirection = "column";
text_input_container.style.margin = "auto";
