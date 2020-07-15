import {
  Meteor
} from 'meteor/meteor';
import _ from 'lodash'
import Console from './lib/logs.js'
import '../lib/col.js'
/** */
import App from './app/app.js'
import './app/feeds.reader.js'
import './data/countries.js'
/* -------------------------------------------------------------------------- */
//
DbStats = {}
DbStats.ItemsTotal = Items.find().count()
DbStats.ItemsFilteredBoth = Items.find({hasKeyword: {$exists:true}, country: {$exists:true}}).count()
DbStats.ItemsFilteredCountries = Items.find({isBlank:false}).count();
DbStats.ItemsWithKeywords = Items.find({hasKeyword:true}).count();
DbStats.both = Items.find({$and:[{ "country": { $exists: true, $ne: null }}, { "keyword": { $exists: true, $ne: null }}]}).count()
log(JSON.stringify(DbStats, null, 2))
CronConfigs = {
  freq: 3,
  dev: 2,
  prod: 7,
  cornLater: ""
}
/* -------------------------------------------------------------------------- */

SyncedCron.start();
/* -------------------------------------------------------------------------- */

Meteor.startup(() => {
  setCountries()
  setItemNumbers()
});

/* -------------------------------------------------------------------------- */
if (Meteor.isDevelopment) {
  console.log('IsDevelopment: '.success, Meteor.isDevelopment)
  CronConfigs.cornLater = 'every 1 minutes'
  // 
} else {
  CronConfigs.cornLater = 'every 7 minutes'
}
/* -------------------------------------------------------------------------- */

var feedsList = App.readAssets('feeds.txt', 'text')
/* -------------------------------------------------------------------------- */
SyncedCron.add({
  name: 'CronParser',
  schedule: function (parser) {
    return parser.text(CronConfigs.cornLater);
  },
  job: function () {
    console.log('SyncdCron: Feed Parser {CHECK}')
    checkFeeds(feedsList)
    console.log('SyncdCron: Feed Parser {SUCCESS}')
    log(JSON.stringify(DbStats, null, 2))
  }
});
/* -------------------------------------------------------------------------- */
//
// 'items'
Meteor.publish(null,function(options){
  return Items.find({$and:[{ "country": { $exists: true, $ne: null }}, { "keyword": { $exists: true, $ne: null }}]},{limit:200, sort:{createdAt: -1}, fields:{content:0, comments: 0, "content:encoded": 0}})
})
/* -------------------------------------------------------------------------- */
/**
 * Setting Countries [Startup]
 */
/* -------------------------------------------------------------------------- */
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
    console.log('====== Countries Data Set: Success ======='.progress)
    if(Items.find().count() == 0){
      checkFeeds(App.readAssets('feeds.txt', 'text'))
    }
  } else {
    console.log('====== Countries Data Set: SET: TRUE ======='.progress)
  }
}
/* -------------------------------------------------------------------------- */
// Used for debugging
// Items.update({},{$unset:{no:1}},{multi:true})
function setItemNumbers(){
  if(!Items.findOne({no:{$exists:true}})){
    console.log('Items are not numbered'.red)
    var items = Items.find({},{sort:{createdAt: 1}}).fetch();
    _.each(items,(item)=>{
      var i = App.getLastItemNo()
      Items.update({_id : item._id},{$set:{no:i}})
    })
  }
}
/* -------------------------------------------------------------------------- */




/* -------------------------------------------------------------------------- */
// 
// console.log(countries)
// console.log(Filters.checkStrArr('USA is here', countries))
// App.readAssets('feeds.txt','text')