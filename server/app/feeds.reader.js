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
            console.log('Feed parser Err'.red, feed)
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
                console.log('warning'.yellow, 'Skipped: Already in the Database ', entry.title)
                return
            }
            console.log('New Entry Process: ', entry.title)
            //================================
            // SettingD Defaults
            var post = entry;
            post.createdAt = new Date();
            post.isFeed = true;
            
            //====================================
            // Checking Country
            var country = Filters.checkStrArr(entry.title, countries);
            if (country && country.length) {
                console.log('Progress '.progress,'Found Country: '.success, country, entry.title + ':' + entry.link);
                
                // 
                post.feedTitle = feed.title;
                post.feedUrl = feed.feedUrl;
                // 
                var country = country.map((country) => {
                    return country.toLowerCase()
                })
                post.country = country;
                // Find country
                var c = Countries.findOne({
                    $or: [{
                        'altSpellings': {
                            $regex: country[0],
                            $options: 'i'
                        }
                    }, {
                        'name.common': {
                            $regex: country[0],
                            $options: 'i'
                        }
                    }]
                })
                if (c) {
                    post.hasCountry = true;
                    post.latlng = c.latlng || 0;
                    post.Lat = c.latlng[0] || 0;
                    post.Lng = c.latlng[1] || 0;
                }
            }
            //====================================
            //          Setting Keyword
            var hasKeyword = Filters.checkStrArr(entry.title, keywords)
            if (hasKeyword) {
                console.log('Progress'.progress, "Keyword detected: " , hasKeyword)
                post.keyword = hasKeyword ? hasKeyword : null;
                post.hasKeyword = true;
            }
            post.isBlank = false;
            //====================================
            //      If no Keywords
            if (!c && !hasKeyword) {
                console.log('Warning'.warn, "No Keyword nor, country is captured")
                post.isBlank = true
            }
            //=====================================
            
            // Cleaning Tags
            delete post.categories
            delete post["dc:creator"]
            delete post["dc:date"]
            //===================================== 
            post.srcURL = rss;
            console.log('Inserting'.success , post.feedTitle, ": ", post.title)
            // console.log(post)
            Items.insert(post, (err) => {
                if (err) {
                    console.log('==== Insert Err')
                    console.log('Post: Error', post)
                }
            })
            //=====================================
        })
    }))
}
/** */
checkFeeds = function (urls) {
    console.log('Checking URLS:', urls.length)
    _.each(urls, (url) => {
        console.log('url', url)
        // Meteor.setTimeout(() => {
        console.log('Checking Feed', url)
        parseRSS(url)
        // }, 1000 * _.random(10, 90))
    })
}
module.exports = checkFeeds