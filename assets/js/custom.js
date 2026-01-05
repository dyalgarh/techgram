(function ($) {
	
	"use strict";

	// Header Type = Fixed
  $(window).scroll(function() {
    var scroll = $(window).scrollTop();
    var box = $('.header-text').height();
    var header = $('header').height();

    if (scroll >= box - header) {
      $("header").addClass("background-header");
    } else {
      $("header").removeClass("background-header");
    }
  });


	$('.loop').owlCarousel({
      center: true,
      items:2,
      loop:true,
      nav: true,
      margin:30,
      responsive:{
          
          992:{
              items:4
          }
      }
  });
	

	// Menu Dropdown Toggle
  if($('.menu-trigger').length){
    $(".menu-trigger").on('click', function() { 
      $(this).toggleClass('active');
      $('.header-area .nav').slideToggle(200);
    });
  }


  // Menu elevator animation
  $('.scroll-to-section a[href*=\\#]:not([href=\\#])').on('click', function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        var width = $(window).width();
        if(width < 991) {
          $('.menu-trigger').removeClass('active');
          $('.header-area .nav').slideUp(200);  
        }       
        $('html,body').animate({
          scrollTop: (target.offset().top) + 1
        }, 700);
        return false;
      }
    }
  });

  $(document).ready(function () {
      $(document).on("scroll", onScroll);
      
      //smoothscroll
      $('.scroll-to-section a[href^="#"]').on('click', function (e) {
          e.preventDefault();
          $(document).off("scroll");
          
          $('.scroll-to-section a').each(function () {
              $(this).removeClass('active');
          })
          $(this).addClass('active');
        
          var target = this.hash,
          menu = target;
          var target = $(this.hash);
          $('html, body').stop().animate({
              scrollTop: (target.offset().top) + 1
            }, 500, 'swing', function () {
              // Do not add the fragment to the URL. If a fragment exists, remove it.
              if (history && history.replaceState) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
              }
              $(document).on("scroll", onScroll);
            });
      });
  });

  function onScroll(event){
      var scrollPos = $(document).scrollTop();
      $('.nav a').each(function () {
          var currLink = $(this);
          var refElement = $(currLink.attr("href"));
          if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
              $('.nav ul li a').removeClass("active");
              currLink.addClass("active");
          }
          else{
              currLink.removeClass("active");
          }
      });
  }



	// Page loading animation
	 $(window).on('load', function() {

        $('#js-preloader').addClass('loaded');

    });

	

	// Window Resize Mobile Menu Fix
  function mobileNav() {
    var width = $(window).width();
    $('.submenu').on('click', function() {
      if(width < 767) {
        $('.submenu ul').removeClass('active');
        $(this).find('ul').toggleClass('active');
      }
    });
  }


  document.getElementById("contact").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const payload = {
    name: document.getElementById("name").value.trim(),
    business_name: document.getElementById("business").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    subject: document.getElementById("subject").value.trim(),
    service_required: document.getElementById("service").value,
    message: document.getElementById("message").value.trim()
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error();

    showContactMessage("Thanks! We’ll contact you soon.", "success");
  } catch (err) {
    showContactMessage("Something went wrong. Please try again.", "error");
  } finally {
    // Clear the form whether the submission succeeded or failed
    try { form.reset(); } catch (e) {}
  }
});

// helper to display inline success/error messages
function showContactMessage(text, type) {
  const el = document.getElementById('contact-message');
  if (!el) return;
  el.classList.remove('success', 'error');
  el.classList.add(type === 'success' ? 'success' : 'error');
  el.textContent = text;
  el.hidden = false;
  if (showContactMessage._timeout) clearTimeout(showContactMessage._timeout);
  showContactMessage._timeout = setTimeout(() => { el.hidden = true; }, 6000);
}


})(window.jQuery);