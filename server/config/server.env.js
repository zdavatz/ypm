import {
    Meteor
  } from 'meteor/meteor';

Meteor.startup(function() {
    if(Meteor.isProduction){
        console.log("Production: Setting Env. Variables")
        process.env.ROOT_URL = '';
        process.env.MONGO_URL = 'mongodb://localhost/meteor';
        process.env.PORT = 3001;
    }
    if(Meteor.isDevelopment){
        console.log("Development: Setting Env. Variables")
    }
});