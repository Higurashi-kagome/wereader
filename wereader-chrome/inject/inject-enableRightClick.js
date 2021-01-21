(function enableRightClick() {
    window.addEventListener("contextmenu",function(t) {
        t.stopImmediatePropagation();
    },true);
})()