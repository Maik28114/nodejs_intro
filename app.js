import http from 'http';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'config.json');

const config = JSON.parse(readFileSync(configPath, 'utf8'));
const { port, hostname } = config;

let posts = [
    {

        id: 1, 
        title: "Mein erster Blogbeitrag", 
        content: "Das sind die Inhalte von meinem ersten Blogbeitrag.",
        author: "Alice",
        date: "2025-07-29"
    },
    {
        id: 2,
         title: "Node.js Grundlagen", 
        content: "In diesem Beitrag beschreibe ich die Node.js Grundlagen.",
        author: "Bob",
        date: "2025-07-30"
    }
];
let nextId = 3;


const server = http.createServer((req, res) => {
    console.log(`Anfrage erhalten: ${req.method} ${req.url}`);


    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'CONTENT-TYPE');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/posts') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(posts));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Endpunkt nicht gefunden." }));
    }


});

server.listen(port, hostname, () => {
    console.log(`Server gestartet unter http://${hostname}:${port}/`);
    console.log(`Teste den GET /posts Endpunkt unter http://${hostname}:${port}/posts`);
})
