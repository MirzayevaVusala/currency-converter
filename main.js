const firstButtonContainer = document.querySelector('.buttons1');
const secondButtonContainer = document.querySelector('.buttons2');
const leftInput = document.querySelector('.left');
const rightInput = document.querySelector('.right');
const currency = new Currency();

let firstButtonValue = 'RUB';
let secondButtonValue = 'USD';
let lastInput = 'left';

function setDefaultButtonStyles() {
    const firstButtons = Array.from(firstButtonContainer.children);
    const defaultFirstButton = firstButtons.find(button => button.textContent === firstButtonValue);
    if (defaultFirstButton) {
        defaultFirstButton.style.backgroundColor = '#833AE0';
        defaultFirstButton.style.color = 'white';
    }
    const secondButtons = Array.from(secondButtonContainer.children);
    const defaultSecondButton = secondButtons.find(button => button.textContent === secondButtonValue);
    if (defaultSecondButton) {
        defaultSecondButton.style.backgroundColor = '#833AE0';
        defaultSecondButton.style.color = 'white';
    }
}

setDefaultButtonStyles();

firstButtonContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        firstButtonValue = event.target.textContent;

        Array.from(firstButtonContainer.children).forEach(button => {
            button.style.backgroundColor = '';
            button.style.color = '';
        });
        event.target.style.backgroundColor = '#833AE0';
        event.target.style.color = 'white';

        exchange();
    }
});

secondButtonContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        secondButtonValue = event.target.textContent;

        Array.from(secondButtonContainer.children).forEach(button => {
            button.style.backgroundColor = '';
            button.style.color = '';
        });

        event.target.style.backgroundColor = '#833AE0';
        event.target.style.color = 'white';

        exchange();
    }
});

function removeLeadingZeros(value) {
    if (value.indexOf('.') === -1) {
        return value.replace(/^0+/, '');
    }
    const [integer, decimal] = value.split('.');
    const cleanedInteger = integer.replace(/^0+/, '0') || '0';
    return `${cleanedInteger}.${decimal}`;
}


function limitDecimalPlaces(value) {
    const [integer, decimal] = value.split('.');
    if (decimal) {
        return `${integer}.${decimal.slice(0, 5)}`;
    }
    return value;
}

leftInput.addEventListener('input', () => {
    leftInput.value = removeLeadingZeros(leftInput.value.replace(',', '.').replace(/[^0-9.,]/g, ''));
    leftInput.value = limitDecimalPlaces(leftInput.value);
    lastInput = 'left';
    exchange();
});

rightInput.addEventListener('input', () => {
    rightInput.value = removeLeadingZeros(rightInput.value.replace(',', '.').replace(/[^0-9.,]/g, ''));
    rightInput.value = limitDecimalPlaces(rightInput.value);
    lastInput = 'right';
    exchange();
});

leftInput.addEventListener('click', () => {
    if (leftInput.value === '0.00000') {
        leftInput.value = '';
    }
    leftInput.value = leftInput.value.replace(',', '.').replace(/[^0-9.,]/g, '');
    lastInput = 'left';
});

rightInput.addEventListener('click', () => {
    if (rightInput.value === '0.00000') {
        rightInput.value = '';
    }
    rightInput.value = rightInput.value.replace(',', '.').replace(/[^0-9.,]/g, '');
    lastInput = 'right';
});

function setInitialConversionRate() {
    currency.getRate('RUB', 'USD')
        .then(rate => {
            const rateText = `1 RUB = ${rate.toFixed(5)} USD`;
            const leftInnerDiv = document.querySelector('.left').nextElementSibling;
            const rightInnerDiv = document.querySelector('.right').nextElementSibling;
            leftInnerDiv.textContent = rateText;
            rightInnerDiv.textContent = `1 USD = ${(1 / rate).toFixed(5)} RUB`;
        });
}

function exchange() {
    let amountLeft = Number(leftInput.value.trim().replace(',', '.'));
    let amountRight = Number(rightInput.value.trim().replace(',', '.'));

    if (isNaN(amountLeft) && isNaN(amountRight)) {
        rightInput.value = '';
        leftInput.value = '';
        return;
    }

    if (firstButtonValue === secondButtonValue) {
        if (navigator.onLine) {
            if (lastInput === 'left' && !isNaN(amountLeft)) {
                rightInput.value = amountLeft.toFixed(5).replace(',', '.');
            } else if (lastInput === 'right' && !isNaN(amountRight)) {
                leftInput.value = amountRight.toFixed(5).replace(',', '.');
            }
        } else {
            if (lastInput === 'left' && !isNaN(amountLeft)) {
                rightInput.value = amountLeft.toFixed(5).replace(',', '.');
            } else if (lastInput === 'right' && !isNaN(amountRight)) {
                leftInput.value = amountRight.toFixed(5).replace(',', '.');
            }
        }
        return;
    }

    if (lastInput === 'left' && !isNaN(amountLeft)) {
        currency.exchange(amountLeft, firstButtonValue, secondButtonValue)
            .then((result) => {
                rightInput.value = result.toFixed(5).replace(',', '.');
                updateConversionRate(firstButtonValue, secondButtonValue);
            });
    } else if (lastInput === 'right' && !isNaN(amountRight)) {
        currency.exchange(amountRight, secondButtonValue, firstButtonValue)
            .then((result) => {
                leftInput.value = result.toFixed(5).replace(',', '.');
                updateConversionRate(secondButtonValue, firstButtonValue);
            });
    }
}

function updateConversionRate(fromCurrency, toCurrency) {
    currency.getRate(fromCurrency, toCurrency)
        .then(rate => {
            const rateText = `1 ${fromCurrency} = ${rate.toFixed(5)} ${toCurrency}`;
            const leftInnerDiv = document.querySelector('.left').nextElementSibling;
            const rightInnerDiv = document.querySelector('.right').nextElementSibling;

            if (lastInput === 'left') {
                leftInnerDiv.textContent = rateText;
                rightInnerDiv.textContent = `1 ${toCurrency} = ${(1 / rate).toFixed(5)} ${fromCurrency}`;
            } else if (lastInput === 'right') {
                rightInnerDiv.textContent = rateText;
                leftInnerDiv.textContent = `1 ${fromCurrency} = ${(1 / rate).toFixed(5)} ${toCurrency}`;
            }
        });
}

setInitialConversionRate();

const connectionStatus = document.getElementById('connection-status');
function updateConnectionStatus() {
    if (navigator.onLine) {
        connectionStatus.style.display = 'none';
    } else {
        connectionStatus.style.display = 'block';
    }
}

updateConnectionStatus();

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
