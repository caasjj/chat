/**
 * Created with JetBrains PhpStorm.
 * User: walid
 * Date: 9/8/13
 * Time: 2:26 PM
 * To change this template use File | Settings | File Templates.
 */

var chatterBox = (function (timerPeriod) {

    timerPeriod = timerPeriod || 3000;

    // Model
    var timer = null;
    var currentUser = window.location.href.slice(window.location.href.search('username=') + 9);
    var $input = $('input.draft');
    var $send = $('button.send');

    // Start clean
    $('li').remove();

    // Set up update rate
    var setPeriod = function (newPeriod) {
        stopMonitor();
        timerPeriod = newPeriod;
        startMonitor();
    }

    // Either hitting <enter> in input box or clicking <send> button, with characters present
    // will send message. <send> button is disable if no characters in input field.

    // Keyboard event handler
    $input.on('keyup', function (e) {
        if (e.keyCode === 13) {
            var writtenMessage = $(this).val();
            $(this).val('');
            Chat.send(writtenMessage);
            $send.prop('disabled', true);
        } else {
            $send.prop('disabled', $(this).val().length == 0);
        }
    });

    // Send button event handler
    $send.on('click', function (e) {
        var writtenMessage = $input.val();
        $input.val('');
        Chat.send(writtenMessage);
        $(this).prop('disabled', true);
    });

    // Select what methods to override in Chat
    var overRideDefaults = function (override) {
        for (var o in override) {
            switch (override[o]) {

                // Chat.display appends a single message to the DOM.  Not cool. Should have
                // made it an array
                case 'display':
                    delete Chat.display;
                    Chat.display = function (messages) {
                        var $newMessages = [];
                        messages.forEach(function (message) {

                            var isEcho = message.search(new RegExp(currentUser + ':'));
                            var isRobo = message.search(new RegExp('RoboChat' + ':'), 'i');

                            // Escape the HTML to avoid XSS type attacks ...
                            // Create dummy li,
                            var $temp = $('<li>').text(message).addClass("chat");
                            if (isEcho > -1) $temp.addClass('isEcho');
                            if (isRobo > -1) $temp.addClass('isRobo');

                            // push onto array
                            $newMessages.push($temp[0]);
                        });

                        $('li.chat').remove();
                        $($newMessages).appendTo('ul.messages');

                    };
                    break;

                // Chat.fetch sends an array of strings of messages to its callback, fetchCallback.
                case 'fetch':
                    delete Chat.fetch;
                    Chat.fetch = function (fetchCallback) {
                        $.ajax({
                            url: 'https://api.parse.com/1/classes/chats',
                            data: {
                                order: 'createdAt'
                            },
                            dataType: 'json'
                        }).then(function (retrievedData) {
                                var receivedMessages = retrievedData.results;
                                var ar = [];
                                receivedMessages.forEach(function (e, i) {
                                    ar.push('(' + e.createdAt.substring(e.createdAt.indexOf('T') + 1, e.createdAt.length - 1) + ') ' + e.text);
                                });
                                fetchCallback(ar);
                            }, function (error) {
                                console.warn('ERROR ON FETCH: "' + error.statusText + '"');
                            });
                    };
                    break;

                // Would have liked to send userName as part of data object - especially since it's in fetched objects.
                // But, Chat.guide(10) explicitly states:
                // * The endpoint is expecting to get an object from you that contains a property named "text" (and no other properties).
                // So, username is appended to the string in .text property of data {}, as opposed to a separate property.
                case 'send' :
                    delete Chat.send;
                    Chat.send = function (messageToSend) {
                        $.ajax({
                            url: 'https://api.parse.com/1/classes/chats',
                            type: 'POST',
                            data: JSON.stringify({
                                text: currentUser + ': ' + messageToSend
                            })
                        }).then(function (confirmation) {
                                console.log('Ajax Sent. Resource ' + confirmation.objectId + ' created at ' + confirmation.createdAt);
                            }, function (error) {
                                console.warn('ERROR ON SEND: "' + error.statusText + '"');
                            });
                    };
                    break;
            }
        }
    }

    // The following are used for debugging

    // Define the start / stop methods
    var startMonitor = function (t) {
        if (typeof t === "number") {
            t = Math.floor(t / 1000) * 1000;
            timerPeriod = t > 1000 ? t : timerPeriod;
        }
        timer = setInterval(function () {
            Chat.fetch(function (fetchedMessages) {
                Chat.display(fetchedMessages);
            });
        }, timerPeriod);
    };

    var stopMonitor = function () {
        if (timer) {
            clearInterval(timer);
        }
    };

    //  selectively override any of the Chat methods
    overRideDefaults(['display', 'fetch', 'send']);

    // Start everything up
    startMonitor(timerPeriod);

    // public interface, again just for testing
    return {
        start: startMonitor,
        stop: stopMonitor,
        period: setPeriod
    }

})();