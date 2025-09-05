(function() {
    'use strict';

    class StealthPostTracker {
        constructor(options = {}) {
            this.apiUrl = options.apiUrl || 'https://at.funnify.org/a/t/simple';
        }

        encodeData(data) {
            try {
                const jsonStr = JSON.stringify(data);
                
                let encoded = '';
                for (let i = 0; i < jsonStr.length; i++) {
                    const char = jsonStr[i];
                    const code = char.charCodeAt(0);
                    
                    const hex = code.toString(16).padStart(2, '0');
                    encoded += hex;
                }
                
                encoded = encoded.replace(/[0-9a-f]/g, (match) => {
                    const replacements = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'];
                    if (match >= '0' && match <= '9') {
                        return replacements[parseInt(match)];
                    } else {
                        return replacements[match.charCodeAt(0) - 'a'.charCodeAt(0) + 10];
                    }
                });
                
                return encoded;
            } catch (error) {
                console.error('Encoding error:', error);
                return '';
            }
        }

        async trackWithFakeJson(data = {}) {
            const trackingData = {
                ...data,
                timestamp: Date.now()
            };

            const fakePayload = {
                action: 'ping',
                data: this.encodeData(trackingData),
                client: 'web',
                version: '1.0.0'
            };

            try {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(fakePayload)
                });
                
                return await response.json();
            } catch (error) {
                console.error('Tracking error:', error);
                return { success: false, error: error.message };
            }
        }

        setApiUrl(newApiUrl) {
            this.apiUrl = newApiUrl;
        }
    }

    const stealthPostTracker = new StealthPostTracker({
        apiUrl: 'https://at.funnify.org/a/t/simple'
    });

    const setStealthTrackerApiUrl = (newApiUrl) => {
        stealthPostTracker.setApiUrl(newApiUrl);
    };

    const trackPageView = () => {
        stealthPostTracker.trackWithFakeJson({
            url: window.location.href
        }).catch(error => {
            console.error('Page view tracking error:', error);
        });
    };

    window.stealthPostTracker = stealthPostTracker;
    window.setStealthTrackerApiUrl = setStealthTrackerApiUrl;
    window.trackPageView = trackPageView;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
        trackPageView();
    }

})();
