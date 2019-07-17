let newPasswordValue;
let confirmationValue;
const submitBtn = document.getElementById('update-profile');
const newPassword = document.getElementById('new-password');
const confirmationPassword = document.getElementById('confirmation-password');
const validationMessage = document.getElementById('validation-message');
function validatePassword(message, add, remove) {
    validationMessage.textContent = message;
    validationMessage.classList.add(add);
    validationMessage.classList.remove(remove);
}
confirmationPassword.addEventListener('input', e => {
    e.preventDefault();
    newPasswordValue = newPassword.value;
    confirmationValue = confirmationPassword.value;
    if(newPasswordValue != confirmationValue) {
        validatePassword('Password must match!', 'color-red', 'color-green');
        submitBtn.setAttribute('disabled', true);
    } else {
        validatePassword('Password match', 'color-green', 'color-red');
        submitBtn.removeAttribute('disabled');
    }
});
