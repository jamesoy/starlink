Meteor.methods
  updateProfile: (doc, modifier, id) ->
    #Important server-side check for security and data integrity
    check(doc, Schema.profile)
    Meteor.users.update(id, {$set: {"profile.roles": doc.roles}})
    console.log(Meteor.users.findOne(id).profile.roles)

  extractInfoFromUrl: (url)->
    extractBase = 'http://api.embed.ly/1/extract'
    embedlyKey = Meteor.settings.embedly
    try
      result = Meteor.http.get(extractBase, {
        params: {
          key: embedlyKey,
          url: url,
          image_width: 200
        }
      })

      return result
    catch error
      console.log(error)
      return null

  upvoteLink: (linkId)->
    link = Links.findOne(linkId)
    Links.update(link._id, {
      $addToSet: {upvoters: this.userId},
      $inc: {votesCount: 1}
    })

  followUser: (followingId)->
    console.log followingId
    console.log 'call follow user'
    Follows.insert({
      followingId: followingId
      followerId: Meteor.userId()
    })
