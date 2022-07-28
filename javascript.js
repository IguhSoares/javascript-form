window.addEventListener("load", () => {
  var nameInput = document.querySelector("#name");
  var birthDateInput = document.querySelector("#birth-date")
  document.querySelector(".js-form").addEventListener("submit", (event) => {
      event.preventDefault();
      console.log(`Nome: ${nameInput.value}\n` +
        `Aniversário: ${birthDateInput.value.replace(
          /(\d{4})-(\d{2})-(\d{2})/,`$3/$2/$1`)}`);
  })
});
