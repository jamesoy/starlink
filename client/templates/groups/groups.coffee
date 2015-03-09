Template.registerHelper 'memberOf', (group) ->
  Meteor.userId() && _.find group.members, (member) ->
    member.id == Meteor.userId()

Template.groups.helpers
  tmplName: ->
    return Session.get('tmplName')
  groups: ->
    return Groups.find().fetch()
  times: ->
    [0..9]
  path: (group) ->
    if UI._globalHelpers.memberOf(group)
      "groups.item"
    else
      ""

Template.groups.events
  'click button.join-group': (event, template) ->
    console.log(this)
    event.preventDefault()

    if (Meteor.user() == null)
      alert('Login first')
      return

    if UI._globalHelpers.memberOf(this)
      alert('you are in this group already')
      return
    console.log("join id: ", Meteor.userId())
    console.log("join picture: ", Meteor.user().profile.pictureUrl)
    this.members.push
      id: Meteor.userId()
      picture: Meteor.user().profile.pictureUrl

    modifies =
      count: @members.length
      members: @members


    Groups.update @_id, {$set: modifies}, (error) ->
      if (error)
        alert(error.reason)

  'click button.leave-group': (event, template) ->
    console.log(this)
    event.preventDefault()

    if (Meteor.user() == null)
      alert('Login first')
      return

    if !UI._globalHelpers.memberOf(this)
      alert('you are not in this group')
      return
    console.log("leave id: ", Meteor.userId())
    this.members = _.without this.members,
      _.findWhere(this.members, {id: Meteor.userId()})

    modifies =
      count: @members.length
      members: @members


    Groups.update @_id, {$set: modifies}, (error) ->
      if (error)
        alert(error.reason)