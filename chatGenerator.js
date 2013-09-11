(function() {

    var started = false;
    var $autochat = $('#autochat');

    var expressions = [
     "Really?", "Cool...", "OK", "Maybe Later", "See ya", "LOL", "Same here", "Hein??", "Just kidding"
    ];

    var sentences = [
        "&lt;script&gt;(function escapedHTML() { })()&lt;script&gt;",
        "I don't know.  Ask on StackOverflow.",
        "<script>(function evilDoer(a) { var myAct = moscowBank('myCred'); a.transferAll(myAct) })(urAct);</script>",
        "I like IE like I like root canals",
        "Gold ... are you serious?? Man, I miss Steve.",
        "I'd probably make more sense if I had some smarts built in",
        "@Robochat: ask Siri, dude!"
    ];

    var createMessage = function() {
        var idx;

        if (Math.random() > 0.2) {
            idx = Math.floor(Math.random() * sentences.length);
           return( sentences[ idx]);
        } else {
            idx = Math.floor(Math.random() * expressions.length);
            return( expressions[ idx ]);
        }
    };

    var start = function() {
        started = !started;
        if (started === true) {
            $autochat.addClass('activeBtn')
            autoChat();
        } else {
            $autochat.removeClass('activeBtn')
        }
    };

    var autoChat = function() {
        if(started === true) {
            Chat.send( createMessage() );
            setTimeout( autoChat, Math.random() * 5000 + 5000 );
        }
    };

    // Assign the event handler to the button
    $autochat.on('click', start);
    return {
        start: start
    }
    
})();

