

let changeLanguage = function(language) {


    const otherLang = language === "EN" ? "CZ" : "EN";
    document.querySelectorAll(`.${otherLang}`).forEach(el => {
	el.classList.add("not-displayed")
	console.log("EN")
    });


    document.querySelectorAll(`.${language}`).forEach(el => {
	el.classList.remove("not-displayed")
    });
}

const langChoice = document.getElementById('lang-choice');
const buttons = langChoice.querySelectorAll('button');

let language = 'EN';

changeLanguage(language)

buttons.forEach(button => {
    button.addEventListener("click", function() {
	buttons.forEach(btn => btn.classList.remove("active"));

	this.classList.add("active");

	language = this.getAttribute("language");
	changeLanguage(language)

    });
});
