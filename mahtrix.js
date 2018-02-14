var ALPHABET = ["!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_", "a", "b", "c", "d", "e", "f", "g", "h", "i", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "x", "y", "z", "{", "|", "}", "~",]

function Word() {

    this.x = 0;
    this.y = 0;
    this.height = 1;
    this.width = 1;
    this.symbols = [];

    this.init = function(w, h) {
        this.width = w;
        this.height = h;
        this.ghost = Math.random() < 0.33;

        this.reset(true);
    };

    this.reset = function(offscreen) {
        this.randomizeWord();
        this.randomizePos(offscreen);
    }

    this.randomizePos = function(offscreen) {
        var r = Math.random();
        //this.x = (r*WIDTH)-(r*WIDTH) % this.step;
        this.x = r;
        r = Math.ceil((Math.random() * 40));
        this.y = offscreen ? -r : r;
        //this.y = 0 + (r*this.height)-(r*this.height) % this.step;
        //this.y = offscreen ? -this.length()*TILE_SIZE-TILE_SIZE : this.y;
    }

    this.randomizeWord = function() {
        var l = (Math.random() < 0.7) ? 2 + parseInt(Math.ceil(Math.random() * 4)) : 5 + parseInt(Math.ceil(Math.random() * 7));
        this.rewrite(l);
    }

    this.rewrite = function(len) {
        this.symbols = [];
        for (var i = 0; i < len; i++) {
            this.symbols.push(Math.floor(Math.random() * ALPHABET.length));
        }
    }

    this.length = function() {
        return this.symbols.length;
    };

    this.get = function(i) {
        return ALPHABET[this.symbols[i]];
    };

    this.update = function() {

        var r = Math.random();
        var l = this.symbols.length;

        // short words always move, long ones occasionally pause
        var moving = l < 4 || (l < 7 && r < 0.75) || r < 0.4;
        if (moving) {
            this.y++;
            if (Math.random() < 0.75 || this.symbols.length < 4) {
                //if (moving) {
                if (this.symbols.length < 5) {
                    this.symbols.shift();
                    this.symbols.push(Math.floor(Math.random() * ALPHABET.length));
                } else {
                    this.symbols.push(this.symbols.shift());
                }
            }
        }

        for (var i = 0; i < this.symbols.length; i++) {
            if (Math.random() < 0.05) { // small chance to randomly change a character
                this.symbols[i] = Math.floor(Math.random() * ALPHABET.length);
            }
        }

    };
}

var words = [];
var w, h;

var BUFFERS = [];
var CURRENT_BUFFER = 0;

var WIDTH = 640;
var HEIGHT = 480;
var TILE_SIZE = 22;
var V_TILES;
var H_TILES;
var NUM_WORDS = 0;
var TARGET_NUM_WORDS = 70;
var STEPS = 250;
var STEPS_DEFAULT = 25000;
var RUNNING = true;
var TARGET_FPS = 25;
var DPR = window.devicePixelRatio;
var RATIO = 1;
var FRAMES = 1;


$(document).ready(function() {

    function init() {

        BUFFERS[0] = $('#mahtrix1')[0];
        BUFFERS[1] = $('#mahtrix2')[0];
        //console.log(BUFFERS);

        words = [];
        for (var i = 0; i < NUM_WORDS; i++) {
            var word = new Word();
            word.init(WIDTH, HEIGHT);
            words.push(word);
        }
        //console.log(words);
        paint();
    }

    function update() {

        // update words
        for (var i = 0; i < words.length; i++) {
            words[i].update();
        }

    }

    function paint() {
        // render
        render();
        // BUFFERS[1 - CURRENT_BUFFER].style.display = 'none'; // .style.visibility = 'hidden';
        // BUFFERS[CURRENT_BUFFER].style.display = 'block'; //.style.visibility = 'visible';
        CURRENT_BUFFER = 1; // - CURRENT_BUFFER;
    }

    function render() {
        var now = Date.now();
        //console.log("Render started. Drawing to buffer " + CURRENT_BUFFER);
        var buffer = BUFFERS[CURRENT_BUFFER]; //getBuffer();
        var ctx = buffer.getContext("2d");

        // ctx.fillStyle = "rgba(255,255,255, 0.5)";
        // ctx.fillStyle = "rgba(255,255,255, 1)";
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        //ctx.fillStyle ="#44DD44";
        //ctx.fillRect(0,0,TILE_SIZE,TILE_SIZE);

        //ctx.fillStyle = "#FF0000";
        ctx.font = (30 / DPR) + "px MatrixCodeNFI";
        //ctx.font = "3vw MatrixCodeNFI";
        //ctx.font = "30px Lucida Console";
        // ctx.fillStyle = "rgba(50,255,50, 1)";
        // ctx.fillStyle = "rgba(50,255,50,0.05)";
        /* random backgrounds?
        var dx = Math.ceil(WIDTH/TILE_SIZE);
        var dy = Math.ceil(HEIGHT/TILE_SIZE);
        for (var i=0; i< dx; i++) {
            if (Math.random() < 0.6) {
                for (var j=0; j< dy; j++) {
                //ctx.fillText(symbols[Math.floor(Math.random()*symbols.length)], i*TILE_SIZE, j*TILE_SIZE);
                //ctx.fillText("asd", i*TILE_SIZE, j*TILE_SIZE);
                ctx.fillText(symbols[(Math.ceil(FRAMES/15)*i)%symbols.length], i*TILE_SIZE+5, j*TILE_SIZE);
                }
            }
        }
        */
        //ctx.strokeStyle = "rgba(50,255,50, 1)";

        var avg = 0;
        for (var i = 0; i < words.length; i++) {
            var l = words[i].length();
            avg += words[i].length();
            var y = words[i].y * TILE_SIZE;
            if (y > HEIGHT) {
                words[i].randomizePos(true);
                y = words[i].y * TILE_SIZE;
            }

            if (y + l * TILE_SIZE > -1) { // don't bother with offscreen words
                var x = (words[i].x * WIDTH) - (words[i].x * WIDTH) % TILE_SIZE;
                /*
                ctx.font = "40px MatrixCodeNFI";
                ctx.fillStyle = "rgba(50,255,50, " + 0.3 + ")";
                ctx.fillText(words[i].get(words[i].length()-1), x+3, y + TILE_SIZE*(words[i].length()-1)+1);
                ctx.font = "30px MatrixCodeNFI";
                */
                for (var j = 0; j < l; j++) {
                    //if (words[i].y + TILE_SIZE*j > 0) { // TODO skip offscreen? needs fix
                    var alpha = words[i].ghost ? 0.1 : (0.2 + (j / (l - l * 0.2))) * 0.8;
                    //ctx.fillStyle = "rgba(50,255,50, " + alpha + ")";
                    ctx.fillStyle = "rgba(50,255,50, " + alpha + ")";
                    //ctx.fillText(words[i].get(j), 8 + words[i].x, words[i].y + TILE_SIZE*j);
                    ctx.fillText(words[i].get(j), x + 5, y + TILE_SIZE * j);
                    //ctx.strokeRect(x, y-TILE_SIZE+3 + TILE_SIZE*j, TILE_SIZE, TILE_SIZE);
                    //}
                }
            }
        }
        $('#avgwl').val((avg / words.length).toFixed(2));
        if (FRAMES % TARGET_FPS == 0) {
            var ms = (Date.now() - now).toFixed(1);
            var fps = (1000 / ms).toFixed(1);
            $('#rendertime').val(ms + ' ms (' + fps + ' fps)');
        }
    }

    function run() {
        update();
        paint();
        //if (STEPS-- > 0) {
        if (RUNNING) {
            setTimeout(function() { run(); }, (1000 / TARGET_FPS));
            FRAMES++;
        }
    }

    function recalcNumWords() {
        if (TARGET_NUM_WORDS < NUM_WORDS) {
            console.log("Reducing words to " + TARGET_NUM_WORDS);
            words.splice(TARGET_NUM_WORDS);
        } else if (TARGET_NUM_WORDS > NUM_WORDS) {
            console.log("Increasing words to " + TARGET_NUM_WORDS);
            for (var i = 0; i < TARGET_NUM_WORDS - NUM_WORDS; i++) {
                var word = new Word();
                word.init(WIDTH, HEIGHT);
                word.randomizePos(true);
                words.push(word);
            }
        }
        NUM_WORDS = words.length;
    }

    $('#initialize').click(function() {
        init();
    });

    $('#step').click(function() {
        update();
        paint();
    });

    $('#run').click(function() {
        STEPS = STEPS_DEFAULT;
        RUNNING = true;
        run();
    });

    $('#stop').click(function() {
        STEPS = 0;
        RUNNING = false;
    });

    $('#numwords').change(function() {
        TARGET_NUM_WORDS = parseInt($('#numwords').val());
        recalcNumWords();
        //init();
    });

    $('#targetfps').change(function() {
        TARGET_FPS = parseInt($('#targetfps').val());
    });


    function resetSize() {
        var w = $(window).width();
        var h = $(window).height();
        $('canvas').attr("width", w); // TODO canvas just streches?
        $('canvas').attr("height", h);
        WIDTH = w;
        HEIGHT = h;
        RATIO = h / w;
        //TILE_SIZE = Math.min(WIDTH/30, 25 * DPR);
        TILE_SIZE = 25 / DPR;
        TARGET_NUM_WORDS = Math.ceil(WIDTH * HEIGHT / 6000 * DPR);
        $('#numwords').val(TARGET_NUM_WORDS);
        //console.log("TARGET_NUM_WORDS " + WIDTH * HEIGHT / 8000);
        //console.log("TILE_SIZE " + TILE_SIZE);
        recalcNumWords();
    }

    $(window).resize(_.debounce(function() {
        console.log("Resized to " + $(window).width());
        resetSize();
    }, 50, { maxWait: 250 }));

    $(window).on("orientationchange", function() {
        resetSize();
    });

    $(window).on("swipeleft", function() {
        NUM_WORDS -= 10;
        NUM_WORDS = NUM_WORDS < 0 ? 0 : NUM_WORDS;
        words.splice(NUM_WORDS);
    });

    $(window).on("swiperight", function() {
        NUM_WORDS += 10;
        for (var i = 0; i < 10; i++) {
            var word = new Word();
            word.init(WIDTH, HEIGHT, TILE_SIZE);
            word.randomizePos(true);
            words.push(word);
        }
    });

    $('body').keypress(function(event) {
        if (event.which == 100) {
            $('#debug').toggle();
        }
    })

    // TODO: find a prettier way to load and cache webfont?
    $('body').append("<div id='loadfont'>!</div>");
    $('#loadfont').remove();

    // juss gooo
    init();
    resetSize();
    run();

    console.log(WIDTH + "x" + HEIGHT + "@" + RATIO + ":" + DPR);
    console.log(WIDTH * HEIGHT / 10000);

});
