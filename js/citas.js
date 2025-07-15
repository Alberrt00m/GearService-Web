document.addEventListener('DOMContentLoaded', function () {
    initializeCitasForm();
    setMinDate();
    addFormAnimations();
});

function initializeCitasForm() {
    const form = document.getElementById('citaForm');
    if (!form) return;

    // Event listeners
    form.addEventListener('submit', handleFormSubmit);

    // Validación en tiempo real
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });

    // Validación especial para campos específicos
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }

    const plateInput = document.getElementById('licensePlate');
    if (plateInput) {
        plateInput.addEventListener('input', formatLicensePlate);
    }

    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
    }
}

// Establecer fecha mínima (hoy)
function setMinDate() {
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

// Manejo del envío del formulario
// Manejo del envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('.submit-button');

    showLoadingState(submitButton);

    try {
        if (!validateForm(form)) {
            hideLoadingState(submitButton);
            showNotification('Por favor, completa todos los campos requeridos correctamente.', 'error');
            return;
        }

        // Obtener datos y enviarlos al servidor
        const formData = new FormData(form);
        const fullName = formData.get('fullName').trim().split(' ');

        const data = {
            nombre: fullName[0] || '',
            apellido: fullName.slice(1).join(' ') || '',
            telefono: formData.get('phone').replace(/\s/g, ''),
            correo: formData.get('email'),
            direccion: formData.get('address'),
            placa: formData.get('licensePlate'),
            marca: formData.get('vehicleBrand'),
            modelo: formData.get('vehicleModel'),
            año: formData.get('vehicleYear'),
            color: formData.get('vehicleColor'),
            fecha: formData.get('preferredDate'),
            descripcion: formData.get('problemDescription')
        };

        console.log('Enviando:', data);

        // Llamada real a tu API
        const response = await fetch('http://localhost:3000/crear-cita', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showSuccessMessage();
            resetForm(form);
        } else {
            console.error(result);
            showNotification('Error del servidor: ' + (result.error || 'Error desconocido'), 'error');
        }

    } catch (error) {
        console.error('Error al enviar formulario:', error);
        showNotification('Hubo un error de red. Intenta nuevamente.', 'error');
    } finally {
        hideLoadingState(submitButton);
    }
}


// Validar formulario completo
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

// Validar campo individual
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;

    // Limpiar errores previos
    clearFieldError(field);

    // Verificar si está vacío (para campos requeridos)
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo es obligatorio');
        return false;
    }

    // Validaciones específicas por tipo
    switch (fieldType) {
        case 'email':
            return validateEmail(field);
        case 'tel':
            return validatePhone(field);
        case 'number':
            return validateNumber(field);
        default:
            if (fieldName === 'licensePlate') {
                return validateLicensePlate(field);
            }
            return true;
    }
}

// Validar email
function validateEmail(field) {
    const email = field.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
        showFieldError(field, 'Por favor, ingresa un email válido');
        return false;
    }

    if (email) {
        showFieldSuccess(field);
    }
    return true;
}

// Validar teléfono
function validatePhone(field) {
    const phone = field.value.trim();
    const phoneRegex = /^[0-9]{9}$/;

    if (phone && !phoneRegex.test(phone.replace(/\s/g, ''))) {
        showFieldError(field, 'El teléfono debe tener 9 dígitos');
        return false;
    }

    if (phone) {
        showFieldSuccess(field);
    }
    return true;
}

// Validar número
function validateNumber(field) {
    const value = field.value.trim();
    const min = field.getAttribute('min');
    const max = field.getAttribute('max');

    if (value) {
        const num = parseInt(value);
        if (min && num < parseInt(min)) {
            showFieldError(field, `El valor mínimo es ${min}`);
            return false;
        }
        if (max && num > parseInt(max)) {
            showFieldError(field, `El valor máximo es ${max}`);
            return false;
        }
        showFieldSuccess(field);
    }
    return true;
}

// Validar placa
function validateLicensePlate(field) {
    const plate = field.value.trim().toUpperCase();
    const plateRegex = /^[A-Z]{3}-[0-9]{3}$/;

    if (plate && !plateRegex.test(plate)) {
        showFieldError(field, 'Formato: ABC-123');
        return false;
    }

    if (plate) {
        showFieldSuccess(field);
    }
    return true;
}

// Formatear número de teléfono
function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 9) value = value.slice(0, 9);

    // Formatear como 999 123 456
    if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{3})/, '$1 $2');
    }

    event.target.value = value;
}

// Formatear placa
function formatLicensePlate(event) {
    let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (value.length > 6) value = value.slice(0, 6);

    // Formatear como ABC-123
    if (value.length > 3) {
        value = value.replace(/([A-Z]{3})([0-9]{1,3})/, '$1-$2');
    }

    event.target.value = value;
}

// Mostrar error en campo
function showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');

    // Remover mensaje anterior
    const existingError = field.parentNode.querySelector('.field-message');
    if (existingError) existingError.remove();

    // Crear mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-message error-message';
    errorDiv.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${message}`;
    field.parentNode.appendChild(errorDiv);

    // Animación de shake
    field.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => field.style.animation = '', 500);
}

// Mostrar éxito en campo
function showFieldSuccess(field) {
    field.classList.add('success');
    field.classList.remove('error');

    // Remover mensaje anterior
    const existingMessage = field.parentNode.querySelector('.field-message');
    if (existingMessage) existingMessage.remove();

    // Crear mensaje de éxito
    const successDiv = document.createElement('div');
    successDiv.className = 'field-message success-message';
    successDiv.innerHTML = '<i class="bi bi-check-circle"></i> Correcto';
    field.parentNode.appendChild(successDiv);
}

// Limpiar error de campo
function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.field-message');
    if (errorMessage) errorMessage.remove();
}

// Estado de carga del botón
function showLoadingState(button) {
    button.disabled = true;
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Enviando...';
    button.style.opacity = '0.7';
}

// Ocultar estado de carga
function hideLoadingState(button) {
    button.disabled = false;
    button.innerHTML = '<i class="bi bi-send"></i> Enviar Solicitud de Cita';
    button.style.opacity = '1';
}

//se borro la simulacion de envio

// Mostrar mensaje de éxito
function showSuccessMessage() {
    const successModal = createSuccessModal();
    document.body.appendChild(successModal);

    // Mostrar modal con animación
    setTimeout(() => successModal.classList.add('show'), 100);

    // Auto cerrar después de 5 segundos
    setTimeout(() => {
        closeModal(successModal);
    }, 5000);
}

// Crear modal de éxito
function createSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <i class="bi bi-check-circle-fill"></i>
                <h3>¡Solicitud Enviada!</h3>
            </div>
            <div class="modal-body">
                <p>Tu solicitud de cita ha sido enviada exitosamente.</p>
                <p>Nos pondremos en contacto contigo en las próximas 2 horas para confirmar tu cita.</p>
                <div class="modal-info">
                    <i class="bi bi-telephone"></i>
                    <span>También puedes llamarnos al: (01) 234-5678</span>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal(this.closest('.success-modal'))" class="modal-btn">
                    <i class="bi bi-check"></i> Entendido
                </button>
            </div>
        </div>
        <div class="modal-backdrop" onclick="closeModal(this.parentNode)"></div>
    `;

    return modal;
}

// Cerrar modal
function closeModal(modal) {
    modal.classList.add('hiding');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

// Resetear formulario
function resetForm(form) {
    form.reset();

    // Limpiar todas las validaciones
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        field.classList.remove('error', 'success');
        clearFieldError(field);
    });
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="bi bi-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentNode.remove()" class="notification-close">
            <i class="bi bi-x"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Añadir animaciones al formulario
function addFormAnimations() {
    const sections = document.querySelectorAll('.form-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    });

    sections.forEach(section => observer.observe(section));
}

// Función global para cerrar modal (para onclick)
window.closeModal = closeModal;