// MAIN.JS
//--------------------------------------------------------------------------------------------------------------------------------
//This is main JS file that contains custom JS scipts and initialization used in this template*/
// -------------------------------------------------------------------------------------------------------------------------------
// Template Name: Roker.
// Author: Iwthemes.
// Version 1.4 - Updated on 01 / 04 / 2015
// Website: http://www.iwthemes.com 
// Email: support@iwthemes.com
// Copyright: (C) 2015 
// -------------------------------------------------------------------------------------------------------------------------------

$(document).ready(function($) {

	'use strict';
	  
	//=================================== Twitter Feed  ======================================//
    /*
	$(".twitter").tweet({
        modpath: 'js/twitter/index.php',
        username: "envato",
        count: 5,
        loading_text: "Loading tweets...",
    });
    */

    //=================================== Flikr Feed  ========================================//
	/*
    $('#flickr').jflickrfeed({
		limit: 8, //Number of images to be displayed
		qstrings: {
			id: '36587311@N08'//Change this to any Flickr Set ID as you prefer.
		},
		itemTemplate: '<li><a href="{{image_b}}" class="fancybox"><img src="{{image_s}}" alt="{{title}}" /></a></li>'
	});

	$('#flickr-aside').jflickrfeed({
		limit: 10, //Number of images to be displayed
		qstrings: {
			id: '36587311@N08'//Change this to any Flickr Set ID as you prefer.
		},
		itemTemplate: '<li><a href="{{image_b}}" class="fancybox"><img src="{{image_s}}" alt="{{title}}" /></a></li>'
	});
	*/
	
 	//=================================== Sticky nav ===================================//
	$("header").sticky({topSpacing:0});

	//=================================== Nav Responsive ==============================//
    $('#menu').tinyNav({
       active: 'selected'
    });

    //=================================== Parallax Efect ==============================//
  	$('.bg_parallax').parallax("50%", .12);

  	//=================================== Loader =====================================//
	jQuery(window).load(function() {
		jQuery(".status").fadeOut();
	    jQuery(".preloader").delay(1000).fadeOut("slow");
	})

    //=================================== Nav Superfish ===============================//
	// $('ul.sf-menu').superfish();

	//=================================== Nav Scroll One Page===========================//
	$('nav ul li a').click(function(){
        var el = $(this).attr('href');
        var elWrapped = $(el);  
        scrollToDiv(elWrapped,40);
        return false;    
    });
    function scrollToDiv(element,navheight){
		var offset = element.offset();
		var offsetTop = offset.top;
		var totalScroll = offsetTop-navheight;
			$('body,html').animate({
						scrollTop: totalScroll
			}, 500);
    }

  	//=================================== Accordion  =================================//
	$('.accordion-container').hide(); 
	$('.accordion-trigger:first').addClass('active').next().show();
	$('.accordion-trigger').click(function(){
		if( $(this).next().is(':hidden') ) { 
			$('.accordion-trigger').removeClass('active').next().slideUp();
			$(this).toggleClass('active').next().slideDown();
		}
		return false;
	});
   	
   	//=================================== jBar  =============================================//
	$('.jBar').hide();
	$('.jRibbon').show().removeClass('up', 500);
	$('.jTrigger').click(function(){
		$('.jRibbon').toggleClass('up', 500);
		$('.jBar').slideToggle();
	});

	//=================================== Simple slide  ====================================//
	$('.carousel').carousel();

	//=================================== Carousel Services  ===============================//
	$("#services-carousel").owlCarousel({
		autoPlay: 3200,      
		items : 4,
		navigation: true,
		itemsDesktop : [1600,3],
		itemsDesktopSmall : [1024,2],
		itemsMobile : [800,1],
		pagination: false
	});

	//=================================== Carousel Works  ==================================//
 	$("#works").owlCarousel({	
		autoPlay: 3200,      
		items : 5,
		navigation: true,
		itemsDesktop : [1600,4],
		itemsDesktopSmall : [1024,3],
		itemsMobile : [500,1],
		pagination: true
	});

	//=================================== Carousel works-no-margin  ==================================//
 	$("#works-no-margin").owlCarousel({	
		autoPlay: 3200,      
		items : 4,
		navigation: false,
		itemsDesktop : [1600,4],
		itemsDesktopSmall : [1024,3],
		itemsMobile : [500,1],
		pagination: false
	});

	//=================================== Carousels Footer  =================================//
  	$(".tweet_list").owlCarousel({
		autoPlay: 4000,      
		items : 1,
	    navigation: false,
	    pagination: true, 
		singleItem: true
	});

	//=================================== Slide Services  ==================================//
 	$("#slide-services").owlCarousel({
		autoPlay: false,
		items : 1,
        navigation : true,
        autoHeight : true,
        slideSpeed : 400,
        singleItem: true,
        pagination : true
	});

  	//=================================== Carousel Sponsors  ================================//
 	$("#sponsors").owlCarousel({
      autoPlay: 3200,      
       items : 6,
       navigation: true,
       itemsDesktopSmall : [1024,4],
       itemsTablet : [768,3],
       itemsMobile : [500,2],
       pagination: false
	});

	//=================================== Slide Services  ================================//
	$("#slide-team").owlCarousel({
		items : 1,
		autoPlay: false,  
    	navigation : true,
    	autoHeight : true,
    	slideSpeed : 400,
    	singleItem: true,
    	pagination : false
	});

	//=================================== Subtmit Form  ====================================//
	$('.form-contact').submit(function(event) {  
	    event.preventDefault();  
	    var url = $(this).attr('action');  
	    var datos = $(this).serialize();  
	    $.get(url, datos, function(resultado) {  
	    	$('.result').html(resultado);  
		});  
 	});  

	//=================================== Subtmit Form Newslleter ===========================//
	$('#newsletterForm').submit(function(event) {  
	    event.preventDefault();  
	    var url = $(this).attr('action');
	    var datos = $(this).serialize();  
	    $.get(url, datos, function(resultado) {  
	        $('#result-newsletter').html(resultado);  
		});
	});  

	//=================================== Ligbox  ===========================================//	
	$('.fancybox').fancybox({
		'overlayOpacity'	:  0.7,
		'overlayColor'		: '#000000',
		'transitionIn'		: 'elastic',
		'transitionOut'		: 'elastic',
    	'easingIn'			: 'easeOutBack',
    	'easingOut'      	: 'easeInBack',
		'speedIn'         	: '700',
		'centerOnScroll'	: true,
		'titlePosition'     : 'over'
	});

	//=================================== Tooltips ========================================//
	// tooltip demo
    $('.sponsors, .social, .icons-work, .tooltip-hover').tooltip({
      selector: "[data-toggle=tooltip]",
      container: "body"
   	});

    //=================================== Hover Efects =====================================//
	$('.item-service, .feature-element li, .boxes-info, .item-table').hover(function() {
		$(this).toggleClass('animated pulse');
	});

    //================================== Scroll Efects =====================================//
  	$(window).scroll(function() {
	    $('.animation-services .icons li, .icon-section').each(function(){
	        var imagePos = $(this).offset().top;
	         var topOfWindow = $(window).scrollTop();
	          if (imagePos < topOfWindow+500) {
	              $(this).addClass("animated bounceInUp").css('opacity' , '1');
	              }
	        });  

	    $('.animation-services .image-big').each(function(){
			var imagePos = $(this).offset().top;       
			var topOfWindow = $(window).scrollTop();
				if (imagePos < topOfWindow+500) {
           		$(this).addClass("animated bounceInUp").css('opacity' , '1');
			}
		});  
	});

	//=================================== Scrollbar  ======================================//
	$(".box").mCustomScrollbar({
        scrollButtons:{
			enable:true
		},
		theme:"dark-2"
    });

	//=================================== Totop  ==========================================//
  	$().UItoTop({
		scrollSpeed:500,
		easingType:'linear'
	});	
	
	//=================================== Portfolio Filters  ==============================//
	$(window).load(function(){
     var $container = $('.portfolioContainer');
     $container.isotope({
      filter: '*',
          animationOptions: {
          duration: 750,
          easing: 'linear',
          queue: false
        }
     });
	 
    $('.portfolioFilter a').click(function(){
      $('.portfolioFilter .current').removeClass('current');
      $(this).addClass('current');
       var selector = $(this).attr('data-filter');
       $container.isotope({
        filter: selector,
               animationOptions: {
               duration: 750,
               easing: 'linear',
               queue: false
             }
        });
       return false;
      }); 
	});	

	var inviteMatch = location.search.match(/invite=(\w+)/);
	if(inviteMatch && inviteMatch[1]){
		$.cookie('usingnet_invite',inviteMatch[1],{domain:location.hostname.match(/\w+\.\w+$/)[0]});
	}
});	