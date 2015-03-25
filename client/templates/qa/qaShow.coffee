Template.qaShow.helpers
  answers: ->
    Answers.find({questionId: this._id})
  comments: ->
    QaComments.find({questionId: this._id, answerId: {$exists: false}})

Template.qaShow.events
  "click .show-comments-button": (e)->
    if Template.instance().$(".answer-comments").length > 0
      Template.instance().$(".answer-comments").remove()
    else
      Blaze.renderWithData(Template._answerComments, this, $(e.target).parent().get(0))