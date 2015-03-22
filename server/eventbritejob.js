/**
 * Created by jwang on 3/13/15.
 */

// https://github.com/percolatestudio/meteor-synced-cron
// http://bunkat.github.io/later/parsers.html
SyncedCron.add({
    name: 'Pull Eventbrite events to Event collection',
    schedule: function(parser) {
        //return parser.text('every 10 seconds');
        //return parser.text('every 30 minutes');
        return parser.text('every 2 hours');
        //return parser.text('at 5:00 am every 1 day');
    },

    job: function() {
        _.each(Organizers.find().fetch(), function(organizer) {
            if (organizer.flag != 'active') return;
            console.log("===========================================================");
            console.log("Organizer: " + organizer.name);
            var events = EJSON.parse(Meteor.http.call(
                "GET",
                "https://www.eventbrite.com/json/organizer_list_events?id=" +
                organizer.organizer_id +
                "&app_key=" +
                Meteor.settings.eventbrite).content);

            _.each(events.events, function(event) {
                console.log("Event: " + event.event.title);
                if (Events.find({id: event.event.id}).count() > 0 ||
                    // event exists already
                    // Status: Completed, Draft, Live, Canceled
                    event.event.status != "Live") {
                    return;
                }

                if (!event.event.venue) {
                    event.event.status = "No_Venue";
                    console.log("Venue is null.");
                } else {
                    var zip = event.event.venue.postal_code;
                    if (isEmpty(zip)) {
                        zip = getZip(event.event.venue.latitude, event.event.venue.longitude);
                        event.event.venue.postal_code = zip;
                        console.log("Zip: " + zip);
                    }
                    // SF Bay Area events only for now
                    if (isEmpty(zip) || 5 != zip.length || zip.indexOf('94') != 0) {
                        event.event.status = "Not_Bay_Area";
                        console.log("Zip is not in bay area: " + zip);
                    }
                }

                Events.insert(event.event);
            });
        });
    }
});

SyncedCron.start();

getZip = function(lat, lng) {
    console.log("Lat/Lng to Zip: " + lat + " / " + lng);
    if (lat === 0 || lng === 0) return;

    var result;
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
        lat +
        "," +
        lng +
        "&key=" +
        Meteor.settings.geocoding;
    //console.log(url);
    var addresses = EJSON.parse(Meteor.http.call(
        "GET",
        url).content);
    //console.log(addresses);
    var address_components = addresses.results[0].address_components;
    if (!!address_components) {
        _.each(address_components, function(address_component) {
            //console.log(address_component);
            if (address_component.types[0] != 'postal_code') {
                return;
            }
            result = address_component.short_name;
        });
    } else {
        console.log("address_components is null: " + addresses.result[0]);
    }
    return result;
};

function isEmpty(str) {
    return (!str || 0 === str.length);
}
