
//Translate Button
const transl = document.getElementById("translate");

//Navlink button
const user_nav = document.getElementById("user");
const all_user = document.querySelectorAll(".user")
const price = document.getElementById("price");
const about = document.getElementById("about");

//Stylling translate button
transl.style.backgroundColor = "black";
transl.style.color = "white";
transl.style.padding = "5px 10px";
transl.style.border = "2px solid white";
transl.style.borderRadius = "10px";



//Translation button function
transl.addEventListener("click", () => {
    const cur = transl.textContent.trim().toLowerCase();
    transl.textContent = cur.includes('english') ? 'French' : 'English';
    if (transl.textContent == "English") {
        user_nav.textContent = "Utillisateur";
        price.textContent = "Prix";
        about.textContent = "A propos";
        title.textContent = "Tes Links";
        title.style.fontStyle = "italic";
    }
    else {
        user_nav.textContent = "User";
        price.textContent = "Price";
        about.textContent = "About";
        title.textContent = "Your Links";
    }


});
//Hover
transl.addEventListener("mouseenter", () => {
    transl.style.backgroundColor = "white";
    transl.style.color = "black";
    transl.style.cursor = "pointer";
    transl.style.border = "2px solid white";
    transl.style.padding = "16px";
});
transl.addEventListener("mouseleave", () => {
    transl.style.backgroundColor = "black";
    transl.style.color = "white";
    transl.style.border = "2px solid white";
    transl.style.padding = "7px 10px";
});

all_user.forEach(user => {
    user.addEventListener("click", () => {
        //<a href="./project_chat_page.html"></a>
        let pers = window.location.href = "/project_chat_page.html";
        pers

    });
});
