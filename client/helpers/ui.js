UI.registerHelper('timeAgo', function(datetime) {
  Session.get('momentLocale'); // depend on session variable to reactively rerun the helper
  return moment(datetime).fromNow();
});
UI.registerHelper('userEmail', function(user) {
  return getUserEmail(user);
})
