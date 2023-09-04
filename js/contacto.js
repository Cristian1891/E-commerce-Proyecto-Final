(function() {
    'use strict';
    
    window.addEventListener('load', function() {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        let forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        let validation = Array.prototype.filter.call(forms, function(form) {
            form.addEventListener('submit', function(event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                else{
                    setTimeout(event.preventDefault(), 4000);
                    Swal.fire({
                        type: 'success',
                        text: 'Formulario enviado',
                        showConfirmButton: false,
                        timer: 2000
                    }).then(function () {
                        window.location.href = "../index.html";
                    })
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();