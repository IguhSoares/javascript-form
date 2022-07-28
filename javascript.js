function validateNameInput(element) {
  if (!element.validity.valid) {
    element.style.setProperty("border-color","var(--invalid-input-border)");
  }
  if (element.validity.patternMismatch) {
    let msg = ""
    if (element.value.length < element.getAttribute("minlength")) {
      msg = "Use pelo menos 3 caracteres (no momento está usando"+
        ` apenas ${element.value.length}).`
    }
    else { msg = "Números não são permitidos."; }
    element.setCustomValidity(msg);
  }
  else {
    element.setCustomValidity("");
    element.style.setProperty("border-color","var(--input-border)");
  }
}


function validateDateInput(element) {
  let msg = "A data de nascimento precisa estar no formato DD/MM/AAAA,"+
    " por exemplo: 31/01/2021.";
  if (!element.validity.valid) {
    element.style.setProperty("border-color","var(--invalid-input-border)");
  }
  if (element.validity.patternMismatch) {
    element.setCustomValidity(msg);
  }
  else {
    element.setCustomValidity("");
    element.style.setProperty("border-color","var(--input-border)");
  }
}


function validateInput(element) {
  let type = element.getAttribute("name");

  if (type === "name") {
    validateNameInput(element);
  }
  else if (type === "birth-date") {
    validateDateInput(element);
  }
}

var setInputValidation = (inputElement) => {
  inputElement.addEventListener("input", () => { validateInput(inputElement); });
}

window.addEventListener("load", () => {
  var nameInput = document.querySelector("#name");
  setInputValidation(nameInput);

  var birthDateInput = document.querySelector("#birth-date");
  setInputValidation(birthDateInput);

  document.querySelector(".js-form").addEventListener("submit", (event) => {
      event.preventDefault();
      console.log(`Nome: ${nameInput.value}\n` +
        `Aniversário: ${birthDateInput.value.replace(
          /(\d{4})-(\d{2})-(\d{2})/,`$3/$2/$1`)}`);
  })
});
