var signin = function() {
  var userData = {
    email: $('#email').val(),
    password: $('#password').val()
  };
  $.post('/auth/login', userData, function(data) {
    if (data.error) {
      $('#pError').text(data.error);
    }
    else {
      window.location.href = nextUrl || "/";
    }
  });
};

