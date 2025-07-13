document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.appointment-form');
    if (!form) return;

    // Función para validar campos
    function validateField(field, errorMessage) {
        const value = field.value.trim();
        if (!value) {
            showFieldError(field, errorMessage);
            return false;
        }
        clearFieldError(field);
        return true;
    }

    // Función para mostrar error en campo
    function showFieldError(field, message) {
        field.style.borderColor = '#dc3545';
        field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
        
        // Remover mensaje de error anterior si existe
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Crear nuevo mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: slideIn 0.3s ease-out;
        `;
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    // Función para limpiar error de campo
    function clearFieldError(field) {
        field.style.borderColor = '#28a745';
        field.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
        
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Función para mostrar notificación
    function showNotification(message, type = 'success') {
        // Remover notificación anterior si existe
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #dc3545, #fd7e14)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            max-width: 350px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }, 4000);
    }

    // Validación en tiempo real
    const fields = form.querySelectorAll('input, textarea');
    fields.forEach(field => {
        field.addEventListener('blur', function() {
            if (this.value.trim()) {
                clearFieldError(this);
            }
        });

        field.addEventListener('input', function() {
            const errorMessage = this.parentNode.querySelector('.error-message');
            if (errorMessage && this.value.trim()) {
                clearFieldError(this);
            }
        });
    });

    // Función para generar ID único
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Manejar envío del formulario
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Obtener campos
        const nombreField = document.getElementById('fullName');
        const modeloField = document.getElementById('vehicleModel');
        const placaField = document.getElementById('licensePlate');
        const descripcionField = document.getElementById('problemDescription');
        const fechaHoraField = document.getElementById('preferredDateTime');

        // Validar campos
        let isValid = true;
        
        if (!validateField(nombreField, 'El nombre completo es requerido')) {
            isValid = false;
        }
        
        if (!validateField(modeloField, 'El modelo del vehículo es requerido')) {
            isValid = false;
        }
        
        if (!validateField(placaField, 'La placa del vehículo es requerida')) {
            isValid = false;
        }
        
        if (!validateField(descripcionField, 'La descripción del problema es requerida')) {
            isValid = false;
        }
        
        if (!validateField(fechaHoraField, 'La fecha y hora son requeridas')) {
            isValid = false;
        }

        // Validar fecha no sea en el pasado
        if (fechaHoraField.value) {
            const selectedDate = new Date(fechaHoraField.value);
            const now = new Date();
            if (selectedDate <= now) {
                showFieldError(fechaHoraField, 'La fecha debe ser futura');
                isValid = false;
            }
        }

        if (!isValid) {
            showNotification('Por favor, corrige los errores en el formulario', 'error');
            return;
        }

        // Crear objeto cita
        const cita = {
            id: generateId(),
            nombre: nombreField.value.trim(),
            modelo: modeloField.value.trim(),
            placa: placaField.value.trim(),
            descripcion: descripcionField.value.trim(),
            fechaHora: fechaHoraField.value,
            fechaCreacion: new Date().toISOString(),
            estado: 'pendiente'
        };

        // Obtener citas previas del localStorage
        let citas = JSON.parse(localStorage.getItem('citas')) || [];
        citas.push(cita);

        // Guardar en localStorage
        localStorage.setItem('citas', JSON.stringify(citas));

        // Animación del botón
        const submitButton = form.querySelector('.submit-button');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Procesando...';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';

        // Simular procesamiento
        setTimeout(() => {
            // Restaurar botón
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            submitButton.style.opacity = '1';

            // Limpiar formulario con animación
            fields.forEach(field => {
                field.style.transition = 'all 0.3s ease';
                field.style.transform = 'scale(0.95)';
                field.style.opacity = '0.5';
            });

            setTimeout(() => {
                form.reset();
                fields.forEach(field => {
                    field.style.transform = 'scale(1)';
                    field.style.opacity = '1';
                    field.style.borderColor = '#e1e8f0';
                    field.style.boxShadow = 'none';
                });
            }, 300);

            // Mostrar mensaje de éxito
            showNotification(`¡Excelente! Tu cita ha sido agendada para el ${new Date(cita.fechaHora).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}. Te contactaremos pronto.`, 'success');

        }, 1500);
    });

    // Agregar estilos para animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});