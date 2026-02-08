// ==========================================
// TOKEJI - MÓDULO AMIGOS
// ==========================================

(function() {
    'use strict';
    
    let contactos = {};
    let listIndex = 0;
    let actionIndex = 0;
    let mode = 'actions';
    let videoStream = null;
    
    window.initAmigos = function() {
        console.log('👥 Inicializando Amigos...');
        
        const saved = localStorage.getItem('tokeji_contactos');
        if (saved) {
            try { 
                contactos = JSON.parse(saved); 
            } catch(e) {
                contactos = {};
            }
        }
        
        listIndex = 0;
        actionIndex = 0;
        mode = Object.keys(contactos).length > 0 ? 'list' : 'actions';
        
        render();
    };
    
    function render() {
        const lista = document.getElementById('amigos-lista');
        const contador = document.getElementById('amigos-contador');
        
        if (!lista || !contador) {
            console.error('No se encontraron elementos de amigos');
            return;
        }
        
        const amigosArray = Object.entries(contactos);
        contador.textContent = amigosArray.length + ' amigo' + (amigosArray.length !== 1 ? 's' : '');
        
        if (amigosArray.length === 0) {
            lista.innerHTML = `
                <div class="amigos-vacio">
                    <div class="vacio-icono">👻</div>
                    <div class="vacio-texto">No tienes amigos aún</div>
                    <div class="vacio-hint">Escanea un QR para añadir</div>
                </div>
            `;
        } else {
            lista.innerHTML = '';
            amigosArray.forEach(([id, nombre], index) => {
                const div = document.createElement('div');
                div.className = 'amigo-card' + (index === 0 ? ' selected' : '');
                div.innerHTML = `
                    <div class="amigo-avatar">👤</div>
                    <div class="amigo-info">
                        <div class="amigo-nombre">${nombre}</div>
                        <div class="amigo-id">${id}</div>
                    </div>
                `;
                lista.appendChild(div);
            });
        }
        
        updateSelection();
    }
    
    function updateSelection() {
        const cards = document.querySelectorAll('.amigo-card');
        const btnEscanear = document.getElementById('amigo-btn-escanear');
        const btnMiQR = document.getElementById('amigo-btn-miqr');
        
        cards.forEach((card, idx) => {
            card.classList.toggle('selected', idx === listIndex && mode === 'list');
        });
        
        if (btnEscanear) {
            btnEscanear.classList.toggle('selected', mode === 'actions' && actionIndex === 0);
        }
        if (btnMiQR) {
            btnMiQR.classList.toggle('selected', mode === 'actions' && actionIndex === 1);
        }
    }
    
    window.amigosOnUp = function() {
        if (window.currentPage !== 'amigos') return false;
        
        const total = Object.keys(contactos).length;
        const hayAmigos = total > 0;
        
        if (mode === 'actions') {
            if (hayAmigos) {
                mode = 'list';
                listIndex = total - 1;
            }
        } else {
            if (hayAmigos) {
                listIndex = (listIndex - 1 + total) % total;
            }
        }
        updateSelection();
        return true;
    };
    
    window.amigosOnDown = function() {
        if (window.currentPage !== 'amigos') return false;
        
        const total = Object.keys(contactos).length;
        const hayAmigos = total > 0;
        
        if (mode === 'list') {
            if (listIndex >= total - 1) {
                mode = 'actions';
                actionIndex = 0;
            } else {
                listIndex++;
            }
        } else {
            actionIndex = (actionIndex + 1) % 2;
        }
        updateSelection();
        return true;
    };
    
    window.amigosOnOk = function() {
        if (window.currentPage !== 'amigos') return false;
        
        if (mode === 'actions') {
            if (actionIndex === 0) {
                iniciarEscanear();
            } else {
                mostrarMiQR();
            }
        } else {
            const amigos = Object.keys(contactos);
            if (amigos.length > 0) {
                alert('Amigo: ' + contactos[amigos[listIndex]]);
            }
        }
        return true;
    };
    
    window.amigosOnBack = function() {
        if (window.currentPage === 'escanear') {
            cerrarEscanear();
            return true;
        }
        const modal = document.getElementById('modal-miqr');
        if (modal && modal.style.display === 'flex') {
            cerrarModalMiQR();
            return true;
        }
        return false;
    };
    
    function iniciarEscanear() {
        let page = document.getElementById('page-escanear');
        if (!page) {
            page = document.createElement('div');
            page.id = 'page-escanear';
            page.className = 'page escanear-page';
            page.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(0,0,0,0.8); color: white;">
                    <span style="font-weight: 800;">ESCANEAR QR</span>
                    <button onclick="cerrarEscanear()" style="background: #ff4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">✕</button>
                </div>
                <div style="flex: 1; position: relative; overflow: hidden;">
                    <video id="qr-video" style="width: 100%; height: 100%; object-fit: cover;" autoplay playsinline></video>
                    <canvas id="qr-canvas" style="display: none;"></canvas>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 200px; border: 3px solid #00ff00; border-radius: 20px; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);"></div>
                    <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; color: white; font-weight: 800;">Apunta al código QR</div>
                </div>
            `;
            document.querySelector('.screen').appendChild(page);
            if (window.pages) window.pages.escanear = page;
        }
        
        window.showPage('escanear');
        
        if (typeof jsQR === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
            script.onload = iniciarCamara;
            script.onerror = () => {
                alert('Error al cargar librería QR');
                cerrarEscanear();
            };
            document.head.appendChild(script);
        } else {
            iniciarCamara();
        }
    }
    
    function iniciarCamara() {
        const video = document.getElementById('qr-video');
        if (!video) return;
        
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(stream => {
                videoStream = stream;
                video.srcObject = stream;
                video.play();
                scanFrame();
            })
            .catch(err => {
                alert('No se pudo acceder a la cámara: ' + err.message);
                cerrarEscanear();
            });
    }
    
    function scanFrame() {
        if (!videoStream) return;
        
        const video = document.getElementById('qr-video');
        const canvas = document.getElementById('qr-canvas');
        
        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
            requestAnimationFrame(scanFrame);
            return;
        }
        
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        
        if (code && code.data) {
            detenerCamara();
            procesarQR(code.data);
            return;
        }
        
        requestAnimationFrame(scanFrame);
    }
    
    function detenerCamara() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
    }
    
    window.cerrarEscanear = function() {
        detenerCamara();
        window.showPage('amigos');
    };
    
    function procesarQR(data) {
        const partes = data.split('|');
        const id = partes[0]?.trim();
        const nombre = partes[1]?.trim() || 'Amigo';
        
        if (!id) {
            alert('QR inválido');
            cerrarEscanear();
            return;
        }
        
        if (contactos[id]) {
            alert('Este amigo ya está en tu lista');
            cerrarEscanear();
            return;
        }
        
        contactos[id] = nombre;
        localStorage.setItem('tokeji_contactos', JSON.stringify(contactos));
        
        alert('¡' + nombre + ' añadido!');
        cerrarEscanear();
        render();
    }
    
    function mostrarMiQR() {
        const user = window.user || {};
        const nombre = user.nombre || 'Usuario';
        const id = user.id || '----';
        
        let modal = document.getElementById('modal-miqr');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-miqr';
            modal.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #f8fafc; z-index: 200; display: none; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;';
            document.querySelector('.screen').appendChild(modal);
        }
        
        const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(id + '|' + nombre);
        
        modal.innerHTML = `
            <div style="font-size: 20px; font-weight: 900; margin-bottom: 20px; color: #2d3748;">MI CÓDIGO QR</div>
            <div style="background: white; padding: 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <img src="${qrUrl}" style="width: 180px; height: 180px; display: block;">
            </div>
            <div style="text-align: center; margin-bottom: 10px;">
                <div style="font-size: 18px; font-weight: 800; color: #2d3748;">${nombre}</div>
                <div style="font-size: 12px; color: #64748b; font-family: monospace;">ID: ${id}</div>
            </div>
            <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-bottom: 30px;">Muéstralo a tus amigos</div>
            <button onclick="cerrarModalMiQR()" style="padding: 12px 30px; background: #8b5cf6; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 0 #5b21b6;">◄ Volver</button>
        `;
        
        modal.style.display = 'flex';
    }
    
    window.cerrarModalMiQR = function() {
        const modal = document.getElementById('modal-miqr');
        if (modal) modal.style.display = 'none';
    };
    
    console.log('📦 Módulo Amigos cargado');
})();
