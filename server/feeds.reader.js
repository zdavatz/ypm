/**
 * 
 */
import { Meteor } from 'meteor/meteor';
import _ from 'lodash';

import '../lib/col.js'

import './data/countries.js'
import Filters from './filters/filters.js'

let Parser = require('rss-parser');
//  import Parser from 'rss-parser'

let parser = new Parser();


var medkeywords = ["outbreak", "quarantine", "coronavirus", "H1N1", "h5N8", "h5n1"]

feedParser = {}
parseRSS = function(rss) {
  
    parser.parseURL(rss, Meteor.bindEnvironment(function (err, feed) {

        if (err) {
            console.log('Feed parser Err', err)
            return
        }
        // feed.title feed.feedUrl feed.lastBuildDate feed.link
        console.log('Checking: ', JSON.stringify(feed.title));
        feed.items.forEach(function (entry) {
            if (Items.findOne({
                    link: entry.link
                })) {
                console.log('Exists:', entry.title)
                return
            }

            console.log('feed',entry.title)
            // 
            var country = Filters.checkStrArr(entry.title,countries);
            var hasKeyword = Filters.checkStrArr(entry.title, medkeywords)
            // && hasKeyword && hasKeyword.length
            if (country && country.length ) {
                console.log('Found : ' , entry.title + ':' + entry.link);
                var post = entry;
                // 
                post.feedTitle = feed.title;
                post.feedUrl = feed.feedUrl;
                // 
                var country = country.map((country) => {
                    return country.toLowerCase()
                })
                post.country = country;
                // 
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
                if(!c){
                    console.log('Skipped',post.feedTitle, ": ", post.title)
                    return
                }
                post.latlng = c.latlng || 0;
                post.Lat = c.latlng[0] || 0;
                post.Lng = c.latlng[1] || 0;
                post.createdAt = new Date();
                post.isFeed = true;
                post.keyword = hasKeyword ? hasKeyword : 0;
                
                console.log(post.feedTitle, ": ", post.title)
                delete post.categories
                delete post["dc:creator"]
                delete post["dc:date"]

                console.log('post:',post)
                // Items.insert(post, (err) => {
                //     if (err) {
                //         console.log('==== Insert Err')
                //         console.log('Post: Error', post)
                //     }
                // })
            }
        })
    }))
}
/** */
checkFeeds = function (urls) {
    console.log('Checking URLS:', urls.length)
    
    _.each(urls, (url) => {
        console.log('url',url)
        // Meteor.setTimeout(() => {
            console.log('Checking Feed', url)
            parseRSS(url)
        // }, 1000 * _.random(10, 90))
    })
}
module.exports = checkFeeds
