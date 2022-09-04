"use strict"

// v - вроде исправил ввод больших букв с телефона
// v - добавил команду help
// v - переделал функционал последних введенных значений с функций на объект с методами 
// v - иногда курсор уходит на след строку, если предыдущая строка полностью заполнена и кажется что началась другая команда
// v - неправильно отображается что-то с телефона, забыл что конкретно (((
// v - немного трясет экран при вводе первой буквы из-за строки 27 и 302 {исправил в css}
// v - Неправильные шрифты на телефоне на главной странице

// ? - Если выведена цитата, то на телефоне после ввода второй буквы пропадает весь введенный текст
// ? - autocomplete вообще напрочь все ломает
// ? - При первой загрузке с телефона ссылки анимируются на главной странице
// ? - надо запретить перемещать каретку или сделать нормальный функционал для этого

// сделать функционал для каретки



// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



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

// Ищем элементы
let typedText = document.querySelector('.typed-text');
typedText.innerHTML = removeLineBreaks(typedText.innerHTML);    // innerHTML меняет элементы внутри себя, поэтому все querySelector'ы, прописанные внутри данного элемента становятся недействительными((((

let cursor = document.querySelector(".cursor");
let inputField = document.querySelector('.input-field');
let form = document.querySelector('form');


// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Добавляем обработчики и передаем фокус на элемент ввода
inputField.focus();
window.onclick = function () {
    inputField.focus();
}

inputField.oninput = function (evt) {
    typedText.textContent = inputField.value;
    window.scroll(0, document.body.clientHeight);
};

form.onsubmit = function (evt) {
    evt.preventDefault();
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Объект последних введенных команд
let lastEntered = {
    array: [],
    position: -1,
    pushMax10: function () {
        if (this.array.length < 10) {
            this.array.push(typedText.textContent);
        } else {
            this.array.shift();
            this.array.push(typedText.textContent);
        }
        return
    },
    get: function () {
        let lastIndex = this.array.length - 1;
        let currentIndex = lastIndex - this.position;
        return this.array[currentIndex];
    },

    setPrevious: function () {
        if (this.position < this.array.length - 1) this.position++
    },
    setNext: function () {
        if (this.position > -1) this.position--
    },

    getSetPrevious: function () {
        this.setPrevious();
        return this.get();
    },
    getSetNext: function () { 
        this.setNext();
        return this.get();
    }
};

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Функционал Backspace, CTRL + Backspace, Enter, ArrowUp, доп. команды

let ctrlPressed = false;

function renderCommandResult(text) {
    let commandResultText = text;
    let commandResult = document.createElement('p');

    commandResult.classList.add('command-result');
    commandResult.textContent = commandResultText;
    typedText.after(commandResult);
    commandResult.after(document.createElement('br'));
    return
}

window.onkeydown = function (evt) {
    inputField.focus();
    inputField.selectionStart = inputField.value.length;
    
    if (evt.key == 'Control') {
        ctrlPressed = true;
    }

    if (evt.key == 'Backspace' && ctrlPressed === true) {
        typedText.textContent = '';
        inputField.value = typedText.textContent;
    }

    if (evt.key === 'ArrowUp') {
        evt.preventDefault();                                        //evt.preventDefault(); здесь нужен, т.к при нажатии ArrowUp по умолчанию каретка в input уходит в начало, что нам не нужно
        typedText.textContent = lastEntered.getSetPrevious();
        inputField.value = typedText.textContent;
    }
    if (evt.key === 'ArrowDown') {
        evt.preventDefault();
        typedText.textContent = lastEntered.getSetNext();
        inputField.value = typedText.textContent;
    }

    // DANGER ZONE!!! DANGER DANGER DANGER USER DEFINED CODE EXECUTION IS IMMINENT!!!
    // DANGER ZONE!!! DANGER DANGER DANGER USER DEFINED CODE EXECUTION IS IMMINENT!!!
    // DANGER ZONE!!! DANGER DANGER DANGER USER DEFINED CODE EXECUTION IS IMMINENT!!!

    if (evt.key === 'Enter') {
        if (typedText.textContent === 'help') {
            renderCommandResult(
                'run (js command) - выполнить любую команду JavaScript и вывести результат в качестве строки\n' +
                'quote - показать случайную цитату\n' +
                'type - напечатать случайную цитату в поле ввода\n' +
                'clear - очистить консоль\n' +
                'quit - вернуться на главную страницу\n' +
                'exit - вернуться на главную страницу\n' +
                '\n' +
                'Arrow Up, Arrow Down - листать список предыдущих команд назад и вперед соответственно\n' + 
                'Ctrl + Backspace - удалить всю строку\n'
                );
        }

        if (typedText.textContent === 'type') {
            typeQuote();
        }

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
        lastEntered.pushMax10();

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

        //Обнуляем поле ввода и триггерим ивент ввода, т.к сам он не триггерится при изменении через JS
        inputField.value = '';
        triggerInputEvent();

        // Обнуляем позицию счетчика последних введенных значений
        lastEntered.position = -1;
        // // Переносимся в конец страницы
        // window.scroll(0, document.body.clientHeight);
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

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Вывод рандомной цитаты

// Рандомное число в диапазоне - взято с MDN https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;       //Максимум не включается, минимум включается
}

function triggerInputEvent(){
    inputField.dispatchEvent(
        new Event('input', {bubbles:true})
        );
}

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
    let listenerArray = [window.onkeydown]                      // в старой версии было несколько значений. пока оставил как массив
    window.onkeydown = null;
    inputField.setAttribute('readonly', '');
    ctrlPressed = false;

    function type() {
        inputField.value += letter.getSetNext()
        triggerInputEvent();

        let timerId = setTimeout(type, 50);
        if (letter.done) {
            clearTimeout(timerId);
            window.onkeydown = listenerArray[0];
            inputField.removeAttribute('readonly');
        }
    };
    setTimeout(type, 200);
    return 'quote'
};