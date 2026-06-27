$(document).ready(function() {
  $('a[href^="#"]').on('click', function(e) {
    var target = $(this.getAttribute('href'));
    if (!target.length) return;
    e.preventDefault();
    $('html, body').stop().animate({
      scrollTop: target.offset().top - 70
    }, 300);
  });
});
