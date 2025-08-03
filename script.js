// Controle de Páginas
let currentPage = 0;
const pages = document.querySelectorAll('.page');
const totalPages = pages.length;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    showPage(0);
    updatePageIndicator();
    
    // Preencher data atual na consulta
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('consultDate').value = today;
    
    // Adicionar eventos de teclado
    document.addEventListener('keydown', handleKeyPress);
    
    // Auto-save dos dados
    setupAutoSave();
});

// Mostrar página específica
function showPage(pageIndex) {
    pages.forEach((page, index) => {
        page.classList.toggle('active', index === pageIndex);
    });
    currentPage = pageIndex;
    updatePageIndicator();
    updateNavigationButtons();
}

// Próxima página
function nextPage() {
    if (currentPage < totalPages - 1) {
        showPage(currentPage + 1);
        animatePageTransition('next');
    }
}

// Página anterior
function previousPage() {
    if (currentPage > 0) {
        showPage(currentPage - 1);
        animatePageTransition('prev');
    }
}

// Atualizar indicador de página
function updatePageIndicator() {
    const indicator = document.getElementById('pageIndicator');
    indicator.textContent = `${currentPage + 1} / ${totalPages}`;
}

// Atualizar botões de navegação
function updateNavigationButtons() {
    const prevBtn = document.querySelector('.navigation button:first-child');
    const nextBtn = document.querySelector('.navigation button:last-child');
    
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === totalPages - 1;
}

// Animação de transição entre páginas
function animatePageTransition(direction) {
    const currentPageElement = pages[currentPage];
    
    if (direction === 'next') {
        currentPageElement.style.animation = 'slideInRight 0.5s ease-in-out';
    } else {
        currentPageElement.style.animation = 'slideInLeft 0.5s ease-in-out';
    }
    
    setTimeout(() => {
        currentPageElement.style.animation = '';
    }, 500);
}

// Controle por teclado
function handleKeyPress(event) {
    switch(event.key) {
        case 'ArrowRight':
        case 'PageDown':
            event.preventDefault();
            nextPage();
            break;
        case 'ArrowLeft':
        case 'PageUp':
            event.preventDefault();
            previousPage();
            break;
        case 'Home':
            event.preventDefault();
            showPage(0);
            break;
        case 'End':
            event.preventDefault();
            showPage(totalPages - 1);
            break;
    }
}

// Salvar como PDF
function saveAsPDF() {
    // Mostrar todas as páginas para impressão
    pages.forEach(page => {
        page.style.display = 'block';
    });
    
    // Configurar para impressão
    const originalTitle = document.title;
    const clientName = document.getElementById('clientName').value || 'Cliente';
    document.title = `Mapa_Numerologico_${clientName.replace(/\s+/g, '_')}`;
    
    // Abrir diálogo de impressão
    window.print();
    
    // Restaurar estado original
    setTimeout(() => {
        document.title = originalTitle;
        showPage(currentPage);
    }, 1000);
}

// Auto-save dos dados do formulário
function setupAutoSave() {
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        // Carregar dados salvos
        const savedValue = localStorage.getItem(`numerology_${input.id || input.name}`);
        if (savedValue && input.type !== 'date') {
            input.value = savedValue;
        }
        
        // Salvar automaticamente
        input.addEventListener('input', function() {
            localStorage.setItem(`numerology_${this.id || this.name}`, this.value);
        });
        
        input.addEventListener('blur', function() {
            localStorage.setItem(`numerology_${this.id || this.name}`, this.value);
        });
    });
}

// Limpar dados salvos
function clearSavedData() {
    if (confirm('Tem certeza que deseja limpar todos os dados salvos?')) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('numerology_')) {
                localStorage.removeItem(key);
            }
        });
        
        // Limpar formulários
        document.querySelectorAll('input, textarea').forEach(input => {
            if (input.type !== 'date') {
                input.value = '';
            }
        });
        
        alert('Dados limpos com sucesso!');
    }
}

// Exportar dados como JSON
function exportData() {
    const data = {
        clientInfo: {
            name: document.getElementById('clientName').value,
            birthDate: document.getElementById('birthDate').value,
            consultDate: document.getElementById('consultDate').value
        },
        analysis: {}
    };
    
    // Coletar todos os textos das análises
    document.querySelectorAll('textarea').forEach((textarea, index) => {
        const section = textarea.closest('.number-section, .number-card, .cycle-section, .synthesis-section, .guidance-section, .affirmations-section');
        const title = section ? section.querySelector('h3, h4')?.textContent : `Análise ${index + 1}`;
        data.analysis[title] = textarea.value;
    });
    
    // Download do arquivo JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mapa_numerologico_${data.clientInfo.name || 'cliente'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Importar dados de JSON
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Preencher informações do cliente
                    if (data.clientInfo) {
                        document.getElementById('clientName').value = data.clientInfo.name || '';
                        document.getElementById('birthDate').value = data.clientInfo.birthDate || '';
                        document.getElementById('consultDate').value = data.clientInfo.consultDate || '';
                    }
                    
                    // Preencher análises
                    if (data.analysis) {
                        document.querySelectorAll('textarea').forEach(textarea => {
                            const section = textarea.closest('.number-section, .number-card, .cycle-section, .synthesis-section, .guidance-section, .affirmations-section');
                            const title = section ? section.querySelector('h3, h4')?.textContent : '';
                            if (title && data.analysis[title]) {
                                textarea.value = data.analysis[title];
                            }
                        });
                    }
                    
                    alert('Dados importados com sucesso!');
                } catch (error) {
                    alert('Erro ao importar dados. Verifique se o arquivo é válido.');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Calcular números numerológicos automaticamente
function calculateNumerology() {
    const name = document.getElementById('clientName').value;
    const birthDate = document.getElementById('birthDate').value;
    
    if (!name || !birthDate) {
        alert('Por favor, preencha o nome e a data de nascimento primeiro.');
        return;
    }
    
    // Função para reduzir número a um dígito
    function reduceToSingleDigit(num) {
        while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
            num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        }
        return num;
    }
    
    // Calcular número do destino (data de nascimento)
    const dateNumbers = birthDate.replace(/-/g, '').split('').map(Number);
    const destinyNumber = reduceToSingleDigit(dateNumbers.reduce((sum, num) => sum + num, 0));
    
    // Calcular número da personalidade (consoantes do nome)
    const consonants = name.toUpperCase().replace(/[AEIOU\s]/g, '');
    const consonantValues = { B:2, C:3, D:4, F:6, G:7, H:8, J:1, K:2, L:3, M:4, N:5, P:7, Q:8, R:9, S:1, T:2, V:4, W:5, X:6, Y:7, Z:8 };
    const personalityNumber = reduceToSingleDigit(
        consonants.split('').reduce((sum, char) => sum + (consonantValues[char] || 0), 0)
    );
    
    // Calcular número da alma (vogais do nome)
    const vowels = name.toUpperCase().replace(/[^AEIOU]/g, '');
    const vowelValues = { A:1, E:5, I:9, O:6, U:3 };
    const soulNumber = reduceToSingleDigit(
        vowels.split('').reduce((sum, char) => sum + (vowelValues[char] || 0), 0)
    );
    
    // Calcular número da expressão (nome completo)
    const allLetters = name.toUpperCase().replace(/\s/g, '');
    const letterValues = { A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, I:9, J:1, K:2, L:3, M:4, N:5, O:6, P:7, Q:8, R:9, S:1, T:2, U:3, V:4, W:5, X:6, Y:7, Z:8 };
    const expressionNumber = reduceToSingleDigit(
        allLetters.split('').reduce((sum, char) => sum + (letterValues[char] || 0), 0)
    );
    
    // Preencher os campos automaticamente
    const textareas = document.querySelectorAll('textarea');
    const suggestions = [
        `Número da Personalidade: ${personalityNumber}\n\nEste número representa como você se apresenta ao mundo...`,
        `Número do Destino: ${destinyNumber}\n\nEste número revela seu propósito de vida e missão...`,
        `Número da Alma: ${soulNumber}\n\nEste número representa seus desejos mais profundos...`,
        `Número da Expressão: ${expressionNumber}\n\nEste número mostra seus talentos naturais...`
    ];
    
    textareas.forEach((textarea, index) => {
        if (index < suggestions.length && !textarea.value) {
            textarea.value = suggestions[index];
        }
    });
    
    alert('Cálculos numerológicos básicos preenchidos! Você pode editar e personalizar as análises.');
}

// Adicionar botões de controle extras
document.addEventListener('DOMContentLoaded', function() {
    const controlsContainer = document.querySelector('.print-controls');
    
    // Botão de cálculo automático
    const calcButton = document.createElement('button');
    calcButton.textContent = '🔢 Calcular';
    calcButton.onclick = calculateNumerology;
    calcButton.title = 'Calcular números numerológicos automaticamente';
    controlsContainer.appendChild(calcButton);
    
    // Botão de exportar
    const exportButton = document.createElement('button');
    exportButton.textContent = '💾 Exportar';
    exportButton.onclick = exportData;
    exportButton.title = 'Exportar dados como JSON';
    controlsContainer.appendChild(exportButton);
    
    // Botão de importar
    const importButton = document.createElement('button');
    importButton.textContent = '📁 Importar';
    importButton.onclick = importData;
    importButton.title = 'Importar dados de JSON';
    controlsContainer.appendChild(importButton);
    
    // Botão de limpar
    const clearButton = document.createElement('button');
    clearButton.textContent = '🗑 Limpar';
    clearButton.onclick = clearSavedData;
    clearButton.title = 'Limpar todos os dados salvos';
    clearButton.style.background = '#dc3545';
    controlsContainer.appendChild(clearButton);
});

// Adicionar animações CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideInLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .page.active {
        animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    
    /* Efeitos de hover melhorados */
    .number-section:hover,
    .number-card:hover,
    .cycle-section:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    
    .sacred-geometry:hover {
        transform: scale(1.05);
    }
    
    /* Indicador de progresso */
    .progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #d4af37, #f4d03f);
        transition: width 0.3s ease;
        z-index: 1001;
    }
`;
document.head.appendChild(style);

// Adicionar barra de progresso
const progressBar = document.createElement('div');
progressBar.className = 'progress-bar';
document.body.appendChild(progressBar);

// Atualizar barra de progresso
function updateProgressBar() {
    const progress = ((currentPage + 1) / totalPages) * 100;
    progressBar.style.width = `${progress}%`;
}

// Atualizar indicador quando mudar de página
const originalShowPage = showPage;
showPage = function(pageIndex) {
    originalShowPage(pageIndex);
    updateProgressBar();
};

// Inicializar barra de progresso
updateProgressBar();

