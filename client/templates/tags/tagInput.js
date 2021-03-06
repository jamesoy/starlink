Template.tagInput.rendered = function () {
  var that = this;
  this.$('.tag-input').selectize({
    onInitialize: function() {
        this.$control_input.attr("readonly","readonly");
      },
    valueField: 'name',
    labelField: 'name',
    searchField: ['name'],
    create: false,
    render: {
        item: function(item, escape) {
            return '<div>' +
              (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
            '</div>';
        },
        option: function(item, escape) {
            var name = item.name;
            var caption = item.nRef;
            return '<div>' +
                '<span class="name">' + escape(name) + '</span>&nbsp;' +
                (caption ? '<span class="badge">' + escape(caption) + '</span>' : '') +
            '</div>';
        }
    },
    onItemAdd: function(value, $item) {
      Posts.addTag(value, {_id: that.data._id});
    },
    onItemRemove: function(value) {
      Posts.removeTag(value, {_id: that.data._id});
    }
  });
};