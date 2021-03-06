Template.groupLayout.events
  'click button.leave-group': (event, template) ->
    event.preventDefault()

    if confirm("Do you want to leave this group?")
      if (Meteor.user() == null)
        Router.go('/profile')
        return

      if !UI._globalHelpers.memberOf(@)
        alert('You are not in this group.')
        return
      this.members = _.without this.members,
        _.findWhere(this.members, {id: Meteor.userId()})

      modifies =
        count: @members.length
        members: @members


      Groups.update @_id, {$set: modifies}, (error) ->
        if (error)
          alert(error.reason)
        else
          Router.go("groups")