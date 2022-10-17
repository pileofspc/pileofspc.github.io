"use strict"

// v - вроде исправил ввод больших букв с телефона
// v - добавил команду help
// v - переделал функционал последних введенных значений с функций на объект с методами 
// v - иногда курсор уходит на след строку, если предыдущая строка полностью заполнена и кажется что началась другая команда
// v - неправильно отображается что-то с телефона, забыл что конкретно (((
// v - немного трясет экран при вводе первой буквы из-за строки 27 и 302 {исправил в css}
// v - Неправильные шрифты на телефоне на главной странице
// v - Если выведена цитата, то на телефоне после ввода второй буквы пропадает весь введенный текст
// v - autocomplete вообще напрочь все ломает
// v - При первой загрузке с телефона ссылки анимируются на главной странице
// v - надо запретить перемещать каретку или сделать нормальный функционал для этого
// v - сделать функционал для каретки
// v - при переносе больших слов курсор его как будто видит на старой строке
// v - при использовании delete проигрывается анимация (backspace почему-то работает)
// v - type нормально не работает с перемещением каретки. курсор всегда остается на первой строке
// v - сделать перемещение по клику
// v - снимать выделение при клике вне текста
// v - при замене выделенного текста на другой текст курсор прыгает на начало

// v - если начинать выделять справа  налево, начиная с пустого места после текста, то ничего не выделяется
// v - не работает shift-click, ctrl-click. Двойной клик работает, случайно так получилось BloodTrail
// v - надо либо не использовать moveCaret, либо как-то написать selectText так, чтобы он выделял с конца в начало
// v - допилить функционал выделения
// v - доделать оформление выделения
// v - при шифт клике в anchor не происходит анимации

// ? - теряются обработчики после исполнения команды

// добавить разделение текущей команды и уже прописанных
// сделать выделение по минимуму*
// сделать цитаты по апишке


// * на уже введенных командах - дефолтное
// на инпуте - с анимацией, бг - прозрачный, текст-шадоу белый
// если начинаешь выделять старые команды, то новую выделить нельзя, и наоборот






// Известные проблемы:
// 1 -  Вообще архитектурный, так сказать, выбор работать с тегом p, а не непосредственно с инпутом привел к тому, что много стандартного функционала пришлось переписывать самому.
//      Такой выбор был сделан, потому что input не стилизовался в CSS так, как я хотел. Возможно, это можно было сделать через JS, но выбор был
//      сделан еще в самом начале, поэтому уже просто его придерживаюсь.
//      Изначально проект должен был быть другим, по ходу уже приходили новые идеи, отчасти поэтому так и получилось.
//      Все больше убеждаюсь, что это была ошибка...
// 2 - Для устранения пробелов используется функция, хотя наверное можно было бы сделать через CSS.
// 3 - Структура кода не приведена в порядок, потому что пока нет понимания как лучше ее выстраивать.
// 4 - Много где используется setTimeout по причине того, что что-то либо не успевает выполняться, либо выполняется раньше, чем нужно, и либо я пока не знаю как это исправить, либо мне лень.
// 5 - Хотелось бы уйти от использования innerHTML, но пока не знаю как. Не знаю как вставить элемент после определенного символа текста без innerHTML.

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




// Проблемы:
// 1) Не знаю как нормально избавиться от пробелов, которые расставлены в HTML для лучшей читаемости кода (написал функцию для этого lul)
// 2) Добавить обработку ошибок
// 3) Добавить перемещение каретки

// Сделано:
// 1) Добавить CTRL + BACKSPACE удалить всё
// 2) Нельзя поставить больше одного пробела подряд (скорее всего ограничение метода append) {на самом деле просто надо было поставить свойство white-space: pre-wrap; }
// 3) Не знаю как удалить последнюю букву (знаю)
// 4) Не знаю как убрать полностью поле ввода, все равно остается какая-то часть лишнего свободного места от него
// 5) Надо добавить функционал печатания рандомной цитаты.
// 3) С телефона вводятся только большие буквы
// 4) Добавить команду help
// 2) Исправить команду help
// 3) С телефона не обнуляется input.value (((


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
let buddy = document.querySelector('body');

let typedDone = document.querySelector('.done');
let typedText = document.querySelector('.typed-text');
typedText.innerHTML = removeLineBreaks(typedText.innerHTML);    // innerHTML меняет элементы внутри себя, поэтому все querySelector'ы, прописанные внутри данного элемента становятся недействительными((((

let cursor = document.querySelector(".cursor");
let inputField = document.querySelector('.input-field');

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function selectInputText(start, end) {
    if (start <= end) {
        inputField.selectionStart = start;
        inputField.selectionEnd = end;
    } else {
        inputField.selectionStart = end;
        inputField.selectionEnd = start;
    }
}
function selectText(element, start, end) {
    let range = new Range();
    range.setStart(element.firstChild, start);
    range.setEnd(element.firstChild, end);

    document.getSelection().removeAllRanges();
    document.getSelection().addRange(range);
}
function selectTextReverse(element, start, end) {
    let range = new Range();
    range.setStart(element.firstChild, start);
    range.setEnd(element.firstChild, end);
    range.collapse(false);

    document.getSelection().removeAllRanges();
    document.getSelection().addRange(range);
    document.getSelection().extend(element.firstChild, start);
}



// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Добавляем обработчики и передаем фокус на элемент ввода
inputField.focus();

let savedStart;
let savedEnd;
let isReverse = false;

let selectionTimer;
let mouseX;
let mouseY;

let savedRangeBefore;
let savedRangeAfter;

let hoveredElement;
let hoveredElementOnMouseDown;
let hoveredElementOnMouseUp;

document.onmousemove = function(evt) {
    mouseX = evt.clientX;
    mouseY = evt.clientY;
}

document.onmouseover = function(evt) {
    hoveredElement = evt.target;
}

document.onmousedown = function(evt) {
    hoveredElementOnMouseDown = evt.target;
    console.log(evt.target);

    if (!evt.shiftKey) {
        if (evt.target === typedText) {
            let collection = document.querySelectorAll('p:not(.typed-text)');
            for (let item of collection) {
                item.classList.add('no-select');
            }
        }
        // if (evt.target !== typedText) {
        //     typedText.classList.add('no-select');
        // }
    } else {
        
    }
    


    if (!evt.shiftKey && evt.button !== 2) {
        window.getSelection().removeAllRanges();
    } 

    if (evt.target.tagName !== 'P' && !evt.shiftKey) {
        selectText(typedText, typedText.textContent.length, typedText.textContent.length);
    }
}

document.onmouseup = function (evt) {
    hoveredElementOnMouseUp = evt.target;

    if (window.getSelection().anchorOffset > window.getSelection().focusOffset) {
        isReverse = true;
    } else {
        isReverse = false;
    }

    savedStart = window.getSelection().anchorOffset;
    savedEnd = window.getSelection().focusOffset;

    if (window.getSelection().focusNode === cursor) {
        let lastP = window.getSelection().focusNode.previousSibling.previousSibling;
        window.getSelection().extend(lastP.childNodes[0], lastP.textContent.length);
    }

    let collection = document.querySelectorAll('p');
    for (let item of collection) {
        item.classList.remove('no-select');
    }

    if (window.getSelection().anchorNode.parentElement === typedText) {
        moveCaret(typedText);
        setWidth(typedText);
    }
 }

inputField.oninput = function () {
    typedText.textContent = inputField.value;
    window.scroll(0, document.body.clientHeight);

    isReverse = false;
};

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


// setTimeout тут нужен для того, чтобы результат команды появлялся позже, чем сама команда в независимости от положения renderCommandResult в коде
function renderCommandResult(text) {
    setTimeout(() => {
    let commandResult = document.createElement('p');
    let lastP = document.querySelector('p:nth-last-of-type(2)');

    commandResult.classList.add('command-result');
    commandResult.textContent = text + '\n';
    lastP.after(commandResult);
    // commandResult.after(document.createElement('br'));
    });
    return
}

window.onkeydown = function (evt) {
    // if (evt.key === 'k') {
    //     evt.preventDefault();
    //     return
    // }
    if (
        evt.key !== 'Shift' &&
        evt.key !== 'Control' &&
        evt.key !== 'Alt' &&
        evt.key !== 'ArrowLeft' &&
        evt.key !== 'ArrowUp' &&
        evt.key !== 'ArrowRight' &&
        evt.key !== 'ArrowDown'
        ) {
        inputField.focus();
        cursor.classList.add('cursor-only-opacity');
    }
    // if (inputField.selectionEnd - inputField.selectionStart !== 0) {
        // cursor.classList.add('cursor-only-opacity');
    // }
    if (evt.key == 'Delete') {
        cursor.classList.add('cursor-only-opacity');
    }

    if (evt.key == 'Backspace' && evt.ctrlKey) {
        typedText.textContent = '';
        inputField.value = typedText.textContent;
    }

    if (evt.key === 'ArrowUp') {
        evt.preventDefault();                                        //evt.preventDefault(); здесь нужен, т.к при нажатии ArrowUp по умолчанию каретка в input уходит в начало, что нам не нужно
        typedText.textContent = lastEntered.getSetPrevious();
        inputField.value = typedText.textContent;
    }
    if (evt.key === 'ArrowDown') {
        evt.preventDefault();                                       //здесь необязательно вроде бы, но добавил для унификации
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

        let newP = document.createElement('p');
        newP.textContent = typedText.textContent + '\n';
        typedDone.appendChild(newP);

        // typedText.textContent += '\n';
        // if (typedText.className === 'typed-text') {
        //     typedText.removeAttribute('class');
        // } else {
        //     typedText.classList.remove('typed-text');
        // }

        // let newP = document.createElement('p');
        // newP.classList.add('typed-text');
        // cursor.before(newP);

        // typedText = newP;

        //Обнуляем поле ввода и текст в пишке
        inputField.value = '';
        setTimeout(() => {
            triggerInputEvent();
        });

        // Обнуляем позицию счетчика последних введенных значений
        lastEntered.position = -1;
    }
    if (evt.key !== 'Shift' && evt.key !== 'Control' && evt.key !== 'Alt') {
        setTimeout(()=>{
            moveCaret();
            setWidth();
        });
    }
};


// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// АНИМАЦИИ, можно переделать на CSS, просто ради тренировки сделал на JS
const delayVisible = 600;
const delayHidden = 300;

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

// flicker();

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Вывод рандомной цитаты

// Рандомное число в диапазоне - взято с MDN https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;       //Максимум не включается, минимум включается
}

function triggerInputEvent() {
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

// Здесь пригодился цикл do... while..., т.к нужно было хотя бы один раз выполнить вне зависимости
// от условия letter.done === false. На последней букве у нас letter.done = false, но при этом надо
// выполнить метод, чтобы он обновил весь объект и отдача букв пошла заново

function typeQuote() {
    let listenerArray = [window.onkeydown]                      // в старой версии было несколько значений. пока оставил как массив
    window.onkeydown = null;
    inputField.setAttribute('readonly', '');

    function type() {
        inputField.value += letter.getSetNext();
        triggerInputEvent();
        moveCaret(typedText);

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

















function insertSpan(element, index, className) {
    let span = document.createElement('span');
    if (className) {
        span.classList.add(className);
    }
    span.textContent = '\u2060';

    let text = element.childNodes[0];
    text.splitText(index).before(span);

    return span;
}

function removeSpan(element) {
    let collection = element.querySelectorAll('span');
    for (let item of collection) {
        item.remove();
    }
    element.normalize();
}

function getSpanCoordinates(element, className) {
    let span = element.querySelector(className);
    let rect = span.getBoundingClientRect();
    return rect
}

function getLeftmostIndex() {
    let start;

    if (savedEnd >= savedStart) {
        start = savedStart;
    } else {
        start = savedEnd;
    }

    return start;
}



function moveCaret(element) {
    insertSpan(element, getLeftmostIndex(), 'selection');
    let coords = getSpanCoordinates(element, '.selection');
    removeSpan(element);

    insertSpan(typedText, typedText.textContent.length, 'end');
    let defaultCoords = getSpanCoordinates(typedText, '.end');
    removeSpan(typedText);


    // Пока не знаю, стоит ли оставить

    // if (coords.y + 'px' !== cursor.style.top) {
    //     cursor.classList.add('cursor-only-opacity');
    // };

    cursor.style.transform = `translateX(${coords.x - defaultCoords.x - 10.5}px)`;
    cursor.style.top = coords.y + 'px';
    if (savedStart === savedEnd && savedEnd === element.textContent.length) {
        cursor.classList.remove('cursor-line');
        cursor.style.transform = 'translateX(0)'
    } else {
        cursor.classList.add('cursor-line');
    }

    setTimeout(() => {
        if (cursor.classList.contains('cursor-only-opacity')) {
            cursor.classList.remove('cursor-only-opacity');
        }
    }, 10);
}




function computeWidth(element) {
    insertSpan(element, savedStart, 'selection');
    let coords1 = getSpanCoordinates(element, '.selection');
    removeSpan(element);
    insertSpan(element, savedEnd, 'end');
    let coords2 = getSpanCoordinates(element, '.end');
    removeSpan(element);

    let result = Math.abs(coords2.x - coords1.x) + 'px';
    return result;
}

function setWidth(element) {
    cursor.style.width = computeWidth(element);

    if (savedEnd !== savedStart) {
        cursor.classList.add('cursor-frame');
    } else {
        cursor.classList.remove('cursor-frame');
        cursor.style.width = '';
    }
}

// window.onkeydown = null;
// window.onmousedown = null;
// window.onmouseup = null;
// document.onkeydown = null;
// document.onmousedown = null;
// document.onmouseup = null;



// setInterval(() => {
//     moveCaret(typedText);
//     setWidth(typedText);
// }, 300);