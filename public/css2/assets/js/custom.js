$(document).ready(function() {


    // addd new
    var ctx = $("#line-chart");
var lineChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ["6.00 PM", "7.00 PM","8.00 PM","9.00 PM","10.00 PM","11.00 PM","12.00 AM","1.00 AM"],
    datasets: [
      {
        label: "2015",
        data: [10,8,6,5,12,8,16,17,6,7,6,10],
        backgroundColor: [
          "#000000c7",
         "#000000c7",
         "#000000c7",
        "#000000c7",
        "#000000c7",
         "#000000c7",
       "#000000c7",
         "#000000c7",
        "#000000c7",
    "#000000c7",
       "#000000c7",
      "#000000c7",
        ],
        borderColor: [
          "#000",
          "#000",
          "#000",
         "#000",
          "#000",
          "#000",
         "#000",
       "#000",
         "#000",
          "#000",
        "#000",
          "#000",
        ],
        borderWidth: 1
      }
    ]
  },
  options: {
    maintainAspectRatio: false
  }
});
    // add new

    $('body').on('click', '#click', loadDoc); 

    $("li:first-child").addClass("first");
    $("li:last-child").addClass("last");
    
    $('[href="#"]').attr("href", "javascript:;");
    $('.menu-Bar').click(function() {
        $(this).toggleClass('open');
        $('.menuWrap').toggleClass('open');
        $('body').toggleClass('ovr-hiddn');
        $('body').toggleClass('overflw');
    });

   $('.index-slider').slick({
        dots: false,
        arrows: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
        {
            breakpoint: 825,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: false,
                arrows:false
            }
        },
        ]
    });


    $('.m-silder').slick({
        dots: true,
        arrows: true,
        infinite: true,
        fade: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
        {
            breakpoint: 825,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: true,
                arrows:false
            }
        },
        ]
    });

            $('.product-slid').slick({
        dots: false,
        arrows: false,
        infinite: true,
        speed: 300,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
        {
            breakpoint: 825,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: false,
                arrows:false
            }
        },
        ]
    });

        $('.client-slider').slick({
        dots: false,
        arrows: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
        {
            breakpoint: 825,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: false,
                arrows:false
            }
        },
        ]
    });

    $('.event-slider').slick({
        dots: false,
        arrows: true,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 2000,
        centerMode: true,
        responsive: [
        {
            breakpoint: 825,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
                dots: false,
                arrows:false
                
            }
        },
        ]
    });


// counter javascript start

$('.count').each(function () {
    $(this).prop('Counter',0).animate({
        Counter: $(this).text()
    }, {
        duration: 4000,
        easing: 'swing',
        step: function (now) {
            $(this).text(Math.ceil(now));
        }
    });
});

// counter javascript end


    $('ul.faq-ul li.active div').slideDown();
    $('ul.faq-ul li h4').click(function() {
        $('ul.faq-ul li').removeClass('active');
        $(this).parent('li').addClass('active');
        $('ul.faq-ul li div').slideUp();
        $(this).parent('li').find('div').slideDown();
    });
    
        $('.faq-ul>li').click(function(){
            $(this).addClass('active');
            $(this).siblings().removeClass('active');
        });
    
        $('.fancybox-media').fancybox({
            openEffect: 'none',
            closeEffect: 'none',
            helpers: {
                media: {}
            }
        });

    $('.searchBtn').click(function() {
        $('.searchWrap').addClass('active');
        $('.overlay').fadeIn('active');
        $('.searchWrap input').focus();
        $('.searchWrap input').focusout(function(e) {
            $(this).parents().removeClass('active');
            $('.overlay').fadeOut('active');
            $('body').removeClass('ovr-hiddn');

        });
    });

});


$(window).on('load', function() {
    var currentUrl = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
    $('ul.menu li a').each(function() {
        var hrefVal = $(this).attr('href');
        if (hrefVal == currentUrl) {
            $(this).removeClass('active');
            $(this).closest('li').addClass('active')
            $('ul.menu li.first').removeClass('active');
        }
    })

});

// tabing

     $('[data-targetit]').on('click', function(e) {
  $(this).addClass('current');
  $(this).siblings().removeClass('current');
  var target = $(this).data('targetit');
  $('.' + target).siblings('[class^="box-"]').hide();
  $('.' + target).fadeIn();
});


     // sticky header

     $(window).scroll(function() {
    if ($(this).scrollTop() > 500){  
        $('').addClass("box-visable");
    }
    else{
        $('').removeClass("box-visable");
    }
});


// slider additional js for tabbing
          $("[data-targetit]").on("click", function (e) {
        $(".test").slick("setPosition");
    });











// peak chart 
// var densityCanvas = document.getElementById("densityChart");
// Chart.defaults.global.defaultFontFamily = "Lato";
// Chart.defaults.global.defaultFontSize = 18;
// var densityData = {
//   label: 'Density of Planet (kg/m3)',
//   data: [5427, 5243, 5514, 3933, 1326, 687, 1271, 1638],
//   backgroundColor: 'rgba(0, 99, 132, 0.6)',
//   borderColor: 'rgba(0, 99, 132, 1)',
//   yAxisID: "y-axis-density"
// };
// var gravityData = {
//   label: 'Gravity of Planet (m/s2)',
//   data: [3.7, 8.9, 9.8, 3.7, 23.1, 9.0, 8.7, 11.0],
//   backgroundColor: 'rgba(99, 132, 0, 0.6)',
//   borderColor: 'rgba(99, 132, 0, 1)',
//   yAxisID: "y-axis-gravity"
// };
// var planetData = {
//   labels: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
//   datasets: [densityData, gravityData]
// };
// var chartOptions = {
//   scales: {
//     xAxes: [{
//       barPercentage: 1,
//       categoryPercentage: 0.6
//     }],
//     yAxes: [{
//       id: "y-axis-density"
//     }, {
//       id: "y-axis-gravity"
//     }]
//   }
// };
// var barChart = new Chart(densityCanvas, {
//   type: 'bar',
//   data: planetData,
//   options: chartOptions
// });






//  demo chart 

    var barChartData = {
        labels: [
          "21",
          "22",
          "23",
          "24",
          "25",
          "26",
          "27",
          "28",
          "29",
          "30",
          "31",
          "32",
          "33"
        ],
        datasets: [
          {
            label: "Male",
            backgroundColor: "#000",
            data: [135, 90, 92, 72, 42, 20, 0, 5, 0, 0, 2, 3, 1]
          },
          {
            label: "Female",
            backgroundColor: "#ff0092",
            data: [120, 75, 82, 63, 45, 32, 1, 0, 0, 0, 0, 0, 0]
          }
        ]
      };
      
      var chartOptions = {
        responsive: true,
        legend: {
          position: "top"
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
      
      window.onload = function() {
        var ctx = document.getElementById("canvas").getContext("2d");
        window.myBar1 = new Chart(ctx, {
          type: "bar",
          data: barChartData,
          options: chartOptions
        });
      };