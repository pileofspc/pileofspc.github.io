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
    range.setStart(element.childNodes[0], start);
    range.setEnd(element.childNodes[0], end);

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

function typeQuote() {
    let listenerArray = [document.onkeydown, document.onmousedown, document.onmouseup]
    document.onkeydown = null;
    document.onmousedown = null;
    document.onmouseup = null;
    inputField.setAttribute('readonly', '');

    function type() {
        inputField.value += letter.getSetNext();
        triggerInputEvent();
        moveCaret(typedText);

        let timerId = setTimeout(type, 50);
        if (letter.done) {
            clearTimeout(timerId);
            document.onkeydown = listenerArray[0];
            document.onmousedown = listenerArray[1];
            document.onmouseup = listenerArray[2];
            inputField.removeAttribute('readonly');
        }
    };
    setTimeout(type, 200);
    return 'quote'
};
























const delayVisible = 600;
const delayHidden = 300;

// Показать курсор + создать таймаут на след. функцию
function cursorFlickerShow () {
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



























function triggerInputEvent() {
    inputField.dispatchEvent(
        new Event('input', {bubbles:true})
        );
}

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

function getPositionSorted(index) {
    let start;
    let end;

    if (savedEnd >= savedStart) {
        start = savedStart;
        end = savedEnd;
    } else {
        start = savedEnd;
        end = savedStart;
    }

    return [start, end][index];
}

function moveCaret(element) {
    let coords;
    let defaultCoords;

    insertSpan(element, getPositionSorted(0), 'selection');
    coords = getSpanCoordinates(element, '.selection');
    removeSpan(element);

    insertSpan(typedText, typedText.textContent.length, 'end');
    defaultCoords = getSpanCoordinates(typedText, '.end');
    removeSpan(typedText);
    

    // Пока не знаю, стоит ли оставить

    // if (coords.y + 'px' !== cursor.style.top) {
    //     cursor.classList.add('cursor-only-opacity');
    // };

    cursor.style.transform = `translateX(${coords.x - defaultCoords.x - 10.5}px)`;
    cursor.style.top = coords.y + window.scrollY +'px';
    if (savedStart === savedEnd && savedEnd === element.textContent.length) {
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

function resetCaret() {
    cursor.style = '';
    cursor.setAttribute('class', 'cursor');
    savedStart = savedEnd = inputField.selectionStart = inputField.value.length;
}