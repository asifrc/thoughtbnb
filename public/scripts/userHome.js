var addAddress = function() {
  var listing = {
    'location': $('#location').val(),
    'description': $('#description').val()
  };
  $.post('/api/listings/', listing, function(data) {
    if (data.error) {
      $('#formError').text(data.error);
      if(data.error===ERRORS.listing.location.missing) {
        $('#location').addClass('has-error');
      }
      return false;
    }
    updateListings();
  });
};

var updateListings = function() {
  $.get('/api/listings/me', function(resp) {

    var scope = angular.element($('#listings')).scope();
    scope.$apply(function() {
      scope.listings = resp.data.listings;
    });
  });
};

$(function() {
  $('#btnAdd').on('click', addAddress);
  updateListings();
});
