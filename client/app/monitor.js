/**
 * 
*/

import _ from 'lodash';
import './monitor.html'
import '../lib/data.engine.js'
Meteor.startup(()=>{

})


function getFilters(items,field) {
    var countries = []
    _.map(items, (item) => {
        if (countries.indexOf(item.country) === -1) {
            countries.push(item.country);
        }
    })
    var newArr = Data.mergeArrays(countries)
    var counts = Data.countArra(newArr, field)
    App.setSetting({
        countryReady: true
    })
    // console.log('getCountries', counts)
    // var uniqCountries = _.uniq(newArr)
    return counts
}


Template.registerHelper('items',()=>{
    return Items.find({},{sort:{createdAt: -1}})
});

/* -------------------------------------------------------------------------- */
Template.registerHelper('filtered',()=>{
    var items = Items.find({},{sort:{createdAt: -1}}).fetch();
    var countries = getFilters(items, 'country');
    return countries
})

/* -------------------------------------------------------------------------- */
Template.registerHelper('filteredKW',()=>{
    var items = Items.find({},{sort:{createdAt: -1}}).fetch();
    var countries = getFilters(items);
    return countries
})
