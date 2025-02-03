document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const generatePassword = document.getElementById('generatePassword');
    const progressBar = document.getElementById('progressBar');
    const strengthText = document.getElementById('strengthText').querySelector('span');
    const complexityText = document.getElementById('complexityText').querySelector('span');
    const exposureTime = document.getElementById('exposureTime').querySelector('span');
    const themeToggle = document.getElementById('themeToggle');
    const showTipsBtn = document.getElementById('showTips');
    const tipsContent = document.querySelector('.tips-content');
    
    const requirements = {
        length: { regex: /.{8,}/, element: document.getElementById('length') },
        uppercase: { regex: /[A-Z]/, element: document.getElementById('uppercase') },
        lowercase: { regex: /[a-z]/, element: document.getElementById('lowercase') },
        number: { regex: /[0-9]/, element: document.getElementById('number') },
        special: { regex: /[!@#$%^&*(),.?":{}|<>]/, element: document.getElementById('special') }
    };

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light');
        document.body.classList.toggle('dark');
        themeToggle.textContent = document.body.classList.contains('dark') ? '🌙' : '☀️';
    });

    // Password Visibility Toggle
    togglePassword.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePassword.innerHTML = `<i class="fa-solid ${isPassword ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
        togglePassword.setAttribute('aria-label', 
            isPassword ? 'Hide password' : 'Show password'
        );
    });

    // Password Tips Toggle
    showTipsBtn.addEventListener('click', () => {
        const isHidden = tipsContent.hidden;
        tipsContent.hidden = !isHidden;
        showTipsBtn.innerHTML = `
            <i class="fa-solid ${isHidden ? 'fa-chevron-up' : 'fa-lightbulb'}"></i>
            ${isHidden ? 'Hide Password Tips' : 'Show Password Tips'}
        `;
    });

    // Generate Strong Password
    function generateStrongPassword() {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const allChars = lowercase + uppercase + numbers + symbols;
        
        let password = '';
        // Ensure at least one of each type
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Add random characters until we reach 16 characters
        while (password.length < 16) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Shuffle the password
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        return password;
    }

    generatePassword.addEventListener('click', () => {
        const newPassword = generateStrongPassword();
        passwordInput.type = 'text'; // Show the password
        passwordInput.value = newPassword;
        togglePassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        // Trigger input event to update strength
        passwordInput.dispatchEvent(new Event('input'));
    });

    // Calculate password complexity
    function calculateComplexity(password) {
        if (!password) return { score: 0, label: 'None' };
        
        let complexity = 0;
        const patterns = [
            { pattern: /[a-z]/, score: 1 },
            { pattern: /[A-Z]/, score: 1 },
            { pattern: /[0-9]/, score: 1 },
            { pattern: /[!@#$%^&*(),.?":{}|<>]/, score: 1 },
            { pattern: /.{8,}/, score: 1 },
            { pattern: /.{12,}/, score: 1 },
            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, score: 2 }
        ];

        patterns.forEach(({ pattern, score }) => {
            if (pattern.test(password)) {
                complexity += score;
            }
        });

        // Normalize complexity to a 0-8 scale
        const labels = ['None', 'Very Simple', 'Simple', 'Moderate', 'Complex', 'Very Complex', 'Excellent', 'Outstanding', 'Maximum'];
        const normalizedScore = Math.min(Math.floor(complexity), 8);

        return {
            score: normalizedScore,
            label: labels[normalizedScore]
        };
    }

    // Password Strength Checker
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        let strength = 0;
        let validRequirements = 0;

        // Check each requirement
        Object.keys(requirements).forEach(req => {
            const isValid = requirements[req].regex.test(password);
            requirements[req].element.classList.toggle('valid', isValid);
            requirements[req].element.textContent = 
                `${isValid ? '✓' : '✗'} ${requirements[req].element.textContent.slice(2)}`;
            if (isValid) validRequirements++;
        });

        // Calculate strength
        strength = (validRequirements / Object.keys(requirements).length) * 100;

        // Update progress bar
        progressBar.style.width = `${strength}%`;
        if (strength <= 20) {
            progressBar.style.backgroundColor = '#ff4444';
            strengthText.textContent = 'Very Weak';
        } else if (strength <= 40) {
            progressBar.style.backgroundColor = '#ffbb33';
            strengthText.textContent = 'Weak';
        } else if (strength <= 60) {
            progressBar.style.backgroundColor = '#ffeb3b';
            strengthText.textContent = 'Medium';
        } else if (strength <= 80) {
            progressBar.style.backgroundColor = '#00C851';
            strengthText.textContent = 'Strong';
        } else {
            progressBar.style.backgroundColor = '#007E33';
            strengthText.textContent = 'Very Strong';
        }

        // Update complexity
        const complexity = calculateComplexity(password);
        complexityText.textContent = complexity.label;

        // Calculate exposure estimate
        if (password.length === 0) {
            exposureTime.textContent = '-';
        } else {
            const possibilities = calculatePossibilities(password);
            const timeToBreak = calculateTimeToBreak(possibilities);
            exposureTime.textContent = timeToBreak;
        }
    });

    function calculatePossibilities(password) {
        let charsetSize = 0;
        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/[0-9]/.test(password)) charsetSize += 10;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) charsetSize += 32;
        
        return Math.pow(charsetSize, password.length);
    }

    function calculateTimeToBreak(possibilities) {
        // Assuming 1 billion guesses per second
        const guessesPerSecond = 1000000000;
        const seconds = possibilities / guessesPerSecond;
        
        if (seconds < 60) return 'Instantly';
        if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
        if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
        if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
        if (seconds < 315360000) return `${Math.round(seconds / 31536000)} years`;
        return 'Centuries';
    }
});