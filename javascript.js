function formatDate(match, year, month, day) {
  return [day, month, year].join("/");
}


function showTable(tableElement) {
  if (tableElement.is(":hidden")) {
    tableElement.fadeIn();
    tableElement.removeClass("hidden");
  }
}


function generateTableRow(tbodyElement, newEntry) {
  /*
    newEntry -> [id, {key: value, key: value}]
  */
  let index = newEntry[0];
  let newData = newEntry[1];
  var tr = `<tr person_id="${index}">`;

  for (key of Object.keys(newData)) {
    if (key === "BirthDate") {
      let regex = /(\d{4})-(\d{2})-(\d{2})/;
      newData[key] = newData[key].replace(regex, formatDate);
    }

    tr += `<td id="${key}_${index}" class="tableCell">${newData[key]}</td>`;
  }
  tr += "</tr>";

  return tr;
}


function generateTable(dbName, tbodyElement) {
  // Ler as entradas do localStorage
  let dbEntries = JSON.parse(window.localStorage.getItem(dbName)) || [];
  // Se não houver entradas, nao exibe tabela
  if (dbEntries.length > 0) {
    // Para cada item, gerar uma <tr> com os dados
    var entries = dbEntries.entries();
    for ([index, element] of entries) {
      tbodyElement.prepend(generateTableRow(tbodyElement,[index, element]));
    }

    showTable(tbodyElement.parent());
  }
}


function updateTable(tbodyElement, newEntry) {
  /*
    newEntry -> [id, {key: value, key: value}]
  */
  var tr = generateTableRow(tbodyElement, newEntry);
  tr = tr.replace("<tr ", '<tr class="hidden"');
  tbodyElement.prepend(tr);
  showTable(tbodyElement.parent());
  $("tr.hidden").fadeIn("slow");
  $("tr.hidden").removeClass("hidden");
}

function getPersonData(nameInput, birthDateInput) {
  return {Nome: nameInput, BirthDate: birthDateInput}
}

function saveDataToStorage(dbName, newData) {
  try {
    var peopleStorage = JSON.parse(window.localStorage.getItem(dbName)) || [];
    if (!Array.isArray(peopleStorage)) { peopleStorage = [peopleStorage] }
    peopleStorage.push(newData);

    localStorage.setItem(dbName, JSON.stringify(peopleStorage));
    return peopleStorage.length; // Index of the newData in localStorage
  } catch (error) {
    return error.message;
  }
}


function displaySuccessMessage(newName, messageArea) {
  let newNameMsg = `"${newName}" cadastrado com sucesso!`

  messageArea.prepend(newNameMsg).hide();
  messageArea.attr("class", "success");
  messageArea.slideDown("slow", () => {
    setTimeout(() => {
      messageArea.slideUp("slow", () => messageArea.empty());
    }, 2000)
  });
}

function displayErrorMessage(errorMsg, messageArea) {
  messageArea.prepend(`Erro: ${errorMsg}`).hide();
  messageArea.attr("class", "error");
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


function InputValidation(inputElement) {
  inputElement.addEventListener("input", () => { validateInput(inputElement); });
}


window.addEventListener("load", () => {
  var nameInput = document.querySelector("#name");
  InputValidation(nameInput);

  var birthDateInput = document.querySelector("#birth-date");
  InputValidation(birthDateInput);

  var dbKey = "Cadastro de Pessoas";
  generateTable(dbKey, $("#dbData tbody"));

  document.querySelector(".js-form").addEventListener("submit", (event) => {
      event.preventDefault();

      newPerson = getPersonData(nameInput.value, birthDateInput.value);

      let newDataIndex = saveDataToStorage(dbKey, newPerson);
      if (Number.isInteger(newDataIndex)) {
        displaySuccessMessage(nameInput.value, $("#msg"));

        let newData = [newDataIndex, newPerson]
        setTimeout(() => updateTable($("#dbData tbody"), newData), 3000);

      } else {
        displayErrorMessage(dataSaved, $("#msg"));
      }

      event.target.reset();
      document.querySelector("button").blur();
  })
});
