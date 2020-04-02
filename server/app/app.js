import {
    Meteor
} from 'meteor/meteor';
import '../../lib/col.js'
import _ from 'lodash';
app = {}
app.readAssets = (file, type) => {
    try {
        console.log('Reading '+type+' file',file)
        var data = Assets.getText(file)
        switch (type) {
            case "text":
                var lines = _.compact(data.split('\n'))
                console.log('Lines:', lines)
                return lines;
                // break;
            case "json":
                var json = JSON.parse(data)
                console.log('JSON:', json)
                return json
                break;
            default:
                console.log('Assets Reading Warning, set Type: ', file);
        }
    } catch (err) {
        throw new Meteor.Error('app-readAssetsErr', err)
    }
}

module.exports = app;