// Ждем, пока вся страница (HTML) загрузится
document.addEventListener('DOMContentLoaded', () => {

    const clubMap = document.querySelector('.club-map');
    const modal = document.getElementById('booking-modal');
    const closeModalButton = document.querySelector('.close-button');
    const bookingForm = document.getElementById('booking-form');
    const modalPcIdSpan = document.getElementById('modal-pc-id');

    let currentSelectedPc = null; // Переменная для хранения ПК, который бронируют

    // НОВОЕ: Объект для хранения информации о бронированиях
    // Ключ - ID компьютера, значение - объект с данными брони
    const bookings = {}; 

    // НОВАЯ ФУНКЦИЯ: Обновление тултипа для ПК
    function updatePcTooltip(pcElement, pcId, clientName, arrivalTime) {
        let tooltip = pcElement.querySelector('.pc-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.classList.add('pc-tooltip');
            pcElement.appendChild(tooltip);
        }
        tooltip.innerHTML = `
            <strong>Забронировано:</strong><br>
            Клиент: ${clientName}<br>
            Время: ${arrivalTime}
        `;
    }

    // --- 1. Открытие модального окна ---
    clubMap.addEventListener('click', (event) => {
        const clickedPc = event.target.closest('.pc');

        if (!clickedPc) {
            return;
        }

        const pcId = clickedPc.dataset.pcId;

        // Теперь проверяем не просто класс, а есть ли бронь в нашем объекте
        if (bookings[pcId]) { 
            // alert(`Этот компьютер №${pcId} уже забронирован клиентом ${bookings[pcId].name} на ${bookings[pcId].time}.`);
            // Вместо alert, просто ничего не делаем, так как при наведении будет тултип
            return; 
        }

        // Если ПК свободен:
        currentSelectedPc = clickedPc;
        modalPcIdSpan.textContent = pcId;
        modal.classList.add('visible');
    });

    // --- 2. Закрытие модального окна ---
    const closeModal = () => {
        modal.classList.remove('visible');
        bookingForm.reset();
        currentSelectedPc = null;
    };

    closeModalButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // --- 3. Обработка отправки формы ---
    bookingForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const clientName = document.getElementById('client-name').value;
        const clientPhone = document.getElementById('client-phone').value;
        const arrivalTime = document.getElementById('arrival-time').value;
        const pcId = modalPcIdSpan.textContent;

        console.log('--- НОВАЯ БРОНЬ ---');
        console.log('Компьютер:', pcId);
        console.log('Имя клиента:', clientName);
        console.log('Телефон:', clientPhone);
        console.log('Время:', arrivalTime);
        console.log('--------------------');
        
        alert(`ПК №${pcId} успешно забронирован!`);

        // Сохраняем информацию о бронировании в нашем объекте
        bookings[pcId] = {
            name: clientName,
            phone: clientPhone,
            time: arrivalTime
        };

        // Меняем статус ПК на "занят" и добавляем тултип
        if (currentSelectedPc) {
            currentSelectedPc.classList.remove('pc-available');
            currentSelectedPc.classList.add('pc-busy');
            updatePcTooltip(currentSelectedPc, pcId, clientName, arrivalTime); // Создаем или обновляем тултип
        }

        closeModal();
    });

});