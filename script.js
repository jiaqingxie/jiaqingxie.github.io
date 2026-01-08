window.dataLayer = window.dataLayer || [];

function gtag() {
    dataLayer.push(arguments);
}

gtag('js', new Date());
gtag('config', 'G-BJMTFXKKQK');


document.addEventListener('keydown', function(evt) {
    if (evt.keyCode == 27) {
        close();
    }
});

function selectContent(query) {
    var range = document.createRange();
    var selection = window.getSelection();
    var elem = document.querySelector(query);
    range.selectNodeContents(elem);
    selection.removeAllRanges();
    selection.addRange(range);
}

function close() {
    document.querySelectorAll("video").forEach(function(video) {
        video.pause();
        video.currentTime = 0;
        video.load();
    });
    location.href="##";
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll("video").forEach(function(video) {
        video.currentTime = 0;
        video.load();
    });
});