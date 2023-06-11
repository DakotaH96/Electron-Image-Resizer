const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');
const brightnessValue = document.querySelector('.brightness')

let previewImage;
let previewWindow;
let brightnessAdjusted;

function loadImage(e) {
    const file = e.target.files[0];

    if (!isFileImage(file)) {
        alertError('Please select an image file');
        return;
    }

     previewWindow = window.open('preview.html', '_blank');
    
    // Get original dimensions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function() {
        heightInput.value = this.height;
        widthInput.value = this.width;
        const imageWidth = this.width;
        const imageHeight = this.height;

        // Set width and height of the preview window
        
        const windowWidth = imageWidth + 50;
        const windowHeight = imageHeight + 80;
        
        previewWindow.resizeTo(windowWidth, windowHeight);

        // Pass the image file path and dimensions to the preview window
        previewWindow.onload = function() {
            previewWindow.postMessage({
                imagePath: URL.createObjectURL(file),
                width: imageWidth,
                height: imageHeight
            }, '*');
            previewImage = previewWindow.document.createElement('img');
            previewImage.id = 'preview-image';
            previewImage.src = URL.createObjectURL(file);
            previewWindow.document.body.appendChild(previewImage);
            previewImage.style.width = imageWidth + 'px';
            previewImage.style.height = imageHeight + 'px';
            

            
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
    const brightness = brightnessAdjusted;

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
        brightness
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


// Update preview image on width input change
widthInput.addEventListener('input', function() {
    const newWidth = parseInt(widthInput.value);
    console.log("new width: " + newWidth);
    updatePreviewImageSize(newWidth, null);
});

// Update preview image on height input change
heightInput.addEventListener('input', function() {
    const newHeight = parseInt(heightInput.value);
    console.log("new height: " + newHeight);
    updatePreviewImageSize(null, newHeight);
});

// Update brightness value and preview image on brightness slider change
brightnessValue.addEventListener('input', function () {
    const brightness = parseFloat(brightnessValue.value);
    brightnessValue.innerText = brightness;
    console.log("new brightness: " + brightness);
    updatePreviewImageBrightness(brightness);
  });

// Function to update the size of the preview image
function updatePreviewImageSize(newWidth, newHeight) {
    if (!previewImage) {
        console.error('Preview image element not found');
        return;
    }

    // Get the current width and height values as integers
    const currentWidth = parseInt(previewImage.style.width);
    const currentHeight = parseInt(previewImage.style.height);

    // Calculate new dimensions if only one of width or height is provided
    const updatedWidth = newWidth || currentWidth;
    const updatedHeight = newHeight || currentHeight;

    // Update the style properties of the preview image
    previewImage.style.width = updatedWidth + 'px';
    previewImage.style.height = updatedHeight + 'px';

    previewWindow.resizeTo(updatedWidth + 50, updatedHeight + 80);

    
}


// Function to update the brightness of the preview image
function updatePreviewImageBrightness(brightness) {
    if (!previewImage) {
      console.error('Preview image element not found');
      return;
    }
  
    // Apply brightness filter to the preview image
    previewImage.style.filter = `brightness(${brightness}%)`;

    brightnessAdjusted = previewImage.style.filter;

  }