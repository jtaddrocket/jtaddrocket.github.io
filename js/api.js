// Cấu hình API endpoint - THAY ĐỔI IP NÀY
const API_BASE_URL = 'http://52.207.251.97'; // Thay bằng IP EC2 của bạn

// Helper function để gọi API
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Để gửi cookies/session
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        // Nếu response là HTML (redirect hoặc error page)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            const html = await response.text();
            // Kiểm tra nếu có redirect
            if (response.redirected || response.url !== `${API_BASE_URL}${endpoint}`) {
                return { success: true, redirected: true, url: response.url };
            }
            return { success: false, error: 'Server returned HTML instead of JSON' };
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Export các hàm API
const API = {
    // Authentication
    login: async (username, password) => {
        // Django thường dùng form data cho login
        const formData = new FormData();
        formData.append('user', username);
        formData.append('password', password);
        
        const response = await fetch(`${API_BASE_URL}/login/`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });
        
        if (response.redirected) {
            return { success: true, url: response.url };
        }
        return { success: false };
    },
    
    logout: async () => {
        const response = await fetch(`${API_BASE_URL}/logout/`, {
            method: 'POST',
            credentials: 'include',
        });
        return response.ok;
    },
    
    // Get current user info (nếu có endpoint)
    getCurrentUser: () => apiCall('/api/user/'),
    
    // Registrations
    getRegistrations: () => apiCall('/registrations/'),
    
    register: (sid) => {
        return fetch(`${API_BASE_URL}/register/${sid}/`, {
            method: 'POST',
            credentials: 'include',
        });
    },
    
    unregister: (sid) => {
        return fetch(`${API_BASE_URL}/unregister/${sid}/`, {
            method: 'POST',
            credentials: 'include',
        });
    },
    
    // Generate schedule
    generate: (data) => apiCall('/generate/', 'POST', data),
    
    // Get all subjects (từ trang start)
    getSubjects: async () => {
        // Cần tạo API endpoint mới hoặc parse HTML
        // Tạm thời return từ trang start
        const response = await fetch(`${API_BASE_URL}/`, {
            credentials: 'include',
        });
        const html = await response.text();
        // Parse HTML để lấy data (tạm thời, nên tạo API endpoint riêng)
        return html;
    }
};

// Export để sử dụng trong các file HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
} else {
    window.API = API;
}
