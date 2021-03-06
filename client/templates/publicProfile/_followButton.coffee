Template._followButton.events
  "click .follow-button": ->
    Meteor.call('followUser', this.user._id)

Template._followButton.helpers
  isNotCurrentUser: (user)->
    Meteor.userId() != user._id

  isFollowing: (user)->
    follow = Follows.findOne({followingId: user._id, followerId: Meteor.userId()})
    follow?
