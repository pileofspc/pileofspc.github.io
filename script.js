"use strict"

// Ищем элементы
let typedText = document.querySelector('.typed-text');
typedText.innerHTML = removeLineBreaks(typedText.innerHTML);    // Эта команда меняет элементы внутри себя, поэтому все querySelector'ы, прописанные внутри данного элемента становятся недействительными((((

let cursor = document.querySelector(".cursor");
let inputField = document.querySelector('.input-field');


// Добавляем обработчики
inputField.focus();
window.onclick = function () {
    inputField.focus();
}

inputField.oninput = function () {
    // typedText.append(inputField.value);
    typedText.textContent += inputField.value;
    inputField.value = '';
};




// Функционал Backspace и CTRL + Backspace

let ctrlPressed = false;

window.onkeydown = function (evt) {
    if (evt.key == 'Control') {
        ctrlPressed = true;
    }

    if (ctrlPressed === true && evt.key == 'Backspace') {
        typedText.textContent = '';
    }
    if (evt.key === 'Backspace') {
        typedText.textContent = typedText.textContent.slice(0, length - 1);
    }
};

window.onkeyup = function (evt) {
    if (evt.key == 'Control') {
        ctrlPressed = false;
    }
};





// АНИМАЦИИ
const delayVisible = 500;
const delayHidden = 400;

// Показать курсор + создать таймаут на след. функцию
function  cursorFlickerShow () {
    cursor.style.opacity = '100%';
    // console.log('100%');

    cursorFlickerShow.timerId = setTimeout(cursorFlickerHide, delayVisible);
    return
};

// Скрыть курсор + создать таймаут на след. функцию
function cursorFlickerHide () {
    cursor.style.opacity = '0';
    // console.log('0%');

    cursorFlickerHide.timerId = setTimeout(cursorFlickerShow, delayHidden);
    return
};


// Старт и стоп анимации
function flicker() {
    setTimeout(cursorFlickerHide, delayVisible);
    return
};

function stopFlicker() {
    clearTimeout(cursorFlickerHide.timerId);
    clearTimeout(cursorFlickerShow.timerId);
    cursor.style.opacity = '100%';
};


flicker();



// Дурацкая функция для того, чтобы убрать пробелы и переносы строки из HTML кода
function removeLineBreaks(string) {
    let stringArray = Array.from(string);

    let bracketCount = 0;
    stringArray.forEach(function (item, index, array) {
        if (item === '<') { ++bracketCount };
        if (item === '>') { --bracketCount };

        if (bracketCount === 0 && (item === '\n' || item === ' ')) {
            array[index] = '';
        };
    });
    let result = stringArray.join('');
    return result
};




// Вывод рандомных цитат
let quotes = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
];