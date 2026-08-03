const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const http = require('http');
const fs = require('fs');
const YTDlpWrap = require('yt-dlp-wrap').default;
const DiscordRPC = require('discord-rpc');

app.name = 'Snisago Music';
app.setAppUserModelId('com.snisago.music');

// ==========================================
const CLIENT_ID = '1482884907410657491'; 
// ==========================================

const ytDlpPath = path.join(app.getPath('userData'), 'yt-dlp.exe');
const ytDlpWrap = new YTDlpWrap();

let mainWindow;
let osdWindow;
let miniWindow;
let osdTimeout;
let currentTrackData = { title: "Плеер пуст", artist: "Ожидание" };

// ==========================================
// DISCORD RPC
// ==========================================
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

// ==========================================
// YT-DLP И ЛОКАЛЬНЫЙ СЕРВЕР
// ==========================================
async function initYtDlp() {
    try {
        if (!fs.existsSync(ytDlpPath)) {
            console.log('📥 Загрузка движка yt-dlp...');
            await YTDlpWrap.downloadFromGithub(ytDlpPath);
            console.log('✅ Движок установлен!');
        }
        ytDlpWrap.setBinaryPath(ytDlpPath);
        startServer(); 
    } catch (error) {
        console.error('❌ Ошибка yt-dlp:', error.message);
    }
}

function startServer() {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    
    if (urlObj.pathname === '/api/info') {
      try {
        let jsonInfo = await ytDlpWrap.getVideoInfo(urlObj.searchParams.get('url'));
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          title: jsonInfo.title || "Трек",
          uploader: jsonInfo.uploader || jsonInfo.artist || "Интернет",
          thumbnailUrl: jsonInfo.thumbnail || 'linear-gradient(135deg, #3b82f6, #06b6d4)'
        }));
      } catch (err) { 
        if (!res.headersSent) { res.writeHead(500); res.end(); }
      }
    } 
    else if (urlObj.pathname === '/api/stream') {
      try {
        let audioStream = ytDlpWrap.execStream([urlObj.searchParams.get('url'), '-f', 'bestaudio', '-o', '-']);
        res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
        audioStream.pipe(res);
        req.on('close', () => { audioStream.destroy(); });
      } catch (err) {
        if (!res.headersSent) { res.writeHead(500); res.end(); }
      }
    } else {
      if (!res.headersSent) { res.writeHead(404); res.end(); }
    }
  });
  server.listen(3000, '127.0.0.1');
}

// ==========================================
// СОЗДАНИЕ ОКОН (ГЛАВНОЕ, ОВЕРЛЕЙ, МИНИ)
// ==========================================
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1250, height: 830, minWidth: 900, minHeight: 600, 
    title: "Snisago Music", icon: path.join(__dirname, 'icon.png'), backgroundColor: '#0a0a0e',
    webPreferences: { nodeIntegration: true, contextIsolation: false, webSecurity: false }
  });
  mainWindow.setMenuBarVisibility(false); 
  mainWindow.loadFile('index.html');
}

function createOsdWindow() {
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    osdWindow = new BrowserWindow({
        width: 320, height: 80, x: width - 340, y: 30,
        transparent: true, frame: false, alwaysOnTop: true, skipTaskbar: true, focusable: false, show: false,
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    osdWindow.setIgnoreMouseEvents(true);
    const osdHtml = `
        <body style="margin:0; overflow:hidden; font-family:sans-serif; color:white; display:flex; align-items:center; background:rgba(15,15,20,0.9); border-radius:12px; padding:15px; border: 1px solid rgba(139, 92, 246, 0.5); backdrop-filter:blur(10px);">
            <div style="font-size:24px; margin-right:15px; background:linear-gradient(135deg, #8b5cf6, #3b82f6); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">🎶</div>
            <div style="overflow:hidden; white-space:nowrap; flex:1;">
                <div id="title" style="font-size:15px; font-weight:bold; text-overflow:ellipsis; overflow:hidden;">Snisago Music</div>
                <div id="artist" style="font-size:12px; color:#94a3b8; text-overflow:ellipsis; overflow:hidden;">Оверлей запущен</div>
            </div>
            <script>
                require('electron').ipcRenderer.on('update-osd', (e, data) => {
                    document.getElementById('title').innerText = data.title;
                    document.getElementById('artist').innerText = data.artist;
                });
            </script>
        </body>
    `;
    osdWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(osdHtml)}`);
}

function createMiniWindow() {
    if (miniWindow) { miniWindow.focus(); return; }
    miniWindow = new BrowserWindow({
        width: 320, height: 120,
        frame: false, alwaysOnTop: true, transparent: true, resizable: false,
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    const miniHtml = `
        <body style="margin:0; font-family:sans-serif; color:white; background:rgba(9,9,11,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:16px; display:flex; flex-direction:column; justify-content:space-between; padding:15px; -webkit-app-region: drag; user-select:none; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="overflow:hidden; white-space:nowrap; max-width: 250px;">
                    <div id="title" style="font-size:14px; font-weight:bold; text-overflow:ellipsis; overflow:hidden;">${currentTrackData.title.replace(/'/g, "&#39;")}</div>
                    <div id="artist" style="font-size:12px; color:#94a3b8; text-overflow:ellipsis; overflow:hidden;">${currentTrackData.artist.replace(/'/g, "&#39;")}</div>
                </div>
                <div id="closeBtn" style="cursor:pointer; -webkit-app-region: no-drag; color:#ef4444; font-size:14px; font-weight:bold; padding:4px;">✕</div>
            </div>
            <div style="display:flex; justify-content:center; gap:25px; -webkit-app-region: no-drag; margin-top:10px;">
                <button id="prev" style="background:none; border:none; color:#fff; cursor:pointer; font-size:18px; transition:0.2s;">⏮</button>
                <button id="play" style="background:none; border:none; color:#8b5cf6; cursor:pointer; font-size:24px; transition:0.2s;">⏯</button>
                <button id="next" style="background:none; border:none; color:#fff; cursor:pointer; font-size:18px; transition:0.2s;">⏭</button>
            </div>
            <script>
                const { ipcRenderer } = require('electron');
                document.getElementById('closeBtn').onclick = () => ipcRenderer.send('close-mini');
                document.getElementById('prev').onclick = () => ipcRenderer.send('mini-action', 'prevBtn');
                document.getElementById('play').onclick = () => ipcRenderer.send('mini-action', 'playBtn');
                document.getElementById('next').onclick = () => ipcRenderer.send('mini-action', 'nextBtn');
                
                ipcRenderer.on('update-osd', (e, data) => {
                    document.getElementById('title').innerText = data.title;
                    document.getElementById('artist').innerText = data.artist;
                });
            </script>
        </body>
    `;
    miniWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(miniHtml)}`);
    
    miniWindow.on('closed', () => {
        miniWindow = null;
        if(mainWindow) mainWindow.show();
    });
}

// ==========================================
// IPC ИВЕНТЫ (СВЯЗЬ С ФРОНТЕНДОМ)
// ==========================================
ipcMain.on('track-changed', (event, data) => {
    currentTrackData = data;
    // Оверлей (OSD)
    if (!osdWindow) createOsdWindow();
    osdWindow.webContents.send('update-osd', data);
    osdWindow.showInactive(); // Показываем, не забирая фокус у игры
    clearTimeout(osdTimeout);
    osdTimeout = setTimeout(() => { if(osdWindow) osdWindow.hide(); }, 4000);
    
    // Мини-плеер (если открыт)
    if (miniWindow) miniWindow.webContents.send('update-osd', data);
});

ipcMain.on('open-mini-player', () => {
    if(mainWindow) mainWindow.hide();
    createMiniWindow();
});

ipcMain.on('close-mini', () => {
    if(miniWindow) miniWindow.close(); 
});

ipcMain.on('mini-action', (event, btnId) => {
    // Вызываем клик по кнопке в главном невидимом окне
    if(mainWindow) mainWindow.webContents.executeJavaScript(`document.getElementById("${btnId}").click()`);
});

// ==========================================
// ЖИЗНЕННЫЙ ЦИКЛ APP
// ==========================================
app.whenReady().then(() => { 
    createWindow(); 
    initYtDlp(); 
    
    // Регистрация глобальных медиа-клавиш
    globalShortcut.register('MediaPlayPause', () => {
        if(mainWindow) mainWindow.webContents.executeJavaScript('document.getElementById("playBtn").click()');
    });
    globalShortcut.register('MediaNextTrack', () => {
        if(mainWindow) mainWindow.webContents.executeJavaScript('document.getElementById("nextBtn").click()');
    });
    globalShortcut.register('MediaPreviousTrack', () => {
        if(mainWindow) mainWindow.webContents.executeJavaScript('document.getElementById("prevBtn").click()');
    });

    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); 
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll(); // Очищаем хоткеи при выходе
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ==========================================
// СИСТЕМА АВТООБНОВЛЕНИЙ
// ==========================================
autoUpdater.autoDownload = false;

ipcMain.on('check_update', () => {
    autoUpdater.checkForUpdates().catch(err => {
        if (mainWindow) mainWindow.webContents.send('update_error', err.message);
    });
});

ipcMain.on('download_update', () => autoUpdater.downloadUpdate());
ipcMain.on('install_update', () => autoUpdater.quitAndInstall());

autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update_available', info.version);
});
autoUpdater.on('update-not-available', () => {
    if (mainWindow) mainWindow.webContents.send('update_not_available');
});
autoUpdater.on('update-downloaded', () => {
    if (mainWindow) mainWindow.webContents.send('update_downloaded');
});
autoUpdater.on('error', (err) => {
    if (mainWindow) mainWindow.webContents.send('update_error', err.message);
});
