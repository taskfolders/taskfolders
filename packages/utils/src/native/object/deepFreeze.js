"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepFreeze = void 0;
const deepFreeze = obj => {
    Object.keys(obj).forEach(prop => {
        if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop]))
            (0, exports.deepFreeze)(obj[prop]);
    });
    return Object.freeze(obj);
};
exports.deepFreeze = deepFreeze;
//# sourceMappingURL=deepFreeze.js.map