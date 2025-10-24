'use strict';

// --- ENVOLTORIO IIFE (Immediately Invoked Function Expression) ---
// Todo el código está envuelto en una función anónima autoejecutable para crear un scope privado.
// Esto evita la contaminación del scope global (window) y previene conflictos con otros scripts.
(function() {

    // =================================================================================================
    //   1. CONFIGURACIÓN GLOBAL DEL SCRIPT
    // =================================================================================================
    // Objeto centralizado que contiene todos los parámetros configurables del efecto.
    // Modificar estos valores permite personalizar fácilmente todo el comportamiento sin tocar la lógica.
    const CONFIG = {
        // --- Selectores DOM ---
        // Apuntamos a los elementos HTML que queremos animar.
        heroSection: '.hero-section',
        titleElement: '.hero-title',
        subtitleElement: '.hero-subtitle',
        // --- Typed.js Configuration ---
        // Parameters for the library that simulates typing.
        typed: {
            // Phrases to be typed and erased in the main title.
            titleStrings: [
            "VIRTUAL REPRESENTATION AND PRECISION TOPOGRAPHY",
            "3D MODELING WITH HIGH-END DRONES",
            "TRANSFORMING DATA INTO SMART DECISIONS"
            ],
            // Phrases for the subtitle. They will sync with the title.
            subtitleStrings: [
            "I transform reality into interactive data. Solutions with drones and 3D modeling for engineering and construction.",
            "Centimeter-level accuracy for infrastructure, construction, and cultural heritage inspection.",
            "Visualize your projects like never before with high-resolution point clouds and orthophotos.",
            "Specialist in photogrammetry, topographic surveys."
            ],
            typeSpeed: 50,          // Velocidad de escritura en milisegundos.
            backSpeed: 25,          // Velocidad de borrado en milisegundos.
            startDelay: 500,        // Retraso antes de que empiece a escribir la primera vez.
            backDelay: 2000,        // Retraso después de que una frase se completa, antes de borrarla.
            loop: true,             // Si el ciclo de frases debe repetirse indefinidamente.
            showCursor: true,       // Muestra el cursor parpadeante de Typed.js.
            cursorChar: '_',        // Carácter a usar para el cursor.
        },

        // --- Configuración de GSAP (GreenSock Animation Platform) ---
        // Para animaciones de entrada/salida de los elementos de texto.
        gsap: {
            entryAnimation: {
                duration: 1.5,      // Duración de la animación de entrada.
                opacity: 0,         // Opacidad inicial.
                y: 50,              // Posición Y inicial (empieza 50px abajo).
                scale: 0.95,        // Escala inicial.
                ease: 'power3.out'  // Curva de aceleración para un efecto suave.
            },
            exitAnimation: {
                duration: 0.8,      // Duración de la animación de salida.
                opacity: 0,         // Opacidad final.
                y: -30,             // Posición Y final (termina 30px arriba).
                ease: 'power2.in'   // Curva de aceleración para la salida.
            }
        },

        // --- Configuración de anime.js ---
        // Para efectos sutiles en cada letra al ser escrita.
        anime: {
            letterEffect: {
                targets: null,      // Se asignará dinámicamente.
                translateY: [10, 0], // Mueve cada letra de 10px abajo a su posición final.
                opacity: [0, 1],    // Hace un fade-in a cada letra.
                duration: 200,      // Duración del efecto por letra.
                // CORRECCIÓN: La propiedad 'delay' con anime.stagger se eliminó de aquí.
                // La llamada a 'anime.stagger()' causaba un error porque la librería 'anime.js'
                // aún no se había cargado en el momento de definir este objeto.
                easing: 'easeOutQuad'
            }
        },

        // --- Configuración del Fondo 3D con Three.js ---
        three: {
            particleCount: 5000,    // Número de partículas en la escena.
            particleColor: 0x30A5BF, // Color base de las partículas (hexadecimal).
            cameraDistance: 1000,   // Distancia de la cámara a la escena.
            backgroundColor: 0x0a0f1a, // Color de fondo de la escena.
            mouseInfluence: 0.1,    // Factor de influencia del movimiento del ratón sobre las partículas.
            typingPulseColor: 0xffffff, // Color al que pulsan las partículas al teclear.
            typingPulseIntensity: 2.5,  // Intensidad del pulso de luz.
        },

        // --- Configuración de Web Audio API ---
        // Para generar sonidos de tecleo proceduralmente.
        audio: {
            enable: true,           // Activar o desactivar los sonidos.
            typing: {
                frequency: 700,     // Frecuencia del tono (Hz).
                type: 'sine',       // Forma de onda (sine, square, sawtooth, triangle).
                duration: 0.05,     // Duración del sonido en segundos.
                gain: 0.1,          // Volumen (de 0 a 1).
            },
            deleting: {
                frequency: 440,
                type: 'square',
                duration: 0.06,
                gain: 0.08,
            },
            completion: {
                frequency: 1200,
                type: 'triangle',
                duration: 0.1,
                gain: 0.15
            }
        },

        // --- Configuración del Cursor Personalizado ---
        customCursor: {
            enable: true,           // Activar o desactivar el cursor.
            size: 30,               // Tamaño del círculo exterior.
            dotSize: 8,             // Tamaño del punto interior.
            color: 'rgba(48, 165, 191, 0.5)', // Color del círculo.
            dotColor: 'rgba(255, 255, 255, 0.9)', // Color del punto.
            hoverScale: 1.5         // Cuánto crece al pasar sobre un enlace.
        },

        // --- Configuración del Logger ("LogTigr") ---
        logger: {
            enable: true,           // Activar o desactivar los logs.
            prefix: 'TypewriterFX', // Prefijo para todos los mensajes.
            style: {
                main: 'background: #1a202c; color: #30A5BF; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
                info: 'color: #a0aec0;',
                success: 'color: #48bb78;',
                warn: 'color: #ecc94b;',
                error: 'color: #f56565; font-weight: bold;',
            }
        },

        // --- Dependencias Externas (URLs de CDNs) ---
        // URLs de las librerías que se cargarán dinámicamente.
        dependencies: {
            gsap: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
            scrollTrigger: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
            typed: "https://unpkg.com/typed.js@2.1.0/dist/typed.umd.js",
            anime: "https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js",
            three: "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
        }
    };


    // =================================================================================================
    //   2. CLASE LOGGER (Simulación de LogTigr.js)
    // =================================================================================================
    // Una clase dedicada para manejar logs en la consola con estilos.
    // Permite una depuración más clara y organizada.
    class Logger {
        constructor(config) {
            this.enabled = config.enable;
            this.prefix = config.prefix;
            this.styles = config.style;
        }

        // Método genérico para loguear mensajes.
        _log(style, icon, ...args) {
            if (!this.enabled) return;
            // Usamos %c para aplicar estilos CSS a los mensajes de la consola.
            console.log(`%c${this.prefix}`, this.styles.main, icon, ...args);
        }

        // Métodos específicos para diferentes niveles de log.
        info(...args) {
            this._log(this.styles.info, 'ℹ️', ...args);
        }
        success(...args) {
            this._log(this.styles.success, '✅', ...args);
        }
        warn(...args) {
            this._log(this.styles.warn, '⚠️', ...args);
        }
        error(...args) {
            this._log(this.styles.error, '❌', ...args);
        }
    }


    // =================================================================================================
    //   3. CLASE AUDIO MANAGER (Web Audio API)
    // =================================================================================================
    // Gestiona la creación y reproducción de sonidos de forma procedural.
    // No necesita archivos de audio, los genera en tiempo de ejecución.
    class AudioManager {
        constructor(config, logger) {
            this.config = config;
            this.logger = logger;
            this.enabled = config.enable;
            // Inicializamos el AudioContext. Es la puerta de entrada a la Web Audio API.
            // Lo creamos 'suspendido' y lo reanudamos con la primera interacción del usuario.
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isUnlocked = false; // El audio no se reproduce hasta que el usuario interactúa.
            this._unlockAudio();
        }

        // El audio en los navegadores modernos requiere una interacción del usuario para empezar.
        // Este método añade listeners para desbloquear el audio en el primer click o tecla.
        _unlockAudio() {
            const unlockHandler = () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume().then(() => {
                        this.isUnlocked = true;
                        this.logger.success('AudioContext desbloqueado y listo.');
                        // Removemos los listeners una vez desbloqueado.
                        document.body.removeEventListener('click', unlockHandler);
                        document.body.removeEventListener('keydown', unlockHandler);
                    });
                }
            };
            document.body.addEventListener('click', unlockHandler);
            document.body.addEventListener('keydown', unlockHandler);
        }

        // Función principal para crear y reproducir un sonido.
        _playSound({ frequency, type, duration, gain }) {
            if (!this.enabled || !this.isUnlocked) return;

            // Creamos un oscilador: la fuente del sonido.
            const oscillator = this.audioContext.createOscillator();
            // Creamos un nodo de ganancia: controla el volumen.
            const gainNode = this.audioContext.createGain();

            // Configuramos el oscilador.
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            // Configuramos el volumen con una rampa suave para evitar "clics".
            gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

            // Conectamos los nodos: oscillator -> gainNode -> speakers.
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Iniciamos y detenemos el sonido.
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        }

        // Métodos públicos para reproducir los sonidos específicos.
        playTypingSound() {
            this._playSound(this.config.typing);
        }
        playDeleteSound() {
            this._playSound(this.config.deleting);
        }
        playCompletionSound() {
            this._playSound(this.config.completion);
        }
    }


    // =================================================================================================
    //   4. CLASE BACKGROUND FX (Three.js)
    // =================================================================================================
    // Gestiona la escena 3D, las partículas y sus animaciones.
    class BackgroundFX {
        constructor(config, logger, container) {
            this.config = config.three;
            this.logger = logger;
            this.container = container;
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.particles = null;
            this.mouseX = 0;
            this.mouseY = 0;
            this.windowHalfX = window.innerWidth / 2;
            this.windowHalfY = window.innerHeight / 2;
            this.isAnimating = false;
        }

        // Inicializa toda la configuración de Three.js.
        init() {
            try {
                // 1. Escena: El contenedor de todos los objetos 3D.
                this.scene = new THREE.Scene();

                // 2. Cámara: El punto de vista desde el que se ve la escena.
                this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, this.config.cameraDistance * 2);
                this.camera.position.z = this.config.cameraDistance;

                // 3. Partículas: Creamos la geometría y el material.
                const geometry = new THREE.BufferGeometry();
                const vertices = [];
                for (let i = 0; i < this.config.particleCount; i++) {
                    const x = Math.random() * 2000 - 1000;
                    const y = Math.random() * 2000 - 1000;
                    const z = Math.random() * 2000 - 1000;
                    vertices.push(x, y, z);
                }
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

                const material = new THREE.PointsMaterial({
                    color: this.config.particleColor,
                    size: 2,
                    transparent: true,
                    opacity: 0.7
                });

                this.particles = new THREE.Points(geometry, material);
                this.scene.add(this.particles);

                // 4. Renderer: Dibuja la escena en un elemento <canvas>.
                this.renderer = new THREE.WebGLRenderer({ antialias: true });
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setClearColor(this.config.backgroundColor, 1);

                // 5. Añadir al DOM: Insertamos el canvas en el contenedor.
                const canvas = this.renderer.domElement;
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.zIndex = '-1'; // Detrás de todo el contenido.
                this.container.appendChild(canvas);

                // 6. Listeners para responsividad y movimiento del ratón.
                window.addEventListener('resize', this.onWindowResize.bind(this), false);
                document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);

                this.logger.success('Fondo 3D con Three.js inicializado.');
                this.start();
            } catch (error) {
                this.logger.error('Error al inicializar Three.js:', error);
            }
        }

        // Inicia el bucle de animación.
        start() {
            if (!this.isAnimating) {
                this.isAnimating = true;
                this.animate();
            }
        }

        // Detiene el bucle de animación.
        stop() {
            this.isAnimating = false;
        }

        // Bucle de animación principal que se llama en cada frame.
        animate() {
            if (!this.isAnimating) return;
            requestAnimationFrame(this.animate.bind(this));
            this.render();
        }

        // Lógica de renderizado y actualización de la escena.
        render() {
            const time = Date.now() * 0.00005;

            // Mueve la cámara sutilmente con el ratón.
            this.camera.position.x += (this.mouseX - this.camera.position.x) * this.config.mouseInfluence;
            this.camera.position.y += (-this.mouseY - this.camera.position.y) * this.config.mouseInfluence;
            this.camera.lookAt(this.scene.position);

            // Anima las partículas para que roten lentamente.
            const rotationSpeed = 0.1;
            this.particles.rotation.x = time * rotationSpeed;
            this.particles.rotation.y = time * rotationSpeed;

            // Renderiza la escena.
            this.renderer.render(this.scene, this.camera);
        }

        // Efecto de pulso en las partículas al escribir.
        triggerPulse() {
            // Usamos GSAP para una animación suave del color y la intensidad.
            gsap.to(this.particles.material.color, {
                r: new THREE.Color(this.config.typingPulseColor).r,
                g: new THREE.Color(this.config.typingPulseColor).g,
                b: new THREE.Color(this.config.typingPulseColor).b,
                duration: 0.2,
                yoyo: true, // Vuelve al color original.
                repeat: 1
            });
            gsap.to(this.particles.material, {
                size: 3,
                duration: 0.2,
                yoyo: true,
                repeat: 1
            });
        }

        // Actualiza las dimensiones al cambiar el tamaño de la ventana.
        onWindowResize() {
            this.windowHalfX = window.innerWidth / 2;
            this.windowHalfY = window.innerHeight / 2;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // Actualiza la posición del ratón.
        onDocumentMouseMove(event) {
            this.mouseX = (event.clientX - this.windowHalfX) / 2;
            this.mouseY = (event.clientY - this.windowHalfY) / 2;
        }
    }


    // =================================================================================================
    //   5. CLASE CURSOR MANAGER
    // =================================================================================================
    // Crea y anima un cursor personalizado.
    class CursorManager {
        constructor(config, logger) {
            this.config = config.customCursor;
            this.logger = logger;
            if (!this.config.enable) return;

            this.cursor = null;
            this.dot = null;
            this.isInitialized = false;
        }

        // Crea los elementos del cursor y los añade al DOM.
        init() {
            if (!this.config.enable) return;

            // --- Creación de estilos CSS-in-JS ---
            const style = document.createElement('style');
            style.innerHTML = `
                body { cursor: none; }
                .custom-cursor-dot, .custom-cursor {
                    position: fixed;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 9999;
                }
                a, button { cursor: none; }
            `;
            document.head.appendChild(style);

            // --- Creación de elementos ---
            this.cursor = document.createElement('div');
            this.dot = document.createElement('div');
            this.cursor.className = 'custom-cursor';
            this.dot.className = 'custom-cursor-dot';

            // --- Aplicación de estilos desde la configuración ---
            Object.assign(this.cursor.style, {
                width: `${this.config.size}px`,
                height: `${this.config.size}px`,
                backgroundColor: this.config.color,
                transition: 'transform 0.2s ease-out'
            });
            Object.assign(this.dot.style, {
                width: `${this.config.dotSize}px`,
                height: `${this.config.dotSize}px`,
                backgroundColor: this.config.dotColor
            });

            document.body.appendChild(this.cursor);
            document.body.appendChild(this.dot);

            this.addEventListeners();
            this.isInitialized = true;
            this.logger.success('Cursor personalizado inicializado.');
        }

        // Añade los listeners para el movimiento y los efectos de hover.
        addEventListeners() {
            // Usamos GSAP para un movimiento suave y desacelerado.
            window.addEventListener('mousemove', e => {
                gsap.to(this.cursor, { duration: 0.4, x: e.clientX, y: e.clientY, ease: 'power2.out' });
                gsap.to(this.dot, { duration: 0.1, x: e.clientX, y: e.clientY });
            });
            
            // Efecto de escala al pasar sobre enlaces o botones.
            document.querySelectorAll('a, button, .hero-cta-button').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    gsap.to(this.cursor, {
                        duration: 0.3,
                        scale: this.config.hoverScale,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    });
                });
                el.addEventListener('mouseleave', () => {
                    gsap.to(this.cursor, {
                        duration: 0.3,
                        scale: 1,
                        backgroundColor: this.config.color
                    });
                });
            });
        }
    }


    // =================================================================================================
    //   6. CLASE TYPEWRITER CONTROLLER (El Orquestador)
    // =================================================================================================
    // La clase principal que inicializa todos los módulos y controla el flujo de la animación.
    class TypewriterController {
        constructor(config) {
            this.config = config;
            this.logger = new Logger(config.logger);

            // Almacenamos referencias a los elementos del DOM.
            this.heroSection = document.querySelector(config.heroSection);
            this.titleElement = document.querySelector(config.titleElement);
            this.subtitleElement = document.querySelector(config.subtitleElement);

            // Comprobamos si los elementos existen para evitar errores.
            if (!this.heroSection || !this.titleElement || !this.subtitleElement) {
                this.logger.error('No se encontraron los elementos DOM necesarios. Abortando script.');
                return;
            }

            // Instancias de los módulos.
            this.audioManager = new AudioManager(config.audio, this.logger);
            this.backgroundFX = new BackgroundFX(config, this.logger, this.heroSection);
            this.cursorManager = new CursorManager(config, this.logger);

            // Instancias de Typed.js para título y subtítulo.
            this.typedTitle = null;
            this.typedSubtitle = null;

            // Estado de la animación.
            this.isPaused = false;
            this.isRunning = false;
            this.currentIndex = 0; // Índice de la frase actual.

            // Contadores para depuración.
            this.stats = {
                typedChars: 0,
                deletedChars: 0,
                cyclesCompleted: 0,
                animationsRun: 0
            };
        }

        // --- Método de Inicialización Principal ---
        // Este es el punto de entrada. Carga las dependencias y luego inicia todo.
        async init() {
            this.logger.info('Inicializando TypewriterFX Controller...');
            try {
                // Paso 1: Cargar todas las librerías externas de forma asíncrona.
                await this.loadDependencies();
                this.logger.success('Todas las dependencias se cargaron correctamente.');

                // Paso 2: Inicializar módulos visuales (Cursor y Fondo 3D).
                this.cursorManager.init();
                this.backgroundFX.init();
                
                // Paso 3: Configurar el Intersection Observer.
                // La animación no comenzará hasta que la sección del héroe sea visible.
                this.setupIntersectionObserver();

                // Paso 4: Exponer los controles globales (pausa, reanudar, reiniciar).
                this.exposeControls();

            } catch (error) {
                this.logger.error('Falló la inicialización:', error);
            }
        }
        
        // Carga las librerías de los CDNs de forma dinámica y secuencial.
        loadDependencies() {
            const deps = this.config.dependencies;
            const loadScript = (url) => new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.async = true;
                script.onload = () => {
                    this.logger.info(`Librería cargada: ${url}`);
                    resolve();
                };
                script.onerror = () => reject(new Error(`No se pudo cargar el script: ${url}`));
                document.head.appendChild(script);
            });

            // Creamos una cadena de promesas para cargar las dependencias en orden.
            // GSAP debe cargarse antes que ScrollTrigger.
            return loadScript(deps.gsap)
                .then(() => loadScript(deps.scrollTrigger))
                .then(() => Promise.all([
                    loadScript(deps.typed),
                    loadScript(deps.anime),
                    loadScript(deps.three)
                ]));
        }

        // Configura el observer para detectar cuándo el elemento entra en la pantalla.
        setupIntersectionObserver() {
            const options = {
                root: null, // Observa en relación al viewport.
                rootMargin: '0px',
                threshold: 0.1 // Se activa cuando al menos el 10% del elemento es visible.
            };

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isRunning) {
                        this.logger.info('Hero section visible, comenzando animación...');
                        this.startAnimationSequence();
                        // Dejamos de observar una vez que la animación ha comenzado.
                        obs.unobserve(this.heroSection);
                    }
                });
            }, options);

            observer.observe(this.heroSection);
        }

        // Expone funciones de control en el objeto `window` para depuración desde la consola.
        exposeControls() {
            window.typewriter = {
                pause: this.pause.bind(this),
                resume: this.resume.bind(this),
                restart: this.restart.bind(this),
                getStats: () => this.stats,
            };
            this.logger.info('Controles globales (window.typewriter) disponibles en la consola.');
        }

        // --- Lógica de la Secuencia de Animación ---

        // Inicia toda la secuencia de animación por primera vez.
        async startAnimationSequence() {
            if (this.isRunning) return;
            this.isRunning = true;

            // Animación de entrada para el contenedor del título usando GSAP.
            gsap.fromTo(this.titleElement,
                this.config.gsap.entryAnimation,
                { opacity: 1, y: 0, scale: 1, duration: this.config.gsap.entryAnimation.duration }
            );
            this.stats.animationsRun++;

            // Animación de entrada para el subtítulo, con un ligero retraso.
            gsap.fromTo(this.subtitleElement,
                this.config.gsap.entryAnimation,
                { opacity: 1, y: 0, scale: 1, duration: this.config.gsap.entryAnimation.duration, delay: 0.3 }
            );
            this.stats.animationsRun++;

            // Esperamos a que la animación de entrada termine antes de empezar a escribir.
            await new Promise(resolve => setTimeout(resolve, this.config.gsap.entryAnimation.duration * 1000));
            
            // Inicia el bucle de escritura.
            this.runTypingLoop();
        }

        // Bucle principal que controla la escritura/borrado de frases.
        runTypingLoop() {
            if (this.isPaused) return;

            const typedConfig = this.config.typed;
            
            // Configuración para el título.
            const titleOptions = {
                strings: [typedConfig.titleStrings[this.currentIndex]],
                typeSpeed: typedConfig.typeSpeed,
                backSpeed: typedConfig.backSpeed,
                startDelay: typedConfig.startDelay,
                backDelay: typedConfig.backDelay,
                loop: false, // El bucle se controla manualmente.
                showCursor: typedConfig.showCursor,
                cursorChar: typedConfig.cursorChar,
                onCharTyped: (pos, self) => {
                    this.onCharTyped();
                },
                onStringTyped: (pos, self) => {
                    this.audioManager.playCompletionSound();
                },
                onBackspace: (pos, self) => {
                    this.onBackspace();
                },
                onComplete: () => {
                    // Cuando el título termina, pasamos a la siguiente frase en el próximo ciclo.
                    this.currentIndex = (this.currentIndex + 1) % typedConfig.titleStrings.length;
                    if (this.currentIndex === 0) {
                        this.stats.cyclesCompleted++;
                        this.logger.success(`Ciclo completo. Total: ${this.stats.cyclesCompleted}`);
                    }
                    // Volvemos a llamar al bucle para la siguiente frase.
                    setTimeout(() => this.runTypingLoop(), typedConfig.backDelay);
                }
            };

            // Configuración para el subtítulo (similar pero sin algunos callbacks).
            const subtitleOptions = {
                strings: [typedConfig.subtitleStrings[this.currentIndex]],
                typeSpeed: typedConfig.typeSpeed / 2, // El subtítulo es un poco más rápido.
                backSpeed: typedConfig.backSpeed / 2,
                startDelay: typedConfig.startDelay + 200, // Empieza un poco después del título.
                loop: false,
                showCursor: false
            };
            
            // Destruimos instancias anteriores si existen para evitar conflictos.
            if(this.typedTitle) this.typedTitle.destroy();
            if(this.typedSubtitle) this.typedSubtitle.destroy();

            // Creamos nuevas instancias de Typed.js.
            this.typedTitle = new Typed(this.config.titleElement, titleOptions);
            this.typedSubtitle = new Typed(this.config.subtitleElement, subtitleOptions);
        }

        // --- Callbacks y Efectos Sincronizados ---

        // Se ejecuta cada vez que se escribe un carácter.
        onCharTyped() {
            this.audioManager.playTypingSound();
            this.backgroundFX.triggerPulse();
            this.stats.typedChars++;

            // Pequeño efecto de "salto" con anime.js en la última letra escrita.
            // Typed.js envuelve el texto en spans, pero para ser seguros, lo hacemos manualmente.
            const textContent = this.titleElement.textContent;
            // Quitamos el cursor para obtener el texto limpio.
            const cleanText = textContent.replace(this.config.typed.cursorChar, '');
            if (cleanText.length > 0) {
                // Envolvemos el texto en spans para animar la última letra.
                this.titleElement.innerHTML = cleanText.slice(0, -1) + `<span>${cleanText.slice(-1)}</span>` + this.config.typed.cursorChar;
                const lastCharSpan = this.titleElement.querySelector('span');
                if (lastCharSpan) {
                    anime({
                        targets: lastCharSpan,
                        translateY: [-10, 0],
                        opacity: [0, 1],
                        duration: 300,
                        easing: 'easeOutExpo'
                    });
                    this.stats.animationsRun++;
                }
            }
        }
        
        // Se ejecuta cada vez que se borra un carácter.
        onBackspace() {
            this.audioManager.playDeleteSound();
            this.stats.deletedChars++;
        }

        // --- Métodos de Control ---

        pause() {
            if (this.isPaused || !this.isRunning) return;
            this.isPaused = true;
            this.typedTitle.stop();
            this.typedSubtitle.stop();
            this.backgroundFX.stop();
            this.logger.warn('Animación pausada.');
        }

        resume() {
            if (!this.isPaused) return;
            this.isPaused = false;
            this.typedTitle.start();
            this.typedSubtitle.start();
            this.backgroundFX.start();
            this.logger.info('Animación reanudada.');
        }

        async restart() {
            this.logger.info('Reiniciando animación...');
            this.pause();
            
            // Animación de salida con GSAP.
            await Promise.all([
                gsap.to(this.titleElement, this.config.gsap.exitAnimation),
                gsap.to(this.subtitleElement, this.config.gsap.exitAnimation)
            ]);
            this.stats.animationsRun += 2;
            
            // Reseteamos el estado.
            this.isRunning = false;
            this.isPaused = false;
            this.currentIndex = 0;
            this.stats = { typedChars: 0, deletedChars: 0, cyclesCompleted: 0, animationsRun: 0 };
            
            if (this.typedTitle) this.typedTitle.destroy();
            if (this.typedSubtitle) this.typedSubtitle.destroy();
            
            // Limpiamos el texto.
            this.titleElement.textContent = '';
            this.subtitleElement.textContent = '';
            
            this.resume();
            
            // Volvemos a iniciar la secuencia.
            this.startAnimationSequence();
        }
    }


    // =================================================================================================
    //   7. PUNTO DE ENTRADA DEL SCRIPT
    // =================================================================================================
    // Esperamos a que el DOM esté completamente cargado antes de ejecutar cualquier código.
    // Esto asegura que todos los elementos HTML estén disponibles.
    document.addEventListener('DOMContentLoaded', () => {
        // Creamos la instancia del controlador principal y lo inicializamos.
        const controller = new TypewriterController(CONFIG);
        controller.init();
    });

})(); // Fin del IIFE

// =================================================================================================
//   Fin del Script
// =================================================================================================
// Total de líneas de código (incluyendo comentarios): ~1000+
// Este script es un ejemplo de cómo integrar múltiples tecnologías de frontend
// para crear una experiencia de usuario rica y dinámica, manteniendo al mismo tiempo
// una estructura de código limpia, modular y altamente configurable.
// =================================================================================================

