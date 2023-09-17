"use strict"

document.body.classList.add('no-select')

// Ищем элементы
let done = document.querySelector('.done');
let todo = document.querySelector('.todo');
let typedText = document.querySelector('.typed-text');
// UNUSED: typedText.innerHTML = removeLineBreaks(typedText.innerHTML);    // innerHTML меняет элементы внутри себя, поэтому все querySelector'ы, прописанные внутри данного элемента становятся недействительными((((

let cursor = document.querySelector(".cursor");
let form = document.querySelector('form')
let inputField = document.querySelector('.input-field');


// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Добавляем обработчики и передаем фокус на элемент ввода
inputField.focus();


// Контроль каретки

let caret = new class Caret {
    constructor() {
        this.savedStart = 0;
        this.savedEnd = 0;
        this.lineHeight = parseFloat(window.getComputedStyle(document.querySelector('p')).lineHeight);
    }

    insertSpan(element, index, className) {
        let span = document.createElement('span');
        if (className) {
            span.classList.add(className);
        }
        span.textContent = '\u2060';
    
        let text = element.childNodes[0];
        text.splitText(index).before(span);
    
        return span;
    }
    removeSpan(element) {
        let collection = element.querySelectorAll('span');
        for (let item of collection) {
            item.remove();
        }
        element.normalize();
    }
    getSpanCoordinates(element, className) {
        let span = element.querySelector(className);
        let rect = span.getBoundingClientRect();
        return rect
    }
    getPositionSorted(index) {
        let start;
        let end;
        if (this.savedEnd >= this.savedStart) {
            start = this.savedStart;
            end = this.savedEnd;
        } else {
            start = this.savedEnd;
            end = this.savedStart;
        }
        if (index !== undefined) {
            return [start, end][index];
        } else {
            return [start, end];
        }
    }
    move(element) {
        let coords;
        let defaultCoords;
    
        this.insertSpan(element, this.getPositionSorted(0), 'selection');
        coords = this.getSpanCoordinates(element, '.selection');
        this.removeSpan(element);
    
        this.insertSpan(typedText, typedText.textContent.length, 'end');
        defaultCoords = this.getSpanCoordinates(typedText, '.end');
        this.removeSpan(typedText);
        
    
        // Пока не знаю, стоит ли оставить
    
        // if (coords.y + 'px' !== cursor.style.top) {
        //     cursor.classList.add('cursor-only-opacity');
        // };
    
        cursor.style.transform = `translateX(${coords.x - defaultCoords.x - 10.5}px)`;
        cursor.style.top = coords.y + window.scrollY +'px';
        if (this.savedStart === this.savedEnd && this.savedEnd === element.textContent.length) {
            cursor.classList.remove('cursor-line');
            cursor.style.transform = 'translateX(0)'
        } else {
            cursor.classList.add('cursor-line');
        }
    
        // ТУТ НУЖНО РАЗОБРАТЬСЯ, ТАЙМАУТ НЕ МОМЕНТАЛЬНЫЙ
        setTimeout(() => {
                cursor.classList.remove('cursor-only-opacity');
        }, 10);
    }
    computeSelection(element) {
        this.insertSpan(element, this.getPositionSorted(0), 'selection');
        let coords1 = this.getSpanCoordinates(element, '.selection');
        this.removeSpan(element);
        this.insertSpan(element, this.getPositionSorted(1), 'end');
        let coords2 = this.getSpanCoordinates(element, '.end');
        this.removeSpan(element);

        let lines = (coords2.y - coords1.y) / this.lineHeight;
        let oneLineWidth = Math.abs(coords2.x - coords1.x) + 'px';
        let multiLineWidth = coords2.x + 'px';
        return {
            coords1: coords1,
            coords2: coords2,
            lines: lines,
            oneLineWidth: oneLineWidth,
            multiLineWidth: multiLineWidth
        }
    }

    expandSelection(element) {
        this.removeAdditionalCursors();
        let computed = this.computeSelection(element);

        if (computed.lines === 0) {
            cursor.style.width = computed.oneLineWidth;
        }

        if (computed.lines > 0) {
            cursor.style.width = '110%';

            this.createAdditionalCursors(computed.lines);
            let cursors = this.getAdditionalCursors();
            let currentAnimationTime = cursor.getAnimations()[0].currentTime;
            let accumulatedY = computed.coords1.y + this.lineHeight;
            for (let i = 0; i < cursors.length; i++) {
                // sync animations
                cursors[i].getAnimations()[0].startTime = currentAnimationTime;

                cursors[i].style.left = '-10px';
                cursors[i].style.top = accumulatedY + 'px';

                accumulatedY += this.lineHeight;

                cursors[i].style.width = '110%'
                if (i === cursors.length - 1) {
                    cursors[i].style.width = computed.multiLineWidth
                }
            }
        }
    
        if (this.savedEnd !== this.savedStart) {
            cursor.classList.add('cursor-frame');
        } else {
            cursor.classList.remove('cursor-frame');
            cursor.style.width = '';
        }
    }

    reset() {
        cursor.style = '';
        cursor.setAttribute('class', 'cursor');
        this.savedStart = this.savedEnd = inputField.selectionStart = inputField.value.length;
    }

    createAdditionalCursors(number) {
        for (let i = 0; i < number; i++) {
            let span = document.createElement('span');
            span.classList.add('cursor', 'cursor-frame', 'additional-cursor');
            span.style.width = '200px';
            cursor.after(span);
        }
    }
    getAdditionalCursors() {
        return document.querySelectorAll('.additional-cursor');
    }
    removeAdditionalCursors() {
        let additionalCursors = this.getAdditionalCursors();
        for (let cursor of additionalCursors) {
            cursor.remove();
        }
    }
}

// Функционал последних введенных команд
let lastEntered = new class LastEntered {
    constructor() {
        this.array = [];
        this.position = -1;
    }
    
    pushMax10() {
        if (this.array.length < 10) {
            this.array.push(typedText.textContent);
        } else {
            this.array.shift();
            this.array.push(typedText.textContent);
        }
    }
    get() {
        let lastIndex = this.array.length - 1;
        let currentIndex = lastIndex - this.position;
        return this.array[currentIndex];
    }
    setPrevious() {
        if (this.position < this.array.length - 1) this.position++
    }
    setNext() {
        if (this.position > -1) this.position--
    }
    getSetPrevious() {
        this.setPrevious();
        return this.get();
    }
    getSetNext() { 
        this.setNext();
        return this.get();
    }
};

// Вывод рандомной цитаты
// Рандомное число в диапазоне - взято с MDN https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;       //Максимум не включается, минимум включается
}

let quotes = new class Quotes {
    constructor() {
        this.timer = '';
        this.quotes = [
            'Падение - это не провал. Провал это Провал. Падение - это где упал.',
            'Не важно у кого день рождения. Важно у кого день рождения кого.',
            'Лучше один раз упасть, чем сто раз упасть.',
            'Каждый думает, что знает меня, но не каждый знает, что не знает, кто думает.',
            'Как бы сейчас не было сейчас. Все будет было.',
            'Не слушай тех, кто много обещает. Они обычно много обещают.',
            'Волк слабее санитара, но в дурке он не работает.',
            'Никогда не поздно, никогда не рано - поменять все поздно, если это рано.',
        ];
        this.quote = '';
        this.i = 0;
        this.done = false;
    }

    getRandomQuote() {
        return this.quotes[getRandomInt(0, this.quotes.length)];
    }
    setRandomQuote() {
        this.quote = this.quotes[getRandomInt(0, this.quotes.length)];
        return this.quote
    }
    getLetter() {
        return this.quote[this.i]
    }
    incrementI() {
        this.i++;
    }
    reset() {
        this.quote = '';
        this.i = 0;
        this.done = false;
    }
    letter() {
        if (this.done) {
            this.reset();
        }
        if (this.quote === '') {
            this.setRandomQuote();
        }

        let result = this.getLetter();
        this.incrementI();
        if (this.getLetter() === undefined) {
            this.done = true;
        }
        return result;
    }
    typeLetter() {
        inputField.value += this.letter();
        handlers.triggerInputEvent();
        this.timer = setTimeout(()=>{this.typeLetter()}, 50);
        if (this.done) {
            clearTimeout(this.timer);
            handlers.unblock();
        }
    }
    type() {
        handlers.saveBlock();
        setTimeout(()=>{this.typeLetter()}, 200);
    }

};

// Действия с обработчиками и ивентами
let handlers = new class Handlers{
    constructor() {
        this.listenerArray = [];
    }
    
    save() {
        this.listenerArray = [document.onkeydown, document.onmousedown, document.onmouseup, form.onsubmit];
    }
    block() {
        document.onkeydown = null;
        document.onmousedown = null;
        document.onmouseup = null;
        form.onsubmit = function(evt) {
            evt.preventDefault()
            return
        };
        inputField.setAttribute('readonly', '');
    }
    saveBlock() {
        this.save();
        this.block();
    }
    unblock() {
        document.onkeydown = this.listenerArray[0];
        document.onmousedown = this.listenerArray[1];
        document.onmouseup = this.listenerArray[2];
        form.onsubmit = this.listenerArray[3];
        inputField.removeAttribute('readonly');
    }
    triggerInputEvent() {
        inputField.dispatchEvent(
            new Event('input', {bubbles:true})
            );
    }
};

// Обработчики кликов мыши
document.onmousedown = function(evt) {
    if (!evt.shiftKey) {
        // Простой клик
        if (evt.target === done || evt.target.parentElement === done) {
            todo.classList.add('no-select');
        } else {
            done.classList.add('no-select');
        }

        if (evt.target === document.body) {
            document.body.classList.remove('no-select');
        }

    } else {
        // Шифт + клик
        if (window.getSelection().anchorNode.parentElement.parentElement === done || window.getSelection().anchorNode.parentElement === done) {
            todo.classList.add('no-select');
        } else {
            done.classList.add('no-select');
        }
        // ОПЦИОНАЛЬНО - при шифт-клике на противоположную сторону выделяет до конца/начала текущей стороны, но при этом сбрасывается действие дефолтного выделения,
        // т.е нельзя больше двигать мышью при нажатой кнопке, чтобы выбрать конец выделения - он уже как бы выбран кодом ниже, как будто кнопка уже была отпущена

        // if ((evt.target.classList.contains('no-select') || evt.target.parentElement.classList.contains('no-select')) &&
        // (evt.target === done || evt.target.parentElement === done)) {
        //     let currentNode = typedText.childNodes[0];
        //     window.getSelection().extend(currentNode, 0);
        // }
        // if (evt.target.classList.contains('no-select') && evt.target === typedText) {
        //     let currentNode = done.querySelector('p:last-child').childNodes[0];
        //     window.getSelection().extend(currentNode, currentNode.length);
        // }
    }

    // Это для того, чтобы при клике внутри выбранного текста выделение начиналось заново
    if (!evt.shiftKey && evt.button !== 2) {
        window.getSelection().removeAllRanges();
    } 
}
document.onmouseup = function (evt) {
    // Без первого условия выдает ошибку (когда ничего еще не выделено)
    if (window.getSelection().anchorNode) {
        if (window.getSelection().anchorNode.parentElement === typedText || window.getSelection().anchorNode === document.body) {
        
            caret.savedStart = window.getSelection().anchorOffset;
            caret.savedEnd = window.getSelection().focusOffset;
            if (window.getSelection().anchorNode === document.body) {
                caret.savedStart = typedText.textContent.length;
            }
            if (window.getSelection().focusNode === document.body) {
                caret.savedEnd = typedText.textContent.length;
            }
    
            if (typedText.textContent) {
                caret.move(typedText);
                caret.expandSelection(typedText);
            }
        }
    }

    todo.classList.remove('no-select');
    done.classList.remove('no-select');
    document.body.classList.add('no-select');
 }

// Обработчики нажатий на клавиши, ввода и отправки формы
// Функционал Backspace, CTRL + Backspace, Enter, ArrowUp, доп. команды

// БИНД ДЛЯ ТЕСТИРОВАНИЯ
// window.addEventListener('keydown', function(evt) {
//     if (evt.code == 'KeyP') {
//         console.log(handlers.listenerArray)
//     }
// });

document.onkeydown = function (evt) {
    if (evt.code == 'KeyC' && evt.ctrlKey) {
            return
    }
    if (evt.key == 'Delete') {
        cursor.classList.add('cursor-only-opacity');
    }
    if (evt.key == 'Backspace' && evt.ctrlKey) {
        typedText.textContent = '';
        inputField.value = typedText.textContent;
    }
    if (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') {
        setTimeout(() => {
            handlers.triggerInputEvent();
        });
    }
    if (evt.key === 'ArrowUp') {
        evt.preventDefault();                                        // evt.preventDefault(); здесь нужен, т.к при нажатии ArrowUp по умолчанию каретка в input уходит в начало, что нам не нужно
        typedText.textContent = lastEntered.getSetPrevious();
        inputField.value = typedText.textContent;

        setTimeout(() => {
            handlers.triggerInputEvent();
        });

        // ДОБАВИТЬ СЮДА УСЛОВИЕ, чтобы на последней команде не сбрасывалось
        caret.reset();
    }
    if (evt.key === 'ArrowDown') {
        evt.preventDefault();                                       // здесь необязательно вроде бы, но добавил для унификации
        typedText.textContent = lastEntered.getSetNext();
        inputField.value = typedText.textContent;

        setTimeout(() => {
            handlers.triggerInputEvent();
        });

        // ДОБАВИТЬ СЮДА УСЛОВИЕ, чтобы на последней команде не сбрасывалось
        caret.reset();
    }
    if (evt.key !== 'Shift' &&
        evt.key !== 'Control' &&
        evt.key !== 'Alt' &&
        evt.key !== 'ArrowUp' &&
        evt.key !== 'ArrowDown' &&
        evt.key !== 'CapsLock') {
            inputField.focus();
            cursor.classList.add('cursor-only-opacity');
    }
    if (evt.key !== 'Shift' && evt.key !== 'Control' && evt.key !== 'Alt' && evt.key !== 'CapsLock') {
        inputField.selectionStart = caret.getPositionSorted(0);
        inputField.selectionEnd = caret.getPositionSorted(1);
    }
}
inputField.oninput = function () {
    typedText.textContent = inputField.value;
    window.scroll(0, document.body.clientHeight);

    // После того, как в инпут попадает буква или в нем перемещается курсор - возвращаем новое положение курсора в переменные и двигаем по ним каретку
    caret.savedStart = inputField.selectionStart;
    caret.savedEnd = inputField.selectionEnd;
    if (typedText.textContent) {
        caret.move(typedText);
        caret.expandSelection(typedText);
    }
};

// setTimeout тут нужен для того, чтобы результат команды появлялся позже, чем сама команда в независимости от положения renderCommandResult в коде
function renderCommandResult(text) {
    setTimeout(() => {
    let commandResult = document.createElement('p');
 
    commandResult.classList.add('command-result');
    commandResult.textContent = text + '\n';
    done.appendChild(commandResult);
    });
}
form.onsubmit = function(evt) {
    evt.preventDefault();

    // DANGER ZONE!!! DANGER DANGER DANGER USER DEFINED CODE EXECUTION IS IMMINENT!!!
    // DANGER ZONE!!! DANGER DANGER DANGER USER DEFINED CODE EXECUTION IS IMMINENT!!!
    // DANGER ZONE!!! DANGER DANGER DANGER USER DEFINED CODE EXECUTION IS IMMINENT!!!

    typedText.classList.add('add-line');
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
            'Ctrl + Backspace - удалить всю строку'
        );
    }
    if (typedText.textContent === 'type') {
        quotes.type();
    }
    // если строка начинается с 'run ', то выполняем команду и выдаем результат в качестве пишки с классом run-result, если нет, то просто продолжаем выполнение блока, т.е записываем просто текстом
    if (typedText.textContent.slice(0, 4) === 'run ') {
        let command = String(Function('return ' + typedText.textContent.slice(4))());
        renderCommandResult(command);
    }
    //  если строка равна clear убираем все пишки, кроме текущей, очищаем поле ввода, убираем линию раздела и сбрасываем каретку
    if (typedText.textContent === 'clear') {
        let pTags = document.querySelectorAll('p:not(.typed-text)');
        for (let pTag of pTags) {
            pTag.remove()
        }
        typedText.textContent = inputField.value = '';
        typedText.classList.remove('add-line')
        caret.reset();
        return
    }

    // если набрали exit или quit - переходим на главную страницу
    if (typedText.textContent === 'exit' || typedText.textContent === 'quit') {

        // window.location.href = 'https://pileofspc.github.io/';
        window.open('https://pileofspc.github.io/', '_self', "noreferrer, noopener")
    }
    if (typedText.textContent === 'quote') {
        renderCommandResult(quotes.getRandomQuote());
    }


    // Записываем последнее значение в массив, переходим на новую строку, убираем класс, добавляем новую p'шку, и присваиваем ее в переменную typedText
    lastEntered.pushMax10();

    let newP = document.createElement('p');
    newP.textContent = typedText.textContent + '\n';
    done.appendChild(newP);

    //Обнуляем поле ввода и текст в пишке
    inputField.value = '';
    typedText.textContent = inputField.value;

    // Обнуляем позицию счетчика последних введенных значений
    lastEntered.position = -1;

    caret.reset();
    setTimeout(() => {
        window.scroll(0, document.body.clientHeight);
    });
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// АНИМАЦИИ, можно переделать на CSS, просто ради тренировки решил сделать на JS
let animation = new class Animation {
    constructor() {
        this.delayVisible = 600;
        this.delayHidden = 300;
        this.timer = null;
    }
    // Показать курсор + создать таймаут на след. функцию
    show() {
        cursor.style.opacity = '100%';

        this.timer = setTimeout(()=>{
            this.hide();
        }, this.delayVisible);
    }
    // Скрыть курсор + создать таймаут на след. функцию
    hide() {
        cursor.style.opacity = '0';

        this.timer = setTimeout(()=>{
            this.show();
        }, this.delayHidden);
    };
    // Старт и стоп анимации
    start() {
        this.hide()
    };
    stop() {
        clearTimeout(this.timer);
        cursor.style.opacity = '100%';
    };
}
// animation.start();