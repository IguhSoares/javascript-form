function getPersonData(nameInput, birthDateInput) {
  return {Nome: nameInput, BirthDate: birthDateInput}
}

function saveDataToStorage(dbName, newData) {
  try {
    var peopleStorage = JSON.parse(window.localStorage.getItem(dbName)) || [];
    if (!Array.isArray(peopleStorage)) { peopleStorage = [peopleStorage] }
    peopleStorage.push(newData);

    localStorage.setItem(dbName, JSON.stringify(peopleStorage));
    return true;
  } catch (error) {
    return error.message;
  }
}


function displaySuccessMessage(newName, messageArea) {
  let newNameMsg = `"${newName}" cadastrado com sucesso!`

  messageArea.prepend(newNameMsg).hide();
  messageArea.addClass("success").removeClass("error");
  messageArea.slideDown("slow", () => {
    setTimeout(() => {
      messageArea.slideUp("slow", () => messageArea.empty());
    }, 2000)
  });
}

function displayErrorMessage(errorMsg, messageArea) {
  messageArea.prepend(`Erro: ${errorMsg}`).hide();
  messageArea.addClass("error").removeClass("success");
  messageArea.slideDown("slow", () => {
    setTimeout(() => {
      messageArea.slideUp("slow", () => messageArea.empty());
    }, 2000)
  });
}


function validateNameInput(element) {
  if (!element.validity.valid) {
    element.style.setProperty("border-color","var(--invalid-input-border)");
  }
  if (element.validity.patternMismatch) {
    let msg = ""
    let name = element.value;
    if (element.value.length < element.getAttribute("minlength")) {
      msg = "Use pelo menos 3 caracteres (no momento está usando"+
        ` apenas ${name.length}).`
    } else if (/^[aA-zZ]{3,}\s*$/.test(name)) {
      msg = "Inserir o nome completo."
    } else if (/\s{2,}|(\s$)/.test(name)) {
      msg = "Remova excesso de espaços entre os nomes ou "+
        "espaço em branco ao final do nome."
    } else if (/\d+/g.test(name)) {
      msg = "Números não são permitidos."; }
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

      newPerson = getPersonData(nameInput.value, birthDateInput.value);

      let dataSaved = saveDataToStorage("Cadastro de Pessoas", newPerson);
      if (dataSaved === true) {
        displaySuccessMessage(nameInput.value, $("#msg"));
      } else {
        displayErrorMessage(dataSaved, $("#msg"));
      }

      event.target.reset();
      document.querySelector("button").blur();
  })
});
