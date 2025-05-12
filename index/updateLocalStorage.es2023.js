import { TPPageState } from "./TPPageState.es2023.js";

export function updateLocalStorage() {
    const ps = TPPageState.s
    localStorage.setItem("fhlPageState", JSON.stringify(ps));
}

// (function (root) {
//     root.updateLocalStorage = updateLocalStorage
// })(this)