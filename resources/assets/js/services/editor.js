/**
 * Handle a paste event, checking the type and performing uploads
 * if an image is thought to need to be uploaded.
 * Returns true if an content was managed in the function otherwise false if nothing occurred.
 * @param {ClipboardEvent} event
 * @param {function(File)} uploadAction
 * @returns boolean
 */
function handlePaste(event, uploadAction, htmlAction) {
    if (!event.clipboardData || !event.clipboardData.types) return false;
    const files = event.clipboardData.files;
    const hasTableData = checkClipboardDataForTable(event.clipboardData);

    // Find any images and upload them if found
    for (const file of files) {
        if (!hasTableData && file.type.startsWith('image/')) {
            uploadAction(file);
            return true;
        }
    }

    const htmlContent = event.clipboardData.getData('text/html');
    if (htmlContent) {
        const cleanedHTML = cleanHTMLPasteContent(htmlContent);
        htmlAction(cleanedHTML);
        console.log(cleanedHTML);
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

    const badElements = [...document.querySelectorAll('script,style')];
    for (const element of badElements) {
        element.remove();
    }

    // TODO - Clear styles apart from a whitelisted set
    // TODO - Remove attributes apart from a a whitelisted set.

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
    return rtfData && rtfData.includes('\\trowd');
}


export default {
    handlePaste,
}