var VetPronto = {
  database: {
    schedule: {},
    contact: {},
    pets: {
      existingPets: [],
      selectedPets: [],
    },
    waitingList: []
  },
  errors: {
    schedule: {},
    contact: {},
    pets: {}
  },
  state: {
    numStepsUntilInitialLoadComplete: 1,
    currentStep: 'schedule',
    accessibleSteps: {
      schedule: true,
      contact: false,
      pets: false,
      payment: false
    },
    completedSteps: {
      schedule: false,
      contact: false,
      pets: false,
      payment: false
    },
    stepOrder: ['schedule', 'contact', 'pets', 'payment'],
    calendarNavClickCount: 0 // determines what week the calendar displays (num weeks from today)
  },
  session: {},
  view: {}
};

VetPronto.main = {
  updateUI: function(doNotUpdateLocationHash) {
    var sectionName = VetPronto.state.currentStep;

    switch (sectionName) {
      case 'schedule':
        VetPronto.schedule.updateUI();
        break;
      case 'contact':
        VetPronto.contact.updateUI();
        break;
      case 'pets':
        VetPronto.pets.updateUI();
        break;
      case 'payment':
        VetPronto.payment.updateUI();
        break;
    }

    VetPronto.header.updateUI();
    VetPronto.header.displayHeaderLink(sectionName);
    VetPronto.main.displayFormSection(sectionName);
    VetPronto.main.updateSummary();

    if (doNotUpdateLocationHash) {
      return;
    }

    VetPronto.main.updateLocationHash();
  },

  displayFormSection: function(sectionName) {
    var $selectedFormSection = $('.form-section[data-section=' + sectionName + ']' );

    $selectedFormSection
      .removeClass('hide')
      .siblings('.form-section')
        .addClass('hide');
  },

  updateLocationHash: function() {
    var sectionName = VetPronto.state.currentStep;

    if (location.hash === '') {
      history.pushState({ section: 'schedule' }, null, '#schedule');
    }

    history.pushState({ section: sectionName }, null, '#' + sectionName);
    // send google analytics pageview
    ga('send', 'pageview', '/appointment/' + sectionName);
  },

  updateSummary: function() {
    for (var i = 0; i < VetPronto.state.stepOrder.length; i++) {
      var sectionName = VetPronto.state.stepOrder[i];

      if (VetPronto.state.completedSteps[sectionName]) {
        VetPronto.summary[sectionName].updateSummary();
      }
    }
  },

  loadInitialSection: function() {
    if (!VetPronto.session.zipCode) {
      VetPronto.modals.displayModalByClassName('.zip-code-modal');
    }

    if (VetPronto.session.zipCode) {
      VetPronto.main.lookUpCityStateByZipCode();
      VetPronto.contact.setCityStateZip();
      VetPronto.loading.retrieveOpenAvailabilities();
    }
  },

  lookUpCityStateByZipCode: function() {
   $.ajax({
      url: 'http://zip.getziptastic.com/v2/US/' + VetPronto.session.zipCode,
      type: 'GET'
    }).done(function(response) {
      VetPronto.database.contact.city = response.city;
      VetPronto.database.contact.state = response.state;
      VetPronto.database.contact.zipcode = response.postal_code;
    });
  },

  getUrlParameterByName: function(param) {
    var name = param,
        regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.href);

    if (results !== null) {
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    } else {
      return '';
    }
  },

  // TODO: replace with better function that doesn't fail if cookies are subsets of eachother.
  getCookie: function(c_name) {
    var i,x,y,ARRcookies=document.cookie.split(";");

    for (i=0;i<ARRcookies.length;i++) {
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x==c_name) {
        return unescape(y);
      }
    }
  },

  saveCookie: function(token) {
    var expirationDate = 'Thu, 18 Dec 2070 12:00:00 UTC';

    // Remove cookies for admin users so they don't authenticate as user next time
    if (VetPronto.session.admin) {
      expirationDate = 'Thu, 01 Jan 1970 00:00:01 GMT';
    }

    document.cookie = 'token=' + token + '; expires=' + expirationDate + '; path=/';
  }
};

$(document).ready(function() {
  $(window).keydown(function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });

  VetPronto.session.zipCode = parseInt(VetPronto.main.getUrlParameterByName('zip_code'));
  VetPronto.session.token = VetPronto.main.getUrlParameterByName('token');

  if (VetPronto.main.getUrlParameterByName('admin')) {
    VetPronto.session.admin = true;
    VetPronto.database.contact.first = VetPronto.main.getUrlParameterByName('first_name');
    VetPronto.database.contact.last = VetPronto.main.getUrlParameterByName('last_name');
    VetPronto.database.contact.email = VetPronto.main.getUrlParameterByName('email');
    VetPronto.database.contact.phone = VetPronto.main.getUrlParameterByName('phone_number');
    VetPronto.database.contact.address = VetPronto.main.getUrlParameterByName('street_address');
  }

  if (VetPronto.session.token) {
    VetPronto.main.saveCookie(VetPronto.session.token);
  } else {
    VetPronto.session.token = VetPronto.main.getCookie('token');
  }

  if (VetPronto.session.token) {
    VetPronto.loading.retrieveDataWithToken();
  } else {
    VetPronto.main.loadInitialSection();
  }

  $('body')
    .on('click', '.continue-button', function(event) {
      var sectionName = $(this).attr('data-section'),
          openStripe = true;

      event.preventDefault();

      if (sectionName === 'pets') {
        VetPronto.pets.submitStep(openStripe);
        return;
      }

      VetPronto[sectionName].submitStep();
      window.scrollTo(0, 0);
    });
});

// Allows user to use back and forward buttons
window.addEventListener('popstate', function(event) {
  var doNotUpdateLocationHash = true;

  VetPronto.state.currentStep = event.state.section;
  VetPronto.main.updateUI(doNotUpdateLocationHash);
});