const express = require('express');
const path = require('path');
const mime = require('mime-types');

const app = express();
const port = 8000;

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

app.use(express.static(path.join(__dirname, '.'), {
    setHeaders: function (res, filePath) {
        const mimeType = mime.lookup(filePath);
        if (mimeType) {
            res.setHeader('Content-Type', mimeType);
        }
    }
}));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
