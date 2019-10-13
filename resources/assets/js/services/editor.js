/**
 * Handle a datatransfer data, commonly found on a paste or drop event.
 * Checks the type and performing uploads if an image is thought to need to be uploaded.
 * Returns true if an content was managed in the function otherwise false if nothing occurred.
 * @param {DataTransfer} dataTransfer
 * @param {function(File)} uploadAction
 * @param {function(string)} htmlAction
 * @returns boolean
 */
function handleDataTransfer(dataTransfer, uploadAction, htmlAction) {
    if (!dataTransfer || !dataTransfer.types) return false;
    const files = dataTransfer.files;
    const hasTableData = checkClipboardDataForTable(dataTransfer);

    // Find any images and upload them if found
    for (const file of files) {
        if (!hasTableData && file.type.startsWith('image/')) {
            uploadAction(file);
            return true;
        }
    }

    const htmlContent = dataTransfer.getData('text/html');
    if (htmlContent) {
        const cleanedHTML = cleanHTMLPasteContent(htmlContent);
        htmlAction(cleanedHTML);
        return true;
    }

    return false;
}

/**
 * Parse and clean up html content.
 * @param html
 * @returns {string}
 */
function cleanHTMLPasteContent(html) {
    const doc = (new DOMParser()).parseFromString(html, 'text/html');

    const badElements = [...doc.querySelectorAll('script,style')];
    for (const element of badElements) {
        element.remove();
    }

    const allowedStyles = new Set(['color', 'text-align', 'font-weight']);
    const allowedAttributes = new Set(['style', 'href', 'alt', 'src', 'align']);
    const elements = doc.querySelectorAll('*');

    for (const element of elements) {

        // Remove non-allowed attributes
        for (let i = element.attributes.length - 1; i >= 0;  i--) {
            const attr = element.attributes[i];
            if (!allowedAttributes.has(attr.name)) {
                console.log(`Removing ${attr.name}`);
                element.removeAttribute(attr.name);
            }
        }

        // Remove non-allowed styles
        const styles = Array.from(element.style);
        for (const style of styles) {
            if (!allowedStyles.has(style)) {
                element.style[style] = null;
            }
        }
    }

    return doc.body.innerHTML;
}

/**
 * Check if the given clipboardData contains something that looks like table data
 * from an application like Excel or LibreOffice
 * @param {DataTransfer} clipboardData
 * @return boolean
 */
function checkClipboardDataForTable(clipboardData) {
    const rtfData = clipboardData.getData('text/rtf');
    return Boolean(rtfData && rtfData.includes('\\trowd'));
}


export default {
    handleDataTransfer,
}