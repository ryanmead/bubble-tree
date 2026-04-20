function prepMail() {
    var recipient = "ryandalrymple", service = "live.com"
    var mailtoLink = "mailto:" + recipient + "@" + service;
    
    // Set the browser location to the mailto link, opening the email client
    window.location.href = mailtoLink;
};