document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.appointment-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Obtener los valores del formulario
        const cita = {
            nombre: document.getElementById('fullName').value.trim(),
            modelo: document.getElementById('vehicleModel').value.trim(),
            placa: document.getElementById('licensePlate').value.trim(),
            descripcion: document.getElementById('problemDescription').value.trim(),
            fechaHora: document.getElementById('preferredDateTime').value
        };

        // Obtener citas previas del localStorage
        let citas = JSON.parse(localStorage.getItem('citas')) || [];
        citas.push(cita);

        // Guardar de nuevo en localStorage
        localStorage.setItem('citas', JSON.stringify(citas));

        // Opcional: limpiar el formulario y mostrar mensaje
        form.reset();
        alert('¡Cita guardada localmente!');
    });
});