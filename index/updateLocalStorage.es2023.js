
export function updateLocalStorage() {
    const ps = window.pageState;
    localStorage.setItem("fhlPageState", JSON.stringify(ps));
}

// (function (root) {
//     root.updateLocalStorage = updateLocalStorage
// })(this)