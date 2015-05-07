/**
 * Created by Chris Cheshire on 07/05/15.
 */

var request = require('request'),
notifier    = require('node-notifier'),
path        = require('path'),
debug       = require('debug')('netwatch');

var statuses      = {
        down: 0,
        virgin: 1,
        talktalk: 2
    },
    validIPs      = {
        virgin: '82.44.176.218',
        talktalk: '79.78.13.85'
    },
    currentStatus = statuses.down;

(function netwatch() {
    debug('About to make request...');

    request({
        url: 'http://api.ipify.org'
    }, function (err, response, body) {
        debug('Request finished');

        var newStatus,
            message,
            icon;

        if (err) {
            newStatus = statuses.down;
            message = 'Connection lost...';
            icon = path.join(__dirname, 'img/disconnected.png');
        } else {
            switch (body) {
                case validIPs.virgin:
                    newStatus = statuses.virgin;
                    message = 'Connected via Virgin';
                    icon = path.join(__dirname, 'img/virgin_logo.gif');

                    break;
                case validIPs.talktalk:
                    newStatus = statuses.talktalk;
                    message = 'Connected via TalkTalk';
                    icon = path.join(__dirname, 'img/talktalk_logo.png');

                    break;
                default:
                    //Not recognised
                    break;
            }
        }

        debug('New status: ', newStatus);
        debug('Current status: ', currentStatus);

        if (newStatus !== currentStatus) {
            console.log('Current message: ', message);

            notifier.notify({
                icon: icon,
                title: 'Netwatch',
                message: message
            });

            currentStatus = newStatus;
        }

        setTimeout(netwatch, 1000);
    });
})();