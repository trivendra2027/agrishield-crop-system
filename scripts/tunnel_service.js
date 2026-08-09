const { spawn } = require('child_process');

function startTunnel() {
    console.log('\x1b[35m[TUNNEL]\x1b[0m Checking internet connection for remote tunnel...');
    const tunnel = spawn('npx', ['-y', 'localtunnel', '--port', '3000', '--local-host', '127.0.0.1', '--subdomain', 'agrishield-dev'], {
        shell: true,
        stdio: 'inherit'
    });

    tunnel.on('close', (code) => {
        console.log(`\x1b[33m[TUNNEL]\x1b[0m Tunnel offline (Code ${code}). Localhost (http://localhost:3000) is running normally. Retrying tunnel in 10s...`);
        setTimeout(startTunnel, 10000);
    });

    tunnel.on('error', (err) => {
        console.log(`\x1b[33m[TUNNEL]\x1b[0m Tunnel network unavailable: ${err.message}. Retrying in 10s...`);
        setTimeout(startTunnel, 10000);
    });
}

startTunnel();
