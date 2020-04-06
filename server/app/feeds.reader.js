/**
 * 
 */
import {
    Meteor
} from 'meteor/meteor';
import _ from 'lodash';
import '../../lib/col.js'
import '../data/countries.js'
import App from './app.js'
import Filters from '../filters/filters.js'
import '../lib/logs.js'
// const colors = require('colors')
let Parser = require('rss-parser');
let parser = new Parser();
/** Get Keywords */
var keywords = App.readAssets('keywords.txt', 'text')
/** */
feedParser = {}
log = console.log
/** */
parseRSS = function (rss) {
    console.log("Checking Feed:".cyan, rss)
    parser.parseURL(rss, Meteor.bindEnvironment(function (err, feed) {
        if (err) {
            console.log('-----------------Err------------------')
            console.log('Feed parser Err'.red, rss)
            console.log("this is an error".error);
            console.log(err)
            console.log('-----------------------------------')
            return
        }
        console.log('Progress: '.green, rss);
        feed.items.forEach(function (entry) {


            if (Items.findOne({
                    link: entry.link
                })) {
                console.log('warning'.yellow, 'Skipped: Already in the Database '.yellow, entry.title)
                return
            }

            //================================
            // SettingD Defaults
            var post = entry;
            post.createdAt = new Date();
            post.isFeed = true;

            post.feedTitle = feed.title;
            post.feedUrl = feed.feedUrl;
            post.srcURL = rss;
            //=====================================
            checkPost(post)
            //=====================================
        })
    }))
}


function arrToLowerCase(arr){
    var arr = arr.map((item) => {
        return item.toLowerCase()
    })
    return arr
}

function checkPost(post) {
    //====================================
    // Checking Country
    var country = Filters.checkStrArr(post.title, countries);
    if (country && country.length) {
        console.log('Progress '.progress,'Found Country: '.success, country);
        post.country = arrToLowerCase(country);
        // Find country
        // var c = Countries.findOne({
        //     $or: [{
        //         'altSpellings': {
        //             $regex: country[0],
        //             $options: 'i'
        //         }
        //     }, {
        //         'name.common': {
        //             $regex: country[0],
        //             $options: 'i'
        //         }
        //     }]
        // })
        // /** */
        // if (c) {
        //     post.hasCountry = true;
        //     post.latlng = c.latlng || 0;
        //     post.Lat = c.latlng[0] || 0;
        //     post.Lng = c.latlng[1] || 0;
        //     console.log('Progress'.progress, "Country detected: " , c.name.common)
        // }else{
        //     console.log('Skipped No country detected: ', post.title)
        //     return 
        // }
    }
    //====================================
    //          Setting Keyword
    var hasKeyword = Filters.checkStrArr(post.title, keywords)
    if (hasKeyword && hasKeyword.length) {
        console.log('Progress'.progress, "Keyword detected: ", hasKeyword)
        post.keyword = arrToLowerCase(hasKeyword);
        post.hasKeyword = hasKeyword;
    }

    //====================================
    if (post.country && post.country.length && post.keyword && post.keyword.length) {
        post.isBlank = false
        console.log('------ SUCCESS------'.green)
        console.log('SUCCESS: Found Keyword and Country'.progress, post.country, post.keyword)
        console.log('------ Inserting------'.progress)
        delete post.categories
        delete post["dc:creator"]
        delete post["dc:date"]

        post.no = App.getLastItemNo();
        //====================
        Items.insert(post, (err) => {
            if (err) {
                console.log('==== Insert Err')
                console.log('Post: Error', post)
            } else {
                console.log('Inserting'.success, colors.green(post.feedTitle), ": ", post.title)
            }
        })

       
    }else{
        console.log('Skipped: No Keyword nor, country is captured'.red, post.title)
    }

}

//
/** */
checkFeeds = function (urls) {
    console.log('Checking URLS:', urls.length)
    _.each(urls, (url) => {
        console.log('url', url)
        Meteor.setTimeout(function () {
            console.log('Checking Feed', url)
            parseRSS(url)
        }, 100 * _.random(10, 90))
    })
}
module.exports = checkFeeds