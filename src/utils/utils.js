class Utils {

    static isArray = (aRef) => Array.isArray(aRef);

    static isFunction(input) {
        return typeof input === 'function';
    }

    static isNumber(aRef) {
        return (typeof aRef === 'number');
    }

    static getDependancyVersion(dependancy) {
        const json = require("../../package.json");
        return json.dependencies[dependancy];
    }

    static isBoolean(input) {
        return (typeof (input) === typeof (true));
    }

    static isString(arg) {
        return (typeof arg === 'string' || arg instanceof String);
    }

    static isEmpty(aRef) {

        if (((aRef === undefined) || (typeof aRef === "undefined") || (aRef === null)))
            return true;
        else {
            if (((typeof aRef) === "string") || (aRef instanceof Array) || Array.isArray(aRef)) {
                return (aRef.length < 1);
            } else if (aRef instanceof Date) {
                return false;
            } else if (aRef instanceof Object) {
                return Object.getOwnPropertyNames(aRef).length < 1;
            }
            return false;
        }
    }

    static resolveElemOrThunk(elemOrThunk) {
        return (Utils.isFunction(elemOrThunk) ? elemOrThunk() : elemOrThunk)
    }

    static renderIfElse(predicate, ifElemOrThunk, elseElemOrThunk) {
        return predicate ? Utils.resolveElemOrThunk(ifElemOrThunk) : Utils.resolveElemOrThunk(elseElemOrThunk);
    }

    static stringify(aRef) {
        if (typeof aRef === "string")
            return aRef;
        return JSON.stringify(aRef);
    }

    static sleep(milliseconds) {
        let sleepUntil = Date.now() + milliseconds;
        while (Date.now() < sleepUntil) ;
    }

    static sleepAndThen(miliseconds) {
        return new Promise((accept) => {
            setTimeout(accept, miliseconds);
        });
    }

    static clone(aRef) {
        return JSON.parse(JSON.stringify(aRef));
    }

    static isObject(aRef) {
        return typeof aRef === 'object' && aRef !== null;
    }
}

module.exports = Utils;
