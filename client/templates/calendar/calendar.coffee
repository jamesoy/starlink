Template.calendar.helpers
  user: ->
    Meteor.user()
  events: ->
    now = new Date()
    Events.find({ startDate: { $gt: now } }, { sort: { startDate: 1 } })
