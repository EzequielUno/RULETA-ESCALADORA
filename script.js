document.addEventListener('DOMContentLoaded', () => {
    // Definición de datos
    const extremidades = ["Mano Derecha", "Mano Izquierda", "Pie Derecho", "Pie Izquierdo"];
    
    const presas = [
        "Manija", "Regleta", "Roma", 
        "Pinza", "Bidedo Monodedo", "Aplique", 
        "Invertida"];

    const colores = [
        { nombre: "Rojo", hex: "#ff0000" },
        { nombre: "Azul", hex: "#0000ff" },
        { nombre: "Verde", hex: "#00ff00" },
        { nombre: "Amarillo", hex: "#ffff00" },
        { nombre: "Naranja", hex: "#ffa500" },
        { nombre: "Blanco", hex: "#ffffff" },
        { nombre: "Negro", hex: "#333333" }
    ];

    // Elementos del DOM
    const btnGirar = document.getElementById('btn-girar');
    
    // Referencias Fila 1
    const reelExtremidad1 = document.getElementById('reel-extremidad-1');
    const reelColor1 = document.getElementById('reel-color-1');
    const reelPresa1 = document.getElementById('reel-presa-1');

    // Referencias Fila 2
    const reelExtremidad2 = document.getElementById('reel-extremidad-2');
    const reelColor2 = document.getElementById('reel-color-2');
    const reelPresa2 = document.getElementById('reel-presa-2');
    
    const fila2 = document.getElementById('fila-2');

    const clickSound = document.getElementById('click-sound');
    const dingSound = document.getElementById('ding-sound');
    const aciertoSound = document.getElementById('acierto-sound');
    const errorSound = document.getElementById('error-sound');
    const btnMute = document.getElementById('btn-mute');
    
    const pantallaInicio = document.getElementById('pantalla-inicio');
    const contenedorJuego = document.getElementById('contenedor-juego');
    const btnFacil = document.getElementById('btn-facil');
    const btnDificil = document.getElementById('btn-dificil');
    const btnVolver = document.getElementById('btn-volver');
    
    // Nuevos elementos para nombre y puntuación
    const inputClimberName = document.getElementById('input-climber-name');
    const displayClimberName = document.getElementById('display-climber-name');
    const displayScore = document.getElementById('display-score');
    const displayFailed = document.getElementById('display-failed');
    const actionButtonsContainer = document.getElementById('action-buttons');
    const btnCumplio = document.getElementById('btn-cumplio');
    const btnNoCumplio = document.getElementById('btn-no-cumplio');

    let nivelActual = 1; // 1 = Fácil, 2 = Difícil
    let score = 0;
    let failedAttempts = 0;
    let currentSpinResults = {};

    // Lógica de Silencio (Mute)
    let isMuted = false;

    btnMute.addEventListener('click', () => {
        isMuted = !isMuted;
        clickSound.muted = isMuted;
        dingSound.muted = isMuted;
        aciertoSound.muted = isMuted;
        errorSound.muted = isMuted;
        
        // Actualizar UI del botón
        btnMute.textContent = isMuted ? '🔇' : '🔊';
        btnMute.classList.toggle('btn-outline-warning', !isMuted);
        btnMute.classList.toggle('btn-outline-danger', isMuted);
    });

    // Selección de niveles
    btnFacil.addEventListener('click', () => iniciarJuego(1));
    btnDificil.addEventListener('click', () => iniciarJuego(2));
    
    btnVolver.addEventListener('click', () => {
        pantallaInicio.classList.remove('d-none');
        contenedorJuego.classList.add('d-none');
    });

    // Inicializar carretel de puntaje
    initializeScoreReel();
    initializeFailedReel();

    // Event listeners para los botones de acción
    btnCumplio.addEventListener('click', () => {
        if (!isMuted) {
            aciertoSound.currentTime = 0;
            aciertoSound.play().catch(() => {});
        }
        score++;
        animateCounter(displayScore, score);
        actionButtonsContainer.classList.add('d-none');
    });

    btnNoCumplio.addEventListener('click', () => {
        if (!isMuted) {
            errorSound.currentTime = 0;
            errorSound.play().catch(() => {});
        }
        failedAttempts++;
        animateCounter(displayFailed, failedAttempts);
        actionButtonsContainer.classList.add('d-none');
    });

    function iniciarJuego(nivel) {
        nivelActual = nivel;
        pantallaInicio.classList.add('d-none');
        contenedorJuego.classList.remove('d-none');

        // Inicializar carreteles de la fila 1 (comienzan en blanco)
        populateReel(reelExtremidad1, extremidades);
        // Actualizar nombre del escalador y reiniciar puntuación
        displayClimberName.textContent = inputClimberName.value.trim() || "Jugador";
        score = 0;
        failedAttempts = 0;
        animateCounter(displayScore, 0);
        animateCounter(displayFailed, 0);
        populateReel(reelPresa1, presas);
        populateReel(reelColor1, colores, true);

        if (nivel === 1) {
            fila2.classList.add('d-none');
        } else {
            fila2.classList.remove('d-none');
            // Inicializar carreteles de la fila 2
            populateReel(reelExtremidad2, extremidades);
            populateReel(reelPresa2, presas);
            populateReel(reelColor2, colores, true);
        }
        
        actionButtonsContainer.classList.add('d-none'); // Asegurarse de que los botones de acción estén ocultos al iniciar el juego
    }

    function initializeScoreReel() {
        let html = '';
        // Creamos números del 0 al 99
        for (let i = 0; i <= 99; i++) {
            html += `<div class="score-item">${i}</div>`;
        }
        displayScore.innerHTML = html;
        animateCounter(displayScore, 0);
    }

    function initializeFailedReel() {
        let html = '';
        for (let i = 0; i <= 99; i++) {
            html += `<div class="score-item">${i}</div>`;
        }
        displayFailed.innerHTML = html;
        animateCounter(displayFailed, 0);
    }

    // Función auxiliar para obtener valores de variables CSS
    function getCssVar(name) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name);
        return parseInt(value) || 0;
    }

    function animateCounter(element, val) {
        const scoreHeight = getCssVar('--score-height') || 30;
        element.style.transform = `translateY(-${val * scoreHeight}px)`;
        
        // Sonido rápido al subir puntos
        if (val > 0 && !isMuted) {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {});
        }
    }

    // Función para llenar los carreteles (duplicamos items para efecto infinito)
    function populateReel(reel, items, isColor = false) {
        // Ítem vacío para que el carretel aparezca "en blanco" al inicio
        const blankItem = `<div class="slot-item"></div>`;
        const content = items.map(item => {
            if (isColor) {
                return `<div class="slot-item"><div class="color-dot" style="background-color: ${item.hex}"></div></div>`;
            }
            return `<div class="slot-item"><span>${item}</span></div>`;
        });

        // Unimos el ítem vacío al inicio y repetimos el contenido para el efecto de giro
        reel.innerHTML = [blankItem, ...content, ...content, ...content, ...content, ...content].join('');
        
        // Reiniciar posición al inicio (ítem vacío) sin animación
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0px)';
    }

    btnGirar.addEventListener('click', () => {
        btnGirar.disabled = true;
        actionButtonsContainer.classList.add('d-none'); // Ocultar botones de acción al inicio del giro
        
        const slotHeight = getCssVar('--slot-height') || 120;
        const iterations = 4; // Cuántas vueltas extra

        // Resultados aleatorios Fila 1
        const res1 = {
            ext: Math.floor(Math.random() * extremidades.length),
            col: Math.floor(Math.random() * colores.length),
            pre: Math.floor(Math.random() * presas.length)
        };

        currentSpinResults.res1 = res1; // Guardar resultados para posible uso futuro

        // Animación Fila 1
        spinReel(reelExtremidad1, res1.ext, extremidades.length, 2000, iterations);
        spinReel(reelPresa1, res1.pre, presas.length, 2500, iterations);
        spinReel(reelColor1, res1.col, colores.length, 3000, iterations);

        let maxWaitTime = 3000;

        if (nivelActual >= 2) {
            // Resultados aleatorios Fila 2
            let ext2Idx;
            do {
                ext2Idx = Math.floor(Math.random() * extremidades.length);
            } while (ext2Idx === res1.ext);

            const res2 = {
                ext: ext2Idx,
                col: Math.floor(Math.random() * colores.length),
                pre: Math.floor(Math.random() * presas.length)
            };
            // Animación Fila 2 (con duraciones más largas para aumentar el suspenso)
            spinReel(reelExtremidad2, res2.ext, extremidades.length, 3800, iterations);
            spinReel(reelPresa2, res2.pre, presas.length, 4400, iterations);
            spinReel(reelColor2, res2.col, colores.length, 5000, iterations);

            maxWaitTime = 5000;

            currentSpinResults.res2 = res2; // Guardar resultados para posible uso futuro
        }

        setTimeout(() => {
            actionButtonsContainer.classList.remove('d-none'); // Mostrar botones de acción después de mostrar resultados
            btnGirar.disabled = false;
        }, maxWaitTime);
    });

    function spinReel(reel, targetIdx, totalItems, duration, turns) {
        const slotHeight = getCssVar('--slot-height') || 120;

        // Reiniciar posición a 0 sin animación antes de girar
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0px)';
        reel.offsetHeight; // Forzar reflow para que el navegador aplique el reinicio antes de la animación

        // +1 para saltar el espacio en blanco inicial y caer en el ítem correcto
        const offset = (totalItems * turns + targetIdx + 1) * slotHeight;
        reel.style.transition = `transform ${duration}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`;
        reel.style.transform = `translateY(-${offset}px)`;

        // Activar efecto de brillo mientras gira
        reel.parentElement.classList.add('reel-glow');

        // Calculate click interval for sound effect
        // The reel moves 'offset' pixels in 'duration' milliseconds.
        // An item "passes" every 'slotHeight' pixels.
        // So, the time between each item passing is (duration / (offset / slotHeight))
        const totalDistance = offset;
        const numberOfItemsPassing = totalDistance / slotHeight;
        const clickInterval = duration / numberOfItemsPassing;

        let clickTimer;
        if (clickInterval > 0 && isFinite(clickInterval)) { // Asegurarse de que el intervalo sea válido
            clickTimer = setInterval(() => {
                clickSound.currentTime = 0; // Reiniciar el sonido para reproducciones rápidas
                clickSound.play().catch(e => console.log("Audio play prevented:", e)); // Manejar posibles restricciones de autoplay
            }, clickInterval);
        }

        // Detener los clics después de que la animación del carretel termine
        setTimeout(() => { 
            clearInterval(clickTimer);
            // Desactivar efecto de brillo al detenerse
            reel.parentElement.classList.remove('reel-glow');
            // Reproducir sonido de campana al detenerse
            dingSound.currentTime = 0;
            dingSound.play().catch(e => console.log("Audio play prevented:", e));
        }, duration);
    }
});
