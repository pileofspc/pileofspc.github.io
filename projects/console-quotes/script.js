// "use strict"


// Нахуй сломано renderCommandResult - сломалось, когда вывел это дело в отдельную функцию
// run String( Function(typedText.textContent.slice(4)) () ); приводит к переполнению стека



// Ищем элементы
let typedText = document.querySelector('.typed-text');
typedText.innerHTML = removeLineBreaks(typedText.innerHTML);    // Эта команда меняет элементы внутри себя, поэтому все querySelector'ы, прописанные внутри данного элемента становятся недействительными((((

let cursor = document.querySelector(".cursor");
let inputField = document.querySelector('.input-field');


// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Функционал Backspace, CTRL + Backspace, Enter, ArrowUp, доп. команды

let ctrlPressed = false;

function renderCommandResult(text) {
    let commandResultText = text;
    let commandResult = document.createElement('p');

    commandResult.classList.add('command-result');
    commandResult.textContent = commandResultText + '\n';
    typedText.after(commandResult);
    return
}

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
    // DANGER ZONE!!! DANGER DANGER DANGER USER DEFINED CODE EXECUTION IS IMMINENT!!!
    // DANGER ZONE!!! DANGER DANGER DANGER USER DEFINED CODE EXECUTION IS IMMINENT!!!

    if (evt.key === 'Enter') {
        // если строка начинается с 'run ', то выполняем команду и выдаем результат в качестве пишки с классом run-result, если нет, то просто продолжаем выполнение блока, т.е записываем просто текстом
        if (typedText.textContent.slice(0, 4) === 'run ') {
            let command = String(Function('return ' + typedText.textContent.slice(4))());
            renderCommandResult(command);
        }

        //  если строка равна clear убираем все пишки
        if (typedText.textContent === 'clear') {
            let pTags = document.querySelectorAll('p');
            for (let pTag of pTags) {
                pTag.remove()
            }
        }

        // если набрали exit или quit - переходим на главную страницу
        if (typedText.textContent === 'exit' || typedText.textContent === 'quit') {
            // window.location.href = 'https://pileofspc.github.io/';
            window.open('https://pileofspc.github.io/', '_self', "noreferrer, noopener")
        }
        if (typedText.textContent === 'quote') {
            renderCommandResult(getQuote());
        }
        
        
        // Записываем последнее значение в массив, переходим на новую строку, убираем класс, добавляем новую p'шку, и присваиваем ее в переменную typedText
        lastEnteredPushMax10();

        typedText.textContent += '\n';
        if (typedText.className === 'typed-text') {
            typedText.removeAttribute('class');
        } else {
            typedText.classList.remove('typed-text');
        }

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

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// АНИМАЦИИ, можно переделать на CSS, просто ради тренировки сделал на JS
const delayVisible = 500;
const delayHidden = 400;

// Показать курсор + создать таймаут на след. функцию
function  cursorFlickerShow () {
    cursor.style.opacity = '100%';

    cursorFlickerShow.timerId = setTimeout(cursorFlickerHide, delayVisible);
    return
};

// Скрыть курсор + создать таймаут на след. функцию
function cursorFlickerHide () {
    cursor.style.opacity = '0';

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

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Вывод рандомной цитаты

function getQuote() {
    let quotes = [
        'Падение - это не провал. Провал это Провал. Падение - это где упал.',
        'Не важно у кого день рождения. Важно у кого день рождения кого.',
        'Лучше один раз упасть, чем сто раз упасть.',
        'Каждый думает, что знает меня, но не каждый знает, что не знает, кто думает.',
        'Как бы сейчас не было сейчас. Все будет было.',
        'Не слушай тех, кто много обещает. Они обычно много обещают.',
        'Волк слабее санитара, но в дурке он не работает.',
        'Никогда не поздно, никогда не рано - поменять все поздно, если это рано.',
    ];

// Рандомное число в диапазоне - взято с MDN https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/random

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;       //Максимум не включается, минимум включается
}

    
    return quotes[getRandomInt(0, quotes.length)];
}

function Letter() {                                     // Использую конструктор потому, что так можно например значение одного свойства присвоить другому, а через литерал {} так сделать не получится
    this.quote = getQuote();                            // т.к. во время инициализации объекта у него нет this
    this.i = 0;
    this.letter = this.quote[this.i];
    this.done = false;

    this.getSetNext = function () {
        let result = this.letter;
        this.i++;
        this.letter = this.quote[this.i];
        if (this.letter === undefined) {
            this.done = true;
            this.getSetNext = function () {
                letter = new Letter();
                return letter.getSetNext();
            }
        };
        return result;
    };
};

let letter = new Letter();

// Интересный случай, здесь пригодился цикл do... while..., т.к нужно было хотя бы один раз выполнить вне зависимости
// от условия letter.done === false. На последней букве у нас letter.done = false, но при этом надо
// выполнить метод, чтобы он обновил весь объект и отдача букв пошла заново

function typeQuote() {
    let func = function () {
        typedText.textContent += letter.getSetNext()
        let timerId = setTimeout(func, 50);
        if (letter.done) {
            clearTimeout(timerId);
            window.onkeydown = listenerArray[0];
            inputField.oninput = listenerArray[1];
        }
    };
    setTimeout(func, 300);

    let listenerArray = [window.onkeydown, inputField.oninput]
    window.onkeydown = null;
    inputField.oninput = function () {
        inputField.value = '';
    };
    ctrlPressed = false;
    return 'quote'
};
typeQuote();
