VetPronto.modals = {

  displayModalByClassName: function(modalClassName, success) {
    var $modal = $(modalClassName);

    VetPronto.loading.hideLoadingSpinner();

    $modal
      .addClass('visible')
      .siblings()
        .addClass('modal-background');
    $('.review-summary').addClass('modal-background');
    $('html').addClass('html-modal-background');

   switch (modalClassName) {
    case '.out-of-area-modal':
      VetPronto.modals.formatOutOfAreaModal();
      break;
    case '.confirm-email-submitted-modal':
      VetPronto.modals.formatConfirmEmailSubmittedModal(success);
      break;
    }
  },

  hideModalByClassName: function(modalClassName) {
    var $modal = $(modalClassName);

    $modal
      .removeClass('visible')
      .siblings()
        .removeClass('modal-background');
    $('.review-summary').removeClass('modal-background');
    $('html').removeClass('html-modal-background');
  },

  formatOutOfAreaModal: function() {
    $('.email-for-waiting-list').val(VetPronto.database.contact.email);
  },

  formatConfirmEmailSubmittedModal: function(success) {
    if (success) {
      $('.confirm-email-submitted-modal-success').removeClass('hide');
      $('.confirm-email-submitted-modal-fail').addClass('hide');
    } else {
      $('.confirm-email-submitted-modal-success').addClass('hide');
      $('.confirm-email-submitted-modal-fail').removeClass('hide');
    }
  }
};

$(document).ready(function() {
  $('.user-zip-code').focus();

  $('body')
    .on('click', '.submit-zip-code-modal-button', function(event) {
      event.preventDefault();

      VetPronto.session.zipCode = $('.user-zip-code').val();
      VetPronto.modals.hideModalByClassName('.zip-code-modal');
      VetPronto.loading.showLoadingSpinner();
      VetPronto.loading.retrieveOpenAvailabilities();
      VetPronto.main.lookUpCityStateByZipCode();
      VetPronto.contact.setCityStateZip();
    })

    .on('click', '.re-enter-zip-code', function() {
      VetPronto.modals.hideModalByClassName('.out-of-area-modal');
      VetPronto.modals.displayModalByClassName('.zip-code-modal');
    })

    .on('click', '.save-email-to-waiting-list-modal-button', function(event) {
      event.preventDefault();

      VetPronto.contact.saveEmailToWaitingList();
      VetPronto.contact.alertUserIsSavedToWaitingList();
    })

    .on('click', '.exit-out-of-area-modal', function() {
      VetPronto.modals.hideModalByClassName('.out-of-area-modal');
      VetPronto.modals.displayModalByClassName('.zip-code-modal');
    })

    .on('click', '.exit-out-of-area-modal-button', function(event) {
      event.preventDefault();

      location.href="http://www.vetpronto.com";
    })

    .on('click', '.have-you-seen-a-vet-before-link', function() {
      VetPronto.modals.hideModalByClassName('.zip-code-modal');
      VetPronto.modals.displayModalByClassName('.enter-email-modal');
    })

    .on('click', '.have-you-seen-a-vet-before-link-contact-section', function() {
      VetPronto.modals.hideModalByClassName('.zip-code-modal');
      $('.return-to-contact-page').removeClass('hide'); // replace action link to return to contact page
      $('.start-booking-appointment').addClass('hide');
      VetPronto.modals.displayModalByClassName('.enter-email-modal');
    })

    .on('click', '.exit-enter-email-modal', function() {
      VetPronto.modals.hideModalByClassName('.enter-email-modal');
      if (VetPronto.state.currentStep === 'schedule') {
        VetPronto.modals.displayModalByClassName('.zip-code-modal');
      }
    })

    .on('click', '.submit-email-address-button', function(event) {
      event.preventDefault();

      var request = $.ajax({
            url: 'http://vethub.herokuapp.com/users/send_token.json',
            type: 'GET',
            data: { email: $('.email-address-modal').val() }
      });

      request.done(function(ajaxResponse) {
        VetPronto.modals.hideModalByClassName('.enter-email-modal');
        VetPronto.modals.displayModalByClassName('.confirm-email-submitted-modal', true);
      });

      request.error(function(ajaxResponse) {
        VetPronto.modals.hideModalByClassName('.enter-email-modal');
        VetPronto.modals.displayModalByClassName('.confirm-email-submitted-modal', false);
      });
    })

    .on('click', '.exit-confirm-email-submitted-modal, .try-different-email', function() {
      VetPronto.modals.hideModalByClassName('.confirm-email-submitted-modal');
      VetPronto.modals.displayModalByClassName('.enter-email-modal');
    })

    .on('click', '.start-booking-appointment', function() {
      VetPronto.modals.hideModalByClassName('.confirm-email-submitted-modal');
      VetPronto.modals.displayModalByClassName('.zip-code-modal');
    })

    .on('click', '.return-to-contact-page', function() {
      VetPronto.modals.hideModalByClassName('.confirm-email-submitted-modal');
    });

  $('.user-zip-code')
    .on('keydown', function(event) {
      if (event.keyCode === 13) {
        VetPronto.session.zipCode = $('.user-zip-code').val();
        VetPronto.modals.hideModalByClassName('.zip-code-modal');
        VetPronto.loading.showLoadingSpinner();
        VetPronto.loading.retrieveOpenAvailabilities();
        VetPronto.main.lookUpCityStateByZipCode();
        VetPronto.contact.setCityStateZip();
      }
    })
});