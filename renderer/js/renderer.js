const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e) {
    const file = e.target.files[0];

    if (!isFileImage(file)) {
        alertError('Please select an image file');
        return;
    }

    // Create a new window for the preview
    const previewWindow = window.open('preview.html', '_blank');

    // Get original dimensions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function() {
        const imageWidth = this.width;
        const imageHeight = this.height;

        // Set width and height of the preview window
        console.log(imageWidth, imageHeight);
        const windowWidth = imageWidth + 50;
        const windowHeight = imageHeight + 80;
        console.log(windowWidth, windowHeight);
        previewWindow.resizeTo(windowWidth, windowHeight);

        // Pass the image file path and dimensions to the preview window
        previewWindow.onload = function() {
            previewWindow.postMessage({
                imagePath: URL.createObjectURL(file),
                width: imageWidth,
                height: imageHeight
            }, '*');
            const previewImage = previewWindow.document.createElement('img');
            previewImage.src = URL.createObjectURL(file);
            previewWindow.document.body.appendChild(previewImage);
        };
    }

    form.style.display = 'block';
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.homedir(), 'Image_Resizer');
}


// Send image to main
function sendImage(e) {
    e.preventDefault();

    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;

    if (!img.files[0]) {
        alertError('Please select an image file');
        return;
    }

    if (!width || !height) {
        alertError('Please enter a width and height');
        return;
    }

    //Send to main using ipcRenderer
    ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height,
    });
}

//listen for image:done
ipcRenderer.on('image:done', () => {
    alertSuccess('Image resized successfully!');
});

//Make sure file is an image
function isFileImage(file) {
    const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    return file && acceptedImageTypes.includes(file['type']);
}

function alertError(message) {
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            background: 'red',
            color: 'white',
            textAlign: 'center',
        }
    })
}

function alertSuccess(message) {
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            background: 'green',
            color: 'white',
            textAlign: 'center',
        }
    })
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);

// //on input change update preview
// widthInput.addEventListener('input', updatePreview);
// heightInput.addEventListener('input', updatePreview);


// function updatePreview() {
//     const width = widthInput.value;
//     const height = heightInput.value;

//     const previewImage = document.querySelector('#preview-image');
//     previewImage.style.width = width + 'px';
//     previewImage.style.height = height + 'px';
// }