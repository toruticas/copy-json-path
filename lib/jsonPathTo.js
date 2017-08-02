'use babel';

var ColType;
(function (ColType) {
    ColType[ColType["Object"] = 0] = "Object";
    ColType[ColType["Array"] = 1] = "Array";
})(ColType || (ColType = {}));
function jsonPathTo(text, offset) {
    var pos = 0;
    var stack = [];
    var isInKey = false;
    // console.log('jsonPathTo:start', text, offset)
    while (pos < offset) {
        // console.log('jsonPathTo:step', pos, stack, isInKey)
        var startPos = pos;
        switch (text[pos]) {
            case '"':
                var _a = readString(text, pos), s = _a.text, newPos = _a.pos;
                // console.log('jsonPathTo:readString', {s, pos, newPos, isInKey, frame: stack[stack.length - 1]})
                if (stack.length) {
                    var frame = stack[stack.length - 1];
                    if (frame.colType == ColType.Object && isInKey) {
                        frame.key = s;
                        isInKey = false;
                    }
                }
                pos = newPos;
                break;
            case '{':
                stack.push({ colType: ColType.Object });
                isInKey = true;
                break;
            case '[':
                stack.push({ colType: ColType.Array, index: 0 });
                break;
            case '}':
            case ']':
                stack.pop();
                break;
            case ',':
                if (stack.length) {
                    var frame = stack[stack.length - 1];
                    if (frame.colType == ColType.Object) {
                        isInKey = true;
                    }
                    else {
                        frame.index++;
                    }
                }
                break;
        }
        if (pos == startPos) {
            pos++;
        }
    }
    // console.log('jsonPathTo:end', {stack})
    return pathToString(stack);
}

function pathToString(path) {
    var s = '';
    for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var frame = path_1[_i];
        if (frame.colType == ColType.Object) {
            if (!frame.key.match(/^[a-zA-Z$_][a-zA-Z\d$_]*$/)) {
                var key = frame.key.replace('"', '\\"');
                s += "[\"" + frame.key + "\"]";
            }
            else {
                if (s.length) {
                    s += '.';
                }
                s += frame.key;
            }
        }
        else {
            s += "[" + frame.index + "]";
        }
    }
    return s;
}
function readString(text, pos) {
    var i = pos + 1;
    while (!(text[i] == '"' && text[i - 1] != '\\'))
        i++;
    return {
        text: text.substring(pos + 1, i),
        pos: i + 1
    };
}

export default jsonPathTo
