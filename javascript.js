function setToggleIconsHandler(element) {
  element.hover(event => {
    let td = event.target;
    let id = td.getAttribute('id').match(/_(\d+)$/)[1];
    $(`#edit_icon_${id}`).show();
    $(`#edit_icon_${id}`).parent().css('display', 'flex');

    $(`#remove_icon_${id}`).show();
    $(`#remove_icon_${id}`).parent().css('display', 'flex');

    $(`tr[person_id="${id}"]`).hover(
      () => {},
      event => {
        $('span.iconWrapper:visible').hide();
        $(`img[id*="_icon_"]:visible`).hide();
      }
    );
  });
}

function initCancelSubmitHandler(cancelButton, rowBackup, dataIndex) {
  cancelButton.on('click', event => {
    let row = $(`tr[person_id="${dataIndex}"]`);
    row.fadeOut();
    setTimeout(() => {
      row.html(rowBackup);
      row.fadeIn();
      setToggleIconsHandler($(`td[id$="${dataIndex}"].personData`));
    }, 500);
  });
}

function initSubmitEditHandler(button, dbName, dataIndex) {
  button.on('click', event => {
    // pegar valor dos inputs
    var nameInput = $(`#name_${dataIndex}`).val();
    var birthDateInput = $(`#birthdate_${dataIndex}`).val();
    // montar personData obj
    var newData = createPersonData(nameInput, birthDateInput);
    if (newData['error']) {
      displayErrorMessage(newData['message']);
    } else {
      // fazer o update
      updateDataFromStorage(dbName, dataIndex, newData);

      let currentRow = button.parent().parent().parent();
      if (currentRow.parent().children().length === 1) {
        $('thead').css('display', 'block');
      }
      currentRow.hide();
      button.parent().hide();
      let successMessage = `${nameInput} editado com sucesso!`;
      displaySuccessMessage(successMessage, $('#msg'));

      setTimeout(() => {
        $('thead').css('display', '');
        updateTable($('#dbData tbody'), [dataIndex, newData], dataIndex);

        setToggleIconsHandler($(`td[id$="${dataIndex}"].personData`));
      }, 3000);
    }
  });
}

function createEditForm(fieldData) {
  // var editForm = '';
  var editForm = [];
  var id = fieldData.getAttribute('id');
  var object = $(`#${id}`);
  id = id.toLowerCase();

  var newTd = $('<td>', { class: 'tableCell' });
  if (id.match(/name/)) {
    let newInput = $('<input>', {
      id: id,
      maxlength: 120,
      minlength: 3,
      name: 'name',
      required: true,
      type: 'text',
      inputmode: 'text',
      pattern: '^([A-zÁ-ú]{3,})(\\s[A-zÁ-ú]+)(\\s[A-zÁ-ú]+)*$',
      autocomplete: 'name',
      value: object.text(),
    });
    newTd.append(newInput);
    editForm.push(newTd);
  } else if (id.match(/date/)) {
    let regex = /(\d{2})\/(\d{2})\/(\d{4})/;
    let date = object.text().replace(regex, reFormatDate);
    let newDate = new Date(date).toISOString().substring(0, 10);
    let newInput = $('<input>', {
      id: id,
      name: 'birth-date',
      type: 'date',
      inputmode: 'numeric',
      required: true,
      pattern: '^(0[1-9]|1[0-9]|2[0-9]|3[01])/(0[1-9]|1[012])/[0-9]{4}$',
      autocomplete: 'bday',
      value: newDate,
    });
    newTd.append(newInput);
    editForm.push(newTd);
  } else if (id.match(/edit/)) {
    newTd.addClass('iconCell');
    let newSaveIcon = $('<span>', { class: 'saveChangesIcon' });
    let saveIconImg = $('<img>', {
      id: `submit_${id}`,
      title: 'Salvar',
      alt: 'Salvar',
      src: 'imgs/confirm_icon.png',
      type: 'submit',
      class: 'icon clickable',
    });
    newSaveIcon.append(saveIconImg);
    newTd.append(newSaveIcon);
    editForm.push(newTd);

    let anotherTd = $('<td>', { class: 'tableCell iconCell' });
    let newCancelIcon = $('<span>', { class: 'saveChangesIcon' });
    let cancelIconImg = $('<img>', {
      id: `cancel_submit_${id}`,
      title: 'Cancelar',
      alt: 'Cancelar',
      src: 'imgs/cancel_icon.png',
      type: 'submit',
      class: 'icon clickable',
    });
    newCancelIcon.append(cancelIconImg);
    anotherTd.append(newCancelIcon);
    editForm.push(anotherTd);
  }

  return editForm;
}

function formatDate(match, year, month, day) {
  return [day, month, year].join('/');
}

function reFormatDate(match, day, month, year) {
  return [year, month, day];
}

function showTable(tableElement) {
  if (tableElement.is(':hidden')) {
    tableElement.fadeIn();
    tableElement.removeClass('hidden');
  }
}

function generateTableRow(tbodyElement, newEntry) {
  /*
    newEntry -> [id, {key: value, key: value}]
  */
  let index = newEntry[0];
  let newData = newEntry[1];
  // var tr = `<tr person_id="${index}">`;
  var tr = $('<tr>', { person_id: index });

  for (key of Object.keys(newData)) {
    if (key === 'BirthDate') {
      let regex = /(\d{4})-(\d{2})-(\d{2})/;
      newData[key] = newData[key].replace(regex, formatDate);
    }
    let personDataTd = $('<td>', {
      id: `${key}_${index}`,
      class: 'tableCell personData',
    }).text(newData[key]);
    tr.append(personDataTd);
  }
  let newButtonTd = $('<td>', {
    id: `edit_${index}`,
    class: 'tableCell iconCell',
  });
  let editIconImg = $('<img>', {
    id: `edit_icon_${index}`,
    src: 'imgs/edit_icon.png',
    type: 'edit',
    title: 'Editar',
    alt: 'Editar',
    class: 'icon clickable hidden',
  });
  let iconWrapper = $('<span>', { class: 'iconWrapper' }).append(editIconImg);
  newButtonTd.append(iconWrapper);
  tr.append(newButtonTd);

  newButtonTd = $('<td>', {
    id: `remove_${index}`,
    class: 'tableCell iconCell',
  });

  let removeIconImg = $('<img>', {
    id: `remove_icon_${index}`,
    src: 'imgs/remove_icon.png',
    type: 'remove',
    title: 'Remover',
    alt: 'Remover',
    class: 'icon clickable hidden',
  });
  iconWrapper = $('<span>', { class: 'iconWrapper' }).append(removeIconImg);
  newButtonTd.append(iconWrapper);
  tr.append(newButtonTd);

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
      tbodyElement.prepend(generateTableRow(tbodyElement, [index, element]));
    }

    showTable(tbodyElement.parent());
  }
}

function updateTable(tbodyElement, newEntry, row = null) {
  /*
    newEntry -> [id, {key: value, key: value}]
  */
  var tr = generateTableRow(tbodyElement, newEntry);
  tr.addClass('hidden');
  if (row) {
    $(`tr[person_id="${row}"]`).replaceWith(tr);
  } else {
    tbodyElement.prepend(tr);
    showTable(tbodyElement.parent());
  }
  $('tr.hidden').fadeIn('slow');
  $('tr.hidden').removeClass('hidden');
}

function createPersonData(nameInput, birthDateInput) {
  let formatDate = birthDateInput.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (formatDate) {
    birthDateInput = `${formatDate[3]}-${formatDate[2]}-${formatDate[1]}`;
  }

  if (nameInput.length === 0) {
    msg = 'Campo requerido. Favor inserir o nome completo.';
  } else if (nameInput.length < 3) {
    msg =
      'Use pelo menos 3 caracteres (no momento está usando' +
      ` apenas ${nameInput.length}).`;
  } else if (nameInput.length > 120) {
    msg =
      'Nome deve ter no máximo 120 caracteres (no momento está com' +
      ` ${nameInput.length} caracteres).`;
  } else if (/^[aA-zZ]{3,}\s*$/.test(nameInput)) {
    msg = 'Inserir o nome completo.';
  } else if (/\s{2,}|(\s$)/.test(nameInput)) {
    msg =
      'Remova excesso de espaços entre os nomes ou ' +
      'espaço em branco ao final do nome.';
  } else if (/\d+/g.test(nameInput)) {
    msg = 'Números não são permitidos.';
  } else if (!/(\d{4})-(\d{2})-(\d{2})/.test(birthDateInput)) {
    msg = 'Data de nascimento inválida.';
  } else {
    return { Name: nameInput, BirthDate: birthDateInput };
  }
  return { error: true, message: msg };
}

function readDb(dbName) {
  return JSON.parse(window.localStorage.getItem(dbName)) || [];
}

function getDataFromStorage(dbName, dataIndex) {
  var dataBase = readDb(dbName);
  return dataBase[dataIndex];
}

function updateDataFromStorage(dbName, dataIndex, newData) {
  var dataBase = readDb(dbName);
  dataBase[dataIndex] = newData;

  localStorage.setItem(dbName, JSON.stringify(dataBase));

  return newData;
}

function saveDataToStorage(dbName, newData) {
  try {
    var peopleStorage = JSON.parse(window.localStorage.getItem(dbName)) || [];
    if (!Array.isArray(peopleStorage)) {
      peopleStorage = [peopleStorage];
    }
    peopleStorage.push(newData);

    localStorage.setItem(dbName, JSON.stringify(peopleStorage));
    return peopleStorage.length - 1; // Index of the newData in localStorage
  } catch (error) {
    return error.message;
  }
}

function removeDataFromStorage(dbName, index) {
  console.log(index);
  var dataBase = readDb(dbName);
  dataBase.splice(index, 1);

  localStorage.setItem(dbName, JSON.stringify(dataBase));
}

function displaySuccessMessage(message, messageArea = $('#msg')) {
  messageArea.prepend(message).hide();
  messageArea.attr('class', 'success');
  messageArea.slideDown('slow', () => {
    setTimeout(() => {
      messageArea.slideUp('slow', () => messageArea.empty());
    }, 2000);
  });
}

function displayErrorMessage(errorMsg, messageArea = $('#msg')) {
  messageArea.prepend(`${errorMsg}`).hide();
  messageArea.attr('class', 'error');
  messageArea.slideDown('slow', () => {
    setTimeout(() => {
      messageArea.slideUp('slow', () => messageArea.empty());
    }, 2000);
  });
}

function validateNameInput(element) {
  if (!element.validity.valid) {
    element.style.setProperty('border-color', 'var(--invalid-input-border)');
  }
  if (element.validity.patternMismatch || element.validity.valueMissing) {
    let msg = '';
    let name = element.value;
    if (element.value.length < element.getAttribute('minlength')) {
      if (element.validity.valueMissing) {
        msg = 'Campo requerido. Favor inserir o nome completo.';
      } else {
        msg =
          'Use pelo menos 3 caracteres (no momento está usando' +
          ` apenas ${name.length}).`;
      }
    } else if (/^[aA-zZ]{3,}\s*$/.test(name)) {
      msg = 'Inserir o nome completo.';
    } else if (/\s{2,}|(\s$)/.test(name)) {
      msg =
        'Remova excesso de espaços entre os nomes ou ' +
        'espaço em branco ao final do nome.';
    } else if (/\d+/g.test(name)) {
      msg = 'Números não são permitidos.';
    }
    element.setCustomValidity(msg);
  } else {
    element.setCustomValidity('');
    element.style.setProperty('border-color', 'var(--input-border)');
  }
}

function validateDateInput(element) {
  let msg =
    'A data de nascimento precisa estar no formato DD/MM/AAAA,' +
    ' por exemplo: 31/01/2021.';
  if (!element.validity.valid) {
    element.style.setProperty('border-color', 'var(--invalid-input-border)');
  }
  if (element.validity.patternMismatch) {
    element.setCustomValidity(msg);
  } else {
    element.setCustomValidity('');
    element.style.setProperty('border-color', 'var(--input-border)');
  }
}

function validateInput(element) {
  let type = element.getAttribute('name');

  if (type === 'name') {
    validateNameInput(element);
  } else if (type === 'birth-date') {
    validateDateInput(element);
  }
}

function inputValidation(inputElement) {
  inputElement.addEventListener('input', e => {
    validateInput(e.target);
  });
}

function renderEditRow(index) {
  var editForm = [];
  for (data of $(`tr[person_id="${index}"]`).children()) {
    editForm.push(createEditForm(data));
  }

  var rowBackup = $(`tr[person_id="${index}"]`).html();
  $(`tr[person_id="${index}"]`).empty();
  for (td of editForm) {
    $(`tr[person_id="${index}"]`).append(td);
  }
  $('span.saveChangesIcon').css('display', 'flex');

  return rowBackup;
}
window.addEventListener('load', () => {
  var nameInput = document.querySelector('#name');
  inputValidation(nameInput);

  var birthDateInput = document.querySelector('#birth-date');
  inputValidation(birthDateInput);

  var dbKey = 'Cadastro de Pessoas';
  generateTable(dbKey, $('#dbData tbody'));

  document.querySelector('.js-form').addEventListener('submit', event => {
    event.preventDefault();

    newPerson = createPersonData(nameInput.value, birthDateInput.value);

    let newDataIndex = saveDataToStorage(dbKey, newPerson);
    if (Number.isInteger(newDataIndex)) {
      let successMessage = `${nameInput.value} cadastrado com sucesso!`;
      displaySuccessMessage(successMessage, $('#msg'));

      let newData = [newDataIndex, newPerson];
      setTimeout(() => {
        updateTable($('#dbData tbody'), newData);
        setToggleIconsHandler($(`td.personData`));
      }, 3000);
    } else {
      displayErrorMessage(dataSaved, $('#msg'));
    }

    event.target.reset();
    document.querySelector('button').blur();
  });

  document.querySelector('#dbData tbody').addEventListener('click', event => {
    let icon = event.target;
    if ($(icon).hasClass('icon')) {
      var index = icon.getAttribute('id').match(/_(\d+)/)[1];
      var action = $(icon).attr('type');

      if (action === 'edit') {
        let rowBackup = renderEditRow(index);
        let currentRow = $(`tr[person_id="${index}"]`)[0];
        let submitEditBtn = $("img[id^='submit_edit_']");
        let cancelEditBtn = $("img[id^='cancel_submit_edit_']");

        inputValidation(currentRow);
        initSubmitEditHandler(submitEditBtn, dbKey, index);
        initCancelSubmitHandler(cancelEditBtn, rowBackup, index);
      } else if (action === 'remove') {
        let personName = $(`#Name_${index}`).text();
        cxDialog({
          title: 'Confirmar remoção',
          info: `Tem certeza que deseja remover "${personName}" da base de dados?`,
          okText: 'Sim, quero remover',
          noText: 'Cancelar',
          ok: () => {
            removeDataFromStorage(dbKey, index);

            displaySuccessMessage(
              `${personName} removido da base de dados.`,
              $('#msg')
            );
            setTimeout(() => {
              $('#dbData').hide();
              $('#dbData tbody').html('');
              generateTable(dbKey, $('#dbData tbody'));
              setToggleIconsHandler($(`td.personData`));
            }, 3000);
          },
          no: () => {},
        });
      }
    }
  });

  setToggleIconsHandler($(`td.personData`));
});
