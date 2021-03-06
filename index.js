/**
 * Created by Chris Cheshire on 07/05/15.
 */

var request    = require('request'),
notifier       = require('node-notifier'),
path           = require('path'),
debug          = require('debug')('netwatch'),
WindowsBalloon = require('node-notifier').WindowsBalloon
    ;

var windowsNotifier = new WindowsBalloon({
    withFallback: true // Try Windows 8 and Growl first?
});

var statuses       = {
        down: 0,
        virgin: 1,
        talktalk: 2
    },
    validIPs       = {
        virgin: '82.44.176.218',
        talktalk: '79.78.13.85'
    },
    timesFailed    = 0,
    maxTimesFailed = 2,
    currentStatus  = statuses.down;

(function netwatch() {
    debug('About to make request...');

    request({
        url: 'http://api.ipify.org',
        timeout: 15000
    }, function (err, response, body) {
        debug('Request finished');

        var newStatus = currentStatus,
            message,
            icon;

        if (err) {
            if (timesFailed < maxTimesFailed) {
                timesFailed++;

                debug('Failed ' + timesFailed + ' times');
            } else {
                debug('Hit max fail times of ' + maxTimesFailed);

                newStatus = statuses.down;
                message = 'Connection lost...';
                icon = path.join(__dirname, 'img/disconnected.png');
            }
        } else {
            timesFailed = 0;

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

            if (process.platform === 'win32') {
                windowsNotifier.notify({
                    title: 'Netwatch',
                    message: message,
                    sound: true,
                    time: 10000, // How long to show balloons in ms
                    wait: false // if wait for notification to end
                });
            } else {
                notifier.notify({
                    icon: icon,
                    title: 'Netwatch',
                    sound: true,
                    wait: false,
                    message: message
                });
            }

            currentStatus = newStatus;
        }

        setTimeout(netwatch, 1000);
    });
})();