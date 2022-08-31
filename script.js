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
    typedText.append(inputField.value);
    // typedText.textContent += inputField.value;
    inputField.value = '';
};



// Массив последних введенных команд
let lastEntered = [];

function lastEnteredPushMax10 () {
    if (lastEntered.length < 10) {
        lastEntered.push(typedText.textContent);
    } else {
        lastEntered.shift();
        lastEntered.push(typedText.textContent);
    }
}


// Достаем по очереди из массива последние введенные данные
function getLastEntered () {
    let lastIndex = lastEntered.length - 1;
    let currentIndex = lastIndex - getLastEntered.functionCalledTimes;
    if (getLastEntered.functionCalledTimes < lastEntered.length - 1) {
        getLastEntered.functionCalledTimes++;
    }
    return lastEntered[currentIndex];
}
getLastEntered.functionCalledTimes = 0;

// В обратную сторону
function getLastEnteredReverse () {
    if (getLastEntered.functionCalledTimes-- > 0) {
        getLastEntered.functionCalledTimes--;
    }
    
    return getLastEntered();
}



// Функционал Backspace, CTRL + Backspace, Enter, ArrowUp

let ctrlPressed = false;

window.onkeydown = function (evt) {
    if (evt.key == 'Control') {
        ctrlPressed = true;
    }

    if (evt.key == 'Backspace' && ctrlPressed === true) {
        typedText.textContent = '';
    }

    if (evt.key === 'Backspace') {
        typedText.textContent = typedText.textContent.slice(0, length - 1);
    }
    if (evt.key === 'ArrowUp') {
        typedText.textContent = getLastEntered();
    }
    if (evt.key === 'ArrowDown') {
        typedText.textContent = getLastEnteredReverse();
    }
















    // DANGER ZONE!!! DANGER DANGER DANGER USER DEFINED CODE EXECUTION IS IMMINENT!!!

    if (evt.key === 'Enter') {
        // если строка начинается с 'run ', то выполняем команду и выдаем результат в качестве пишки с классом run-result, если нет, то просто продолжаем выполнение блока, т.е записываем просто текстом
        if (typedText.textContent.slice(0, 4) === 'run ') {
            let runResultText = String(
                Function(typedText.textContent.slice(4))()
            );
            let runResult = document.createElement('p');

            runResult.classList.add('run-result');
            runResult.textContent = runResultText + '\n';
            typedText.after(runResult);
        }

        //  если строка равна clear убираем все пишки
        if (typedText.textContent === 'clear') {
            let pTags = document.querySelectorAll('p');
            for (let pTag of pTags) {
                pTag.remove()
            }
        }
        
        
        // Записываем последнее значение в массив, переходим на новую строку, убираем класс, добавляем новую p'шку, и присваиваем ее в переменную typedText
        lastEnteredPushMax10();

        typedText.textContent += '\n';
        // typedText.classList.remove('typed-text');
        typedText.removeAttribute('class');

        let newP = document.createElement('p');
        newP.classList.add('typed-text');
        cursor.before(newP);

        typedText = newP;



        // Обнуляем счетчик функций последних введенных значений
        getLastEntered.functionCalledTimes = 0;
        // Переносимся в конец страницы
        window.scroll(0, document.body.clientHeight);
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




// Вывод рандомной цитаты

// Рандомное число в диапазоне - взято с MDN https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
  }

function getQuote() {
    let quotes = [
        'Падение - это не провал. Провал это Провал. Падение - это где упал.',
        'Не важно у кого день рождения. Важно у кого день рождения кого',
        'Лучше один раз упасть, чем сто раз упасть',
        'Каждый думает, что знает меня, но не каждый знает, что не знает, кто думает',
        'Как бы сейчас не было сейчас. Все будет было.',
        'Не слушай тех, кто много обещает. Они обычно много обещают',
        'Волк слабее санитара, но в дурке он не работает',
        'Никогда не поздно, никогда не рано - поменять все поздно, если это рано',
    ];
    let quote = quotes[getRandomInt(0, quotes.length)];
    return quote;
}