let rows = 20;
let cols = 6;


let sound = [];

for (let i in range(9)) {
	sound.push(new Howl({
		src: [`sounds/clip${i}.mp3`],
		volume: 0.2,
		rate: 0.5+i*0.06
	}));
}

const charset = ' 0+ABC1|-DEF2(GHIJ3)KLM4.NOP5#QRST6$UVW7@XYZ8?,%9\'!';

let text = `A VIRTUAL SPLIT-FLAP DISPLAY
TYPE IN THE BOX AND CLICK UPDATE (${navigator.appVersion.includes("Mac") ? 'CMD' : 'CTRL'}+ENTER)`.split('');
let display = [];
let input = [];

let interval;

for (let i in range(rows*cols)) {
	$('.display').append(`<p>${charset[0]}</p>`);
	display.push(charset[0]);
}

function range(n) {
	return Array.from({length: n},e=>0);
}

function repeat(str, n) {
	let arr = [];
	for (let i in range(n)) arr.push(str);
	return arr;
}

function generate() {
	if (text.length < rows*cols) {
		text = text.concat(Array.from({length: rows*cols - text.length},e=>charset[0]));
	}

	for (let i in text) { // process newlines into spaces
		i = +i;
		if (text[i] === ' ' && (Math.floor(i / rows) < Math.floor(text.indexOf(' ', i+1) / rows))) { // if space and extends to next line
			text[i] = '\n';
		}
		if (text[i] === '\n') { // if char is newline
			let length = rows - (i % rows);
			if (i % rows === 0 && text[i-1] !== '%%' && text[i+1] !== '\n') { // if newline is at end of line
				text.splice(i, 1);
			} else if (i % rows === 0 && text[i-1] !== '%%' && text[i+1] === '\n') { // if newline is at end of line and newline after
				text.splice(i, 2, ...repeat('%%', length));
			} else { // if newline is in the middle of line
				text.splice(i, 1, ...repeat('%%', length));
			}
		}
	}

	text = text.map(el => el === '%%' ? ' ' : el); // remove "fake" spaces made by newlines
	text = text.slice(0, rows*cols);

	let custom = text.concat(display).filter(el => !charset.includes(el));
	custom = charset.split('').concat(custom.filter((el, i) => custom.indexOf(el) === i).sort());

	clearInterval(interval);
	interval = setInterval(function(){
		let amount = 0;
		if (display.join('') !== text.join('')) { // if display isn't target text
			for (let i in display) {
				if (display[i] !== text[i]) { // if not target char
					display[i] = custom[(custom.indexOf(display[i]) + 1) % custom.length];
					let offset = Math.round(Math.random() * 10);
					setTimeout(function(){
						$('.display > p').eq(i).text(display[i]);
					}, offset)
					amount += 1;
				}
			}
		} else {
			clearInterval(interval);
			console.log('done');
		}
		
		amount = amount > 10 ? 10 : amount;
		for (let i in range(amount)) {
			let offset = Math.round(Math.random() * 1);
			let sample = Math.round(Math.random() * 8) + 0;
			let pan = Math.round(Math.random() * 0.4) - 0.4;
			setTimeout(function(){
				sound[sample].stereo(pan,
					sound[sample].play()
				)
			}, i*offset);
		}
	}, 64);
}

generate();

$('#input').on('keydown', function(e){
	if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
		text = $('#input').val().split('');
		generate();
	}
});

$('#update').on('click', function(){
	text = $('#input').val().split('');
	generate();
});
$('#uppercase').on('click', function(){
	$('#input').val($('#input').val().split('').map(el => el.toUpperCase()).join(''));
});