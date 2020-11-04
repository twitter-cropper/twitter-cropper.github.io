let files = [];
let cropped = [];
let cropper = null;
let curr = 0;
let startTo = 1;
let pageId = 1;

window.addEventListener("DOMContentLoaded", () => {
    let el = document.querySelector('#cropper');
    cropper = new Croppie(el, {
        viewport: { width: 1200, height: 675 },
        showZoomer: false,
        enableOrientation: false
    });
    document.addEventListener('keypress', (e) => {
        if (e.code === "Space") {
            next();
        }
    });
})

function checkUploadStat(e) {
    if (isNaN(e.key)) {
        e.preventDefault()
    }
}

function next() {
    if (pageId !== 2) {
        return
    }
    cropper.result({type: 'blob', size: 'viewport', format: 'jpeg'}).then(function(blob) {
        cropped.push(blob)
        if (curr + 1 > files.length - 1) {
            display(1);
            buildArchive();
            reset();
        } else {
            loadCropper(curr + 1);
        }
    });
}

function reset() {
    files = [];
    cropped = [];
    curr = 0;
    startTo = 1;
}

function buildArchive() {
    document.querySelector("#loading").classList.remove("hide")
    let zip = new JSZip();
    for (let i = 0; i < cropped.length; i++) {
        zip.file(`${parseInt(startTo)+i}.jpg`, cropped[i], {base64: true});
    }
    zip.generateAsync({type:"blob"})
        .then(function(content) {
            // see FileSaver.js
            saveAs(content, "cropped.zip");
            document.querySelector("#loading").classList.add("hide");
        });
}

function uploadImages(e) {
    e.preventDefault();
    if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (e.dataTransfer.items[i].kind === 'file') {
                addImage(e.dataTransfer.items[i].getAsFile());
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
            addImage(e.dataTransfer.files[i]);
        }
    }
    startTo = document.querySelector(".upload__start").value;
    loadCropper(0);
    display(2);
}

function loadCropper(i) {
    curr = i;
    let reader  = new FileReader();
    reader.addEventListener("load", function () {
        cropper.bind({
            url: this.result
        });
    }, false);
    reader.readAsDataURL(files[i]);
}

function addImage(file) {
    files.push(file);
}

function dragOverHandler(e) {
    e.preventDefault();
}

function display(i) {
    pageId = i;
    switch (i) {
        case 1:
            document.querySelector(".cropper__content").classList.add("hide")
            document.querySelector("#upload").classList.remove("hide")
            break
        case 2:
            document.querySelector("#upload").classList.add("hide")
            document.querySelector(".cropper__content").classList.remove("hide")
    }
}

// function drawLayer(ctx) {
//     ctx.fillStyle = "green";
//     ctx.fillRect(10, 10, 100, 100);
// }
//
// function background(el, ctx) {
//     ctx.fillStyle = '#181818';
//     ctx.fillRect(0, 0, el.width, el.height);
// }