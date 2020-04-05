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
        if (countries.indexOf(item[field]) === -1) {
            countries.push(item[field]);
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
/* -------------------------------------------------------------------------- */
Template.registerHelper('items',()=>{
    var q = {}
    if (App.getSetting('selectedCountry')) {
        var country = App.getSetting('selectedCountry').toLowerCase()
        q.country = {
            '$in': [country]
        }
    }

    if (App.getSetting('selectedKeyword')) {
        var keyword = App.getSetting('selectedKeyword').toLowerCase()
        q.keyword = {
            '$in': [keyword]
        }
    }


    return Items.find(q,{sort:{createdAt: -1}}).fetch()
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
    var keywords = getFilters(items, 'keyword');
    return keywords
})
