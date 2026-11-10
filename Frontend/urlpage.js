
//******plus-btn */


const plusbtn = document.getElementById ("plus-btn");
const plusmenu = document.getElementById ("plus-menu");

plusbtn.addEventListener("click", () => {
    plusmenu.classList.toggle("hidden");
    plusbtn.classList.toggle("rotate-224");
});


const copyButton = document.getElementById("copylink");

if (copyButton) {
    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText("https://dezubikpharmacy.vercel.app/");
        alert("link copied!");
    });
}


//******plus-btn2 */


const plusbtn2 = document.getElementById ("plus-btn2");
const plusmenu2 = document.getElementById ("plus-menu2");

plusbtn2.addEventListener("click", () => {
    plusmenu2.classList.toggle("hidden");
    plusbtn2.classList.toggle("rotate-224");
});


const copyButton2 = document.getElementById("copylink2");

if (copyButton2) {
    copyButton2.addEventListener("click", () => {
        navigator.clipboard.writeText("https://www.facebook.com/share/14uMX6gmRgk/");
        alert("link copied!");
    });
}



//******plus-btn3 */


const plusbtn3 = document.getElementById ("plus-btn3");
const plusmenu3 = document.getElementById ("plus-menu3");

plusbtn3.addEventListener("click", () => {
    plusmenu3.classList.toggle("hidden");
    plusbtn3.classList.toggle("rotate-224");
});


const copyButton3 = document.getElementById("copylink3");

if (copyButton3) {
    copyButton3.addEventListener("click", () => {
        navigator.clipboard.writeText("https://www.instagram.com/dezubiksamjones_pharma_/");
        alert("link copied!");
    });
}

//******plus-btn4 */


const plusbtn4 = document.getElementById ("plus-btn4");
const plusmenu4 = document.getElementById ("plus-menu4");

plusbtn4.addEventListener("click", () => {
    plusmenu4.classList.toggle("hidden");
    plusbtn4.classList.toggle("rotate-224");
});


const copyButton4 = document.getElementById("copylink4");

if (copyButton4) {
    copyButton4.addEventListener("click", () => {
        navigator.clipboard.writeText("https://wa.me/2349120909740?text=Hello,I want to make a purchase.");
        alert("link copied!");
    });
}