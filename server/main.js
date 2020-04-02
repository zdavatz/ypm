import { Meteor } from 'meteor/meteor';
import _ from 'lodash'
import '../lib/col.js'
/** */
import App from './app/app.js'
import  './feeds.reader.js'
import './data/countries.js'
import Filters from './filters/filters.js'







Meteor.startup(() => {
  setCountries()
});
/**
 * Setting Countries [Startup]
 */
function setCountries() {

  var countriesDBCount = Countries.find().count();
  if (countriesDBCount == 0) {
    var countries = Assets.getText('countries.json')
    console.log('CountriesDB check: ', countriesDBCount, '!=== Country File', countries.length)
    console.log('====== Countries Data Set: Init =======')
    _.each(JSON.parse(countries), (country) => {
      console.log('Setting', country.name.common)
      Countries.insert(country)
    })
    console.log('====== Countries Data Set: Success =======')
  } else {
    console.log('====== Countries Data Set: Exists =======')
  }
}




checkFeeds(App.readAssets('feeds.txt','text'))


/** */
// console.log(countries)
// console.log(Filters.checkStrArr('USA is here', countries))
// App.readAssets('feeds.txt','text')
