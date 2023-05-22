

$(document).ready(init);


function init() {
  $("#btn-login").click(login);
}

function login(event) {
  event.preventDefault();

  let loginData = {
    email: $("#inputEmail").val(),
    password: $("#inputPassword").val()
  };

  $.ajax({
    method: "POST",
    url: "/login",
    data: JSON.stringify(loginData),
    dataType: "html",
    contentType: "application/json",
    success: completeLogin,
    failure: failedLogin
  }).fail(failedLogin);
}

function completeLogin() {
  console.log("complete login");
  window.location.replace("/home.html");
}

function failedLogin() {
  console.log("failed login");
}
