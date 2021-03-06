var OAuth = Package.oauth.OAuth;

var urlUtil = Npm.require('url');

OAuth.registerService('linkedin', 2, null, function (query) {

    var response = getTokenResponse(query);
    var accessToken = response.accessToken;

    var serviceData = {
        accessToken: accessToken,
        expiresAt: (+new Date) + (1000 * response.expiresIn)
    };

    // list of extra fields
    // http://developer.linkedin.com/documents/profile-fields
    var extraFields = 'first-name,headline,id,last-name,site-standard-profile-request,email-address,location:(name),num-connections,picture-url,public-profile-url,skills,languages,three-current-positions,three-past-positions,educations,recommendations-received,summary';
    // remove the whitespaces which could break the request
    extraFields = extraFields.replace(/\s+/g, '');

    var fields = {};
    fields = getExtraData(accessToken, extraFields, fields);
    var profileUrl = fields.siteStandardProfileRequest.url;
    var urlParts = urlUtil.parse(profileUrl, true);
    serviceData.id = urlParts.query.id;
    fields.publicId = urlParts.query.id;
/*
    var queue = new PowerQueue({
      isPaused: true
    })

    queue.taskHandler = function(data, next) {
      Meteor.setTimeout(function() {
        getConnection(data.accessToken, data.fields)
      }, 5000);
    };
    queue.add({accessToken: accessToken, fields: fields});
    queue.run();
*/
    return {
        serviceData: serviceData,
        options: {
          profile: fields
        }
    };
});

var getExtraData = function (accessToken, extraFields, fields) {
    var url = 'https://api.linkedin.com/v1/people/~:(' + extraFields + ')';
    var response = Meteor.http.get(url, {
        params: {
            oauth2_access_token: accessToken,
            format: 'json'
        }
    }).data;
    return _.extend(fields, response);
}

var getConnection = function (accessToken, fields) {
    //https://developer-programs.linkedin.com/rest
    var url = 'https://api.linkedin.com/v1/people/~/connections:(id,first-name,last-name,maiden-name,headline,email-address,location,industry,num-connections,summary,specialties,positions,picture-url,public-profile-url)';
    var response = Meteor.http.get(url, {
        params: {
            oauth2_access_token: accessToken,
            format: 'json'
        }
    }).data;
    var values = response.values;
    if(!!values && values.length && fields.id) {
      for(var i=0; i < values.length; i ++) {
        Meteor.linkedinConnections.update({id: values[i].id, userLinkedInId: fields.id}, _.extend(values[i], { userLinkedInId: fields.id}), {upsert: true});
      }
    }
    return;
}

var getProfile = function (accessToken, fields) {
    var url = 'https://api.linkedin.com/v1/people/~';
    var response = Meteor.http.get(url, {
        params: {
            oauth2_access_token: accessToken,
            format: 'json'
        }
    }).data;
    return _.extend(fields, response);
}

// checks whether a string parses as JSON
var isJSON = function (str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
var getTokenResponse = function (query) {
    var config = ServiceConfiguration.configurations.findOne({service: 'linkedin'});
    if (!config)
        throw new ServiceConfiguration.ConfigError("Service not configured");

    var responseContent;
    try {

        // Request an access token
        // responseContent = Meteor.http.post(
        //   "https://api.linkedin.com/uas/oauth2/accessToken", {
        //     params: {
        //       grant_type: 'authorization_code',
        //       client_id: config.clientId,
        //       client_secret: config.secret,
        //       code: query.code,
        //       redirect_uri: Meteor.absoluteUrl("_oauth/linkedin?close")
        //     }
        //   }).content;

// fallback to old school
        responseContent = Meteor.http.post(
            "https://api.linkedin.com/uas/oauth2/accessToken?grant_type=authorization_code&code=" + query.code + "&redirect_uri=" + Meteor.absoluteUrl("_oauth/linkedin?close") + "&client_id=" + config.clientId + "&client_secret=" + OAuth.openSecret(config.secret)
        ).content;
    } catch (err) {
        throw new Error("Failed to complete OAuth handshake with LinkedIn. " + err.message);
    }

    // If 'responseContent' does not parse as JSON, it is an error.
    if (!isJSON(responseContent)) {
        throw new Error("Failed to complete OAuth handshake with LinkedIn. " + responseContent);
    }

    // Success! Extract access token and expiration
    var parsedResponse = JSON.parse(responseContent);
    var accessToken = parsedResponse.access_token;
    var expiresIn = parsedResponse.expires_in;

    if (!accessToken) {
        throw new Error("Failed to complete OAuth handshake with LinkedIn " +
        "-- can't find access token in HTTP response. " + responseContent);
    }

    return {
        accessToken: accessToken,
        expiresIn: expiresIn
    };
};

var getIdentity = function (accessToken) {
    try {
        return Meteor.http.get("https://www.linkedin.com/v1/people/~", {
            params: {oauth2_access_token: accessToken, format: 'json'}
        }).data;
    } catch (err) {
        throw new Error("Failed to fetch identity from LinkedIn. " + err.message);
    }
};

LinkedIn.retrieveCredential = function (credentialToken, credentialSecret) {
    return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
