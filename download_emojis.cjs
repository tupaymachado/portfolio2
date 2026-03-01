const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'assets', 'emojis');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const files = [
    'angry.svg', 'blush.svg', 'confused.svg', 'cry.svg',
    'disappointed.svg', 'eyebrow-raise.svg', 'grin.svg',
    'hot.svg', 'sad.svg', 'smile.svg', 'surprise.svg',
    'tongue.svg', 'wink.svg'
];

let downloaded = 0;
files.forEach(file => {
    const url = `https://raw.githubusercontent.com/rozniak/MSN-Emoticons/master/${file}`;
    const filePath = path.join(dir, file);

    https.get(url, (res) => {
        if (res.statusCode !== 200) {
            console.error(`Failed to download ${file}: ${res.statusCode}`);
            return;
        }
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded ${file}`);
            downloaded++;
            if (downloaded === files.length) {
                console.log('✅ Done!');
                process.exit(0);
            }
        });
    }).on('error', err => console.error(err));
});
