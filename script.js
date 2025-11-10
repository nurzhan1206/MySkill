document.addEventListener('DOMContentLoaded', () => {

    // Находим все нужные элементы
    const clubMap = document.querySelector('.club-map');
    const modal = document.getElementById('booking-modal');
    const closeModalButton = document.querySelector('.close-button');
    const bookingForm = document.getElementById('booking-form');
    const modalPcIdSpan = document.getElementById('modal-pc-id');

    let currentSelectedPc = null;
    let bookings = {}; // Наш объект для хранения брони

    // --- 1. НОВЫЙ БЛОК: Сохранение и Загрузка ---

    // Функция сохранения в localStorage
    function saveBookings() {
        localStorage.setItem('clubBookings', JSON.stringify(bookings));
    }

    // Функция загрузки и отрисовки карты
    function loadBookingsAndRenderMap() {
        const savedBookings = localStorage.getItem('clubBookings');
        if (savedBookings) {
            bookings = JSON.parse(savedBookings);
        }

        // Проходимся по всем ПК на карте
        document.querySelectorAll('.pc').forEach(pcElement => {
            const pcId = pcElement.dataset.pcId;
            const booking = bookings[pcId];

            // Сначала сбрасываем все статусы
            pcElement.classList.remove('pc-busy', 'pc-occupied');
            pcElement.classList.add('pc-available');
            
            // Удаляем старый тултип, если он был
            const oldTooltip = pcElement.querySelector('.pc-tooltip');
            if (oldTooltip) {
                oldTooltip.remove();
            }

            if (booking) {
                // Если есть бронь, обновляем класс и тултип
                pcElement.classList.remove('pc-available');
                if (booking.status === 'booked') {
                    pcElement.classList.add('pc-busy'); // Забронирован
                } else if (booking.status === 'occupied') {
                    pcElement.classList.add('pc-occupied'); // Занят
                }
                updatePcTooltip(pcElement, pcId, booking.name, booking.time, booking.status);
            }
        });
    }

    // Функция обновления тултипа (теперь показывает статус)
    function updatePcTooltip(pcElement, pcId, clientName, arrivalTime, status) {
        let tooltip = pcElement.querySelector('.pc-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.classList.add('pc-tooltip');
            pcElement.appendChild(tooltip);
        }
        
        let statusText = (status === 'booked') ? 'Бронь' : 'Занят';
        
        tooltip.innerHTML = `
            <strong>${statusText}: ${clientName}</strong><br>
            Время: ${arrivalTime}
        `;
    }

    // --- 2. ОБНОВЛЕННЫЙ: Обработчик кликов по карте ---

    clubMap.addEventListener('click', (event) => {
        const clickedPc = event.target.closest('.pc');
        if (!clickedPc) return;

        const pcId = clickedPc.dataset.pcId;
        const booking = bookings[pcId];

        if (!booking) {
            // --- СЛУЧАЙ 1: ПК СВОБОДЕН (ЗЕЛЕНЫЙ) ---
            // Открываем модальное окно бронирования
            currentSelectedPc = clickedPc;
            modalPcIdSpan.textContent = pcId;
            modal.classList.add('visible');
        } 
        else if (booking.status === 'booked') {
            // --- СЛУЧАЙ 2: ПК ЗАБРОНИРОВАН (ФИОЛЕТОВЫЙ) ---
            // Предлагаем посадить клиента
            if (confirm(`Клиент "${booking.name}" (бронь на ${booking.time}) пришел?`)) {
                // Меняем статус на "Занят"
                booking.status = 'occupied';
                saveBookings(); // Сохраняем
                loadBookingsAndRenderMap(); // Перерисовываем карту
            }
        } 
        else if (booking.status === 'occupied') {
            // --- СЛУЧАЙ 3: ПК ЗАНЯТ (КРАСНЫЙ) ---
            // Предлагаем завершить сеанс
            if (confirm(`Завершить сеанс для клиента "${booking.name}"?`)) {
                // Удаляем бронь
                delete bookings[pcId];
                saveBookings(); // Сохраняем
                loadBookingsAndRenderMap(); // Перерисовываем карту
            }
        }
    });

    // --- 3. Закрытие модального окна (без изменений) ---
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

    // --- 4. ОБНОВЛЕННЫЙ: Обработка отправки формы ---
    bookingForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const clientName = document.getElementById('client-name').value;
        const clientPhone = document.getElementById('client-phone').value;
        const arrivalTime = document.getElementById('arrival-time').value;
        const pcId = modalPcIdSpan.textContent;

        // Сохраняем информацию о бронировании (с новым статусом)
        bookings[pcId] = {
            name: clientName,
            phone: clientPhone,
            time: arrivalTime,
            status: 'booked' // Изначально 'забронирован'
        };

        // Сохраняем в localStorage
        saveBookings();
        
        alert(`ПК №${pcId} успешно забронирован!`);

        // Перерисовываем всю карту с новыми данными
        loadBookingsAndRenderMap();

        // Закрываем окно
        closeModal();
    });

    // --- 5. ЗАПУСК ---
    // Загружаем брони и рисуем карту при первой загрузке страницы
    loadBookingsAndRenderMap();

});