const asyncTimeout = miliseconds => {
  return new Promise(resolve => {
    setTimeout(resolve, miliseconds);
  });
};
const jsDateFormatRegEx = /(\d{4})-(\d{2})-(\d{2})/;
const myDateFormatRegEx = /(\d{2})\/(\d{2})\/(\d{4})/;

class LocalStorageDb {
  constructor(dbName) {
    this.dbName = dbName;
    this.data = this.#readDb();
  }

  #readDb() {
    return JSON.parse(window.localStorage.getItem(this.dbName)) || [];
  }

  #writeDb() {
    try {
      localStorage.setItem(this.dbName, JSON.stringify(this.data));
    } catch (error) {
      throw error;
    }
  }

  update(person) {
    this.data[person.id] = { name: person.name, birthdate: person.birthdate };
    try {
      this.#writeDb();

      return newData;
    } catch (error) {
      return error.message;
    }
  }

  save(person) {
    this.data.push({ name: person.name, birthdate: person.birthdate });

    try {
      this.#writeDb();

      return this.data.length - 1; // Index of the newData in localStorage
    } catch (error) {
      return error.message;
    }
  }

  delete(index) {
    this.data.splice(index, 1);
    try {
      this.#writeDb();
      return index;
    } catch (error) {
      return error.message;
    }
  }
}

class Person {
  constructor(name, birthdate, dbIndex = null) {
    this.id = dbIndex;
    this.name = name;
    this.birthdate = birthdate;
  }
}

class Validate {
  static name(name, length = { min: 3, max: 120 }) {
    let msg = false;
    if (name.length === 0) {
      msg = 'Campo requerido. Favor inserir o nome completo.';
    } else if (name.length < length.min) {
      msg =
        `Use pelo menos ${length.min} caracteres (no momento está usando` +
        ` apenas ${name.length}).`;
    } else if (name.length > length.max) {
      msg =
        `Nome deve ter no máximo ${length.max} caracteres (no momento está com` +
        ` ${name.length} caracteres).`;
    } else if (/^[A-zÁ-ú]+\s*$/.test(name)) {
      msg = 'Inserir o nome completo.';
    } else if (/\s{2,}|(\s$)/.test(name)) {
      msg =
        'Remova excesso de espaços entre os nomes ou ' +
        'espaço em branco ao final do nome.';
    } else if (/\d+/g.test(name)) {
      msg = 'Números não são permitidos.';
    }

    if (msg) {
      return { message: msg };
    } else {
      return { name: name };
    }
  }

  static date(birthDate) {
    const dateFormat = this.checkDateFormat(birthDate);
    if (dateFormat === 'myFormat') {
      birthDate = DataTable.jsFormatDate(birthDate);
    }

    var date = new Date(birthDate);
    if (date == 'Invalid Date' || !jsDateFormatRegEx.test(birthDate)) {
      const msg =
        'A data de nascimento precisa estar no formato DD/MM/AAAA,' +
        ' por exemplo: 31/01/2021.';

      return { message: msg };
    } else {
      return { birthdate: birthDate };
    }
  }

  static checkDateFormat(dateString) {
    if (jsDateFormatRegEx.test(dateString)) {
      return 'jsFormat';
    }
    if (myDateFormatRegEx.test(dateString)) {
      return 'myFormat';
    }
  }

  static input(input = null) {
    if (!input) {
      return { message: 'No fields to validate' };
    }
    var validation = {};
    for (let fieldName in input) {
      switch (fieldName) {
        case 'name':
          validation = { ...validation, ...Validate.name(input[fieldName]) };
          break;
        case 'birthdate':
          validation = { ...validation, ...Validate.date(input[fieldName]) };
      }
    }

    return validation;
  }
}

class DataTable {
  #id;
  #classNames;
  #wrapper;
  #headers;
  #database;
  constructor(id, classNames, wrapper, headers = [], database = []) {
    this.#id = id;
    this.#classNames = classNames;
    this.#wrapper = wrapper;
    this.#headers = headers;
    this.jqueryObj = null; // this.jqueryObj is the same as $(`#${this.#id}`)
    this.#database = database;
  }

  #thead() {
    let tr = $('<tr>');
    for (let header of this.#headers) {
      tr.append(
        $('<th>', {
          class: 'tableCell',
        }).text(header)
      );
    }
    return $('<thead>').append(tr);
  }

  #renderRows() {
    var data = this.#database.data;

    if (data.length > 0) {
      var tbodyElement = this.jqueryObj.children('tbody');

      for (let index in data) {
        var person = data[index];

        tbodyElement.prepend(
          this.newRow({
            id: index,
            name: person.name,
            birthdate: person.birthdate,
          })
        );
      }
    }
    return data.length;
  }

  #renderEditRow(index) {
    var editForm = [];
    for (let data of $(`tr[person_id="${index}"]`).children()) {
      editForm.push(this.#renderEditForm(data));
    }

    var rowBackup = $(`tr[person_id="${index}"]`).html();
    $(`tr[person_id="${index}"]`).empty();
    for (let td of editForm) {
      $(`tr[person_id="${index}"]`).append(td);
    }
    $(`tr[person_id="${index}"]`).attr('id', 'js-edit-form');
    $('span.saveChangesIcon').css('display', 'flex');

    return rowBackup;
  }

  #renderEditForm(fieldData) {
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
      let date = DataTable.jsFormatDate(object.text());
      let newDate = new Date(date).toISOString().substring(0, 10);
      let newInput = $('<input>', {
        id: id,
        name: 'birthdate',
        type: 'date',
        inputmode: 'numeric',
        required: true,
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

  #formatDate(dateString) {
    return dateString.replace(jsDateFormatRegEx, (match, year, month, day) =>
      [day, month, year].join('/')
    );
  }

  render() {
    let table = $('<table>', {
      id: this.#id,
      class: this.#classNames,
    });
    table.append(this.#thead());
    table.append($('<tbody>'));

    $(`#${this.#wrapper}`).html('');
    $(`#${this.#wrapper}`).append(table);
    this.jqueryObj = $(`#${this.#id}`);

    let totalRows = this.#renderRows();
    if (totalRows > 0) {
      this.initToggleIconsEvent($('td.personData'));
      this.show();
    }
  }

  newRow(person) {
    /*
      person -> {id: id, name: "name", birthdate: "yyyy-mm-dd"} (Person)
    */
    let index = person.id;
    var tr = $('<tr>', { person_id: index });

    for (let key of Object.keys(person)) {
      if (key === 'id') {
        continue;
      }
      if (key === 'birthdate') {
        person[key] = this.#formatDate(person[key]);
      }
      let personDataTd = $('<td>', {
        id: `${key}_${index}`,
        class: 'tableCell personData',
      }).text(person[key]);
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

  update(newData, personId = null) {
    var tr = this.newRow(newData);
    tr.addClass('hidden');
    if (personId) {
      $(`tr[person_id="${personId}"]`).replaceWith(tr);
    } else {
      this.jqueryObj.children('tbody').prepend(tr);
    }
    $('tr.hidden').fadeIn('slow');
    $('tr.hidden').removeClass('hidden');

    this.initToggleIconsEvent(tr.children('.personData'));

    if (this.jqueryObj.is(':hidden')) {
      this.jqueryObj.show();
    }
  }

  show() {
    if (this.jqueryObj.is(':hidden')) {
      this.jqueryObj.fadeIn();
      this.jqueryObj.removeClass('hidden');
    }
  }

  initEvents(database) {
    this.jqueryObj.children('tbody').on('click', event => {
      let icon = $(event.target);

      if (icon.hasClass('icon')) {
        var index = icon.attr('id').match(/_(\d+)/)[1];
        var action = $(icon).attr('type');

        if (action === 'remove') {
          this.removeItemHandler(index, database);
        }
        if (action === 'edit') {
          let rowBackup = this.#renderEditRow(index);

          let editForm = new Form('js-edit-form');
          editForm.initInputEvents();
          editForm.initSubmitEditEvent(database, this);
          editForm.initCancelEditEvent(rowBackup, this);
        }
      }
    });
  }

  initToggleIconsEvent(element) {
    if (!element.hasClass('personData')) {
      console.error('Missing "personData" class in the following element:');
      return console.error(element);
    }
    element.hover(event => {
      let td = $(event.target);
      let id = td.attr('id').match(/_(\d+)$/)[1];

      $(`#edit_icon_${id}`).show();
      $(`#edit_icon_${id}`).parent().css('display', 'flex');

      $(`#remove_icon_${id}`).show();
      $(`#remove_icon_${id}`).parent().css('display', 'flex');

      $(`tr[person_id="${id}"]`).hover(
        () => {},
        () => {
          $('span.iconWrapper:visible').hide();
          $(`img[id*="_icon_"]:visible`).hide();
        }
      );
    });
  }

  removeItemHandler(index, database) {
    let personName = $(`#name_${index}`).text();
    cxDialog({
      title: 'Confirmar remoção',
      info: `Tem certeza que deseja remover "${personName}" da base de dados?`,
      okText: 'Sim, quero remover',
      noText: 'Cancelar',
      ok: async () => {
        database.delete(index);
        this.render();
        this.initEvents(database);

        await asyncTimeout(500);
        Message.displaySuccess(`${personName} removido da base de dados.`);
      },
      no: () => {},
    });
  }

  static jsFormatDate(dateString) {
    return dateString.replace(myDateFormatRegEx, (match, day, month, year) => {
      return [year, month, day].join('-');
    });
  }
}

class Form {
  constructor(id) {
    this.jqueryObj = $(`#${id}`);
  }

  #validateInput(element) {
    if (!element.validity.valid) {
      element.style.setProperty('border-color', 'var(--invalid-input-border)');
    }
    var validation = Validate.input({
      [element.getAttribute('name')]: element.value,
    });

    if (validation.message) {
      element.setCustomValidity(validation.message);
    } else {
      element.setCustomValidity('');
      element.style.setProperty('border-color', 'var(--input-border)');
    }
  }

  initFormSubmitEvent(database, table) {
    this.jqueryObj.on('submit', async event => {
      event.preventDefault();
      $('button').blur();

      var name = $('#name').val();
      var birthDate = $('#birth-date').val();

      var validation = Validate.input({
        name: name,
        birthdate: birthDate,
      });

      if (validation.message) {
        Message.displayError(validation.message);
      } else {
        var person = new Person(name, birthDate);
        var newDataIndex = database.save(person);

        if (Number.isInteger(newDataIndex)) {
          event.target.reset();
          person.id = newDataIndex;
          Message.displaySuccess(`${person.name} cadastrado com sucesso!`);

          await asyncTimeout(3000);
          table.update(person);
        } else {
          Message.displayError(newDataIndex);
        }
      }
    });
  }

  initInputEvents() {
    this.jqueryObj
      .find('input')
      .on('input', e => this.#validateInput(e.target));
  }

  initSubmitEditEvent(database, dataTable) {
    var index = this.jqueryObj.attr('person_id');
    var submitEditBtn = this.jqueryObj.find(`#submit_edit_${index}`);

    submitEditBtn.on('click', async () => {
      var nameInput = $(`#name_${index}`).val();
      var birthDateInput = $(`#birthdate_${index}`).val();

      var validation = Validate.input({
        name: nameInput,
        birthdate: birthDateInput,
      });

      if (validation.message) {
        Message.displayError(validation.message);
      } else {
        const person = new Person(nameInput, birthDateInput, index);
        database.update(person);
        dataTable.update(person, index);

        await asyncTimeout(500);
        let successMessage = `${nameInput} editado com sucesso!`;
        Message.displaySuccess(successMessage);
      }
    });
  }

  initCancelEditEvent(rowBackup, dataTable) {
    var index = this.jqueryObj.attr('person_id');
    var cancelEditBtn = this.jqueryObj.find(`#cancel_submit_edit_${index}`);

    cancelEditBtn.on('click', async () => {
      let row = $(`tr[person_id="${index}"]`);
      row.fadeOut();
      await asyncTimeout(500);
      row.html(rowBackup);
      row.fadeIn();

      dataTable.initToggleIconsEvent(row.children('.personData'));
    });
  }
}

class Message {
  static displaySuccess(message, messageArea = $('#msg')) {
    messageArea.prepend(message).hide();
    messageArea.attr('class', 'success');
    messageArea.slideDown('slow', async () => {
      await asyncTimeout(2000);
      messageArea.slideUp('slow', () => messageArea.empty());
    });
  }

  static displayError(errorMsg, messageArea = $('#msg')) {
    messageArea.prepend(`${errorMsg}`).hide();
    messageArea.attr('class', 'error');
    messageArea.slideDown('slow', async () => {
      await asyncTimeout(2000);
      messageArea.slideUp('slow', () => messageArea.empty());
    });
  }
}

function start() {
  const dataBase = new LocalStorageDb('Cadastro de Pessoas');
  const dataTable = new DataTable(
    'dbData',
    'js-table hidden',
    'table-wrapper',
    ['Nome', 'Data de Nascimento'],
    dataBase
  );
  dataTable.render();
  dataTable.initEvents(dataBase);

  var form = new Form('js-person-form');
  form.initInputEvents();
  form.initFormSubmitEvent(dataBase, dataTable);
}

start();
