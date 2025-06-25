import api from './api';

class AIBouquetService {
    constructor() {
        this.baseURL = '/aibouquet';
    }

    /**
     * Verifică starea serviciului AI
     */
    async getAIStatus() {
        try {
            const response = await api.get(`${this.baseURL}/status`);
            return response.data;
        } catch (error) {
            console.error('Error checking AI status:', error);
            throw error;
        }
    }

    /**
     * Obține informații despre modelul AI
     */
    async getModelInfo() {
        try {
            const response = await api.get(`${this.baseURL}/model-info`);
            return response.data;
        } catch (error) {
            console.error('Error getting model info:', error);
            throw error;
        }
    }

    /**
     * Generează un buchet folosind AI
     * @param {string} message - Mesajul utilizatorului
     * @param {boolean} includeVisual - Dacă să includă vizualizarea
     * @param {Object} options - Opțiuni suplimentare
     */
    async generateBouquet(message, includeVisual = false, options = {}) {
        try {
            const requestData = {
                message: message.trim(),
                includeVisual: includeVisual,
                preferredColors: options.preferredColors || null,
                occasion: options.occasion || null,
                budget: options.budget || null
            };

            const response = await api.post(`${this.baseURL}/generate`, requestData);
            return response.data;
        } catch (error) {
            console.error('Error generating bouquet:', error);
            throw error;
        }
    }

    /**
     * Analizează textul fără a genera buchet complet
     * @param {string} message - Mesajul de analizat
     */
    async analyzeText(message) {
        try {
            const requestData = {
                message: message.trim()
            };

            const response = await api.post(`${this.baseURL}/analyze-text`, requestData);
            return response.data;
        } catch (error) {
            console.error('Error analyzing text:', error);
            throw error;
        }
    }

    /**
     * Procesează multiple mesaje simultan
     * @param {string[]} messages - Array de mesaje
     */
    async generateBatchBouquets(messages) {
        try {
            const requestData = {
                messages: messages.map(msg => msg.trim()).filter(msg => msg.length > 0)
            };

            if (requestData.messages.length === 0) {
                throw new Error('Nu sunt mesaje valide pentru procesare');
            }

            if (requestData.messages.length > 50) {
                throw new Error('Maximum 50 de mesaje permise per batch');
            }

            const response = await api.post(`${this.baseURL}/batch-generate`, requestData);
            return response.data;
        } catch (error) {
            console.error('Error with batch generation:', error);
            throw error;
        }
    }

    /**
     * Generează doar vizualizarea pentru date de buchet existente
     * @param {Object} bouquetData - Datele buchetului
     * @param {string} filename - Numele fișierului (opțional)
     */
    async generateVisual(bouquetData, filename = null) {
        try {
            const requestData = {
                bouquetData: bouquetData,
                filename: filename
            };

            const response = await api.post(`${this.baseURL}/generate-visual`, requestData);
            return response.data;
        } catch (error) {
            console.error('Error generating visual:', error);
            throw error;
        }
    }

    /**
     * Obține combinații populare de buchete
     */
    async getPopularCombinations() {
        try {
            const response = await api.get(`${this.baseURL}/popular-combinations`);
            return response.data;
        } catch (error) {
            console.error('Error getting popular combinations:', error);
            throw error;
        }
    }

    /**
     * Validează un mesaj înainte de trimitere
     * @param {string} message - Mesajul de validat
     */
    validateMessage(message) {
        if (!message || typeof message !== 'string') {
            return { valid: false, error: 'Mesajul trebuie să fie text' };
        }

        const trimmedMessage = message.trim();
        
        if (trimmedMessage.length === 0) {
            return { valid: false, error: 'Mesajul nu poate fi gol' };
        }

        if (trimmedMessage.length < 3) {
            return { valid: false, error: 'Mesajul trebuie să aibă cel puțin 3 caractere' };
        }

        if (trimmedMessage.length > 1000) {
            return { valid: false, error: 'Mesajul trebuie să aibă maxim 1000 de caractere' };
        }

        // Verifică pentru caractere care ar putea cauza probleme
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+=/i
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(trimmedMessage)) {
                return { valid: false, error: 'Mesajul conține caractere nepermise' };
            }
        }

        return { valid: true, message: trimmedMessage };
    }

    /**
     * Helper pentru formatarea erorilor API
     * @param {Error} error - Eroarea de formatat
     */
    formatError(error) {
        if (error.response) {
            // Server a răspuns cu un status code de eroare
            const status = error.response.status;
            const data = error.response.data;

            if (status === 400) {
                return data.message || 'Cerere invalidă';
            } else if (status === 401) {
                return 'Nu ești autentificat. Te rog să te loghezi.';
            } else if (status === 403) {
                return 'Nu ai permisiunile necesare pentru această acțiune.';
            } else if (status === 404) {
                return 'Serviciul AI nu a fost găsit.';
            } else if (status === 503) {
                return 'Serviciul AI este temporar indisponibil. Te rog să încerci mai târziu.';
            } else if (status >= 500) {
                return 'Eroare de server. Te rog să încerci mai târziu.';
            }

            return data.message || `Eroare ${status}`;
        } else if (error.request) {
            // Cererea a fost făcută dar nu s-a primit răspuns
            return 'Nu se poate conecta la serviciul AI. Verifică conexiunea la internet.';
        } else {
            // Altceva a mers prost
            return error.message || 'A apărut o eroare neașteptată';
        }
    }

    /**
     * Cache pentru reducerea numărului de requests
     */
    createCache() {
        const cache = new Map();
        const maxCacheSize = 100;
        const cacheExpiry = 5 * 60 * 1000; // 5 minute

        return {
            get: (key) => {
                const item = cache.get(key);
                if (item && Date.now() - item.timestamp < cacheExpiry) {
                    return item.data;
                }
                cache.delete(key);
                return null;
            },
            set: (key, data) => {
                if (cache.size >= maxCacheSize) {
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                }
                cache.set(key, {
                    data: data,
                    timestamp: Date.now()
                });
            },
            clear: () => {
                cache.clear();
            }
        };
    }

    /**
     * Retry logic pentru requests care eșuează
     */
    async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                
                // Nu face retry pentru anumite tipuri de erori
                if (error.response && [400, 401, 403, 404].includes(error.response.status)) {
                    throw error;
                }

                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                }
            }
        }

        throw lastError;
    }

    /**
     * Monitorizare performanță
     */
    createPerformanceMonitor() {
        const metrics = {
            requests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalResponseTime: 0
        };

        return {
            startRequest: () => {
                metrics.requests++;
                return Date.now();
            },
            endRequest: (startTime, success = true) => {
                const duration = Date.now() - startTime;
                metrics.totalResponseTime += duration;
                metrics.averageResponseTime = metrics.totalResponseTime / metrics.requests;
                
                if (success) {
                    metrics.successfulRequests++;
                } else {
                    metrics.failedRequests++;
                }
            },
            getMetrics: () => ({ ...metrics }),
            reset: () => {
                Object.keys(metrics).forEach(key => {
                    metrics[key] = 0;
                });
            }
        };
    }
}

// Creează instanța singleton
const aiBouquetService = new AIBouquetService();

// Inițializează cache și monitoring
aiBouquetService.cache = aiBouquetService.createCache();
aiBouquetService.performanceMonitor = aiBouquetService.createPerformanceMonitor();

export { aiBouquetService };
export default aiBouquetService;
