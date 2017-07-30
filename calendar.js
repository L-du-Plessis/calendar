// define availability data
var availability = [
  {
    "Date": "2016-05-18",
    "HoursAvailable": [9, 10, 11, 12, 13, 14, 17]
  },
  {
    "Date": "2016-05-19",
    "HoursAvailable": [9, 10, 11, 12, 13, 14, 15, 16, 17]
  },
  {
    "Date": "2016-05-20",
    "HoursAvailable": [9, 10, 14, 15, 16, 17]
  },
  {
    "Date": "2016-05-21",
    "HoursAvailable": [9, 10, 11, 12, 13]
  },
  {
    "Date": "2016-05-23",
    "HoursAvailable": [13, 14, 15, 16]
  },
  {
    "Date": "2016-05-24",
    "HoursAvailable": [11, 12, 15, 16, 17]
  }
];

var fullDates = [];
var fullTimesStart = [];
var fullTimesEnd = [];

function getFullTimes() {

  fullDates = [];
  fullTimesStart = [];
  fullTimesEnd = [];

  for (var key in availability) {
    if (availability.hasOwnProperty(key)) {
      for (var key2 in availability[key].HoursAvailable) {
        if (availability[key].HoursAvailable.hasOwnProperty(key2)) {                
          var current = availability[key].HoursAvailable[key2];
                
          if (current > availability[key].HoursAvailable[Number(key2) - 1] + 1) {
            var start = current - (current - availability[key].HoursAvailable[Number(key2) - 1] - 1);
            
            if (availability[key].Date == '2016-05-18')  // current day
              start--;
              
            if (current == 17)  // last slot of day
              current--;
            
            fullDates.push(availability[key].Date);
            fullTimesStart.push(start);
            fullTimesEnd.push(current - 1);
          }
          
        }
      }
      
      if (availability[key].HoursAvailable[0] > 9) {
        var current = availability[key].HoursAvailable[1];
        var start = current - (current - 9 - 1);
        
        fullDates.push(availability[key].Date);
        fullTimesStart.push(start);
        fullTimesEnd.push(current - 2);
      }

      var last = availability[key].HoursAvailable.length - 1;
      if (availability[key].HoursAvailable[last] < 17) {
        var start = 17 - (17 - availability[key].HoursAvailable[last] - 1);
        
        fullDates.push(availability[key].Date);
        fullTimesStart.push(start);
        fullTimesEnd.push(17 - 1);
      }
    }
  }
  
}

function checkSlotAvailability (time, jobLength, date, availability) {
  // check if time slot is available
  
  for (var key in availability) {
    if (availability.hasOwnProperty(key)) {
      for (var key2 in availability[key].HoursAvailable) {
        if (availability[key].HoursAvailable.hasOwnProperty(key2)) {
          
          if (date == availability[key].Date && time == availability[key].HoursAvailable[key2]) {            
            // check if job will fit in
            if (time + jobLength > 18)
              return "Unavailable";
      
            var i = 0;
            while (i < fullTimesStart.length) {
              if (fullDates[i] == availability[key].Date && fullTimesStart[i] - jobLength - 1 < time && time < fullTimesEnd[i] + 2)
                return "Unavailable";        
              i++;
            }
            
            return "Available";
          }
        }
      }
    }
  }

  return "Full";
}

function initializeView() {
    // configure slider
    $( "#slider" ).slider({
      value: 3,
      min: 1,
      max: 5,
      step: 1,
      slide: function( event, ui ) {
        $( "#hours" ).val( ui.value + " HR/s" );
        $("#availabilityTable > thead").empty();
        $("#availabilityTable > tbody").empty();
        renderTable(ui.value);
      }
    });
    var jobLength = $( "#slider" ).slider( "value" );
    $( "#hours" ).val( jobLength + " HR/s" );
    renderTable(jobLength);
    
    // table cell clicked
    $("#availabilityTable").on("click", "td", function() {
      if ($( this ).text() == "Available") {
        var jobLength = $( "#slider" ).slider( "value" );
        
        for (i=0; i<jobLength; i++) {
          var rowIndex = $(this).parent().index() + 1 + i;
          $('table > tbody > tr:nth-child(' + rowIndex + ')').find('td').eq($(this).index()).addClass("selected");
          $('table > tbody > tr:nth-child(' + rowIndex + ')').find('td').eq($(this).index()).text("Selected");
        }        
      }
    });   
}

function mainPanel() {  // display main panel  
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {  // mobile
    $.jsPanel({
      theme:           'primary',
      setstatus:       'maximize',
      contentOverflow: 'scroll',
      contentAjax:     {
          url:     'content.html',
          done:    function( data, textStatus, jqXHR, panel ) {
              this.content.css('padding', '10px').append(data);
              initializeView();
          }
      },
      headerTitle:     'Availability Calendar',
      headerControls:  { minimize: 'remove', close: 'remove' },
    });
  }
  else {  // desktop
    $.jsPanel({
      theme:          'primary',
      contentSize:    { width: 840, height: 510 },
      contentAjax:    {
          url:     'content.html',
          done:    function( data, textStatus, jqXHR, panel ) {
              this.content.css('padding', '30px').append(data);
              initializeView();
          }
      },
      headerTitle:    'Availability Calendar',
      headerControls: { minimize: 'remove', close: 'remove' },
    });
  }
}

function renderTable(jobLength) {
    getFullTimes();
    
    // get date range
    var weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var lastDay = new Date("2016-05-24T18:00:00");
    var dates = [];
    var fdates = [];
    for (var d = new Date("2016-05-18T11:27:00"); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    // render table head
    $('#availabilityTable > thead').append('<tr><th></th></tr>');
    
    for (i=0; i<dates.length; i++) {
      if (dates[i].getDay())  // exclude Sunday
      {
        var displayDate = weekdays[dates[i].getDay()] + ' ' + dates[i].getDate() + nth(dates[i].getDate());
        fdates.push(dates[i].toISOString().substr(0,10));
        $('#availabilityTable tr:last').append("<th class='day'>" + displayDate + "</th>");
      }
    }
    
    // render table body
    for (i=9; i<18; i++) {
      var time = pad(i, 2) + ':00 - ' + Number(i + 1) + ':00';      
      $('#availabilityTable > tbody:last-child').append('<tr><td><strong>' + time + '</strong></td></tr>');
      
      for (j=0; j<6; j++) {
        var display = checkSlotAvailability(i, jobLength, fdates[j], availability);
        var dclass = display.toLowerCase();
        
        $('#availabilityTable tr:last').append("<td class='" + dclass + "'>" + display + "</td>");
      }
    }
    
    // hide columns on mobiles
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {      
      $('td:nth-child(1),th:nth-child(1)').eq(0).css('width','15%');
      $('td:nth-child(6),th:nth-child(6)').hide();
      $('td:nth-child(7),th:nth-child(7)').hide();
    }
}

function nth(d) {
  // get th, st, nd or rd in date
  if(d>3 && d<21) return 'th';
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

function pad(num, size) {
  // zero pad time
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}
