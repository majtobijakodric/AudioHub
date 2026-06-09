const passwordInput = document.getElementById('password');
const passwordContainer = document.getElementById('passwordContainer');
const registerBtn = document.getElementById('registerBtn');

let touched = false;

passwordInput.addEventListener('focus', () => {
    touched = true;
});

passwordInput.addEventListener('input', () => {
    if (!touched) return;
    updateState();
});

passwordInput.addEventListener('blur', () => {
    if (touched) updateState();
});

function updateState() {
    const valid = passwordInput.value.length >= 5;

    if (valid) {
        passwordContainer.classList.remove('border-red-600');
        passwordContainer.classList.add('border-[#727272]');
        registerBtn.disabled = false;
    } else {
        passwordContainer.classList.add('border-red-600');
        passwordContainer.classList.remove('border-[#727272]');
        registerBtn.disabled = true;
    }
}
