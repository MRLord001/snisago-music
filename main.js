const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater'); // <-- Добавлено сюда
const path = require('path');
const http = require('http');
const fs = require('fs');
const YTDlpWrap = require('yt-dlp-wrap').default;
const DiscordRPC = require('discord-rpc');

app.name = 'Snisago Music';
app.setAppUserModelId('com.snisago.music');

// ==========================================
// ВСТАВЬ СЮДА СВОЙ APPLICATION ID ИЗ DISCORD
const CLIENT_ID = '1482884907410657491'; 
// ==========================================

const ytDlpPath = path.join(app.getPath('userData'), 'yt-dlp.exe');
const ytDlpWrap = new YTDlpWrap();

let rpcReady = false;
DiscordRPC.register(CLIENT_ID);
const rpc = new DiscordRPC.Client({ transport: 'ipc' });

rpc.on('ready', () => { 
  rpcReady = true; 
  console.log('🎮 Discord RPC готов!'); 
});
rpc.login({ clientId: CLIENT_ID }).catch(() => {});

ipcMain.on('update-rpc', (event, data) => {
  if (!rpcReady) return;
  if (data.isPlaying) {
    rpc.setActivity({ 
      details: 'Слушает музыку', 
      state: 'в Snisago Music', 
      startTimestamp: data.startTimestamp, 
      largeImageKey: 'logo', 
      instance: false 
    }).catch(() => {});
  } else { 
    rpc.clearActivity().catch(() => {}); 
  }
});

ipcMain.on('clear-rpc', () => {
  if (!rpcReady) return;
  rpc.clearActivity().catch(() => {});
});

// НОВАЯ ФИЧА: Управление Мини-Плеером
ipcMain.on('toggle-mini-player', (event, isMini) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (isMini) {
    win.setMinimumSize(320, 140);
    win.setSize(350, 150, true);
    win.setAlwaysOnTop(true);
  } else {
    win.setMinimumSize(900, 600);
    win.setSize(1250, 830, true);
    win.setAlwaysOnTop(false);
  }
});

async function initYtDlp() {
    try {
        if (!fs.existsSync(ytDlpPath)) {
            console.log('📥 Загрузка движка yt-dlp из репозитория (пожалуйста, подождите)...');
            await YTDlpWrap.downloadFromGithub(ytDlpPath);
            console.log('✅ Движок yt-dlp успешно загружен!');
        } else {
            console.log('✅ Движок yt-dlp уже установлен.');
        }
        ytDlpWrap.setBinaryPath(ytDlpPath);
        startServer(); 
    } catch (error) {
        console.error('❌ Ошибка при скачивании yt-dlp:', error.message);
    }
}

function startServer() {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    
    if (urlObj.pathname === '/api/search') {
      const query = urlObj.searchParams.get('q');
      if (!query) { res.writeHead(400); res.end(); return; }
      try {
        let stdout = await ytDlpWrap.execPromise(['ytsearch15:' + query, '--dump-json', '--flat-playlist']);
        const tracks = stdout.trim().split('\n').map(line => {
          if (!line) return null;
          const item = JSON.parse(line);
          return {
            title: item.title, 
            artist: item.uploader || "Интернет",
            src: `http://localhost:3000/api/stream?url=${encodeURIComponent('https://youtube.com/watch?v=' + item.id)}`,
            cover: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`
          };
        }).filter(t => t !== null);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(tracks));
      } catch (err) { 
        res.writeHead(200); res.end(JSON.stringify([])); 
      }
    } 
    
    else if (urlObj.pathname === '/api/info') {
      const targetUrl = urlObj.searchParams.get('url');
      try {
        let jsonInfo = await ytDlpWrap.getVideoInfo(targetUrl);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          title: jsonInfo.title || "Пользовательский трек",
          uploader: jsonInfo.uploader || jsonInfo.artist || "Внешний источник",
          thumbnailUrl: jsonInfo.thumbnail || (jsonInfo.thumbnails && jsonInfo.thumbnails.length > 0 ? jsonInfo.thumbnails[0].url : 'linear-gradient(135deg, #3b82f6, #06b6d4)')
        }));
      } catch (err) { 
        console.error('Ошибка парсинга:', err.message);
        if (!res.headersSent) { res.writeHead(500); res.end(); }
      }
    } 
    
    else if (urlObj.pathname === '/api/stream') {
      const targetUrl = urlObj.searchParams.get('url');
      try {
        let audioStream = ytDlpWrap.execStream([targetUrl, '-f', 'bestaudio', '-o', '-']);
        res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
        audioStream.pipe(res);
        req.on('close', () => { audioStream.destroy(); });
      } catch (err) {
        console.error('Ошибка стриминга:', err.message);
        if (!res.headersSent) { res.writeHead(500); res.end(); }
      }
    } else {
      if (!res.headersSent) { res.writeHead(404); res.end(); }
    }
  });

  server.listen(3000, '127.0.0.1', () => {
    console.log('🎵 Сервер Snisago Music на базе yt-dlp успешно запущен (порт 3000)');
  });
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1250, height: 830, minWidth: 900, minHeight: 600, title: "Snisago Music", icon: path.join(__dirname, 'icon.png'), backgroundColor: '#0a0a0e',
    webPreferences: { nodeIntegration: true, contextIsolation: false, webSecurity: false }
  });
  mainWindow.setMenuBarVisibility(false); mainWindow.loadFile('index.html');
}

app.whenReady().then(() => { 
    createWindow(); 
    initYtDlp(); 
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); 
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });


// ==========================================
// СИСТЕМА АВТООБНОВЛЕНИЙ
// ==========================================

autoUpdater.autoDownload = false;

// Слушаем кнопки из интерфейса
ipcMain.on('check_update', () => {
    autoUpdater.checkForUpdates().catch(err => {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) win.webContents.send('update_error', err.message);
    });
});

ipcMain.on('download_update', () => {
    autoUpdater.downloadUpdate();
});

ipcMain.on('install_update', () => {
    autoUpdater.quitAndInstall();
});

// Отправляем ответы в интерфейс
autoUpdater.on('update-available', (info) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) win.webContents.send('update_available', info.version);
});

autoUpdater.on('update-not-available', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) win.webContents.send('update_not_available');
});

autoUpdater.on('update-downloaded', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) win.webContents.send('update_downloaded');
});

autoUpdater.on('error', (err) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) win.webContents.send('update_error', err.message);
});
