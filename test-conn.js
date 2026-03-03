const { Client } = require('pg');
const dns = require('dns');
const net = require('net');
const dotenv = require('dotenv');
dotenv.config();

const urlStr = process.env.DATABASE_URL;
const url = new URL(urlStr);

async function diagnose() {
    console.log('--- DIAGNÓSTICO DE CONEXIÓN ---');
    console.log('Host:', url.hostname);
    console.log('Puerto:', url.port);
    console.log('Usuario:', url.username);

    // 1. DNS
    console.log('\n1. Probando resolución DNS...');
    try {
        const ip = await new Promise((resolve, reject) => {
            dns.lookup(url.hostname, (err, address) => {
                if (err) reject(err);
                else resolve(address);
            });
        });
        console.log('✅ DNS Resuelto:', ip);
    } catch (err) {
        console.error('❌ Error DNS:', err.message);
        return;
    }

    // 2. TCP
    console.log('\n2. Probando conexión TCP al puerto...');
    try {
        await new Promise((resolve, reject) => {
            const socket = net.createConnection(url.port || 5432, url.hostname, () => {
                socket.end();
                resolve();
            });
            socket.setTimeout(5000);
            socket.on('error', reject);
            socket.on('timeout', () => reject(new Error('Timeout TCP')));
        });
        console.log('✅ Conexión TCP establecida');
    } catch (err) {
        console.error('❌ Error TCP:', err.message);
        return;
    }

    // 3. Autenticación y SSL
    console.log('\n3. Probando autenticación (SSL rejectUnauthorized: false)...');
    const client = new Client({
        connectionString: urlStr,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log('✅ Autenticación exitosa');
        await client.end();
    } catch (err) {
        console.error('❌ Error Autenticación/SSL:');
        console.error('   Código:', err.code);
        console.error('   Mensaje:', err.message);
    }
}

diagnose();
