import http from 'http';
//import { readFileSync } from 'fs';
import { readFile } from 'fs/promises'; // Neu: readFile aus 'fs/promises' für asynchrones Lesen
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'config.json');

//const config = JSON.parse(readFileSync(configPath, 'utf8'));
const config = JSON.parse(await readFile(configPath, 'utf8'));
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = ''; // Variable, um die Datenstücke zu sammeln

        // 'data'-Ereignis: Wird ausgelöst, wenn ein Datenstück (chunk) empfangen wird
        req.on('data', chunk => {
            body += chunk.toString(); // Konvertiert den Buffer zu String und fügt ihn zum Body hinzu
        });

        // 'end'-Ereignis: Wird ausgelöst, wenn der gesamte Body empfangen wurde
        req.on('end', () => {
            resolve(body); // Lösen Sie das Promise mit dem gesammelten Body auf
        });

        // 'error'-Ereignis: Fehlerbehandlung, falls ein Problem beim Lesen des Streams auftritt
        req.on('error', err => {
            reject(err); // Lehnt das Promise bei einem Fehler ab
        });
    });
}
//const server = http.createServer((req, res) => {
const server = http.createServer(async (req, res) => {
    console.log(`Anfrage erhalten: ${req.method} ${req.url}`);


    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'CONTENT-TYPE');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
/*
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
*/

/*
    if (req.url === '/posts' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(posts));
    } else if (req.url.match(/^\/posts\/(\d+)$/) && req.method === 'GET') {
        const id = parseInt(req.url.split('/')[2]);
        const post = posts.find(p => p.id === id);

        if (post) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(post));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Blogbeitrag nicht gefunden' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Endpunkt nicht gefunden' }));
    }
});

server.listen(port, hostname, () => {
    console.log(`Server läuft unter http://${hostname}:${port}/`);
    console.log(`Testen Sie: GET http://${hostname}:${port}/posts`);
    console.log(`Testen Sie: GET http://${hostname}:${port}/posts/1`);
    console.log(`Testen Sie: GET http://${hostname}:${port}/posts/99 (für 404 Fehler)`);
});
*/


    if (req.url === '/posts' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        await delay(500);
        res.end(JSON.stringify(posts));
    } else if (req.url.match(/^\/posts\/(\d+)$/) && req.method === 'GET') {
        const id = parseInt(req.url.split('/')[2]);
        const post = posts.find(p => p.id === id);

        if (post) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            await delay(300);
            res.end(JSON.stringify(post));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Blogbeitrag nicht gefunden' }));
        }
    } else if (req.url === '/posts' && req.method === 'POST') {
         try {
        // Warten Sie asynchron, bis der gesamte Request-Body empfangen wurde
        const body = await getRequestBody(req);
        // Wandeln Sie den JSON-String im Body in ein JavaScript-Objekt um
        const newPost = JSON.parse(body);

        // Grundlegende Validierung: Prüfen, ob notwendige Felder vorhanden sind
        if (!newPost.title || !newPost.content || !newPost.author) {
            res.writeHead(400, { 'Content-Type': 'application/json' }); // 400 Bad Request
            res.end(JSON.stringify({ message: 'Fehlende Felder: title, content und author sind erforderlich.' }));
            return; // Beenden Sie die Funktion hier
        }

        // Weisen Sie dem neuen Beitrag eine ID und das aktuelle Datum zu
        newPost.id = nextId++;
        newPost.date = new Date().toISOString().split('T')[0]; // Aktuelles Datum im Format YYYY-MM-DD

        posts.push(newPost); // Fügen Sie den neuen Beitrag zur In-Memory-Liste hinzu

        res.writeHead(201, { 'Content-Type': 'application/json' }); // 201 Created Statuscode
        await delay(200); // Simulierte Verzögerung für die Datenbankoperation
        res.end(JSON.stringify(newPost)); // Senden Sie den neu erstellten Beitrag als JSON zurück
    } catch (error) {
        // Fehlerbehandlung: Wenn JSON ungültig ist oder andere Fehler auftreten
        console.error('Fehler beim Parsen der Anfrage oder ungültiges JSON:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' }); // 400 Bad Request
        res.end(JSON.stringify({ message: 'Ungültige Anfrage: JSON-Format erwartet oder Daten fehlen.' }));
    }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Endpunkt nicht gefunden' }));
    }
});

server.listen(port, hostname, () => {
    console.log(`Server läuft unter http://${hostname}:${port}/`);
    console.log('API-Endpunkte zum Testen:');
    console.log(`GET http://${hostname}:${port}/posts`);
    console.log(`GET http://${hostname}:${port}/posts/1`);
    console.log(`POST http://${hostname}:${port}/posts (mit JSON-Body)`);
});