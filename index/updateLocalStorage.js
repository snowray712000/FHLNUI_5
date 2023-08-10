(function (root) {
    root.updateLocalStorage = updateLocalStorage
})(this)
function updateLocalStorage() {
    localStorage.setItem("fhlPageState", JSON.stringify(pageState));
}
