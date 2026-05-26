// App State
let currentTab = 'learn';
let currentScore = 0;
let answeredQuestionsCount = 0;
let correctAnswersCount = 0;
let streak = 0;
let currentQuestionIndex = 0;
let userAnswers = []; // Track details of answered questions: { question, userAns, correctAns, isCorrect, explanation }
let selectedWords = []; // For word ordering questions

// Quiz Question Database
const questions = [
    // Multiple Choice
    {
        type: 'mcq',
        question: 'She _______ (study) English every night.',
        options: ['study', 'studies', 'studys', 'studying'],
        correct: 'studies',
        explanation: 'Chủ ngữ là "She" (ngôi thứ 3 số ít), động từ "study" kết thúc bằng phụ âm + "y", ta đổi "y" thành "i" rồi thêm "es".'
    },
    {
        type: 'mcq',
        question: 'We _______ (not watch) TV in the morning.',
        options: ['not watch', 'watches not', "don't watch", "doesn't watch"],
        correct: "don't watch",
        explanation: 'Chủ ngữ "We" số nhiều, trong câu phủ định dùng trợ động từ "don\'t" (do not) + động từ nguyên mẫu.'
    },
    {
        type: 'mcq',
        question: '_______ they live in London?',
        options: ['Do', 'Does', 'Are', 'Is'],
        correct: 'Do',
        explanation: 'Trong câu hỏi nghi vấn, chủ ngữ "they" (số nhiều) cần đi cùng trợ động từ "Do".'
    },
    {
        type: 'mcq',
        question: 'The train _______ at 8:00 AM every morning.',
        options: ['leave', 'leaves', 'leaving', 'is leave'],
        correct: 'leaves',
        explanation: 'Diễn tả lịch trình cố định của phương tiện giao thông. "The train" là danh từ số ít nên động từ "leave" thêm "s".'
    },
    {
        type: 'mcq',
        question: 'I always _______ up early.',
        options: ['gets', 'getting', 'get', 'am get'],
        correct: 'get',
        explanation: 'Chủ ngữ "I" thì động từ thường giữ nguyên mẫu ở thể khẳng định.'
    },
    
    // Fill in the blank
    {
        type: 'fitb',
        question: 'He _______ (go) to school by bus.',
        correct: ['goes'],
        explanation: 'Chủ ngữ "He" (ngôi thứ 3 số ít), động từ "go" kết thúc bằng chữ "o" nên ta thêm đuôi "es".'
    },
    {
        type: 'fitb',
        question: 'My cats _______ (love) fish.',
        correct: ['love'],
        explanation: 'Chủ ngữ "My cats" là danh từ số nhiều (những con mèo) nên động từ giữ nguyên mẫu.'
    },
    {
        type: 'fitb',
        question: 'She _______ (not have) a car.',
        correct: ["doesn't have", "does not have"],
        explanation: 'Chủ ngữ "She" số ít, trong phủ định dùng "doesn\'t" (does not) + động từ nguyên mẫu "have".'
    },
    {
        type: 'fitb',
        question: 'What time _______ you usually wake up?',
        correct: ['do'],
        explanation: 'Câu hỏi dùng từ để hỏi (Wh-), chủ ngữ là "you" nên dùng trợ động từ "do".'
    },
    {
        type: 'fitb',
        question: 'Water _______ (boil) at 100 degrees Celsius.',
        correct: ['boils'],
        explanation: 'Diễn tả một chân lý, sự thật hiển nhiên. "Water" là danh từ số ít không đếm được nên động từ thêm "s".'
    },

    // Word Ordering
    {
        type: 'order',
        question: 'Hãy xếp các từ thành câu đúng: "Anh ấy thường chơi bóng đá vào thứ Bảy."',
        words: ['He', 'usually', 'plays', 'soccer', 'on', 'Saturdays'],
        correct: 'He usually plays soccer on Saturdays',
        explanation: 'Trạng từ chỉ tần suất (usually) đứng trước động từ thường (plays). Trật tự: S + trạng từ + V + O + Trạng từ chỉ thời gian.'
    },
    {
        type: 'order',
        question: 'Hãy xếp các từ thành câu phủ định đúng: "Họ không thích đồ ăn cay."',
        words: ['They', 'do', 'not', 'like', 'spicy', 'food'],
        correct: 'They do not like spicy food',
        explanation: 'Cấu trúc phủ định của động từ thường: Chủ ngữ (They) + do not + động từ thường (like) + cụm tân ngữ (spicy food).'
    },
    {
        type: 'order',
        question: 'Hãy xếp các từ thành câu hỏi đúng: "Bố bạn có nói tiếng Anh không?"',
        words: ['Does', 'your', 'father', 'speak', 'English', '?'],
        correct: 'Does your father speak English ?',
        explanation: 'Câu hỏi nghi vấn Yes/No: Trợ động từ (Does) + Chủ ngữ (your father) + Động từ nguyên mẫu (speak) + Tân ngữ (English) + Dấu chấm hỏi (?).'
    }
];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Set current date
    const dateDisplay = document.getElementById('date-display');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateDisplay.textContent = today.toLocaleDateString('vi-VN', options);

    // Load first question
    loadQuestion();
    updateProgressUI();
});

// Tab Switching Logic
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update navigation active states
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`btn-tab-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Switch active section content
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.remove('active');
    });
    
    const activeSection = document.getElementById(`tab-${tabName}`);
    if (activeSection) activeSection.classList.add('active');

    // Special logic when entering Dashboard
    if (tabName === 'progress') {
        updateProgressTab();
    }
}

// Sub-Tab Switching Logic (Learn Mode)
function switchSubTab(event, subTabId) {
    const parentContainer = event.target.closest('.tab-sub-container');
    
    // Remove active from buttons
    parentContainer.querySelectorAll('.tab-sub-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active to current button
    event.target.classList.add('active');
    
    // Hide all sub-tab contents
    parentContainer.querySelectorAll('.tab-sub-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show current sub-tab content
    parentContainer.querySelector(`#${subTabId}`).classList.add('active');
}

// Text-to-Speech (TTS)
function speakText(text) {
    if ('speechSynthesis' in window) {
        // Cancel any speaking right now
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9; // Slightly slower for language learners
        
        // Try to find a high quality English voice
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google'));
        if (enVoice) {
            utterance.voice = enVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Trình duyệt của bạn không hỗ trợ tính năng phát âm tự động.');
    }
}

// Load Quiz Question
function loadQuestion() {
    // Reset specific container layouts
    document.getElementById('options-container').classList.add('hidden');
    document.getElementById('input-container').classList.add('hidden');
    document.getElementById('word-order-container').classList.add('hidden');
    document.getElementById('feedback-box').classList.add('hidden');
    
    const q = questions[currentQuestionIndex];
    const typeBadge = document.getElementById('quiz-type-badge');
    const questionText = document.getElementById('question-text');
    
    // Set Question text
    questionText.innerHTML = q.question;
    
    if (q.type === 'mcq') {
        typeBadge.textContent = 'Trắc nghiệm';
        typeBadge.style.borderColor = 'rgba(99, 102, 241, 0.2)';
        typeBadge.style.color = 'var(--primary-light)';
        
        const optContainer = document.getElementById('options-container');
        optContainer.innerHTML = '';
        optContainer.classList.remove('hidden');
        
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span>${opt}</span> <span class="opt-icon"></span>`;
            btn.onclick = () => checkMCQAnswer(btn, opt, q.correct);
            optContainer.appendChild(btn);
        });
        
    } else if (q.type === 'fitb') {
        typeBadge.textContent = 'Điền vào chỗ trống';
        typeBadge.style.borderColor = 'rgba(59, 130, 246, 0.2)';
        typeBadge.style.color = '#60a5fa';
        
        const inputContainer = document.getElementById('input-container');
        inputContainer.classList.remove('hidden');
        
        const inputField = document.getElementById('blank-input');
        inputField.value = '';
        inputField.disabled = false;
        inputField.focus();
        
        const submitBtn = document.getElementById('btn-submit-blank');
        submitBtn.disabled = false;
        
    } else if (q.type === 'order') {
        typeBadge.textContent = 'Xếp chữ thành câu';
        typeBadge.style.borderColor = 'rgba(168, 85, 247, 0.2)';
        typeBadge.style.color = '#c084fc';
        
        const orderContainer = document.getElementById('word-order-container');
        orderContainer.classList.remove('hidden');
        
        selectedWords = [];
        renderWordOrderZones(q.words);
    }
}

// Check MCQ Answer
function checkMCQAnswer(selectedBtn, selectedVal, correctVal) {
    // Disable all options immediately to prevent double click
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
    });

    const isCorrect = (selectedVal === correctVal);
    
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        selectedBtn.querySelector('.opt-icon').innerHTML = '✅';
        handleAnswerResult(true, selectedVal, correctVal);
    } else {
        selectedBtn.classList.add('incorrect');
        selectedBtn.querySelector('.opt-icon').innerHTML = '❌';
        
        // Highlight correct one
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.innerText.trim().startsWith(correctVal)) {
                btn.classList.add('correct');
                btn.querySelector('.opt-icon').innerHTML = '✅';
            }
        });
        handleAnswerResult(false, selectedVal, correctVal);
    }
}

// Check Fill in the blank Answer
function checkBlankAnswer() {
    const inputField = document.getElementById('blank-input');
    const submitBtn = document.getElementById('btn-submit-blank');
    const userVal = inputField.value.trim().toLowerCase();
    
    if (!userVal) return; // Ignore empty submittals

    inputField.disabled = true;
    submitBtn.disabled = true;

    const q = questions[currentQuestionIndex];
    // correct array has lowercased answers
    const isCorrect = q.correct.some(ans => ans.toLowerCase() === userVal);
    const correctVal = q.correct[0]; // Primary correct answer for display
    
    handleAnswerResult(isCorrect, inputField.value.trim(), correctVal);
}

// Word Order Zones Renderer
function renderWordOrderZones(initialWords) {
    const selectedZone = document.getElementById('selected-words-zone');
    const shuffledZone = document.getElementById('shuffled-words-zone');
    
    selectedZone.innerHTML = '';
    shuffledZone.innerHTML = '';
    
    // Shuffle words for presentation if not already shuffled (or just shuffle them now)
    // We make a shallow copy and shuffle
    const shuffled = [...initialWords].sort(() => Math.random() - 0.5);
    
    shuffled.forEach(word => {
        const tile = document.createElement('div');
        tile.className = 'word-tile';
        tile.textContent = word;
        tile.onclick = () => selectWordTile(word, tile);
        shuffledZone.appendChild(tile);
    });
}

function selectWordTile(word, tileElement) {
    // Add to selected list
    selectedWords.push(word);
    
    // Render in selected zone
    const selectedZone = document.getElementById('selected-words-zone');
    const selectedTile = document.createElement('div');
    selectedTile.className = 'word-tile';
    selectedTile.textContent = word;
    selectedTile.onclick = () => deselectWordTile(word, selectedTile);
    selectedZone.appendChild(selectedTile);
    
    // Remove / hide from shuffled zone
    tileElement.remove();
}

function deselectWordTile(word, tileElement) {
    // Remove from selected list
    const index = selectedWords.indexOf(word);
    if (index > -1) {
        selectedWords.splice(index, 1);
    }
    
    // Remove from selected zone
    tileElement.remove();
    
    // Add back to shuffled zone
    const shuffledZone = document.getElementById('shuffled-words-zone');
    const tile = document.createElement('div');
    tile.className = 'word-tile';
    tile.textContent = word;
    tile.onclick = () => selectWordTile(word, tile);
    shuffledZone.appendChild(tile);
}

function resetWordOrder() {
    const q = questions[currentQuestionIndex];
    selectedWords = [];
    renderWordOrderZones(q.words);
}

function checkWordOrderAnswer() {
    const q = questions[currentQuestionIndex];
    const userSentence = selectedWords.join(' ').replace(/\s+\?/g, ' ?'); // Handle question mark spacing
    const correctSentence = q.correct;
    
    const isCorrect = (userSentence.trim().toLowerCase() === correctSentence.trim().toLowerCase());
    
    // Disable tiles click by clearing event listeners
    document.querySelectorAll('.selected-words-zone .word-tile, .shuffled-words-zone .word-tile').forEach(tile => {
        tile.onclick = null;
        tile.style.cursor = 'default';
    });
    
    handleAnswerResult(isCorrect, userSentence, correctSentence);
}

// Main Answer Evaluator & Feedback Presenter
function handleAnswerResult(isCorrect, userVal, correctVal) {
    answeredQuestionsCount++;
    
    const q = questions[currentQuestionIndex];
    const feedbackBox = document.getElementById('feedback-box');
    const fbStatus = document.getElementById('feedback-status');
    const fbMessage = document.getElementById('feedback-message');
    const fbExplanation = document.getElementById('feedback-explanation');
    
    feedbackBox.classList.remove('hidden');
    feedbackBox.className = 'feedback-box'; // reset classes
    
    // Record user answer
    userAnswers.push({
        question: q.question.includes('_______') ? q.question : q.question + ` (${q.correct})`,
        userAns: userVal || '(trống)',
        correctAns: correctVal,
        isCorrect: isCorrect,
        explanation: q.explanation
    });

    if (isCorrect) {
        correctAnswersCount++;
        currentScore += 10;
        streak++;
        
        feedbackBox.classList.add('correct');
        fbStatus.textContent = 'Chính Xác! 🎉';
        
        // Pick random encouragement
        const messages = ['Làm rất tốt!', 'Tuyệt vời!', 'Bạn đang tiến bộ rất nhanh!', 'Rất chính xác!'];
        fbMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
        
        // Play TTS for the correct sentence to reinforce learning
        speakText(correctVal);
        
    } else {
        streak = 0;
        feedbackBox.classList.add('incorrect');
        fbStatus.textContent = 'Chưa Đúng 😢';
        fbMessage.innerHTML = `Đáp án đúng là: <strong>${correctVal}</strong>`;
    }
    
    fbExplanation.textContent = q.explanation;
    
    // Save to Local Storage for persistence
    saveProgressToStorage();
    
    // Update Score Board UI
    updateProgressUI();
}

// Next Question Logic
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= questions.length) {
        // End of quiz, switch to progress automatically or loop
        alert('Chúc mừng! Bạn đã hoàn thành toàn bộ bài tập hôm nay. Hãy xem kết quả tại Tab Tiến Trình.');
        currentQuestionIndex = 0; // Reset index for next run
        switchTab('progress');
    } else {
        loadQuestion();
    }
}

// Reset Quiz Progress
function resetQuiz() {
    currentQuestionIndex = 0;
    currentScore = 0;
    answeredQuestionsCount = 0;
    correctAnswersCount = 0;
    streak = 0;
    userAnswers = [];
    
    saveProgressToStorage();
    loadQuestion();
    updateProgressUI();
}

// Update Top Scores & Progress Bars UI
function updateProgressUI() {
    document.getElementById('current-score').textContent = currentScore;
    document.getElementById('answered-ratio').textContent = `${correctAnswersCount}/${answeredQuestionsCount}`;
    
    // Update progress bar
    const progressFill = document.getElementById('practice-progress');
    const percent = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;
    progressFill.style.width = `${percent}%`;
}

// Update Progress Tab Charts and Badges
function updateProgressTab() {
    // Set text stats
    document.getElementById('stat-completed').textContent = answeredQuestionsCount;
    document.getElementById('stat-correct').textContent = correctAnswersCount;
    
    const accuracy = answeredQuestionsCount > 0 ? Math.round((correctAnswersCount / answeredQuestionsCount) * 100) : 0;
    document.getElementById('stat-accuracy').textContent = `${accuracy}%`;

    // Process badges unlocking
    updateBadges(accuracy);

    // Render Review List
    const reviewList = document.getElementById('review-list');
    const incorrectAnswers = userAnswers.filter(ans => !ans.isCorrect);

    if (incorrectAnswers.length === 0) {
        reviewList.innerHTML = '<div class="empty-state">Tuyệt vời! Bạn chưa trả lời sai câu nào. Hãy tiếp tục phát huy!</div>';
    } else {
        reviewList.innerHTML = '';
        incorrectAnswers.forEach(item => {
            const row = document.createElement('div');
            row.className = 'review-item';
            row.innerHTML = `
                <div>
                    <div class="review-q-text">${item.question}</div>
                    <div class="review-details">
                        Bạn đã chọn: <span class="text-error" style="text-decoration: line-through;">${item.userAns}</span> | 
                        Đáp án đúng: <span class="text-success" style="font-weight: 600;">${item.correctAns}</span>
                    </div>
                    <div class="review-details" style="font-style: italic; margin-top: 4px; color: var(--text-muted);">
                        💡 ${item.explanation}
                    </div>
                </div>
                <button class="btn-tts" onclick="speakText('${item.correctAns.replace(/'/g, "\\'")}')" title="Nghe phát âm">🔊</button>
            `;
            reviewList.appendChild(row);
        });
    }
}

function updateBadges(accuracy) {
    const starterBadge = document.getElementById('badge-starter');
    const scholarBadge = document.getElementById('badge-scholar');
    const masterBadge = document.getElementById('badge-master');

    // Badge 1: Starter (answered at least 1 correct)
    if (correctAnswersCount >= 1) {
        starterBadge.classList.remove('locked');
        starterBadge.classList.add('unlocked');
    } else {
        starterBadge.classList.add('locked');
        starterBadge.classList.remove('unlocked');
    }

    // Badge 2: Scholar (5 correct answers in total)
    if (correctAnswersCount >= 5) {
        scholarBadge.classList.remove('locked');
        scholarBadge.classList.add('unlocked');
    } else {
        scholarBadge.classList.add('locked');
        scholarBadge.classList.remove('unlocked');
    }

    // Badge 3: Master (answered 10 questions with 100% accuracy)
    if (answeredQuestionsCount >= 10 && accuracy === 100) {
        masterBadge.classList.remove('locked');
        masterBadge.classList.add('unlocked');
    } else {
        masterBadge.classList.add('locked');
        masterBadge.classList.remove('unlocked');
    }
}

// Local Storage Persistence
function saveProgressToStorage() {
    const data = {
        currentScore,
        answeredQuestionsCount,
        correctAnswersCount,
        streak,
        currentQuestionIndex,
        userAnswers
    };
    localStorage.setItem('english_present_simple_progress', JSON.stringify(data));
}

function loadProgressFromStorage() {
    const stored = localStorage.getItem('english_present_simple_progress');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            currentScore = data.currentScore || 0;
            answeredQuestionsCount = data.answeredQuestionsCount || 0;
            correctAnswersCount = data.correctAnswersCount || 0;
            streak = data.streak || 0;
            currentQuestionIndex = data.currentQuestionIndex || 0;
            userAnswers = data.userAnswers || [];
        } catch (e) {
            console.error('Lỗi nạp dữ liệu tiến trình học tập:', e);
        }
    }
}

// Call on startup
loadProgressFromStorage();
