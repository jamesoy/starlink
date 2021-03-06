@Schema = {}
@Schema.profile = new SimpleSchema
  roles:
    type: [String]
    optional: true
    autoform:
      type: "select-checkbox"
      options: ->
        [
          label: "Enterpreneur"
          value: "enterpreneur"
        ,
          label: "Investor"
          value: "investor"
        ,
          label: "Professional"
          value: "professional"
        ,
          label: "Others"
          value: "Others"
        ]
  # areas:
  #   type: [String]
  #   label: "Areas"
  #   autoform:
  #     type: "selectize"
  #     afFieldInput:
  #       multiple: true
  #
  # interests:
  #   type: [String]
  #   label: "Interests"
  #   autoform:
  #     type: "selectize"
  #     afFieldInput:
  #       multiple: true

  summary:
    type: String
    label: "Summary"
    optional: true
